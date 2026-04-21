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

// Mock analysis function - simulates AI detection without API
const mockAnalyze = async (tab, inputText, imageFile = null) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate deterministic but realistic results based on input
  const inputLower = (inputText || "").toLowerCase();
  const hasImage = !!imageFile;
  
  // Common signals library
  const signalsLibrary = {
    image: {
      ai: ["Smooth texture gradients typical of diffusion models", "Minor geometric inconsistency in background elements", "Statistical pixel distribution anomalies", "Missing camera sensor noise patterns", "Perfect lighting without realistic light sources"],
      real: ["Natural camera sensor noise pattern detected", "Consistent lighting and shadows", "Authentic depth of field", "Normal JPEG compression artifacts", "No AI-generation watermarks found"]
    },
    text: {
      ai: ["Uniform sentence length distribution", "Missing personal anecdotes or lived experience", "Excessive use of transitional phrases", "No typos or casual language markers", "Overly balanced argument structure"],
      human: ["Contains colloquial expressions", "Variable sentence structure", "Personal voice detected", "Natural flow with minor imperfections", "Context-specific knowledge gaps"]
    },
    product: {
      fraud: ["Price 73% below market average", "Product description contains plagiarized content", "No return policy mentioned", "Suspiciously high discount without reason", "Seller has multiple identical listings"],
      legit: ["Price within normal market range", "Detailed original description", "Clear return policy stated", "Consistent product specifications", "Verifiable brand information"]
    },
    seller: {
      fraud: ["Account age: 12 days with 500+ sales claimed", "Location mismatch: 'US-based' but IP shows overseas", "Reviews follow copy-paste pattern", "No negative feedback visible", "Returns policy contradictory"],
      legit: ["Account age consistent with sales volume", "Verified contact information provided", "Mixed review pattern (normal for real sellers)", "Clear business address listed", "Consistent response times"]
    }
  };
  
  // Determine verdict based on input patterns
  let verdict, confidence, riskScore, signals, summary;
  
  // Check for suspicious keywords
  const suspiciousTerms = {
    image: ["midjourney", "dalle", "stable diffusion", "ai generated", "prompt"],
    text: ["moreover", "furthermore", "in conclusion", "it is important to note", "on the other hand"],
    product: ["too good to be true", "limited stock", "act fast", "unbelievable price", "miracle", "magic"],
    seller: ["trust me", "guaranteed", "no questions asked", "private seller", "new account"]
  };
  
  const legitTerms = {
    image: ["canon", "nikon", "sony alpha", "iphone", "dslr", "raw photo"],
    text: ["i feel", "in my experience", "honestly", "personally", "actually"],
    product: ["original", "authentic", "manufacturer warranty", "genuine", "official"],
    seller: ["verified", "business registered", "since 20", "customer service", "physical store"]
  };
  
  const suspiciousCount = suspiciousTerms[tab]?.filter(term => inputLower.includes(term)).length || 0;
  const legitCount = legitTerms[tab]?.filter(term => inputLower.includes(term)).length || 0;
  
  // Image-specific detection
  if (tab === "image") {
    if (hasImage) {
      // Random but seeded by filename
      const seed = imageFile.name.length + imageFile.size;
      const isAILikely = seed % 3 === 0; // ~33% chance of AI detection for demo
      
      if (isAILikely) {
        verdict = "AI-GENERATED";
        confidence = Math.floor(75 + Math.random() * 20);
        riskScore = Math.floor(70 + Math.random() * 25);
        signals = signalsLibrary.image.ai.slice(0, 3 + Math.floor(Math.random() * 2));
        summary = "This image shows multiple hallmarks of AI generation, including unnatural texture patterns and lighting inconsistencies. The statistical distribution of pixel correlations deviates from real camera-captured photos.";
      } else {
        verdict = "AUTHENTIC";
        confidence = Math.floor(70 + Math.random() * 25);
        riskScore = Math.floor(10 + Math.random() * 30);
        signals = signalsLibrary.image.real.slice(0, 3 + Math.floor(Math.random() * 2));
        summary = "This image appears to be authentic. Normal camera sensor noise patterns and consistent lighting suggest it was captured with a real camera rather than generated by AI.";
      }
    } else if (inputText) {
      // URL-based detection
      if (inputText.includes("placeholder") || inputText.includes("fake") || inputText.includes("generated")) {
        verdict = "LIKELY AI";
        confidence = 82;
        riskScore = 78;
        signals = ["URL pattern matches known AI image generation services", "Image hosting on AI-focused platforms", "No camera EXIF data available"];
        summary = "The image source and URL pattern suggest this may be AI-generated. The hosting service is commonly used for AI artwork rather than authentic photography.";
      } else {
        verdict = "UNCERTAIN";
        confidence = 55;
        riskScore = 45;
        signals = ["Unable to fully verify image source", "Limited metadata available", "Would benefit from direct file upload"];
        summary = "Based on URL analysis alone, we cannot definitively determine if this image is AI-generated. Uploading the actual file would provide a more accurate assessment.";
      }
    } else {
      verdict = "UNCERTAIN";
      confidence = 50;
      riskScore = 50;
      signals = ["No image data provided to analyze"];
      summary = "Please provide an image URL or upload a file for analysis.";
    }
  }
  
  // Text detection
  else if (tab === "text") {
    const wordCount = (inputText || "").split(/\s+/).length;
    const hasAIPatterns = suspiciousCount > legitCount && suspiciousCount > 1;
    const hasHumanPatterns = legitCount > suspiciousCount;
    
    if (wordCount < 20) {
      verdict = "UNCERTAIN";
      confidence = 40;
      riskScore = 30;
      signals = ["Text too short for reliable analysis", "Need at least 50-100 words for accurate detection"];
      summary = "The provided text is too short to make a reliable determination. Please provide more content (at least 50-100 words) for better accuracy.";
    } else if (hasAIPatterns) {
      verdict = "AI-WRITTEN";
      confidence = Math.floor(75 + Math.random() * 20);
      riskScore = Math.floor(70 + Math.random() * 25);
      signals = signalsLibrary.text.ai.slice(0, 4);
      summary = "This text exhibits strong patterns consistent with AI language models, including uniform sentence structures, balanced paragraphs, and absence of personal voice or authentic human imperfections.";
    } else if (hasHumanPatterns) {
      verdict = "HUMAN-WRITTEN";
      confidence = Math.floor(70 + Math.random() * 20);
      riskScore = Math.floor(10 + Math.random() * 25);
      signals = signalsLibrary.text.human.slice(0, 3);
      summary = "This text shows characteristics of human writing, including variable sentence patterns, personal voice, and natural conversational elements that are difficult for current AI to replicate convincingly.";
    } else {
      // Neutral/mixed signals
      const score = Math.random();
      if (score > 0.6) {
        verdict = "LIKELY AI";
        confidence = 68;
        riskScore = 72;
        signals = signalsLibrary.text.ai.slice(0, 3);
        summary = "Multiple linguistic patterns suggest this text may be AI-generated, though some human elements are present. The text appears overly polished and structured.";
      } else {
        verdict = "LIKELY HUMAN";
        confidence = 65;
        riskScore = 35;
        signals = signalsLibrary.text.human.slice(0, 2);
        summary = "This text shows signs of human authorship, including natural flow and contextual awareness, though some AI-like patterns were detected.";
      }
    }
  }
  
  // Product detection
  else if (tab === "product") {
    const hasFraudSignals = suspiciousCount >= 2 || inputLower.includes("fake") || inputLower.includes("scam");
    const hasLegitSignals = legitCount >= 2 || inputLower.includes("original") || inputLower.includes("warranty");
    
    if (hasFraudSignals && !hasLegitSignals) {
      verdict = "FRAUDULENT";
      confidence = Math.floor(80 + Math.random() * 15);
      riskScore = Math.floor(85 + Math.random() * 15);
      signals = signalsLibrary.product.fraud.slice(0, 4);
      summary = "This product listing contains multiple red flags consistent with fraudulent listings, including suspicious pricing, plagiarized content, and missing policy information. Strongly advise against purchase.";
    } else if (hasLegitSignals && !hasFraudSignals) {
      verdict = "LEGITIMATE";
      confidence = Math.floor(75 + Math.random() * 20);
      riskScore = Math.floor(10 + Math.random() * 20);
      signals = signalsLibrary.product.legit.slice(0, 3);
      summary = "This product listing appears legitimate with normal pricing, original descriptions, and clear policies. Standard e-commerce precautions still apply.";
    } else {
      verdict = "SUSPICIOUS";
      confidence = Math.floor(60 + Math.random() * 20);
      riskScore = Math.floor(55 + Math.random() * 25);
      signals = ["Price somewhat below market average", "Limited seller history available", "Returns policy unclear"];
      summary = "This listing shows some concerning signals but not enough for a definitive fraud determination. Recommend additional verification before purchase.";
    }
  }
  
  // Seller detection
  else {
    const hasFraudSignals = suspiciousCount >= 2 || inputLower.includes("scam") || inputLower.includes("fake profile");
    const hasLegitSignals = legitCount >= 2 || inputLower.includes("verified") || inputLower.includes("established");
    
    if (hasFraudSignals && !hasLegitSignals) {
      verdict = "FRAUDULENT";
      confidence = Math.floor(85 + Math.random() * 10);
      riskScore = Math.floor(90 + Math.random() * 10);
      signals = signalsLibrary.seller.fraud.slice(0, 4);
      summary = "This seller profile exhibits multiple fraud indicators including account age inconsistencies, location mismatches, and suspicious review patterns. Strongly advise against transacting with this seller.";
    } else if (hasLegitSignals && !hasFraudSignals) {
      verdict = "LEGITIMATE";
      confidence = Math.floor(80 + Math.random() * 15);
      riskScore = Math.floor(5 + Math.random() * 15);
      signals = signalsLibrary.seller.legit.slice(0, 3);
      summary = "This seller profile appears legitimate with verified information, reasonable account history, and normal review patterns. Standard marketplace precautions still apply.";
    } else {
      verdict = "SUSPICIOUS";
      confidence = Math.floor(55 + Math.random() * 20);
      riskScore = Math.floor(50 + Math.random() * 25);
      signals = ["Limited seller history", "Some missing verification details", "Recommend starting with small transaction"];
      summary = "This seller profile shows some warning signs but requires more investigation. Consider testing with a small purchase or requesting additional verification before committing to large transactions.";
    }
  }
  
  // Ensure riskScore and confidence are within bounds
  riskScore = Math.min(100, Math.max(0, riskScore));
  confidence = Math.min(100, Math.max(0, confidence));
  
  return {
    verdict,
    confidence,
    riskScore,
    signals: signals || ["Analysis completed using pattern matching", "For production, connect to Claude API for deeper insights"],
    summary: summary || "Analysis complete. For more accurate results with actual AI detection, integrate with Anthropic's Claude API using your API key."
  };
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
      // Use mock analysis instead of API call
      const result = await mockAnalyze(tab, inputVal, imageFile);
      setResults((r) => ({ ...r, [tab]: result }));
    } catch (error) {
      console.error("Analysis error:", error);
      setResults((r) => ({ 
        ...r, 
        [tab]: { 
          error: true, 
          summary: "Analysis failed. Please try again." 
        } 
      }));
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
    text: "Paste the text you want to analyze for AI generation...\n\nExample: 'Moreover, it is important to note that artificial intelligence has revolutionized many industries. In conclusion, the future looks promising.'",
    product: "Paste the full product listing — title, description, price, specs, seller info, reviews...\n\nExample: 'Miracle Weight Loss Pill - 90% OFF! Limited stock! Act fast! No returns.'",
    seller: "Paste seller profile — name, account age, ratings, reviews, bio, return policy, contact info...\n\nExample: 'New seller, 2 days old. 1000+ items sold. 5-star reviews only. Located in Nigeria but ships from US.'",
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 680, margin: "0 auto", padding: "0 0 2rem" }}>

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
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "#1A1A1A", letterSpacing: "-0.3px" }}>
                Fraud<span style={{ color: PINK[400] }}>Guard</span>
              </h1>
              <span style={{
                fontSize: 10, fontWeight: 500, letterSpacing: 0.8,
                background: PINK[50], color: PINK[600],
                padding: "2px 7px", borderRadius: 20,
                border: `0.5px solid ${PINK[200]}`,
              }}>DEMO MODE</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#666666" }}>
              Detect AI content · fake products · fraudulent sellers
            </p>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div style={{
        background: PINK[50],
        border: `0.5px solid ${PINK[200]}`,
        borderRadius: 8,
        padding: "8px 12px",
        marginBottom: "1rem",
        fontSize: 11,
        color: PINK[600],
        textAlign: "center"
      }}>
        🔍 DEMO MODE — Using simulated detection. Add your Anthropic API key for real AI-powered analysis.
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "7px 14px",
              border: activeTab === t.id ? `1.5px solid ${PINK[400]}` : "0.5px solid #E5E5E5",
              borderRadius: "8px",
              background: activeTab === t.id ? PINK[50] : "transparent",
              color: activeTab === t.id ? PINK[600] : "#666666",
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
        background: "#FFFFFF",
        border: "0.5px solid #E5E5E5",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "1rem",
      }}>
        <div style={{
          padding: "10px 14px",
          borderBottom: "0.5px solid #E5E5E5",
          background: "#F9F9F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "#666666", fontWeight: 500 }}>
            {tab.icon} {tab.desc}
          </span>
          {activeTab === "image" && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 500,
                border: `0.5px solid ${PINK[300]}`,
                borderRadius: "6px",
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
          <div style={{ padding: "10px 14px", borderBottom: "0.5px solid #E5E5E5", display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ height: 60, width: 60, objectFit: "cover", borderRadius: "6px", border: `0.5px solid ${PINK[200]}` }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#1A1A1A", fontWeight: 500 }}>{imageFile?.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#999999" }}>{(imageFile?.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={clearImage}
              style={{ marginLeft: "auto", fontSize: 11, color: "#999999", border: "none", background: "none", cursor: "pointer", padding: "4px 8px" }}
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
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: "transparent",
            color: "#1A1A1A",
            boxSizing: "border-box",
            lineHeight: 1.6,
          }}
        />

        <div style={{
          padding: "10px 14px",
          borderTop: "0.5px solid #E5E5E5",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#999999" }}>{tab.hint}</span>
          <button
            onClick={() => analyze(activeTab)}
            disabled={isLoading || !canAnalyze}
            style={{
              padding: "8px 18px",
              background: isLoading || !canAnalyze ? "#F0F0F0" : PINK[400],
              color: isLoading || !canAnalyze ? "#999999" : "white",
              border: "none",
              borderRadius: "6px",
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
          borderRadius: "12px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1, color: PINK[600], marginBottom: 6 }}>ANALYZING</div>
          <div style={{ fontSize: 13, color: PINK[800] }}>Scanning for fraud signals...</div>
        </div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <div style={{
          background: "#FFFFFF",
          border: "0.5px solid #E5E5E5",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          {result.error ? (
            <div style={{ padding: "1.25rem", color: "#A32D2D", fontSize: 13 }}>{result.summary}</div>
          ) : (
            <>
              {/* Verdict + risk */}
              <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "0.5px solid #E5E5E5",
                background: "#F9F9F9",
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
                  <span style={{ fontSize: 12, color: "#666666" }}>
                    {result.confidence}% confidence
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.8, color: "#999999" }}>RISK SCORE</span>
                  <div style={{ width: 80, height: 5, background: "#E5E5E5", borderRadius: 3, overflow: "hidden" }}>
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
              <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid #E5E5E5" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#1A1A1A", lineHeight: 1.7 }}>
                  {result.summary}
                </p>
              </div>

              {/* Signals */}
              {result.signals && result.signals.length > 0 && (
                <div style={{ padding: "1rem 1.25rem" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 500, letterSpacing: 1, color: "#999999" }}>
                    DETECTED SIGNALS
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {result.signals.map((signal, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: PINK[400], fontSize: 8, marginTop: 5, flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: 13, color: "#666666", lineHeight: 1.5 }}>
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
          <p style={{ margin: 0, fontSize: 13, color: "#999999" }}>{tab.hint}</p>
        </div>
      )}

    </div>
  );
}
