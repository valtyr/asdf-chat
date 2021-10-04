import Router from './lib/router';
import indexPage from './index.html';

import { uuid } from '@cfworker/uuid';

const router = Router();

router.get('/room/:name/websocket', async (request, env) => {
  let id;

  const name = request.params?.name || '';
  if (name.match(/^[0-9a-f]{64}$/)) {
    // The name is 64 hex digits, so let's assume it actually just encodes an ID. We use this
    // for private rooms. `idFromString()` simply parses the text as a hex encoding of the raw
    // ID (and verifies that this is a valid ID for this namespace).
    id = env.rooms.idFromString(name);
  } else if (name.length <= 32) {
    // Treat as a string room name (limited to 32 characters). `idFromName()` consistently
    // derives an ID from a string.
    id = env.rooms.idFromName(name);
  } else {
    return new Response('Name too long', { status: 404 });
  }

  const roomObject = env.rooms.get(id);
  const newUrl = new URL(request.url);
  newUrl.pathname = '/websocket';
  return roomObject.fetch(newUrl.toString(), request);
});

router.get('/presence/:name/websocket', async (request, env) => {
  let id;

  const name = request.params?.name || '';
  if (name.match(/^[0-9a-f]{64}$/)) {
    // The name is 64 hex digits, so let's assume it actually just encodes an ID. We use this
    // for private rooms. `idFromString()` simply parses the text as a hex encoding of the raw
    // ID (and verifies that this is a valid ID for this namespace).
    id = env.presence.idFromString(name);
  } else if (name.length <= 32) {
    // Treat as a string room name (limited to 32 characters). `idFromName()` consistently
    // derives an ID from a string.
    id = env.presence.idFromName(name);
  } else {
    return new Response('Name too long', { status: 404 });
  }

  const roomObject = env.presence.get(id);
  const newUrl = new URL(request.url);
  newUrl.pathname = '/websocket';
  return roomObject.fetch(newUrl.toString(), request);
});

router.get('/', () => {
  return new Response(indexPage, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Encoding': 'utf-8',
    },
  });
});

router.get('/test', async () => {
  const enc = new TextEncoder();

  const keyUUID = uuid();
  const secretUUID = uuid();

  const keyDigest = await crypto.subtle.digest('SHA-256', enc.encode(keyUUID));
  const secretDigest = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(secretUUID),
  );

  const key = btoa(
    new Uint8Array(keyDigest).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      '',
    ),
  );
  const secret = btoa(
    new Uint8Array(secretDigest).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      '',
    ),
  );

  return new Response(JSON.stringify({ key, secret }), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'utf-8',
    },
  });
});

router.get('*', () => new Response('Not found', { status: 404 }));

export async function handleRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  return await router.handle(request, env);
}
