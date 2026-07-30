import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  generateDailyInsight, 
  generateDailyContent, 
  generateFermentationRecipe, 
  generatePurificationTips,
  generateRecipeOptions,
  generateAlchemistRecipe,
  generateSpeech,
  moderateContent,
  analyzeSoulJourney,
  generateAppCover
} from "./services/geminiService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Routes
  app.get("/api/daily-insight", async (req, res) => {
    try {
      const data = await generateDailyInsight();
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/daily-insight:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.get("/api/daily-content", async (req, res) => {
    try {
      const data = await generateDailyContent();
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/daily-content:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.get("/api/fermentation-recipe", async (req, res) => {
    try {
      const data = await generateFermentationRecipe();
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/fermentation-recipe:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.get("/api/purification-tips", async (req, res) => {
    try {
      const data = await generatePurificationTips();
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/purification-tips:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.post("/api/recipe-options", async (req, res) => {
    try {
      const { mealType } = req.body;
      if (!mealType) {
        res.status(400).json({ error: "Missing mealType" });
        return;
      }
      const data = await generateRecipeOptions(mealType);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/recipe-options:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.post("/api/alchemist-recipe", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!ingredients) {
        res.status(400).json({ error: "Missing ingredients" });
        return;
      }
      const data = await generateAlchemistRecipe(ingredients);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/alchemist-recipe:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.post("/api/speech", async (req, res) => {
    try {
      const { text, instruction } = req.body;
      if (!text) {
        res.status(400).json({ error: "Missing text" });
        return;
      }
      const data = await generateSpeech(text, instruction);
      res.json({ audio: data });
    } catch (error: any) {
      console.error("Error in /api/speech:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.post("/api/moderate-content", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ error: "Missing text" });
        return;
      }
      const data = await moderateContent(text);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/moderate-content:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.post("/api/analyze-soul-journey", async (req, res) => {
    try {
      const { logs } = req.body;
      const data = await analyzeSoulJourney(logs || []);
      res.json({ feedback: data });
    } catch (error: any) {
      console.error("Error in /api/analyze-soul-journey:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.get("/api/app-cover", async (req, res) => {
    try {
      const data = await generateAppCover();
      res.json({ cover: data });
    } catch (error: any) {
      console.error("Error in /api/app-cover:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
