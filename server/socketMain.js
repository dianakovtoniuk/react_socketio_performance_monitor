// Where the socket.io listeners and (most) emitters live

const NODE_CLIENT_TOKEN = process.env.NODE_CLIENT_TOKEN || '239rfaiskdfvq243EGa4q3wefsdad';
const REACT_CLIENT_TOKEN = process.env.REACT_CLIENT_TOKEN || '23jrtiheriufyqwidsf';

const socketMain = (io, pid) => {
    io.on('connection', (socket) => {
        let machineMacA;
        let isNodeClient = false;
        const { token } = socket.handshake.auth;

        if (token === NODE_CLIENT_TOKEN) {
            // valid nodeClient: put it in the appropriate room
            isNodeClient = true;
            socket.join('nodeClient');
        } else if (token === REACT_CLIENT_TOKEN) {
            // valid reactClient: put it in the appropriate room
            socket.join('reactClient');
        } else {
            // you do not belong here. Go away!
            socket.disconnect();
            console.log('Unauthorized client disconnected');
            return;
        }
        console.log(`Someone connected on worker ${pid}`);
        socket.emit('welcome', 'Welcome to the performance monitor server!');

        socket.on('perfData', (data) => {
            // only node clients are allowed to report performance data
            if (!isNodeClient) {
                return;
            }
            if (!machineMacA) {
                // first tick from this machine: let the front end know it is alive
                machineMacA = data.macA;
                console.log(`Machine ${machineMacA} is reporting to worker ${pid}`);
                io.to('reactClient').emit('connectedOrNot', { machineMacA, isAlive: true });
            }
            io.to('reactClient').emit('perfData', data);
        });

        socket.on('disconnect', () => {
            // a nodeClient just disconnected: let the front end know!
            if (machineMacA) {
                io.to('reactClient').emit('connectedOrNot', { machineMacA, isAlive: false });
            }
        });
    });
};

module.exports = socketMain;
