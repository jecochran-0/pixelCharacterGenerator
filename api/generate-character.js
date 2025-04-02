const { OpenAI } = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { description } = req.body;
    const cleanDescription = description?.trim();

    if (!cleanDescription) {
      return res.status(400).json({ error: "Description is required" });
    }

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

    // Return the image URL
    return res.status(200).json({ imageUrl: imageUrl });
  } catch (error) {
    console.error("Error generating character:", error);
    return res.status(500).json({ error: "Failed to generate character" });
  }
}
