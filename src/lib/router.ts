import { Router as Itty, RouteEntry, RouterOptions } from 'itty-router';

interface RouteHandler<TRequest> {
  (request: TRequest & Request, env: Env): Response | Promise<Response>;
}

interface Route {
  <TRequest>(
    path: string,
    ...handlers: RouteHandler<TRequest & Request>[]
  ): Itty<TRequest>;
}

type Router<TRequest> = {
  handle: (request: Request, env: Env) => Response;
  routes: RouteEntry<TRequest>[];
} & {
  [any: string]: Route;
};

const Router = Itty as <TRequest>(
  options?: RouterOptions<TRequest>,
) => Router<TRequest>;

export default Router;
