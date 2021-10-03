import { handleErrors } from './helpers';
import { nanoid } from 'nanoid';

import {
  ClientPresenceEvent,
  PresenceUser,
  ServerPresenceEvent,
} from '@asdf-chat/types/lib/presence';

interface Session {
  id: string;
  socket: WebSocket;
  quit?: boolean;
  username: string;
}

class Presence {
  state: DurableObjectState;
  env: Env;
  sessions: Session[];
  users: PresenceUser[];

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.users = [];
  }

  async fetch(request: Request): Promise<Response> {
    return await handleErrors(request, async () => {
      const url = new URL(request.url);
      if (url.pathname !== '/websocket')
        return new Response('Not found', { status: 404 });

      const username = url.searchParams.get('username');
      if (!username) return new Response('Username missing', { status: 401 });

      if (request.headers.get('Upgrade') !== 'websocket')
        return new Response('Expected websocket', { status: 400 });

      const pair = new WebSocketPair();

      await this.handleSession(pair[1], username);

      return new Response(null, { status: 101, webSocket: pair[0] });
    });
  }

  async handleSession(webSocket: WebSocket, username: string): Promise<void> {
    webSocket.accept();

    const session: Session = {
      id: nanoid(),
      socket: webSocket,
      username,
    };

    const user: PresenceUser = {
      id: session.id,
      cursor: null,
      username: session.username,
    };

    this.sessions.push(session);
    this.users.push(user);

    webSocket.addEventListener('message', async (msg) => {
      try {
        if (session.quit) {
          webSocket.close(1011, 'WebSocket broken.');
          return;
        }

        const data = JSON.parse(msg.data) as ClientPresenceEvent;

        switch (data.type) {
          case 'cursor': {
            const index = this.users.findIndex((u) => u.id === session.id);
            this.users[index].cursor = {
              x: data.x,
              y: data.y,
            };
            this.tick(session.id);
          }
        }
      } catch (err) {
        // Report any exceptions directly back to the client. As with our handleErrors() this
        // probably isn't what you'd want to do in production, but it's convenient when testing.
        const error = err as Error;
        webSocket.send(JSON.stringify({ error: error.stack }));
      }
    });

    const closeOrErrorHandler = () => {
      session.quit = true;
      this.sessions = this.sessions.filter(({ id }) => id !== session.id);
      this.users = this.users.filter(({ id }) => id !== session.id);
      this.tick();
    };
    webSocket.addEventListener('close', closeOrErrorHandler);
    webSocket.addEventListener('error', closeOrErrorHandler);
  }

  tick(skipId?: string): void {
    const users = skipId
      ? this.users.filter((u) => u.id !== skipId)
      : this.users;
    this.broadcast({
      type: 'tick',
      users,
    });
  }

  broadcast(message: ServerPresenceEvent): void {
    // Apply JSON if we weren't given a string to start with.
    const serialized =
      typeof message === 'string' ? message : JSON.stringify(message);

    // Iterate over all the sessions sending them messages.
    const quitters: Session[] = [];
    this.sessions = this.sessions.filter((session) => {
      try {
        session.socket.send(serialized);
        return true;
      } catch (err) {
        // Whoops, this connection is dead. Remove it from the list and arrange to notify
        // everyone below.
        session.quit = true;
        quitters.push(session);
        return false;
      }
    });
  }
}

export default Presence;
