# Performance Monitor

Real-time performance monitor for your machines, built with TypeScript, Node.js, Socket.IO and React.
Practice project from the Udemy course "SocketIO v4, with websockets - the details" by Robert Bunch.

A small Node program (`nodeClient`) runs on every machine you want to watch, collects CPU, memory and system
information once per second and sends it to a Socket.IO server. A React dashboard shows the data live.

## Features

- CPU load, memory usage and system information for every connected machine
- Live updates once per second, one widget per machine
- An "Offline" overlay when a machine stops reporting
- Clustered Socket.IO server with sticky sessions and the cluster adapter
- Token-based authentication for node clients and React clients
- Written in TypeScript end to end, with the data and Socket.IO event types shared by all three parts

## Architecture

```
nodeClient (every machine)  --perfData-->  server (cluster)  --perfData-->  react-client (dashboard)
```

- `nodeClient` collects the data and sends it in a `perfData` event.
- `server` runs one worker per CPU core with sticky sessions, and the cluster adapter lets every worker emit to every
  client. Node clients join the `nodeClient` room and React clients join the `reactClient` room. The server forwards
  `perfData` to the `reactClient` room and announces when a machine goes offline with `connectedOrNot`.
- `react-client` keeps the latest data of every machine and refreshes the widgets once per second.

## Run

You need three terminals (Node.js 18 or newer):

```bash
cd server
npm install
npm run dev        # Socket.IO server on http://localhost:3000
```

```bash
cd nodeClient
npm install
npm run dev        # start as many as you like, each one shows up as a separate machine
```

```bash
cd react-client
npm install
npm start          # dashboard on http://localhost:3001
```

`npm run dev` runs the TypeScript sources directly with `tsx`. For a production-style run, compile and start the
compiled code instead:

```bash
npm run build
npm start
```

`npm run cluster-demo` in `server` runs `clusterTest.ts`, a minimal example of Node's `cluster` module that is not
part of the app.

Every part has `npm run typecheck`, which checks the types without emitting any files.

## Configuration

| Variable | Used by | Default |
|---|---|---|
| `PORT` | server | `3000` |
| `CLIENT_URL` | server (CORS) | `http://localhost:3001` |
| `NODE_CLIENT_TOKEN` | server, nodeClient | demo token from the course |
| `REACT_CLIENT_TOKEN` | server | demo token from the course |
| `SERVER_URL` | nodeClient | `http://127.0.0.1:3000` |
| `REACT_APP_SERVER_URL` | react-client (build time) | `http://localhost:3000` |
| `REACT_APP_CLIENT_TOKEN` | react-client (build time) | demo token from the course |

The default tokens are demo values. Anything in a browser bundle is public, so the React token only keeps random
connections out. Set your own tokens before exposing the server anywhere.

## Project structure

```
shared/
  types.ts         data and event types used by all three parts
nodeClient/        collects performance data and sends it to the server
  src/index.ts     socket connection and the one-second tick
  src/perfData.ts  CPU, memory and system info
server/            clustered Socket.IO server
  src/servers.ts   cluster primary and workers
  src/socketMain.ts  socket event handlers
  src/clusterTest.ts standalone cluster demo
react-client/      React dashboard (Create React App)
  src/perfDataComponents/   Widget, Cpu, Mem and Info components
  src/utilities/            socket connection and canvas drawing helpers
```

The event types in `shared/types.ts` are imported with `import type` by the node client, the server and the React
client, so a change to an event or to the data is checked at compile time in all three places.

