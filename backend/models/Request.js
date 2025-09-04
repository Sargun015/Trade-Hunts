// import mongoose from 'mongoose';

// const ServiceRequestSchema = new mongoose.Schema(
//   {
//     requesterId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     providerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ['pending', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled'],
//       default: 'pending',
//     },
//     terms: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);

import mongoose from 'mongoose';

const ServiceRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    terms: {
      type: String,
    },
    requesterCompletionMarked: {
      type: Boolean,
      default: false,
    },
    providerCompletionMarked: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

export const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);