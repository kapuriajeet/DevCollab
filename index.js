import "dotenv/config";
import { mongoDBConnection } from "./db/connection.js";
import { app } from './app.js';
import { createServer } from "http";
import { initializeSocket } from "./socket/socketServer.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoDBConnection();

    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

