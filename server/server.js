import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("public"));

// BURAYA EKLE
app.get("/", (req, res) => {
  res.send("Todi API çalışıyor 🚀");
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Todi, a realistic AI avatar. Talk naturally.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));