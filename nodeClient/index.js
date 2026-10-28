// The node program that captures local performance data
// and sends it via socket to the server
// Req:
// - socket.io-client

const os = require('os'); // native to node!
const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:3000'; // where our server is listening
const options = {
    auth: {
        token: process.env.NODE_CLIENT_TOKEN || '239rfaiskdfvq243EGa4q3wefsdad',
    },
};

// We need a way to identify this machine to the server, for front-end usage.
// We use the MAC address of the first internet-facing network interface, plus a random number
// so that several clients on the same machine show up as separate machines.
const getMachineId = () => {
    const nI = os.networkInterfaces(); // a list of all network interfaces on this machine
    let base = os.hostname();
    // loop through all network interfaces until we find a non-internal one
    for (const key in nI) {
        const isInternetFacing = nI[key] && nI[key].length > 0 && !nI[key][0].internal;
        if (isInternetFacing) {
            base = nI[key][0].mac;
            break;
        }
    }
    return base + Math.floor(Math.random() * 100000);
};

const socket = io(SERVER_URL, options);
socket.on('connect', () => {
    console.log(`Connected to ${SERVER_URL}`);
    const macA = getMachineId();

    const perfDataInterval = setInterval(async () => {
        // every second, get the performance data and emit it
        const perfData = await performanceLoadData();
        perfData.macA = macA;
        socket.emit('perfData', perfData);
    }, 1000);

    socket.on('disconnect', () => {
        clearInterval(perfDataInterval); // if we disconnect for any reason (this includes reconnects), stop ticking
    });
});

socket.on('connect_error', (err) => {
    console.log(`Could not connect to ${SERVER_URL}: ${err.message}`);
});

const cpuAverage = () => {
    const cpus = os.cpus();
    // cpus is an array of all cores. We need the average of all the cores, which gives us the cpu average.
    let idleMs = 0; // idle milliseconds
    let totalMs = 0; // total milliseconds
    // loop through each core (thread)
    cpus.forEach((aCore) => {
        // loop through each mode of the current core and add it to totalMs
        for (const mode in aCore.times) {
            totalMs += aCore.times[mode];
        }
        // add the idle mode of this core to idleMs
        idleMs += aCore.times.idle;
    });
    return {
        idle: idleMs / cpus.length,
        total: totalMs / cpus.length,
    };
};

// The times property on cpus is time since boot, so we take the times "now" and 100ms later.
// Comparing them gives us the current load.
const getCpuLoad = () =>
    new Promise((resolve) => {
        const start = cpuAverage(); // "now" value of load
        setTimeout(() => {
            const end = cpuAverage(); // value 100ms after "now"
            const idleDiff = end.idle - start.idle;
            const totalDiff = end.total - start.total;
            // calculate the % of the used cpu
            const percentOfCpu = 100 - Math.floor((100 * idleDiff) / totalDiff);
            resolve(percentOfCpu);
        }, 100);
    });

const performanceLoadData = async () => {
    // What do we need to know FROM NODE about performance?
    const cpus = os.cpus(); // all cpus as an array
    // memory usage
    const totalMem = os.totalmem(); // in bytes
    const freeMem = os.freemem(); // in bytes
    const usedMem = totalMem - freeMem;
    const memUseage = Math.floor((usedMem / totalMem) * 100) / 100; // 2 decimal places
    // OS type
    const osType = os.type() === 'Darwin' ? 'Mac' : os.type();
    // uptime, in seconds
    const upTime = os.uptime();
    // CPU info: type, number of cores, clock speed
    const cpuType = cpus[0].model;
    const numCores = cpus.length;
    const cpuSpeed = cpus[0].speed;
    // current CPU load, in %
    const cpuLoad = await getCpuLoad();
    return {
        freeMem,
        totalMem,
        usedMem,
        memUseage,
        osType,
        upTime,
        cpuType,
        numCores,
        cpuSpeed,
        cpuLoad,
    };
};
