import { handleErrors } from './helpers';
import { nanoid } from 'nanoid';
import { ChatEvent } from '@asdf-chat/types/lib/chat';

const MAX_TYPING_DURATION = 2000;

interface Session {
  id: string;
  socket: WebSocket;
  quit?: boolean;
  username?: string;
}

class ChatRoom {
  state: DurableObjectState;
  env: Env;
  sessions: Session[];
  lastTimestamp = 0;

  typingState: {
    id: string;
    lastTypingEvent: number;
    username: string;
  }[] = [];

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request: Request): Promise<Response> {
    return await handleErrors(request, async () => {
      const url = new URL(request.url);
      if (url.pathname !== '/websocket')
        return new Response('Not found', { status: 404 });

      if (request.headers.get('Upgrade') !== 'websocket')
        return new Response('Expected websocket', { status: 400 });

      const pair = new WebSocketPair();

      await this.handleSession(pair[1]);

      return new Response(null, { status: 101, webSocket: pair[0] });
    });
  }

  async handleSession(webSocket: WebSocket): Promise<void> {
    webSocket.accept();

    const session: Session = {
      id: nanoid(),
      socket: webSocket,
    };

    let typingTimeoutHandle: number | null = null;

    this.sessions.push(session);

    webSocket.addEventListener('message', async (msg) => {
      try {
        if (session.quit) {
          webSocket.close(1011, 'WebSocket broken.');
          return;
        }

        const data = JSON.parse(msg.data) as ChatEvent;

        switch (data.type) {
          case 'setup': {
            session.username = data.username;
            break;
          }
          case 'createMessage': {
            if (!session.username) return;
            this.broadcast({
              type: 'newMessage',
              message: data.message,
              username: session.username,
              timestamp: new Date().toUTCString(),
            });
            break;
          }
          case 'startTyping': {
            this.startTyping(session);

            if (typingTimeoutHandle) {
              clearTimeout(typingTimeoutHandle);
              typingTimeoutHandle = null;
            }

            typingTimeoutHandle = setTimeout(
              () => this.stopTyping(session),
              MAX_TYPING_DURATION,
            );

            break;
          }
          case 'stopTyping': {
            this.stopTyping(session);

            if (typingTimeoutHandle) {
              clearTimeout(typingTimeoutHandle);
              typingTimeoutHandle = null;
            }

            break;
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
      // if (session.username) {
      //   this.broadcast({ quit: session.name });
      // }
    };
    webSocket.addEventListener('close', closeOrErrorHandler);
    webSocket.addEventListener('error', closeOrErrorHandler);
  }

  startTyping(session: Session): void {
    const now = Date.now();
    const idx = this.typingState.findIndex((item) => item.id === session.id);
    if (idx === -1) {
      this.typingState.push({
        id: session.id,
        lastTypingEvent: now,
        username: session.username || '',
      });
    } else {
      this.typingState[idx].lastTypingEvent = now;
    }

    this.afterTypingEvent();
  }

  stopTyping(session: Session): void {
    const idx = this.typingState.findIndex((item) => item.id === session.id);
    if (idx !== -1) {
      this.typingState.splice(idx, 1);
    }
    this.afterTypingEvent();
  }

  afterTypingEvent(): void {
    const now = Date.now();
    this.typingState = this.typingState.filter(
      (item) => now - item.lastTypingEvent < MAX_TYPING_DURATION,
    );
    this.broadcast({ type: 'typingState', typingState: this.typingState });
  }

  broadcast(message: ChatEvent): void {
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

    // quitters.forEach((quitter) => {
    //   if (quitter.name) {
    //     this.broadcast({ quit: quitter.name });
    //   }
    // });
  }
}

export default ChatRoom;
