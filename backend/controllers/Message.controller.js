import express from 'express';
import { Message } from '../models/Message.js';
import { User } from '../models/User.model.js';
import mongoose from 'mongoose';

export const getAllConversations = async(req,res)=>{
    try {
        const conversations = await Message.aggregate([
          {
            $match: {
              $or: [
                { sender: new mongoose.Types.ObjectId(req.user_id) },
                { receiver: new mongoose.Types.ObjectId(req.user_id) }
              ]
            }
          },
          {
            $sort: { timestamp: -1 }
          },
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ["$sender", new mongoose.Types.ObjectId(req.user_id)] },
                  "$receiver",
                  "$sender"
                ]
              },
              lastMessage: { $first: "$$ROOT" }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $unwind: '$userDetails'
          },
          {
            $project: {
              _id: 1,
              userId: '$_id',
              firstName: '$userDetails.firstName',
              lastName: '$userDetails.lastName',
              lastMessage: '$lastMessage.content',
              timestamp: '$lastMessage.timestamp',
              unread: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$lastMessage.receiver", new mongoose.Types.ObjectId(req.user_id)] },
                      { $eq: ["$lastMessage.read", false] }
                    ]
                  },
                  true,
                  false
                ]
              }
            }
          },
          {
            $sort: { timestamp: -1 }
          }
        ]);
        console.log(conversations);
        res.status(200).json({
          success: true,
          conversations
        });
      } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching conversations',
          error: error.message
        });
      }
}

export const getConversation = async(req,res)=>{
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid user ID'
          });
        }
    
        const messages = await Message.find({
          $or: [
            { sender: req.user_id, receiver: userId },
            { sender: userId, receiver: req.user_id }
          ]
        }).sort({ timestamp: 1 });
    
        const otherUser = await User.findById(userId).select('firstName lastName');
    
        await Message.updateMany(
          { 
            sender: userId, 
            receiver: req.user_id,
            read: false
          },
          { $set: { read: true } }
        );
    
        res.status(200).json({
          success: true,
          messages,
          user: otherUser
        });
      } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching conversation',
          error: error.message
        });
      }
}