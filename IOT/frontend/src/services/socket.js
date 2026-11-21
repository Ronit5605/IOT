import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log(`[Socket Connected] ID: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket Disconnected] Reason: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket Connect Error]', err.message);
    });
  }
  return socket;
};

export const joinRoom = (role, ambulanceId) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join', { role, ambulanceId });
  } else {
    s.once('connect', () => {
      s.emit('join', { role, ambulanceId });
    });
  }
};
