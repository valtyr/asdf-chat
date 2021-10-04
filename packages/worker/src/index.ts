import { handleRequest } from './handler';

export { default as ChatRoom } from './lib/do/ChatRoom';
export { default as Presence } from './lib/do/Presence';

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    return await handleRequest(req, env);
  },
};
