import express from "express";
import cors from 'cors';
import 'dotenv/config';
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import { Message } from "./models/Message.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
  res.send("Hello World");
});


import escrowRoutes from './routes/Escrow.routes.js';
import userRoutes from './routes/User.routes.js';
import profileRoutes from './routes/Profileroutes.js';
import skillRoutes from './routes/SkillMatching.routes.js';
import requestRoutes from './routes/ServiceRequest.routes.js';
import messageRoutes from './routes/Message.routes.js';

app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skill', skillRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/messages', messageRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

export const attachIoToRequest = (io) => {
  return (req, res, next) => {
    req.io = io;
    next();
  };
};


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.join(socket.userId);

  socket.on("send_message", async (data) => {
    try {
      const { receiverId, content, attachments = [] } = data;

      const newMessage = new Message({
        sender: new mongoose.Types.ObjectId(socket.userId),
        receiver: new mongoose.Types.ObjectId(receiverId),
        content,
        attachments,
        timestamp: new Date(),
        read: false
      });

      await newMessage.save();

      const messageData = {
        _id: newMessage._id,
        sender: socket.userId,
        receiver: receiverId,
        content,
        attachments,
        timestamp: newMessage.timestamp,
        read: false
      };

      socket.emit("receive_message", messageData);
      io.to(receiverId).emit("receive_message", messageData);

      io.to(receiverId).emit("new_message_notification", {
        senderId: socket.userId,
        messagePreview: content.substring(0, 50),
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("mark_as_read", async (data) => {
  });

  socket.on('service_request_updated', (data) => {
    // Broadcast to both requester and provider
    socket.to(data.requesterId).emit('service_request_updated', data);
    socket.to(data.providerId).emit('service_request_updated', data);
  });
  

  socket.on("typing", (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit("user_typing", { userId: socket.userId });
  });

  socket.on("stop_typing", (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit("user_stop_typing", { userId: socket.userId });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

connectDB();