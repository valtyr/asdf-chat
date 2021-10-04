export {};

declare global {
  interface Env {
    ENVIRONMENT?: string;
    rooms: DurableObjectNamespace;
    presence: DurableObjectNamespace;
  }

  /**
   * Git hash of current commit. Will be ambiguous in development.
   */
  const GIT_HASH: string;

  // Missing types
  interface WebSocket {
    accept(): void;
  }

  class WebSocketPair {
    0: WebSocket;
    1: WebSocket;
  }

  interface ResponseInit {
    webSocket?: WebSocket;
  }

  interface Request {
    params?: { [_: string]: string };
  }

  interface DurableObjectState {
    blockConcurrencyWhile(callback: () => void | Promise<void>): Promise<void>;
  }
}

declare module '*.html' {
  const content: string;
  export default content;
}
