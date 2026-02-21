import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MDMxODE4NjUsImlhdCI6MTc3MTY0NTg2NSwicmF5IjoiYmZjY2QyMzZlZmIxNjA1MWIxMDE1OGUwZmM2MTc1N2IiLCJzdWIiOjM4MTk2NTh9.Q4Zqz7aQl-Q9gpDWW-ehuj_LfHhnCu8U1I-Mm_uj43E3zSWo8fsI3dghZHPN5EvhrfbAu6KB0jCQlGVNRaX0oMBoLKIJjVL4T52x09zylADwiotn90FXuI1wKqs6Kf1oOO1RKjUbBA2a9_jnDl2tgabmJVYPXlcSEza4EcGF4SiRKUm9Qpc2xMgGIrlz7s5rMt3xbDIJfqAHMCr0llTo0H5ECjzSrQCVsSdkhGhuhuRH88ZJCLGYdDGeOd86wwzV3TYAO4ipszY-avHxj1bkmM7DCfolzewUY1SOxgRhHlZqZttoRV7UCAi6YSNbM7tetADfatBhlCSVEM7WOR6QA";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 5SIM Proxy Routes
  app.get("/api/5sim/buy/:service", async (req, res) => {
    try {
      const { service } = req.params;
      const response = await fetch(`https://5sim.net/v1/user/buy/activation/russia/any/${service}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error (buy):", error);
      res.status(500).json({ error: "Failed to proxy request to 5SIM" });
    }
  });

  app.get("/api/5sim/check/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const response = await fetch(`https://5sim.net/v1/user/check/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error (check):", error);
      res.status(500).json({ error: "Failed to proxy request to 5SIM" });
    }
  });

  app.get("/api/5sim/finish/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const response = await fetch(`https://5sim.net/v1/user/finish/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error (finish):", error);
      res.status(500).json({ error: "Failed to proxy request to 5SIM" });
    }
  });

  app.get("/api/5sim/cancel/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const response = await fetch(`https://5sim.net/v1/user/cancel/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error (cancel):", error);
      res.status(500).json({ error: "Failed to proxy request to 5SIM" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
