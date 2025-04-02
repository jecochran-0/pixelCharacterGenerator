export default function handler(req, res) {
  try {
    // Check if OpenAI API key is configured
    const apiKeyConfigured = !!process.env.OPENAI_API_KEY;

    // Don't return the actual key for security reasons
    return res.status(200).json({
      apiKeyConfigured: apiKeyConfigured,
      apiKeyFirstChar: apiKeyConfigured
        ? process.env.OPENAI_API_KEY.substring(0, 3) + "..."
        : null,
      nodeEnv: process.env.NODE_ENV || "not set",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
