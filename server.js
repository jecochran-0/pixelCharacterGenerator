require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();
const { OpenAI } = require("openai"); // Correct OpenAI import

// Initialize the OpenAI client with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this environment variable
});

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint for character generation
app.post("/generate-character", async (req, res) => {
  try {
    const { description } = req.body;
    const cleanDescription = description.trim();

    const prompt = `Create a pixel art character based on this description: ${cleanDescription}

This is for a video game sprite that will be used directly in the game engine, so it must be:
1. ONLY the character on a completely white/transparent background
2. A single sprite with no variations
3. No color palettes or references (these will be added by the game engine)
4. Technically clean with no UI elements or text

The game engine CANNOT process images with color palettes, multiple character versions, or text - it will cause errors.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });

    const imageUrl = response.data[0].url;

    // Simply return the image URL directly
    res.json({ imageUrl: imageUrl });
  } catch (error) {
    console.error("Error generating character:", error);
    res.status(500).json({ error: "Failed to generate character" });
  }
});

// Add a new endpoint to proxy image downloads
app.get("/download-image", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send("Image URL is required");
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get the image data as a buffer
    const imageBuffer = await response.buffer();

    // Set appropriate headers
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pixel-character.png"
    );
    res.setHeader("Content-Type", "image/png");

    // Send the image data
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error downloading image:", error);
    res.status(500).send("Failed to download image");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the application`);
});
