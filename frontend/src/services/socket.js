import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  socket = io('/', { auth: { token }, transports: ['websocket'] });
  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};
