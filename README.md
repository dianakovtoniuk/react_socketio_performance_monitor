# Performance Monitor

Real-time performance monitor for your machines, built with Node.js, Socket.IO and React.
Practice project from the Udemy course "SocketIO v4, with websockets - the details" by Robert Bunch.

A small Node program (`nodeClient`) runs on every machine you want to watch, collects CPU, memory and system
information once per second and sends it to a Socket.IO server. A React dashboard shows the data live.

## How it works

- `nodeClient` collects the data and sends it to the server in a `perfData` event.
- `server` runs as a cluster of workers (one per CPU core) with sticky sessions, so a client always reaches the same
  worker, and the cluster adapter lets every worker emit to every connected client.
- `server` authenticates every connection with a token. Node clients join the `nodeClient` room and React clients
  join the `reactClient` room. The server forwards `perfData` to the `reactClient` room and announces when a
  machine goes offline with `connectedOrNot`.

## Run

Start the server first, then one or more node clients:

```bash
cd server
npm install
npm start          # http://localhost:3000
```

`npm run cluster-demo` runs `clusterTest.js`, a minimal example of Node's `cluster` module that is not part of the app.

```bash
cd nodeClient
npm install
npm start
```

## Configuration

| Variable | Used by | Default |
|---|---|---|
| `PORT` | server | `3000` |
| `CLIENT_URL` | server (CORS) | `http://localhost:3001` |
| `NODE_CLIENT_TOKEN` | server, nodeClient | demo token from the course |
| `REACT_CLIENT_TOKEN` | server | demo token from the course |
| `SERVER_URL` | nodeClient | `http://127.0.0.1:3000` |

The default tokens are demo values. Set your own before exposing the server anywhere.
