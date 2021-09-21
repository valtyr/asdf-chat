import Router from './lib/router';

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
router.get('/test', () => new Response('hello'));
router.get('*', () => new Response('Not found', { status: 404 }));

export async function handleRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  return await router.handle(request, env);
}
