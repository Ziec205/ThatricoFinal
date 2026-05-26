import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from 'cors';
import backendRoutes from './src/backend/routes';
import { ensureDatabaseReady } from './src/backend/database';

dotenv.config();

async function startServer() {
  await ensureDatabaseReady();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // CORS - allow frontend origin from env (set FRONTEND_ORIGIN in Render/Vercel)
  const allowedOrigin = process.env.FRONTEND_ORIGIN || process.env.VITE_API_URL || '*';
  app.use(cors({ origin: allowedOrigin, credentials: true }));

  // Serve public folder (for images)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // API routes go here
  app.use("/api", backendRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
