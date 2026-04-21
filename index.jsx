import { useState, useRef } from "react";

const PINK = {
  50: "#FBEAF0",
  100: "#F4C0D1",
  200: "#ED93B1",
  300: "#E07098",
  400: "#D4537E",
  600: "#993556",
  800: "#72243E",
};

const tabs = [
  { id: "image", label: "Image scan", icon: "◈", desc: "Detect AI-generated images", hint: "Paste an image URL or upload a file" },
  { id: "text", label: "Text scan", icon: "❋", desc: "Detect AI-written content", hint: "Paste any text — article, caption, review..." },
  { id: "product", label: "Product check", icon: "◉", desc: "Spot fraudulent listings", hint: "Paste the full product listing details" },
  { id: "seller", label: "Seller check", icon: "◎", desc: "Verify seller legitimacy", hint: "Paste seller profile, reviews, bio..." },
];

const systemPrompts = {
  image: `You are an expert AI image forensics analyst. Analyze images to determine if they are AI-generated. Look for: unnatural textures, geometric inconsistencies, watermarks or artifacts from AI tools (Midjourney, DALL-E, Stable Diffusion), overly smooth skin or hair, surreal lighting, impossible shadows, background distortions, facial feature asymmetries, hands with wrong number of fingers, text rendered incorrectly within the image, clothing/fabric that defies physics, repetitive background patterns. Respond ONLY in valid JSON with no extra text:
{"verdict":"AI-GENERATED"|"LIKELY AI"|"UNCERTAIN"|"LIKELY REAL"|"AUTHENTIC","confidence":0-100,"riskScore":0-100,"signals":["array of specific signals found"],"summary":"2-3 sentence analysis"}`,

  text: `You are an expert AI text detection specialist. Analyze text to determine if it was written by an AI or a human. Look for: uniform sentence length and structure, overly balanced paragraphs, absence of personal voice or lived experience, generic transitional phrases ("it's important to note", "in conclusion", "moreover"), unnaturally comprehensive coverage, absence of typos or colloquialisms, excessive hedging, repetitive patterns in sentence starters, lack of strong opinion, suspiciously perfect grammar. Respond ONLY in valid JSON with no extra text:
{"verdict":"AI-WRITTEN"|"LIKELY AI"|"UNCERTAIN"|"LIKELY HUMAN"|"HUMAN-WRITTEN","confidence":0-100,"riskScore":0-100,"signals":["array of specific signals found"],"summary":"2-3 sentence analysis"}`,

  product: `You are a fraud detection expert specializing in e-commerce. Analyze product listings for fraud signals. Look for: prices dramatically below market value, vague or plagiarized descriptions, stolen product images, missing brand or manufacturer info, keyword stuffing, implausible specifications, unrealistic delivery promises, no return policy, suspicious pricing patterns (ends in .99 across all items), generic stock photos, counterfeit brand signals, inconsistent currency/units, fake review language. Respond ONLY in valid JSON with no extra text:
{"verdict":"FRAUDULENT"|"SUSPICIOUS"|"UNCERTAIN"|"LIKELY LEGIT"|"LEGITIMATE","confidence":0-100,"riskScore":0-100,"signals":["array of specific signals found"],"summary":"2-3 sentence analysis"}`,

  seller: `You are a marketplace fraud analyst. Analyze seller profiles and information for legitimacy. Look for: very new accounts with high sales volume claims, vague business details, location inconsistencies, patterns matching known scam profiles, uniform 5-star reviews with generic praise, no negative feedback, recently created profiles, mismatched shipping origin and seller location, copy-pasted store descriptions, unrealistic guarantees, pressure tactics, no verifiable contact info, too-wide product range suggesting dropship scam, unusual response time claims. Respond ONLY in valid JSON with no extra text:
{"verdict":"FRAUDULENT"|"SUSPICIOUS"|"UNCERTAIN"|"LIKELY LEGIT"|"LEGITIMATE","confidence":0-100,"riskScore":0-100,"signals":["array of specific signals found"],"summary":"2-3 sentence analysis"}`,
};

const verdictStyle = (verdict) => {
  if (!verdict) return { color: "#5F5E5A", bg: "#F1EFE8" };
  const v = verdict.toLowerCase();
  if (v.includes("fraud") || v === "ai-generated" || v === "ai-written")
    return { color: "#A32D2D", bg: "#FCEBEB" };
  if (v.includes("suspicious") || v.includes("likely ai"))
    return { color: "#854F0B", bg: "#FAEEDA" };
  if (v.includes("uncertain"))
    return { color: "#5F5E5A", bg: "#F1EFE8" };
  return { color: "#3B6D11", bg: "#EAF3DE" };
};

const riskBarColor = (score) => {
  if (score > 70) return "#E24B4A";
  if (score > 40) return "#EF9F27";
  return "#639922";
};

export default function FraudGuard() {
  const [activeTab, setActiveTab] = useState("image");
  const [inputs, setInputs] = useState({ image: "", text: "", product: "", seller: "" });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setInputs((i) => ({ ...i, image: "" }));
  };

  const analyze = async (tab) => {
    const inputVal = inputs[tab];
    const hasImageFile = tab === "image" && imageFile;
    if (!inputVal.trim() && !hasImageFile) return;

    setLoading((l) => ({ ...l, [tab]: true }));
    setResults((r) => ({ ...r, [tab]: null }));

    try {
      let messages;

      if (hasImageFile) {
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target.result.split(",")[1]);
          reader.onerror = () => rej(new Error("read failed"));
          reader.readAsDataURL(imageFile);
        });
        messages = [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: imageFile.type, data: base64 } },
              { type: "text", text: "Analyze this image for AI generation signals. Respond only in the JSON format specified in your system prompt." },
            ],
          },
        ];
      } else if (tab === "image" && inputVal.trim()) {
        messages = [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "url", url: inputVal.trim() } },
              { type: "text", text: "Analyze this image for AI generation signals. Respond only in the JSON format specified in your system prompt." },
            ],
          },
        ];
      } else {
        messages = [{ role: "user", content: inputVal }];
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompts[tab],
          messages,
        }),
      });

      const data = await response.json();
      const rawText = (data.content || []).map((c) => c.text || "").join("");
      const clean = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults((r) => ({ ...r, [tab]: parsed }));
    } catch {
      setResults((r) => ({ ...r, [tab]: { error: true, summary: "Analysis failed. Please check your input and try again." } }));
    } finally {
      setLoading((l) => ({ ...l, [tab]: false }));
    }
  };

  const tab = tabs.find((t) => t.id === activeTab);
  const result = results[activeTab];
  const isLoading = loading[activeTab];
  const canAnalyze = inputs[activeTab].trim() || (activeTab === "image" && imageFile);

  const placeholders = {
    image: "Paste image URL (https://example.com/photo.jpg)",
    text: "Paste the text you want to analyze for AI generation...\n\nSupports: articles, captions, product descriptions, emails, social posts, academic work...",
    product: "Paste the full product listing — title, description, price, specs, seller info, reviews...",
    seller: "Paste seller profile — name, account age, ratings, reviews, bio, return policy, contact info...",
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 680, margin: "0 auto", padding: "0 0 2rem" }}>

      {/* Header */}
      <div style={{ padding: "1.5rem 0 1.25rem", borderBottom: `2px solid ${PINK[400]}`, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: PINK[400],
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1" fill="none" />
              <line x1="8" y1="1" x2="8" y2="3.5" stroke="white" strokeWidth="1.2" />
              <line x1="8" y1="12.5" x2="8" y2="15" stroke="white" strokeWidth="1.2" />
              <line x1="1" y1="8" x2="3.5" y2="8" stroke="white" strokeWidth="1.2" />
              <line x1="12.5" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "-0.3px" }}>
                Fraud<span style={{ color: PINK[400] }}>Guard</span>
              </h1>
              <span style={{
                fontSize: 10, fontWeight: 500, letterSpacing: 0.8,
                background: PINK[50], color: PINK[600],
                padding: "2px 7px", borderRadius: 20,
                border: `0.5px solid ${PINK[200]}`,
              }}>AI-POWERED</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>
              Detect AI content · fake products · fraudulent sellers
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "7px 14px",
              border: activeTab === t.id ? `1.5px solid ${PINK[400]}` : "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-md)",
              background: activeTab === t.id ? PINK[50] : "transparent",
              color: activeTab === t.id ? PINK[600] : "var(--color-text-secondary)",
              fontSize: 13,
              fontWeight: activeTab === t.id ? 500 : 400,
              cursor: "pointer",
              transition: "all 0.12s",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: 11 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        marginBottom: "1rem",
      }}>
        <div style={{
          padding: "10px 14px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-secondary)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500 }}>
            {tab.icon} {tab.desc}
          </span>
          {activeTab === "image" && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 500,
                border: `0.5px solid ${PINK[300]}`,
                borderRadius: "var(--border-radius-md)",
                background: PINK[50], color: PINK[600], cursor: "pointer",
              }}
            >
              Upload file
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        </div>

        {/* Image preview */}
        {activeTab === "image" && imagePreview && (
          <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ height: 60, width: 60, objectFit: "cover", borderRadius: "var(--border-radius-md)", border: `0.5px solid ${PINK[200]}` }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>{imageFile?.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-tertiary)" }}>{(imageFile?.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={clearImage}
              style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-tertiary)", border: "none", background: "none", cursor: "pointer", padding: "4px 8px" }}
            >
              Remove
            </button>
          </div>
        )}

        <textarea
          value={inputs[activeTab]}
          onChange={(e) => {
            setInputs((i) => ({ ...i, [activeTab]: e.target.value }));
            if (activeTab === "image" && e.target.value) clearImage();
          }}
          placeholder={imageFile ? "Image ready — click Analyze to scan" : placeholders[activeTab]}
          disabled={!!(activeTab === "image" && imageFile)}
          style={{
            width: "100%",
            minHeight: activeTab === "text" ? 140 : 100,
            padding: "12px 14px",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            background: "transparent",
            color: "var(--color-text-primary)",
            boxSizing: "border-box",
            lineHeight: 1.6,
          }}
        />

        <div style={{
          padding: "10px 14px",
          borderTop: "0.5px solid var(--color-border-tertiary)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{tab.hint}</span>
          <button
            onClick={() => analyze(activeTab)}
            disabled={isLoading || !canAnalyze}
            style={{
              padding: "8px 18px",
              background: isLoading || !canAnalyze ? "var(--color-background-secondary)" : PINK[400],
              color: isLoading || !canAnalyze ? "var(--color-text-tertiary)" : "white",
              border: "none",
              borderRadius: "var(--border-radius-md)",
              fontSize: 13,
              fontWeight: 500,
              cursor: isLoading || !canAnalyze ? "default" : "pointer",
              minWidth: 110,
              transition: "background 0.15s",
            }}
          >
            {isLoading ? "Scanning..." : "Analyze →"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{
          padding: "1.5rem",
          background: PINK[50],
          border: `0.5px solid ${PINK[200]}`,
          borderRadius: "var(--border-radius-lg)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1, color: PINK[600], marginBottom: 6 }}>ANALYZING</div>
          <div style={{ fontSize: 13, color: PINK[800] }}>Scanning for fraud signals...</div>
        </div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
        }}>
          {result.error ? (
            <div style={{ padding: "1.25rem", color: "#A32D2D", fontSize: 13 }}>{result.summary}</div>
          ) : (
            <>
              {/* Verdict + risk */}
              <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                background: "var(--color-background-secondary)",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: 0.5,
                    background: verdictStyle(result.verdict).bg,
                    color: verdictStyle(result.verdict).color,
                  }}>
                    {result.verdict}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {result.confidence}% confidence
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.8, color: "var(--color-text-tertiary)" }}>RISK SCORE</span>
                  <div style={{ width: 80, height: 5, background: "var(--color-border-tertiary)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${result.riskScore}%`,
                      background: riskBarColor(result.riskScore),
                      borderRadius: 3,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 500, minWidth: 32,
                    color: riskBarColor(result.riskScore),
                  }}>
                    {result.riskScore}%
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
                  {result.summary}
                </p>
              </div>

              {/* Signals */}
              {result.signals && result.signals.length > 0 && (
                <div style={{ padding: "1rem 1.25rem" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 500, letterSpacing: 1, color: "var(--color-text-tertiary)" }}>
                    DETECTED SIGNALS
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {result.signals.map((signal, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: PINK[400], fontSize: 8, marginTop: 5, flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                          {signal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !isLoading && (
        <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: PINK[50],
            border: `0.5px solid ${PINK[200]}`,
            margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: PINK[300],
          }}>
            {tab.icon}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-tertiary)" }}>{tab.hint}</p>
        </div>
      )}

    </div>
  );
}
