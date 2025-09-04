// pages/ServiceDetailsPage.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { EscrowContext } from '../context/EscrowContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Calendar, 
  MessageCircle,
  Star 
} from 'lucide-react';

const ServiceDetailsPage = () => {
  const { token, user } = useContext(AppContext);
  const { 
    getEscrowByRequestId, 
    createEscrow, 
    confirmEscrow, 
    disputeEscrow, 
    cancelEscrow,
    submitFeedback 
  } = useContext(EscrowContext);
  
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  
  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/request/${requestId}`, {
        headers: { token }
      });
      
      setRequest(response.data.request);
      
      // Fetch escrow if request exists
      if (response.data.request) {
        const escrowData = await getEscrowByRequestId(requestId);
        setEscrow(escrowData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to load service request');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token && requestId) {
      fetchRequest();
    }
  }, [token, requestId]);
  
  const handleStartService = async () => {
    try {
      const newEscrow = await createEscrow(requestId);
      if (newEscrow) {
        setEscrow(newEscrow);
        fetchRequest(); // Refresh request status
      }
    } catch (err) {
      console.error('Error starting service:', err);
      setError('Failed to start service');
    }
  };
  
  const handleConfirmCompletion = async () => {
    try {
      const updatedEscrow = await confirmEscrow(escrow._id);
      if (updatedEscrow) {
        setEscrow(updatedEscrow);
        fetchRequest(); // Refresh request status
      }
    } catch (err) {
      console.error('Error confirming completion:', err);
      setError('Failed to confirm service completion');
    }
  };
  
  const handleDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      return;
    }
    
    try {
      const updatedEscrow = await disputeEscrow(escrow._id, disputeReason);
      if (updatedEscrow) {
        setEscrow(updatedEscrow);
        setShowDisputeForm(false);
        fetchRequest(); // Refresh request status
      }
    } catch (err) {
      console.error('Error disputing service:', err);
      setError('Failed to submit dispute');
    }
  };
  
  const handleCancel = async () => {
    try {
      const updatedEscrow = await cancelEscrow(escrow._id);
      if (updatedEscrow) {
        setEscrow(updatedEscrow);
        fetchRequest(); // Refresh request status
      }
    } catch (err) {
      console.error('Error cancelling service:', err);
      setError('Failed to cancel service');
    }
  };
  
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    try {
      const updatedEscrow = await submitFeedback(escrow._id, rating, feedback);
      if (updatedEscrow) {
        setEscrow(updatedEscrow);
        setShowFeedbackForm(false);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback');
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'client_confirmed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Client Confirmed</span>;
      case 'provider_confirmed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Provider Confirmed</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
      case 'disputed':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Disputed</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Not Found!</strong>
          <span className="block sm:inline"> Service request not found.</span>
        </div>
      </div>
    );
  }
  
  const isClient = user._id === request.clientId;
  const isProvider = user._id === request.providerId;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Service Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
            <p className="text-gray-600 mb-4">{request.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-700">
                <User size={18} className="mr-2" />
                <span>{isClient ? 'You are the client' : 'You are the provider'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar size={18} className="mr-2" />
                <span>Created on {new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock size={18} className="mr-2" />
                <span>Status: {request.status}</span>
              </div>
            </div>
            
            {/* Escrow information */}
            {escrow && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Service Completion Status</h3>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-gray-700">Current status:</span>
                  {getStatusBadge(escrow.status)}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  {escrow.status === 'pending' && (
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                  )}
                  {(escrow.status === 'client_confirmed' || escrow.status === 'provider_confirmed') && (
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                  )}
                  {escrow.status === 'completed' && (
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  )}
                  {escrow.status === 'disputed' && (
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  )}
                  {escrow.status === 'cancelled' && (
                    <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  )}
                </div>
                
                {/* Confirmation details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      escrow.clientConfirmationDate ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {escrow.clientConfirmationDate ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <span>
                      Client confirmation: {escrow.clientConfirmationDate 
                        ? new Date(escrow.clientConfirmationDate).toLocaleString() 
                        : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      escrow.providerConfirmationDate ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {escrow.providerConfirmationDate ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <span>
                      Provider confirmation: {escrow.providerConfirmationDate 
                        ? new Date(escrow.providerConfirmationDate).toLocaleString() 
                        : 'Pending'}
                    </span>
                  </div>
                </div>
                
                {/* Show dispute reason if disputed */}
                {escrow.status === 'disputed' && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                    <h4 className="text-red-700 font-medium flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Dispute Reason
                    </h4>
                    <p className="text-red-600 mt-1">{escrow.disputeReason}</p>
                  </div>
                )}
                
                {/* Show feedback if completed and feedback exists */}
                {escrow.status === 'completed' && escrow.feedback.rating && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded mb-4">
                    <h4 className="text-green-700 font-medium flex items-center gap-2">
                      <Star size={16} />
                      Client Feedback
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, index) => (
                        <Star 
                          key={index}
                          size={16} 
                          fill={index < escrow.feedback.rating ? 'currentColor' : 'none'}
                          className={index < escrow.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-2 text-gray-700">{escrow.feedback.rating}/5</span>
                    </div>
                    {escrow.feedback.comment && (
                      <p className="text-gray-600 mt-2 italic">"{escrow.feedback.comment}"</p>
                    )}
                  </div>
                )}
                
                {/* Action buttons based on status and user role */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {/* For client actions */}
                  {isClient && (
                    <>
                      {escrow.status === 'pending' && (
                        <>
                          <button
                            onClick={handleConfirmCompletion}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                          >
                            <CheckCircle size={18} />
                            Confirm Completion
                          </button>
                          <button
                            onClick={() => setShowDisputeForm(true)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2"
                          >
                            <AlertTriangle size={18} />
                            Raise Dispute
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
                          >
                            <XCircle size={18} />
                            Cancel Service
                          </button>
                        </>
                      )}
                      
                      {escrow.status === 'provider_confirmed' && (
                        <button
                          onClick={handleConfirmCompletion}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Confirm Completion
                        </button>
                      )}
                      
                      {escrow.status === 'completed' && !escrow.feedback.rating && (
                        <button
                          onClick={() => setShowFeedbackForm(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                          <Star size={18} />
                          Leave Feedback
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* For provider actions */}
                  {isProvider && (
                    <>
                      {escrow.status === 'pending' && (
                        <>
                          <button
                            onClick={handleConfirmCompletion}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                          >
                            <CheckCircle size={18} />
                            Confirm Completion
                          </button>
                          <button
                            onClick={() => setShowDisputeForm(true)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2"
                          >
                            <AlertTriangle size={18} />
                            Raise Dispute
                          </button>
                        </>
                      )}
                      
                      {escrow.status === 'client_confirmed' && (
                        <button
                          onClick={handleConfirmCompletion}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Confirm Completion
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Contact button for both parties */}
                  <button
                    onClick={() => navigate(`/messages?userId=${isClient ? request.providerId : request.clientId}`)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Contact {isClient ? 'Provider' : 'Client'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Show button to start service if no escrow exists */}
            {!escrow && request.status === 'accepted' && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 mb-4">
                  This service has been accepted. To begin the service process, 
                  click the button below.
                </p>
                <button
                  onClick={handleStartService}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Start Service
                </button>
              </div>
            )}
            
            {/* Dispute form */}
            {showDisputeForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold mb-4">Raise a Dispute</h3>
                  <form onSubmit={handleDispute}>
                    <div className="mb-4">
                      <label htmlFor="disputeReason" className="block text-gray-700 mb-2">
                        Reason for dispute
                      </label>
                      <textarea
                        id="disputeReason"
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Please explain why you're disputing this service..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDisputeForm(false)}
                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Submit Dispute
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Feedback form */}
            {showFeedbackForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold mb-4">Leave Feedback</h3>
                  <form onSubmit={handleSubmitFeedback}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              size={24} 
                              fill={star <= rating ? 'currentColor' : 'none'}
                              className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="feedback" className="block text-gray-700 mb-2">
                        Comments (optional)
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Share your experience with the service provider..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowFeedbackForm(false)}
                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;