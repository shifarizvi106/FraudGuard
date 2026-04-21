// ========================================
// FraudGuard · Main React Component
// ========================================

const { useState, useRef } = React;

// Color constants
const PINK = {
    50: "#FBEAF0",
    100: "#F4C0D1",
    200: "#ED93B1",
    300: "#E07098",
    400: "#D4537E",
    600: "#993556",
    800: "#72243E",
};

// Tab configuration
const tabs = [
    { id: "image", label: "Image scan", icon: "◈", desc: "Detect AI-generated images", hint: "Paste an image URL or upload a file" },
    { id: "text", label: "Text scan", icon: "❋", desc: "Detect AI-written content", hint: "Paste any text — article, caption, review..." },
    { id: "product", label: "Product check", icon: "◉", desc: "Spot fraudulent listings", hint: "Paste the full product listing details" },
    { id: "seller", label: "Seller check", icon: "◎", desc: "Verify seller legitimacy", hint: "Paste seller profile, reviews, bio..." },
];

// Mock analysis function
const mockAnalyze = async (tab, inputText, imageFile = null) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const inputLower = (inputText || "").toLowerCase();
    const hasImage = !!imageFile;
    
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
    
    let verdict, confidence, riskScore, signals, summary;
    
    if (tab === "image") {
        if (hasImage) {
            const seed = imageFile.name.length + imageFile.size;
            const isAILikely = seed % 3 === 0;
            
            if (isAILikely) {
                verdict = "AI-GENERATED";
                confidence = Math.floor(75 + Math.random() * 20);
                riskScore = Math.floor(70 + Math.random() * 25);
                signals = signalsLibrary.image.ai.slice(0, 3 + Math.floor(Math.random() * 2));
                summary = "This image shows multiple hallmarks of AI generation, including unnatural texture patterns and lighting inconsistencies.";
            } else {
                verdict = "AUTHENTIC";
                confidence = Math.floor(70 + Math.random() * 25);
                riskScore = Math.floor(10 + Math.random() * 30);
                signals = signalsLibrary.image.real.slice(0, 3 + Math.floor(Math.random() * 2));
                summary = "This image appears to be authentic. Normal camera sensor noise patterns suggest it was captured with a real camera.";
            }
        } else if (inputText) {
            if (inputText.includes("placeholder") || inputText.includes("fake")) {
                verdict = "LIKELY AI";
                confidence = 82;
                riskScore = 78;
                signals = ["URL pattern matches known AI image generation services", "No camera EXIF data available"];
                summary = "The image source suggests this may be AI-generated.";
            } else {
                verdict = "UNCERTAIN";
                confidence = 55;
                riskScore = 45;
                signals = ["Unable to fully verify image source", "Would benefit from direct file upload"];
                summary = "Cannot definitively determine if this image is AI-generated. Uploading the file would provide a more accurate assessment.";
            }
        } else {
            verdict = "UNCERTAIN";
            confidence = 50;
            riskScore = 50;
            signals = ["No image data provided to analyze"];
            summary = "Please provide an image URL or upload a file for analysis.";
        }
    } else if (tab === "text") {
        const wordCount = (inputText || "").split(/\s+/).length;
        const hasAIPatterns = suspiciousCount > legitCount && suspiciousCount > 1;
        const hasHumanPatterns = legitCount > suspiciousCount;
        
        if (wordCount < 20) {
            verdict = "UNCERTAIN";
            confidence = 40;
            riskScore = 30;
            signals = ["Text too short for reliable analysis"];
            summary = "Please provide more content (at least 50-100 words) for better accuracy.";
        } else if (hasAIPatterns) {
            verdict = "AI-WRITTEN";
            confidence = Math.floor(75 + Math.random() * 20);
            riskScore = Math.floor(70 + Math.random() * 25);
            signals = signalsLibrary.text.ai.slice(0, 4);
            summary = "This text exhibits strong patterns consistent with AI language models.";
        } else if (hasHumanPatterns) {
            verdict = "HUMAN-WRITTEN";
            confidence = Math.floor(70 + Math.random() * 20);
            riskScore = Math.floor(10 + Math.random() * 25);
            signals = signalsLibrary.text.human.slice(0, 3);
            summary = "This text shows characteristics of human writing.";
        } else {
            verdict = Math.random() > 0.6 ? "LIKELY AI" : "LIKELY HUMAN";
            confidence = 65;
            riskScore = Math.random() > 0.6 ? 72 : 35;
            signals = ["Mixed signals detected"];
            summary = "This text shows both human and AI-like patterns.";
        }
    } else if (tab === "product") {
        const hasFraudSignals = suspiciousCount >= 2 || inputLower.includes("fake") || inputLower.includes("scam");
        const hasLegitSignals = legitCount >= 2 || inputLower.includes("original") || inputLower.includes("warranty");
        
        if (hasFraudSignals && !hasLegitSignals) {
            verdict = "FRAUDULENT";
            confidence = Math.floor(80 + Math.random() * 15);
            riskScore = Math.floor(85 + Math.random() * 15);
            signals = signalsLibrary.product.fraud.slice(0, 4);
            summary = "This product listing contains multiple red flags consistent with fraudulent listings.";
        } else if (hasLegitSignals && !hasFraudSignals) {
            verdict = "LEGITIMATE";
            confidence = Math.floor(75 + Math.random() * 20);
            riskScore = Math.floor(10 + Math.random() * 20);
            signals = signalsLibrary.product.legit.slice(0, 3);
            summary = "This product listing appears legitimate.";
        } else {
            verdict = "SUSPICIOUS";
            confidence = Math.floor(60 + Math.random() * 20);
            riskScore = Math.floor(55 + Math.random() * 25);
            signals = ["Price somewhat below market average", "Limited seller history available"];
            summary = "This listing shows some concerning signals but not enough for a definitive determination.";
        }
    } else {
        const hasFraudSignals = suspiciousCount >= 2 || inputLower.includes("scam") || inputLower.includes("fake profile");
        const hasLegitSignals = legitCount >= 2 || inputLower.includes("verified") || inputLower.includes("established");
        
        if (hasFraudSignals && !hasLegitSignals) {
            verdict = "FRAUDULENT";
            confidence = Math.floor(85 + Math.random() * 10);
            riskScore = Math.floor(90 + Math.random() * 10);
            signals = signalsLibrary.seller.fraud.slice(0, 4);
            summary = "This seller profile exhibits multiple fraud indicators.";
        } else if (hasLegitSignals && !hasFraudSignals) {
            verdict = "LEGITIMATE";
            confidence = Math.floor(80 + Math.random() * 15);
            riskScore = Math.floor(5 + Math.random() * 15);
            signals = signalsLibrary.seller.legit.slice(0, 3);
            summary = "This seller profile appears legitimate.";
        } else {
            verdict = "SUSPICIOUS";
            confidence = Math.floor(55 + Math.random() * 20);
            riskScore = Math.floor(50 + Math.random() * 25);
            signals = ["Limited seller history", "Some missing verification details"];
            summary = "This seller profile shows some warning signs but requires more investigation.";
        }
    }
    
    riskScore = Math.min(100, Math.max(0, riskScore));
    confidence = Math.min(100, Math.max(0, confidence));
    
    return { verdict, confidence, riskScore, signals: signals || ["Analysis completed"], summary };
};

// Helper functions
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

// Main Component
const FraudGuard = () => {
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
            const result = await mockAnalyze(tab, inputVal, imageFile);
            setResults((r) => ({ ...r, [tab]: result }));
        } catch (error) {
            setResults((r) => ({ ...r, [tab]: { error: true, summary: "Analysis failed. Please try again." } }));
        } finally {
            setLoading((l) => ({ ...l, [tab]: false }));
        }
    };

    const currentTab = tabs.find((t) => t.id === activeTab);
    const result = results[activeTab];
    const isLoading = loading[activeTab];
    const canAnalyze = inputs[activeTab].trim() || (activeTab === "image" && imageFile);

    const placeholders = {
        image: "Paste image URL (https://example.com/photo.jpg)",
        text: "Paste the text you want to analyze for AI generation...\n\nExample: 'Moreover, it is important to note that artificial intelligence has revolutionized many industries. In conclusion, the future looks promising.'",
        product: "Paste the full product listing — title, description, price, specs...\n\nExample: 'Miracle Weight Loss Pill - 90% OFF! Limited stock! Act fast!'",
        seller: "Paste seller profile — name, account age, ratings, reviews...\n\nExample: 'New seller, 2 days old. 1000+ items sold. All 5-star reviews.'",
    };

    return (
        <div className="app-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="logo-icon">
                        <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" fill="white" />
                            <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1" fill="none" />
                            <line x1="8" y1="1" x2="8" y2="3.5" stroke="white" strokeWidth="1.2" />
                            <line x1="8" y1="12.5" x2="8" y2="15" stroke="white" strokeWidth="1.2" />
                            <line x1="1" y1="8" x2="3.5" y2="8" stroke="white" strokeWidth="1.2" />
                            <line x1="12.5" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.2" />
                        </svg>
                    </div>
                    <div>
                        <div className="title-section">
                            <h1 className="app-title">Fraud<span>Guard</span></h1>
                            <span className="demo-badge">DEMO MODE</span>
                        </div>
                        <p className="tagline">Detect AI content · fake products · fraudulent sellers</p>
                    </div>
                </div>
            </div>

            {/* Demo Notice */}
            <div className="demo-notice">
                Using simulated detection — Add Anthropic API key for real AI-powered analysis
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        className={`tab-button ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        <span className="tab-icon">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Input Panel */}
            <div className="input-panel">
                <div className="panel-header">
                    <span className="panel-title">{currentTab.icon} {currentTab.desc}</span>
                    {activeTab === "image" && (
                        <button className="upload-button" onClick={() => fileRef.current?.click()}>
                            Upload file
                        </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                </div>

                {activeTab === "image" && imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" className="preview-img" />
                        <div className="preview-info">
                            <p className="preview-name">{imageFile?.name}</p>
                            <p className="preview-size">{(imageFile?.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button className="remove-button" onClick={clearImage}>Remove</button>
                    </div>
                )}

                <textarea
                    className="fraud-textarea"
                    value={inputs[activeTab]}
                    onChange={(e) => {
                        setInputs((i) => ({ ...i, [activeTab]: e.target.value }));
                        if (activeTab === "image" && e.target.value) clearImage();
                    }}
                    placeholder={imageFile ? "Image ready — click Analyze to scan" : placeholders[activeTab]}
                    disabled={!!(activeTab === "image" && imageFile)}
                    style={{ minHeight: activeTab === "text" ? "140px" : "100px" }}
                />

                <div className="panel-footer">
                    <span className="hint-text">{currentTab.hint}</span>
                    <button
                        className="analyze-button"
                        onClick={() => analyze(activeTab)}
                        disabled={isLoading || !canAnalyze}
                    >
                        {isLoading ? "Scanning..." : "Analyze →"}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="loading-container">
                    <div className="loading-label">ANALYZING</div>
                    <div className="loading-text">Scanning for fraud signals...</div>
                </div>
            )}

            {/* Result */}
            {result && !isLoading && (
                <div className="result-card">
                    {result.error ? (
                        <div style={{ padding: "1.25rem", color: "#A32D2D" }}>{result.summary}</div>
                    ) : (
                        <>
                            <div className="result-header">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span
                                        className="verdict-badge"
                                        style={{
                                            background: verdictStyle(result.verdict).bg,
                                            color: verdictStyle(result.verdict).color,
                                        }}
                                    >
                                        {result.verdict}
                                    </span>
                                    <span className="confidence-text">{result.confidence}% confidence</span>
                                </div>
                                <div className="risk-section">
                                    <span className="risk-label">RISK SCORE</span>
                                    <div className="risk-bar-container">
                                        <div
                                            className="risk-bar"
                                            style={{
                                                width: `${result.riskScore}%`,
                                                background: riskBarColor(result.riskScore),
                                            }}
                                        />
                                    </div>
                                    <span className="risk-score" style={{ color: riskBarColor(result.riskScore) }}>
                                        {result.riskScore}%
                                    </span>
                                </div>
                            </div>

                            <div className="result-summary">
                                <p className="summary-text">{result.summary}</p>
                            </div>

                            {result.signals && result.signals.length > 0 && (
                                <div className="signals-section">
                                    <p className="signals-title">DETECTED SIGNALS</p>
                                    <div className="signals-list">
                                        {result.signals.map((signal, i) => (
                                            <div key={i} className="signal-item">
                                                <span className
