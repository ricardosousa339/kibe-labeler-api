import WebSocket, { WebSocketServer } from 'ws';

// Servidor WebSocket
const wss = new WebSocketServer({ port: 8082 });

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (message: string) => {
	console.log(`Received message => ${message}`);
	ws.send(`Hello, you sent -> ${message}`);
  });

  ws.on('close', () => {
	console.log('Client has disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8082');

// Cliente WebSocket
const client = new WebSocket('ws://localhost:6008/subscribe');

client.on('open', () => {
  console.log('Connected to ws://localhost:6008/subscribe');
  client.send('Hello from client');
});

client.on('message', (data: WebSocket.Data) => {
  console.log(`Received from server: ${data}`);
});

client.on('close', () => {
  console.log('Disconnected from ws://localhost:6008/subscribe');
});

client.on('error', (error) => {
  console.error(`WebSocket error: ${error}`);
});