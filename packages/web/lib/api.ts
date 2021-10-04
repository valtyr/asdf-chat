export const protocol = () => {
  switch (location.protocol) {
    case "http:":
      return "ws:";
    case "https:":
    default:
      return "wss:";
  }
};
export const wsUrl = (path: string) => {
  if (process.env.NODE_ENV === "development")
    return `ws://localhost:8787${path}`;

  return `wss://${location.host}${path}`;
};
