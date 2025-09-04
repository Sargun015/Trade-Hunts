// models/Escrow.js
import mongoose from 'mongoose';

const escrowSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'client_confirmed', 'provider_confirmed', 'completed', 'disputed', 'cancelled'],
    default: 'pending'
  },
  clientConfirmationDate: {
    type: Date,
    default: null
  },
  providerConfirmationDate: {
    type: Date,
    default: null
  },
  completionDate: {
    type: Date,
    default: null
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      default: ''
    }
  },
  disputeReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

escrowSchema.pre('save', function(next) {
  // Auto-update status to 'completed' when both parties confirm
  if (
    (this.status === 'client_confirmed' && this.isModified('providerConfirmationDate')) ||
    (this.status === 'provider_confirmed' && this.isModified('clientConfirmationDate'))
  ) {
    this.status = 'completed';
    this.completionDate = new Date();
  }
  next();
});

export const Escrow = mongoose.model('Escrow', escrowSchema);