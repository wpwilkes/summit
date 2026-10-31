export function getServerBindAddress(): string {
  const serverBindAddress = process.env.SERVER_BIND_ADDRESS;
  if (!serverBindAddress) {
    throw new Error('Server bind address is not defined.');
  }
  return serverBindAddress;
}

export function getServerPort(): number {
  const _serverPort = process.env.SERVER_PORT;
  if (!_serverPort) {
    throw new Error('Server port is not defined.');
  }
  const serverPort = Number(_serverPort);
  if (!Number.isInteger(serverPort)) {
    throw new Error('Server port is malformed.');
  }
  return serverPort;
}
