import { OpenAI } from "openai";

// In-memory storage (not persistent across function invocations)
// For production, use a database like MongoDB Atlas, Supabase, or Upstash Redis
const pendingRequests = {};

export default async function handler(req, res) {
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return res.status(500).json({
        error: "Server configuration error - API key missing",
      });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Process based on HTTP method
    if (req.method === "POST") {
      // Start generation request
      const { description } = req.body;
      const cleanDescription = description?.trim();

      if (!cleanDescription) {
        return res.status(400).json({ error: "Description is required" });
      }

      console.log("Starting image generation for:", cleanDescription);

      // Generate a unique request ID
      const requestId =
        Date.now().toString() + Math.random().toString(36).substring(2, 7);

      // Store the request details (for status checking)
      pendingRequests[requestId] = {
        status: "processing",
        description: cleanDescription,
        timestamp: Date.now(),
      };

      // Start the image generation in background (won't block response)
      setTimeout(async () => {
        try {
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

          // Store the result
          pendingRequests[requestId] = {
            status: "completed",
            imageUrl: response.data[0].url,
            timestamp: Date.now(),
          };
          console.log("Image generation completed for request:", requestId);
        } catch (error) {
          console.error("Error generating image:", error);
          pendingRequests[requestId] = {
            status: "error",
            error: error.message,
            timestamp: Date.now(),
          };
        }
      }, 0);

      // Return immediately with the request ID
      return res.status(202).json({
        requestId: requestId,
        status: "processing",
        message: "Image generation started",
      });
    } else if (req.method === "GET") {
      // Check status of a request
      const { requestId } = req.query;

      if (!requestId || !pendingRequests[requestId]) {
        return res.status(404).json({ error: "Request not found" });
      }

      const request = pendingRequests[requestId];

      // If completed, return the result
      if (request.status === "completed") {
        return res.status(200).json({
          status: "completed",
          imageUrl: request.imageUrl,
        });
      }
      // If error, return the error
      else if (request.status === "error") {
        return res.status(500).json({
          status: "error",
          error: request.error,
        });
      }
      // If still processing
      return res.status(200).json({
        status: "processing",
        message: "Image generation in progress",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Failed to process request",
      message: error.message,
    });
  }
}
