import mongoose from 'mongoose'; 

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String,
    url: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  }]
});

MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, read: 1 });
MessageSchema.index({ timestamp: -1 });

MessageSchema.methods.markAsRead = async function() {
  this.read = true;
  return await this.save();
};

export const Message = mongoose.model('Message', MessageSchema);

