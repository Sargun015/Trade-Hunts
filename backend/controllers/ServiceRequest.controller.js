

import { sendServiceRequestNotification } from "../utils/email.js";
import { ServiceRequest } from "../models/Request.js";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";

export const createServiceRequest = async (req, res) => {
  try {
    const { providerId, terms } = req.body;
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider ID',
      });
    }
    const provider = await User.findById(providerId).select('firstName lastName email');
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }
    const newServiceRequest = new ServiceRequest({
      requesterId: req.user_id,
      providerId,
      terms,
      status: 'pending',
      requesterCompletionMarked: false,
      providerCompletionMarked: false,
    });
    const requester = await User.findById(req.user_id);
    await sendServiceRequestNotification(
      provider.email,
      `${requester.firstName} ${requester.lastName}`,
    );
    await newServiceRequest.save();
    res.status(201).json({
      success: true,
      serviceRequest: newServiceRequest,
    });
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service request',
      error: error.message,
    });
  }
};

// Get service request between two users
export const getServiceRequestByUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user_id;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }
    // Find service request where current user is either requester or provider
    // and the other user is either requester or provider
    const serviceRequest = await ServiceRequest.findOne({
      $or: [
        { requesterId: currentUserId, providerId: userId },
        { requesterId: userId, providerId: currentUserId }
      ],
      // Don't return requests that were rejected or cancelled
      status: { $nin: ['rejected', 'cancelled'] }
    }).sort({ createdAt: -1 }); // Get the most recent one
    res.status(200).json({
      success: true,
      serviceRequest,
    });
  } catch (error) {
    console.error('Get service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service request',
      error: error.message,
    });
  }
};

// Update service request status
export const updateServiceRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const currentUserId = req.user_id;
    console.log('Current User ID:', currentUserId);
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    // Validate status
    const validStatuses = ['pending', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    // Find the service request
    const serviceRequest = await ServiceRequest.findById(requestId);
    console.log(serviceRequest);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    // Check if user is authorized to update this request
    if (serviceRequest.requesterId.toString() !== currentUserId && 
        serviceRequest.providerId.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service request',
      });
    }



    // Update status
    serviceRequest.status = status;
    await serviceRequest.save();

    // Send notification to the other party
    const recipientId = serviceRequest.requesterId.toString() === currentUserId 
      ? serviceRequest.providerId 
      : serviceRequest.requesterId;
    
    const recipient = await User.findById(recipientId).select('email');
    const currentUser = await User.findById(currentUserId).select('firstName lastName');

    if (recipient && currentUser) {
      await sendServiceRequestNotification(
        recipient.email,
        `${currentUser.firstName} ${currentUser.lastName}`,
        `Service request status updated to: ${status}`
      );
    }

    res.status(200).json({
      success: true,
      serviceRequest,
    });
  } catch (error) {
    console.error('Update service request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service request status',
      error: error.message,
    });
  }
};

// Mark service request as completed by either user
export const markServiceRequestCompletion = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user_id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const serviceRequest = await ServiceRequest.findById(requestId);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    // Check if user is part of this request
    if (serviceRequest.requesterId.toString() !== currentUserId && 
        serviceRequest.providerId.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service request',
      });
    }

    // Check if request is in an 'accepted' status
    if (serviceRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted service requests can be marked as completed',
      });
    }

    // Mark completion based on user role
    if (serviceRequest.requesterId.toString() === currentUserId) {
      serviceRequest.requesterCompletionMarked = true;
    } else {
      serviceRequest.providerCompletionMarked = true;
    }

    // If both parties marked it complete, change status to completed
    if (serviceRequest.requesterCompletionMarked && serviceRequest.providerCompletionMarked) {
      serviceRequest.status = 'completed';
    }

    await serviceRequest.save();

    // Notify the other party
    const recipientId = serviceRequest.requesterId.toString() === currentUserId 
      ? serviceRequest.providerId 
      : serviceRequest.requesterId;
    
    const recipient = await User.findById(recipientId).select('email');
    const currentUser = await User.findById(currentUserId).select('firstName lastName');

    if (recipient && currentUser) {
      await sendServiceRequestNotification(
        recipient.email,
        `${currentUser.firstName} ${currentUser.lastName}`,
        `Service marked as completed by ${serviceRequest.requesterId.toString() === currentUserId ? 'requester' : 'provider'}`
      );
    }

    res.status(200).json({
      success: true,
      serviceRequest,
    });
  } catch (error) {
    console.error('Mark service request completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking service request as completed',
      error: error.message,
    });
  }
};

// Get all service requests for current user
export const getUserServiceRequests = async (req, res) => {
  try {
    const currentUserId = req.user_id;
    const { status } = req.query;

    const filter = {
      $or: [
        { requesterId: currentUserId },
        { providerId: currentUserId }
      ]
    };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    const serviceRequests = await ServiceRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('requesterId', 'firstName lastName email')
      .populate('providerId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: serviceRequests.length,
      serviceRequests,
    });
  } catch (error) {
    console.error('Get user service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service requests',
      error: error.message,
    });
  }
};

// Update service request terms
export const updateServiceRequestTerms = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { terms } = req.body;
    const currentUserId = req.user_id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const serviceRequest = await ServiceRequest.findById(requestId);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    // Check if user is part of this request
    if (serviceRequest.requesterId.toString() !== currentUserId && 
        serviceRequest.providerId.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service request',
      });
    }

    // Can only update terms if status is pending or negotiating
    if (!['pending', 'negotiating'].includes(serviceRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Terms can only be updated for pending or negotiating requests',
      });
    }

    // Update terms and set status to negotiating
    serviceRequest.terms = terms;
    serviceRequest.status = 'negotiating';
    await serviceRequest.save();

    // Notify the other party
    const recipientId = serviceRequest.requesterId.toString() === currentUserId 
      ? serviceRequest.providerId 
      : serviceRequest.requesterId;
    
    const recipient = await User.findById(recipientId).select('email');
    const currentUser = await User.findById(currentUserId).select('firstName lastName');

    if (recipient && currentUser) {
      await sendServiceRequestNotification(
        recipient.email,
        `${currentUser.firstName} ${currentUser.lastName}`,
        'Service request terms have been updated'
      );
    }

    res.status(200).json({
      success: true,
      serviceRequest,
    });
  } catch (error) {
    console.error('Update service request terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service request terms',
      error: error.message,
    });
  }
};
