import express from "express";
import { openai } from "../services/openai.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { business, platform, tone, promo } = req.body;

        // Validate required fields
        if (!business || !platform || !tone || !promo) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const prompt = `
        Create 3 ${platform} posts for a ${business}.
        Tone: ${tone}.
        Promotion: ${promo}.
        Include hashtags and emojis.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8
        });

        res.json({ posts: response.choices[0].message.content });
    } catch (error) {
        console.error("Generation error:", error);
        res.status(500).json({ error: "Failed to generate posts" });
    }
});

export default router;