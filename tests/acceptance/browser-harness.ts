import type { Express } from 'express';
import { startTestServer, type TestServer } from '../helpers/http';

export interface AcceptanceFailure {
  step: string;
  expected: string;
  actual: string;
  visibleMessage: string;
  artifact?: string;
}

export function createAcceptanceFailure(step: string, expected: string, actual: string, visibleMessage: string): AcceptanceFailure {
  return { step, expected, actual, visibleMessage };
}

export async function startAcceptanceServer(app: Express): Promise<TestServer> {
  return startTestServer(app);
}
