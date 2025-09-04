

import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { format } from 'date-fns';
import { MessageCircle, User, ChevronLeft, CheckCircle, ChevronDown } from 'lucide-react';
import io from 'socket.io-client';

const MessagesPage = () => {
  const { token, user } = useContext(AppContext);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [serviceRequest, setServiceRequest] = useState(null);
  const [completionMarked, setCompletionMarked] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError('Failed to connect to messaging service');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (data) => {
      if (
        currentConversation && 
        (data.sender === currentConversation.userId || data.receiver === currentConversation.userId)
      ) {
        setMessages((prev) => [...prev, data]);        
        if (data.receiver === user._id) {
          socket.emit('mark_as_read', { messageId: data._id });
        }
      }
      
      fetchConversations();
    });

    socket.on('user_typing', (data) => {
      if (currentConversation && data.userId === currentConversation.userId) {
        setIsTyping(true);
      }
    });

    socket.on('user_stop_typing', (data) => {
      if (currentConversation && data.userId === currentConversation.userId) {
        setIsTyping(false);
      }
    });

    socket.on('service_request_updated', (data) => {
      if (currentConversation && 
          (data.requesterId === user._id || data.providerId === user._id) &&
          (data.requesterId === currentConversation.userId || data.providerId === currentConversation.userId)) {
        setServiceRequest(data);
        
        const userRole = user._id === data.requesterId ? 'requester' : 'provider';
        setCompletionMarked(data[`${userRole}CompletionMarked`] || false);
        
        let statusMessage = '';
        switch (data.status) {
          case 'negotiating':
            statusMessage = '🤝 Service request has moved to negotiation stage.';
            break;
          case 'accepted':
            statusMessage = '✅ Service request has been accepted and is now in progress.';
            break;
          case 'rejected':
            statusMessage = '❌ Service request has been rejected.';
            break;
          case 'completed':
            statusMessage = '🎉 This service has been marked as completed by both parties.';
            break;
          case 'cancelled':
            statusMessage = '⚠️ This service request has been cancelled.';
            break;
          default:
            statusMessage = '';
        }
        
        if (statusMessage) {
          const systemMessage = {
            _id: `system-${Date.now()}`,
            sender: 'system',
            content: statusMessage,
            timestamp: new Date(),
            isSystemMessage: true
          };
          
          setMessages(prev => [...prev, systemMessage]);
        }
        
        // If status terminal (completed/rejected/cancelled), auto-refresh
        if (['completed', 'rejected', 'cancelled'].includes(data.status)) {
          fetchConversations();
        }
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('service_request_updated');
    };
  }, [socket, currentConversation, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { token }
      });
      console.log('Conversations:', response.data.conversations);
      setConversations(response.data.conversations || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const directUserId = queryParams.get('userId');
    
    if (directUserId && !currentConversation) {
      // Find if we already have a conversation with this user
      const existingConversation = conversations.find(
        conv => conv.userId === directUserId
      );
      
      if (existingConversation) {
        openConversation(existingConversation);
      } else if (directUserId) {
        const newConversation = {
          userId: directUserId,
          firstName: 'User', 
          lastName: '',
          lastMessage: '',
          timestamp: new Date(),
          unread: false
        };
        
        axios.get(`http://localhost:5000/api/messages/conversation/${directUserId}`, {
          headers: { token }
        }).then(response => {
          if (response.data.user) {
            newConversation.firstName = response.data.user.firstName;
            newConversation.lastName = response.data.user.lastName;
          }
          setMessages(response.data.messages || []);
          setCurrentConversation(newConversation);
          setLoading(false);
          
          fetchConversations();
        }).catch(err => {
          console.error('Error starting new conversation:', err);
          setError('Failed to start conversation');
          setLoading(false);
        });
      }
      
      window.history.replaceState({}, document.title, '/messages');
    }
  }, [conversations, currentConversation, token]);

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/messages/conversation/${userId}`, {
        headers: { token }
      });
      setMessages(response.data.messages || []);
      
      fetchServiceRequest(userId);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const fetchServiceRequest = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/request/conversation/${userId}`, {
        headers: { token }
      });
      
      if (response.data.serviceRequest) {
        setServiceRequest(response.data.serviceRequest);
        
        const userRole = user._id === response.data.serviceRequest.requesterId ? 'requester' : 'provider';
        setCompletionMarked(response.data.serviceRequest[`${userRole}CompletionMarked`] || false);
      } else {
        setServiceRequest(null);
        setCompletionMarked(false);
      }
    } catch (err) {
      console.error('Error fetching service request:', err);
      setServiceRequest(null);
    }
  };

  const openConversation = (conversation) => {
    setCurrentConversation(conversation);
    fetchMessages(conversation.userId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentConversation) return;

    socket.emit('send_message', {
      receiverId: currentConversation.userId,
      content: newMessage
    });

    setNewMessage('');
    
    socket.emit('stop_typing', { receiverId: currentConversation.userId });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!currentConversation) return;

    socket.emit('typing', { receiverId: currentConversation.userId });
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    const timeout = setTimeout(() => {
      socket.emit('stop_typing', { receiverId: currentConversation.userId });
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  const updateServiceRequestStatus = async (newStatus) => {
    if (!serviceRequest || !currentConversation) return;
    
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/request/${serviceRequest._id}/status`,
        { status: newStatus },
        { headers: { token } }
      );
      
      setServiceRequest(response.data.serviceRequest);
      setShowStatusMenu(false);
      
      let statusMessage = '';
      switch (newStatus) {
        case 'negotiating':
          statusMessage = '🤝 You moved this service request to negotiation stage.';
          break;
        case 'accepted':
          statusMessage = '✅ You accepted this service request. It is now in progress.';
          break;
        case 'rejected':
          statusMessage = '❌ You rejected this service request.';
          break;
        case 'cancelled':
          statusMessage = '⚠️ You cancelled this service request.';
          break;
        default:
          statusMessage = `You updated the service request status to ${newStatus}.`;
      }
      
      const systemMessage = {
        _id: `system-${Date.now()}`,
        sender: 'system',
        content: statusMessage,
        timestamp: new Date(),
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
    } catch (err) {
      console.error('Error updating service request status:', err);
      setError('Failed to update service request status');
    }
  };

  const markServiceAsCompleted = async () => {
    if (!serviceRequest || !currentConversation) return;
    
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/request/${serviceRequest._id}/mark-completed`,
        {},
        { headers: { token } }
      );
      
      setServiceRequest(response.data.serviceRequest);
      setCompletionMarked(true);
      
      const systemMessage = {
        _id: `system-${Date.now()}`,
        sender: 'system',
        content: `✅ You marked this service as completed. Waiting for the other party to confirm.`,
        timestamp: new Date(),
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
    } catch (err) {
      console.error('Error marking service as completed:', err);
      setError('Failed to mark service as completed');
    }
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  const formatConversationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff < 7) {
      return format(date, 'EEE');
    }
    
    return format(date, 'MMM d');
  };

  const backToConversations = () => {
    setCurrentConversation(null);
    setMessages([]);
    setServiceRequest(null);
    setCompletionMarked(false);
    setShowStatusMenu(false);
  };

  const getServiceRequestStatus = () => {
    if (!serviceRequest) return null;
    
    switch(serviceRequest.status) {
      case 'pending':
        return { label: 'Pending', color: 'text-yellow-600 bg-yellow-100' };
      case 'negotiating':
        return { label: 'Negotiating', color: 'text-purple-600 bg-purple-100' };
      case 'accepted':
        return { label: 'In Progress', color: 'text-blue-600 bg-blue-100' };
      case 'rejected':
        return { label: 'Rejected', color: 'text-red-600 bg-red-100' };
      case 'completed':
        return { label: 'Completed', color: 'text-green-600 bg-green-100' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'text-gray-600 bg-gray-100' };
      default:
        return { label: serviceRequest.status, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const getAvailableStatusActions = () => {
    if (!serviceRequest) return [];
    
    const isRequester = user._id === serviceRequest.requesterId;
    const isProvider = user._id === serviceRequest.providerId;
    
    switch(serviceRequest.status) {
      case 'pending':
        if (isRequester) {
          return [
            { status: 'negotiating', label: 'Move to Negotiation', color: 'bg-purple-500 hover:bg-purple-600' },
            { status: 'cancelled', label: 'Cancel Request', color: 'bg-red-500 hover:bg-red-600' }
          ];
        } else if (isProvider) {
          return [
            { status: 'negotiating', label: 'Negotiate', color: 'bg-purple-500 hover:bg-purple-600' },
            { status: 'accepted', label: 'Accept Request', color: 'bg-green-500 hover:bg-green-600' },
            { status: 'rejected', label: 'Reject Request', color: 'bg-red-500 hover:bg-red-600' }
          ];
        }
        break;
      case 'negotiating':
        return [
          { status: 'accepted', label: 'Accept Terms', color: 'bg-green-500 hover:bg-green-600' },
          { status: isRequester ? 'cancelled' : 'rejected', 
            label: isRequester ? 'Cancel Request' : 'Reject Request', 
            color: 'bg-red-500 hover:bg-red-600' }
        ];
      case 'accepted':
        if (!completionMarked) {
          return [
            { status: isRequester ? 'cancelled' : 'rejected', 
              label: isRequester ? 'Cancel Service' : 'Terminate Service', 
              color: 'bg-red-500 hover:bg-red-600' }
          ];
        }
        return [];
      default:
        return [];
    }
  };

  const isServiceEditable = () => {
    if (!serviceRequest) return false;
    return !['completed', 'rejected', 'cancelled'].includes(serviceRequest.status);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        
        <div className="flex h-[calc(80vh-10rem)]">
          <div className={`w-full md:w-1/3 border-r ${currentConversation ? 'hidden md:block' : 'block'}`}>
            {loading && conversations.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Start chatting with users by clicking the Contact button on their profile
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto h-full">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      conversation.unread ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => openConversation(conversation)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-200 rounded-full p-2">
                        <User size={24} className="text-gray-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${conversation.unread ? 'font-bold' : ''}`}>
                            {conversation.firstName} {conversation.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatConversationTime(conversation.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${conversation.unread ? 'font-semibold text-black' : 'text-gray-500'}`}>
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={`w-full md:w-2/3 flex flex-col ${!currentConversation ? 'hidden md:flex' : 'flex'}`}>
            {!currentConversation ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b flex items-center">
                  <button 
                    className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100" 
                    onClick={backToConversations}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-shrink-0 bg-gray-200 rounded-full p-2">
                    <User size={20} className="text-gray-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">
                      {currentConversation.firstName} {currentConversation.lastName}
                    </p>
                    {isTyping && (
                      <p className="text-xs text-gray-500">typing...</p>
                    )}
                  </div>
                  
                  {serviceRequest && getServiceRequestStatus() && (
                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${getServiceRequestStatus().color}`}>
                      {getServiceRequestStatus().label}
                    </div>
                  )}
                </div>
                
                {serviceRequest && (
                  <div className="bg-gray-50 p-4 border-b relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Service Request</p>
                        <p className="text-xs text-gray-500">{serviceRequest.terms}</p>
                      </div>
                      
                      {isServiceEditable() && (
                        <div className="relative">
                          {serviceRequest.status === 'accepted' && !completionMarked ? (
                            <button 
                              onClick={markServiceAsCompleted}
                              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Mark as Completed
                            </button>
                          ) : serviceRequest.status === 'accepted' && completionMarked ? (
                            <span className="text-green-600 text-sm font-medium flex items-center">
                              <CheckCircle size={16} className="mr-1" />
                              Marked as completed
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                              >
                                Update Status
                                <ChevronDown size={16} className="ml-1" />
                              </button>
                              
                              {showStatusMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                                  <div className="py-1">
                                    {getAvailableStatusActions().map((action) => (
                                      <button
                                        key={action.status}
                                        className={`block w-full text-left px-4 py-2 text-sm text-white ${action.color}`}
                                        onClick={() => updateServiceRequestStatus(action.status)}
                                      >
                                        {action.label}
                                      </button>
                                    ))}
                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={() => setShowStatusMenu(false)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex-1 p-4 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Send a message to start the conversation
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
            
                      {messages.map((message) => {
                        const isCurrentUser = message.sender === user._id;
                        const isSystemMessage = message.isSystemMessage;
                        
                        if (isSystemMessage) {
                          return (
                            <div key={message._id} className="flex justify-center">
                              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                                {message.content}
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <div 
                            key={message._id} 
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[75%] px-4 py-2 rounded-lg ${
                                isCurrentUser 
                                  ? 'bg-blue-500 text-white rounded-br-none' 
                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div 
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatMessageTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleSendMessage} className="border-t p-4">
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleTyping}
                      disabled={serviceRequest && serviceRequest.status === 'completed'}
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                      disabled={!newMessage.trim() || (serviceRequest && serviceRequest.status === 'completed')}
                    >
                      Send
                    </button>
                  </div>
                  {serviceRequest && serviceRequest.status === 'completed' && (
                    <p className="text-xs text-gray-500 mt-2">
                      This conversation is closed as the service has been marked as completed.
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;