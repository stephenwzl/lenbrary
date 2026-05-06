import { Server } from 'node:http';
import type { Express } from 'express';

export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
}

export async function startTestServer(app: Express): Promise<TestServer> {
  const server = await new Promise<Server>(resolve => {
    const listener = app.listen(0, () => resolve(listener));
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start test server');
  }
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise(resolve => server.close(() => resolve())),
  };
}
