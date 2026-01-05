import { useState } from "react";
import { generatePost } from "./api";

function App() {
    const [business, setBusiness] = useState("");
    const [platform, setPlatform] = useState("Instagram");
    const [tone, setTone] = useState("Professional");
    const [promo, setPromo] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleGenerate() {
        setLoading(true);
        setResult("");

        try {
            const data = await generatePost({
                business,
                platform,
                tone,
                promo
            });

            setResult(data.posts);
        } catch (error) {
            setResult("Something went wrong.");
        }

        setLoading(false);
    }

    return (
        <div style={{ padding: 20, maxWidth: 600 }}>
            <h1>Social Media Post Generator</h1>

            <input
                placeholder="Business name"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
            />

            <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
            >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>Twitter (X)</option>
                <option>LinkedIn</option>
            </select>

            <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
            >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Motivational</option>
                <option>Luxury</option>
                <option>Funny</option>
            </select>

            <input
                placeholder="Promotion (optional)"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
            />

            <button onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Posts"}
            </button>

            <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
                {result}
            </pre>
        </div>
    );
}

export default App;