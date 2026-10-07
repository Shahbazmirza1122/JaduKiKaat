import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "storeSettings.json");
const PRODUCTS_FILE_PATH = path.join(process.cwd(), "data", "storeProducts.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(cors());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Store settings API (Categories, Hero, Flash deal, etc.)
  app.get("/api/store-settings", (req, res) => {
    try {
      if (fs.existsSync(SETTINGS_FILE_PATH)) {
        const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
        return res.json(JSON.parse(data));
      }
      res.json({});
    } catch (err: any) {
      console.warn("Failed to read storeSettings.json:", err.message);
      res.status(500).json({ error: "Failed to read store settings" });
    }
  });

  app.post("/api/store-settings", (req, res) => {
    try {
      const settings = req.body;
      const dataDir = path.dirname(SETTINGS_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
      res.json({ success: true, settings });
    } catch (err: any) {
      console.warn("Failed to save storeSettings.json:", err.message);
      res.status(500).json({ error: "Failed to save store settings" });
    }
  });

  // Store products API
  app.get("/api/store-products", (req, res) => {
    try {
      if (fs.existsSync(PRODUCTS_FILE_PATH)) {
        const data = fs.readFileSync(PRODUCTS_FILE_PATH, "utf-8");
        return res.json(JSON.parse(data));
      }
      res.json([]);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read store products" });
    }
  });

  app.post("/api/store-products", (req, res) => {
    try {
      const products = req.body;
      const dataDir = path.dirname(PRODUCTS_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), "utf-8");
      res.json({ success: true, count: Array.isArray(products) ? products.length : 0 });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save store products" });
    }
  });

  // Safepay API routing - Create a tracker to initiate payment
  app.post("/api/safepay/create-tracker", async (req, res) => {
    try {
      let { amount, currency = "PKR", environment = "sandbox" } = req.body;
      const secretKey = process.env.SAFEPAY_SECRET_KEY || "0896abe5b456c3aae0ce02b5fd25ac9ff8c4c183342d00cdee304e9f0ff9827f";
      const clientKey = process.env.VITE_SAFEPAY_PUBLIC_KEY || "sec_710ff60e-c2b7-469f-8aa3-8ff149f5c8fb";
      
      if (!secretKey) {
        return res.status(500).json({ error: "Safepay Secret Key not configured on the server." });
      }

      environment = String(environment).toLowerCase();
      if (environment !== 'production') environment = 'sandbox';

      const baseUrl = environment === "production" 
        ? "https://api.getsafepay.com" 
        : "https://sandbox.api.getsafepay.com";

      // 1. Authenticate / Create Tracker via Safepay API
      // Reference: https://docs.getsafepay.com/
      const trackerResponse = await fetch(`${baseUrl}/order/v1/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SFPY-MERCHANT-SECRET": secretKey
        },
        body: JSON.stringify({
          client: clientKey,
          amount: amount,
          currency: currency,
          environment: environment
        })
      });

      if (!trackerResponse.ok) {
        const errorData = await trackerResponse.text();
        console.warn("Safepay API Error:", errorData);
        return res.status(trackerResponse.status).json({
          error: "Failed to create Safepay tracker",
          details: errorData
        });
      }

      const trackerData = await trackerResponse.json();
      res.json(trackerData);
    } catch (error: any) {
      console.warn("Payment initiation error:", error);
      res.status(500).json({ error: "Failed to initiate payment", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });

    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Provide a fallback for React Router in a single-page application
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();
