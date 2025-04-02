export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    const imageBuffer = await response.arrayBuffer();

    // Set appropriate headers
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pixel-character.png"
    );
    res.setHeader("Content-Type", "image/png");

    // Send the image data
    return res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error("Error downloading image:", error);
    return res.status(500).send("Failed to download image");
  }
}
