const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] }
});

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enroll', require('./routes/enrollments'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/instructor', require('./routes/instructor'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));

require('./utils/socket')(io);

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('DB Error:', err); process.exit(1); });
