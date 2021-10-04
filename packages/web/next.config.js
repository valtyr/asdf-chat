module.exports = {
  async rewrites() {
    return [
      {
        source: "/api:path*",
        destination: "http://localhost:8787/api:path*",
      },
    ];
  },
};
