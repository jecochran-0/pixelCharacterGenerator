require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/generate-hero", async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    const imageUrl = response.data[0].url;
    res.status(200).send({ imageUrl: imageUrl });
  } catch (error) {
    console.error("Error generating hero:", error);
    res.status(500).send(error);
  }
});

app.post("/generate-backstory", async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an epic storyteller",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const backstory = response.choices[0].message.content;
    res.status(200).send({ backstory: backstory });
  } catch (error) {
    console.error("Error generating hero:", error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
