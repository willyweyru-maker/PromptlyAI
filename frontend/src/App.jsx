import { useState, useEffect } from "react";

const DAILY_LIMIT = 3;

export default function App() {
  const [tab, setTab] = useState("posts");

  /* ===== PLAN ===== */
  const [usage, setUsage] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [isPro, setIsPro] = useState(false);

  /* ===== SOCIAL POSTS ===== */
  const [business, setBusiness] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Professional");
  const [promo, setPromo] = useState("");
  const [industry, setIndustry] = useState("General");
  const [posts, setPosts] = useState([]);

  /* ===== LEAD REPLIES ===== */
  const [leadMessage, setLeadMessage] = useState("");
  const [replyPlatform, setReplyPlatform] = useState("WhatsApp");
  const [replyTone, setReplyTone] = useState("Friendly");
  const [reply, setReply] = useState("");

  /* ===== HISTORY ===== */
  const [history, setHistory] = useState([]);

  /* ===== INIT ===== */
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem("usage") || "{}");

    if (saved.date !== today) {
      localStorage.setItem("usage", JSON.stringify({ date: today, count: 0 }));
      setUsage(0);
    } else {
      setUsage(saved.count || 0);
      setLimitReached(saved.count >= DAILY_LIMIT);
    }

    setIsPro(localStorage.getItem("isPro") === "true");
    setHistory(JSON.parse(localStorage.getItem("history") || "[]"));
  }, []);

  const incrementUsage = () => {
    if (isPro) return;
    const today = new Date().toDateString();
    const count = usage + 1;
    localStorage.setItem("usage", JSON.stringify({ date: today, count }));
    setUsage(count);
    if (count >= DAILY_LIMIT) setLimitReached(true);
  };

  const saveHistory = (text) => {
    const updated = [{ text, time: new Date().toLocaleString() }, ...history];
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  /* ===== GENERATORS (SAFE) ===== */
  const generatePosts = () => {
    if (!business || limitReached) return;

    const template =
      industry === "Restaurant"
        ? "Fresh flavors served daily"
        : industry === "E-commerce"
        ? "Shop smarter today"
        : "Trusted by customers";

    const result = [
      `🚀 ${business} is live on ${platform}! ${promo || template}.`,
      `✨ ${tone} energy. ${business} delivers results.`,
      `📣 Discover ${business}. ${promo || "DM us to learn more."}`,
    ];

    setPosts(result);
    saveHistory(result.join("\n"));
    incrementUsage();
  };

  const generateReply = () => {
    if (!leadMessage || limitReached) return;

    const result = `Hi! Thanks for reaching out on ${replyPlatform} 😊  
We’re happy to help — tell us what you need and we’ll assist right away.`;

    setReply(result);
    saveHistory(result);
    incrementUsage();
  };

  const copyText = (text) => navigator.clipboard.writeText(text);

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div style={styles.card}>
        <h1 style={styles.title}>PromptlyAI</h1>

        <div style={styles.planBar}>
          <span>{isPro ? "🌟 Pro" : "Free"}</span>
          <strong>{isPro ? "Unlimited" : `${usage}/${DAILY_LIMIT}`}</strong>
        </div>

        {!isPro && limitReached && (
          <div style={styles.upgradeBox}>
            Daily limit reached
            <button
              className="glowBtn"
              onClick={() => {
                localStorage.setItem("isPro", "true");
                setIsPro(true);
                setLimitReached(false);
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* TABS */}
        <div style={styles.tabs}>
          {["posts", "replies", "history"].map((t) => (
            <button
              key={t}
              className={tab === t ? "tab active" : "tab"}
              onClick={() => setTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* POSTS */}
        {tab === "posts" && (
          <>
            <div style={styles.grid}>
              <input style={styles.input} placeholder="Business" value={business} onChange={(e) => setBusiness(e.target.value)} />
              <select style={styles.input} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
              </select>
              <select style={styles.input} value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Professional</option>
                <option>Friendly</option>
                <option>Bold</option>
              </select>
              <select style={styles.input} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option>General</option>
                <option>Restaurant</option>
                <option>E-commerce</option>
              </select>
            </div>

            <button className="glowBtn" onClick={generatePosts} disabled={limitReached}>
              Generate Posts
            </button>

            {posts.map((p, i) => (
              <div key={i} style={styles.result}>
                {p}
                <button className="miniBtn" onClick={() => copyText(p)}>Copy</button>
              </div>
            ))}
          </>
        )}

        {/* REPLIES */}
        {tab === "replies" && (
          <>
            <select style={styles.input} value={replyPlatform} onChange={(e) => setReplyPlatform(e.target.value)}>
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>Email</option>
            </select>

            <textarea
              style={styles.textarea}
              placeholder="Paste lead message..."
              value={leadMessage}
              onChange={(e) => setLeadMessage(e.target.value)}
            />

            <button className="glowBtn" onClick={generateReply} disabled={limitReached}>
              Generate Reply
            </button>

            {reply && (
              <div style={styles.result}>
                {reply}
                <button className="miniBtn" onClick={() => copyText(reply)}>Copy</button>
              </div>
            )}
          </>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <>
            {history.length === 0 && <p>No history yet.</p>}
            {history.map((h, i) => (
              <div key={i} style={styles.result}>
                <small>{h.time}</small>
                <p>{h.text}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #0f2027, #000)",
    display: "flex",
    justifyContent: "center",
    padding: 40,
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },
  card: {
    width: "100%",
    maxWidth: 900,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 36,
    boxShadow: "0 0 60px rgba(0,255,255,0.15)",
  },
  title: {
    textAlign: "center",
    fontSize: "2.5rem",
    background: "linear-gradient(90deg,#7cffcb,#00f5ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  planBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
    opacity: 0.8,
  },
  upgradeBox: {
    background: "linear-gradient(135deg,#ff9f43,#ff6b6b)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 14,
  },
  input: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    marginBottom: 14,
  },
  result: {
    background: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    position: "relative",
  },
};

const css = `
.tab {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #7cffcb;
  cursor: pointer;
}
.tab.active {
  background: linear-gradient(135deg,#7cffcb,#00f5ff);
  color: #000;
  font-weight: bold;
}
.glowBtn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  margin-top: 10px;
  font-weight: bold;
  background: linear-gradient(135deg,#7cffcb,#00f5ff);
  cursor: pointer;
  transition: box-shadow .3s, transform .2s;
}
.glowBtn:hover {
  box-shadow: 0 0 20px rgba(0,255,255,.7);
  transform: translateY(-1px);
}
.miniBtn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: #000;
  color: #7cffcb;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}
`;
