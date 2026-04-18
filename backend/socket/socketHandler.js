import jwt from 'jsonwebtoken';

let _io = null;

/**
 * Initializes Socket.io handlers.
 * @param {import('socket.io').Server} io
 */
const socketHandler = (io) => {
  _io = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.user;
    const room = `${role}_${userId}`;

    socket.join(room);
    console.log(`[Socket] ${role} connected: ${userId} → room: ${room}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] ${role} disconnected: ${userId}`);
    });
  });
};

/**
 * Returns the initialized Socket.io instance.
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!_io) {
    throw new Error('Socket.io has not been initialized. Call socketHandler(io) first.');
  }
  return _io;
};

export { socketHandler, getIO };
