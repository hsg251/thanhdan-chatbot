require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {

    try {

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "tencent/hy3:free",
                    stream: true,
                    messages: req.body.messages
                })
            }
        );

        if (!response.ok) {

            const txt = await response.text();

            console.log(txt);

            return res.status(500).send(txt);

        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        while (true) {

            const { done, value } = await reader.read();

            if (done) break;

            res.write(decoder.decode(value));

        }

        res.end();

    } catch (err) {

        console.log(err);

        res.status(500).end();

    }

});

app.listen(3000, () => {

    console.log("Server running");

});