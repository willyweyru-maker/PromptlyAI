"use client";

import { useState } from "react";

export default function SocialGenerator() {
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setPosts([]);

    // Call our API (we'll create this next)
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, platform }),
    });

    const data = await res.json();
    setPosts(data.posts || ["Error generating posts. We'll fix AI next."]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
          AI Social Media Post Generator
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Describe your business update, choose a platform, and get ready-to-post ideas!
        </p>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., New handmade jewelry collection, perfect for gifts"
            className="w-full p-4 border rounded-lg mb-4 h-32"
            required
          />

          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full p-4 border rounded-lg mb-6"
          >
            <option>Instagram</option>
            <option>Facebook</option>
            <option>X (Twitter)</option>
            <option>LinkedIn</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Posts"}
          </button>
        </form>

        {posts.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold">Your Generated Posts:</h2>
            {posts.map((post, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow">
                <p className="whitespace-pre-wrap">{post}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}