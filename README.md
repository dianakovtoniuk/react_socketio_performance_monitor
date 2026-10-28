# Performance Monitor

Real-time performance monitor for your machines, built with Node.js, Socket.IO and React.
Practice project from the Udemy course "SocketIO v4, with websockets - the details" by Robert Bunch.

A small Node program (`nodeClient`) runs on every machine you want to watch, collects CPU, memory and system
information once per second and sends it to a Socket.IO server. A React dashboard shows the data live.

## Node client

Collects performance data with the native `os` module: CPU load, memory usage, OS type, uptime and CPU info.

```bash
cd nodeClient
npm install
npm start
```

It prints the collected data once per second.
