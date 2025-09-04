// context/EscrowContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';

export const EscrowContext = createContext();

export const EscrowProvider = ({ children }) => {
  const { token } = useContext(AppContext);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEscrows = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/escrow/user', {
        headers: { token }
      });
      
      setEscrows(response.data.escrows || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching escrows:', err);
      setError('Failed to load escrows');
      setLoading(false);
    }
  };

  const getEscrowByRequestId = async (requestId) => {
    if (!token || !requestId) return null;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/escrow/request/${requestId}`, {
        headers: { token }
      });
      
      return response.data.escrow;
    } catch (err) {
      console.error('Error fetching escrow:', err);
      return null;
    }
  };

  const createEscrow = async (requestId) => {
    if (!token || !requestId) return null;
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/escrow/create',
        { requestId },
        { headers: { token } }
      );
      
      // Refresh escrows after creation
      fetchEscrows();
      
      return response.data.escrow;
    } catch (err) {
      console.error('Error creating escrow:', err);
      setError('Failed to create escrow');
      return null;
    }
  };

  const confirmEscrow = async (escrowId) => {
    if (!token || !escrowId) return null;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/escrow/confirm/${escrowId}`,
        {},
        { headers: { token } }
      );
      
      // Update local state
      setEscrows(prev => 
        prev.map(escrow => 
          escrow._id === escrowId ? response.data.escrow : escrow
        )
      );
      
      return response.data.escrow;
    } catch (err) {
      console.error('Error confirming escrow:', err);
      setError('Failed to confirm service completion');
      return null;
    }
  };

  const disputeEscrow = async (escrowId, reason) => {
    if (!token || !escrowId) return null;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/escrow/dispute/${escrowId}`,
        { reason },
        { headers: { token } }
      );
      
      // Update local state
      setEscrows(prev => 
        prev.map(escrow => 
          escrow._id === escrowId ? response.data.escrow : escrow
        )
      );
      
      return response.data.escrow;
    } catch (err) {
      console.error('Error disputing escrow:', err);
      setError('Failed to submit dispute');
      return null;
    }
  };

  const cancelEscrow = async (escrowId) => {
    if (!token || !escrowId) return null;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/escrow/cancel/${escrowId}`,
        {},
        { headers: { token } }
      );
      
      // Update local state
      setEscrows(prev => 
        prev.map(escrow => 
          escrow._id === escrowId ? response.data.escrow : escrow
        )
      );
      
      return response.data.escrow;
    } catch (err) {
      console.error('Error cancelling escrow:', err);
      setError('Failed to cancel service');
      return null;
    }
  };

  const submitFeedback = async (escrowId, rating, comment) => {
    if (!token || !escrowId) return null;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/escrow/feedback/${escrowId}`,
        { rating, comment },
        { headers: { token } }
      );
      
      // Update local state
      setEscrows(prev => 
        prev.map(escrow => 
          escrow._id === escrowId ? response.data.escrow : escrow
        )
      );
      
      return response.data.escrow;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback');
      return null;
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, [token]);

  const value = {
    escrows,
    loading,
    error,
    fetchEscrows,
    getEscrowByRequestId,
    createEscrow,
    confirmEscrow,
    disputeEscrow,
    cancelEscrow,
    submitFeedback
  };

  return (
    <EscrowContext.Provider value={value}>
      {children}
    </EscrowContext.Provider>
  );
};