import socketIo from 'socket.io-client';

let socket: SocketIOClient.Socket | undefined;

export function connect(url: string, io = socketIo) {
  return new Promise((resolve, reject) => {
    socket = io(url);
    socket.on('connect', resolve);
    socket.on('connect_error', reject);
  });
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
  }
}
