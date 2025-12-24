// Custom UV Configuration for better site compatibility
// This overwrites the stock UV config.js

self.__uv$config = {
  prefix: "/uv/service/",
  // Use base64 encoding for better compatibility with special characters
  encodeUrl: Ultraviolet.codec.base64.encode,
  decodeUrl: Ultraviolet.codec.base64.decode,
  handler: "/uv/uv.handler.js",
  client: "/uv/uv.client.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};
