import io from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000'; // our server is at :3000
const options = {
  auth: { token: process.env.REACT_APP_CLIENT_TOKEN || '23jrtiheriufyqwidsf' },
};

const socket = io(SERVER_URL, options);

export default socket;
