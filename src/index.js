import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

// static paths
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const fastify = Fastify({
	logger:
		process.env.NODE_ENV === "production"
			? true
			: {
					level: process.env.LOG_LEVEL || "info",
					transport: {
						target: "pino-pretty",
						options: {
							translateTime: "HH:MM:ss Z",
							ignore: "pid,hostname",
						},
					},
			  },
	trustProxy: true,
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				// Enhanced CORS headers for better compatibility
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				res.setHeader("X-Content-Type-Options", "nosniff");
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				try {
					if (req.url.endsWith("/wisp/")) {
						wisp.routeRequest(req, socket, head);
					} else {
						socket.end();
					}
				} catch (error) {
					console.error("WebSocket upgrade error:", error);
					socket.destroy();
				}
			})
			.on("error", (error) => {
				console.error("Server error:", error);
			});
	},
});

fastify.register(fastifyStatic, {
	root: publicPath,
	decorateReply: true,
});

// Health check endpoint for Railway and monitoring
fastify.get("/health", async (req, res) => {
	return {
		status: "healthy",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || "development",
	};
});

// Readiness check
fastify.get("/ready", async (req, res) => {
	return { status: "ready" };
});

fastify.get("/uv/uv.config.js", (req, res) => {
	return res.sendFile("uv/uv.config.js", publicPath);
});

fastify.register(fastifyStatic, {
	root: uvPath,
	prefix: "/uv/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});

fastify.server.on("listening", () => {
	const address = fastify.server.address();

	// by default we are listening on 0.0.0.0 (every interface)
	// we just need to list a few
	console.log("🚀 Ultraviolet Proxy Server Started");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === "IPv6" ? `[${address.address}]` : address.address
		}:${address.port}`
	);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
	console.log(`Process ID: ${process.pid}`);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
});

// Enhanced error handlers
fastify.setErrorHandler((error, request, reply) => {
	fastify.log.error(error);
	reply.status(error.statusCode || 500).send({
		error: "Internal Server Error",
		message:
			process.env.NODE_ENV === "development" ? error.message : "An error occurred",
		statusCode: error.statusCode || 500,
	});
});

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
	reply.status(404).send({
		error: "Not Found",
		message: `Route ${request.method} ${request.url} not found`,
		statusCode: 404,
	});
});

// Graceful shutdown handling
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error);
	shutdown();
});
process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

async function shutdown() {
	console.log("\n🛑 Shutdown signal received: closing HTTP server");
	try {
		await fastify.close();
		console.log("✅ Server closed successfully");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error during shutdown:", error);
		process.exit(1);
	}
}

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

fastify.listen({
	port: port,
	host: "0.0.0.0",
});
