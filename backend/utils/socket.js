const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // Join course chat room
    socket.on('join_course', (courseId) => {
      socket.join(`course_${courseId}`);
      socket.to(`course_${courseId}`).emit('user_joined', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    // Send message in course chat
    socket.on('send_message', async (data) => {
      const { courseId, content } = data;
      try {
        const message = await Message.create({
          course: courseId,
          sender: socket.user._id,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          content,
        });
        io.to(`course_${courseId}`).emit('new_message', {
          _id: message._id,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          content,
          createdAt: message.createdAt,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Real-time progress update
    socket.on('progress_update', (data) => {
      const { courseId, completionPercentage } = data;
      socket.to(`course_${courseId}`).emit('student_progress', {
        studentId: socket.user._id,
        studentName: socket.user.name,
        completionPercentage,
      });
    });

    // Real-time notification broadcast (admin sends to all)
    socket.on('broadcast_notification', (data) => {
      if (socket.user.role === 'admin') {
        io.emit('notification', {
          type: data.type,
          message: data.message,
          timestamp: new Date(),
        });
      }
    });

    socket.on('leave_course', (courseId) => {
      socket.leave(`course_${courseId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};
