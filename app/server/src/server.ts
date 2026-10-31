import app from './app.js';
import { getServerBindAddress, getServerPort } from './config/server.js';

const serverBindAddress = getServerBindAddress();
const serverPort = getServerPort();

app.listen(serverPort, serverBindAddress, () => {
  console.log(`summit API listening on ${serverBindAddress}:${serverPort}`);
});
