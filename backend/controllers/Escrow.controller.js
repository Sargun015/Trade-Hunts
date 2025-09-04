// controllers/Escrow.controller.js
import { Escrow } from '../models/Escrow.model.js';
import { ServiceRequest } from '../models/Request.js';
import mongoose from 'mongoose';

// Create a new escrow when a service request is accepted

export const createEscrow = async (req, res) => {
  try {
    const { requestId } = req.body;
    
    // Check if request exists
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }
    
    // Check if escrow already exists
    const existingEscrow = await Escrow.findOne({ requestId });
    if (existingEscrow) {
      return res.status(400).json({
        success: false,
        message: 'Escrow already exists for this request'
      });
    }
    
    // Create new escrow
    const escrow = new Escrow({
      requestId,
      clientId: request.clientId,
      providerId: request.providerId,
      status: 'pending'
    });
    
    await escrow.save();
    
    // Update request status
    request.status = 'in_progress';
    await request.save();
    
    res.status(201).json({
      success: true,
      message: 'Escrow created successfully',
      escrow
    });
  } catch (error) {
    console.error('Create escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating escrow',
      error: error.message
    });
  }
};

// Get escrow by request ID
export const getEscrowByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const escrow = await Escrow.findOne({ requestId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    res.status(200).json({
      success: true,
      escrow
    });
  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching escrow',
      error: error.message
    });
  }
};

// Confirm service completion (used by both client and provider)
export const confirmEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.user_id;
    
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    // Check if user is client or provider
    const isClient = escrow.clientId.toString() === userId;
    const isProvider = escrow.providerId.toString() === userId;
    
    if (!isClient && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Update confirmation status based on user role
    if (isClient) {
      if (escrow.status === 'provider_confirmed') {
        escrow.status = 'completed';
        escrow.clientConfirmationDate = new Date();
        escrow.completionDate = new Date();
      } else {
        escrow.status = 'client_confirmed';
        escrow.clientConfirmationDate = new Date();
      }
    } else if (isProvider) {
      if (escrow.status === 'client_confirmed') {
        escrow.status = 'completed';
        escrow.providerConfirmationDate = new Date();
        escrow.completionDate = new Date();
      } else {
        escrow.status = 'provider_confirmed';
        escrow.providerConfirmationDate = new Date();
      }
    }
    
    await escrow.save();
    
    // If escrow is completed, update the service request
    if (escrow.status === 'completed') {
      const request = await ServiceRequest.findById(escrow.requestId);
      if (request) {
        request.status = 'completed';
        await request.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Service ${escrow.status === 'completed' ? 'completed' : 'confirmation received'}`,
      escrow
    });
  } catch (error) {
    console.error('Confirm escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming service completion',
      error: error.message
    });
  }
};

// Submit a dispute
export const disputeEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { reason } = req.body;
    const userId = req.user_id;
    
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    // Check if user is client or provider
    if (
      escrow.clientId.toString() !== userId && 
      escrow.providerId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check if escrow can be disputed
    if (escrow.status === 'completed' || escrow.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot dispute a ${escrow.status} service`
      });
    }
    
    // Update escrow
    escrow.status = 'disputed';
    escrow.disputeReason = reason;
    
    await escrow.save();
    
    // Update service request
    const request = await ServiceRequest.findById(escrow.requestId);
    if (request) {
      request.status = 'disputed';
      await request.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Dispute submitted successfully',
      escrow
    });
  } catch (error) {
    console.error('Dispute escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting dispute',
      error: error.message
    });
  }
};

// Cancel escrow (can only be done before both parties confirm)
export const cancelEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.user_id;
    
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    // Check if user is client or provider
    if (
      escrow.clientId.toString() !== userId && 
      escrow.providerId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Check if escrow can be cancelled
    if (escrow.status === 'completed' || escrow.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${escrow.status} service`
      });
    }
    
    // Update escrow
    escrow.status = 'cancelled';
    
    await escrow.save();
    
    // Update service request
    const request = await ServiceRequest.findById(escrow.requestId);
    if (request) {
      request.status = 'cancelled';
      await request.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Service cancelled successfully',
      escrow
    });
  } catch (error) {
    console.error('Cancel escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling service',
      error: error.message
    });
  }
};

// Get all escrows for a user (as either client or provider)
export const getEscrowsByUserId = async (req, res) => {
  try {
    const userId = req.user_id;
    
    const escrows = await Escrow.find({
      $or: [
        { clientId: userId },
        { providerId: userId }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      escrows
    });
  } catch (error) {
    console.error('Get escrows error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching escrows',
      error: error.message
    });
  }
};

// Submit feedback after service completion
export const submitFeedback = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user_id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (1-5) is required'
      });
    }
    
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    // Check if user is the client
    if (escrow.clientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only clients can submit feedback'
      });
    }
    
    // Check if escrow is completed
    if (escrow.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only provide feedback for completed services'
      });
    }
    
    // Update feedback
    escrow.feedback = {
      rating,
      comment: comment || ''
    };
    
    await escrow.save();
    
    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      escrow
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};