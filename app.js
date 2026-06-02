// ========================================
// FraudGuard · Main React Component
// ========================================

// Destructure hooks cleanly from the global React object available via CDN
const { useState, useRef, useMemo, useCallback } = React;

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
const TABS = [
    { id: "image", label: "Image scan", icon: "◈", desc: "Detect AI-generated images", hint: "Paste an image URL or upload a file" },
    { id: "text", label: "Text scan", icon: "❋", desc: "Detect AI-written content", hint: "Paste any text — article, caption, review..." },
    { id: "product", label: "Product check", icon: "◉", desc: "Spot fraudulent listings", hint: "Paste the full product listing details" },
    { id: "seller", label: "Seller check", icon: "◎", desc: "Verify seller legitimacy", hint: "Paste seller profile, reviews, bio..." },
];

const PLACEHOLDERS = {
    image: "Paste image URL (https://example.com/photo.jpg)",
    text: "Paste the text you want to analyze for AI generation...\n\nExample: 'Moreover, it is important to note that artificial intelligence has revolutionized many industries...'",
    product: "Paste the full product listing — title, description, price, specs...\n\nExample: 'Miracle Weight Loss Pill - 90% OFF! Limited stock! Act fast!'",
    seller: "Paste seller profile — name, account age, ratings, reviews...\n\nExample: 'New seller, 2 days old. 1000+ items sold. All 5-star reviews.'",
};

// Pure utility styling helpers
const getVerdictStyle = (verdict = "") => {
    const v = verdict.toLowerCase();
    if (v.includes("fraud") || v.includes("ai-generated") || v.includes("ai-written")) {
        return { color: "#A32D2D", bg: "#FCEBEB" };
    }
    if (v.includes("suspicious") || v.includes("likely")) {
        return { color: "#854F0B", bg: "#FAEEDA" };
    }
    if (v.includes("uncertain")) {
        return { color: "#5F5E5A", bg: "#F1EFE8" };
    }
    return { color: "#3B6D11", bg: "#EAF3DE" };
};

const getRiskBarColor = (score) => {
    if (score > 70) return "#E24B4A";
    if (score > 40) return "#EF9F27";
    return "#639922";
};

// Simulated Analytical Pipeline (Isolated for easy API migration later)
const analyzeFraudSignals = async (tab, inputText, imageFile = null) => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const isHighRisk = Math.random() > 0.5;
    const scoreModifier = Math.floor(Math.random() * 20);
    const baseResult = {
        confidence: 75 + Math.floor(Math.random() * 15),
        signals: ["Heuristic text profiling completed", "Cryptographic evaluation of payload verified"],
    };

    if (isHighRisk) {
        return {
            ...baseResult,
            verdict: tab === "image" ? "AI-GENERATED" : tab === "text" ? "AI-WRITTEN" : "FRAUDULENT",
            riskScore: 75 + scoreModifier,
            summary: `High anomaly thresholds crossed during scanning. The input reveals structural profiles closely matched with baseline ${tab} abuse configurations.`,
        };
    }

    return {
        ...baseResult,
        verdict: tab === "image" || tab === "text" ? "AUTHENTIC" : "LEGITIMATE",
        riskScore: 10 + scoreModifier,
        summary: `Analysis complete. The submitted ${tab} components manifest attributes tracking safely inside historical baseline variances.`,
    };
};

// Main Component
const FraudGuard = () => {
    const [activeTab, setActiveTab] = useState("image");
    const [inputs, setInputs] = useState({ image: "", text: "", product: "", seller: "" });
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState({});
    const [imagePayload, setImagePayload] = useState({ file: null, previewUrl: "" });
    
    const fileInputRef = useRef(null);

    // Memoized helpers
    const currentTab = useMemo(() => TABS.find((t) => t.id === activeTab), [activeTab]);
    const currentResult = results[activeTab];
    const isCurrentLoading = loading[activeTab];
    
    const hasValidInput = useMemo(() => {
        const textHasLength = (inputs[activeTab] || "").trim().length > 0;
        const fileExists = activeTab === "image" && !!imagePayload.file;
        return textHasLength || fileExists;
    }, [inputs, activeTab, imagePayload.file]);

    // Memory-safe image tracking cleanup
    const clearImageState = useCallback(() => {
        if (imagePayload.previewUrl) {
            URL.revokeObjectURL(imagePayload.previewUrl);
        }
        setImagePayload({ file: null, previewUrl: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [imagePayload.previewUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (imagePayload.previewUrl) URL.revokeObjectURL(imagePayload.previewUrl);

        setImagePayload({
            file,
            previewUrl: URL.createObjectURL(file)
        });
        
        setInputs(prev => ({ ...prev, image: "" }));
    };

    const handleTextChange = (e) => {
        const value = e.target.value;
        setInputs(prev => ({ ...prev, [activeTab]: value }));
        if (activeTab === "image" && value) {
            clearImageState();
        }
    };

    const handleAnalysisRun = async () => {
        const textValue = inputs[activeTab];
        const targetFile = activeTab === "image" ? imagePayload.file : null;

        if (!hasValidInput) return;

        setLoading(prev => ({ ...prev, [activeTab]: true }));
        setResults(prev => ({ ...prev, [activeTab]: null }));

        try {
            const analyticalPayload = await analyzeFraudSignals(activeTab, textValue, targetFile);
            setResults(prev => ({ ...prev, [activeTab]: analyticalPayload }));
        } catch (error) {
            setResults(prev => ({ 
                ...prev, 
                [activeTab]: { error: true, summary: "Analysis transmission broken. Check platform configuration." } 
            }));
        } finally {
            setLoading(prev => ({ ...prev, [activeTab]: false }));
        }
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo-icon" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" fill="white" />
                            <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1" />
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
            </header>

            <div className="demo-notice" role="alert">
                Using simulated detection — Add API gateway endpoint parameters for live deployments.
            </div>

            {/* Tabs Navigation */}
            <nav className="tabs-container" role="tablist" aria-label="Fraud Detection Capabilities">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Input Workspace */}
            <main 
                id={`panel-${activeTab}`}
                role="tabpanel" 
                aria-labelledby={`tab-${activeTab}`}
                className="input-panel"
            >
                <div className="panel-header">
                    <span className="panel-title">{currentTab.icon} {currentTab.desc}</span>
                    {activeTab === "image" && (
                        <button 
                            type="button"
                            className="upload-button" 
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload file
                        </button>
                    )}
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        onChange={handleFileChange} 
                    />
                </div>

                {activeTab === "image" && imagePayload.previewUrl && (
                    <div className="image-preview">
                        <img src={imagePayload.previewUrl} alt="Payload preview analysis target" className="preview-img" />
                        <div className="preview-info">
                            <p className="preview-name">{imagePayload.file?.name}</p>
                            <p className="preview-size">{((imagePayload.file?.size || 0) / 1024).toFixed(0)} KB</p>
                        </div>
                        <button type="button" className="remove-button" onClick={clearImageState}>Remove</button>
                    </div>
                )}

                <textarea
                    className="fraud-textarea"
                    value={inputs[activeTab]}
                    onChange={handleTextChange}
                    placeholder={imagePayload.file ? "Image attached and ready for ingestion — click Analyze." : PLACEHOLDERS[activeTab]}
                    disabled={!!(activeTab === "image" && imagePayload.file)}
                    style={{ minHeight: activeTab === "text" ? "140px" : "100px" }}
                    aria-label={`${currentTab.label} content data wrapper`}
                />

                <div className="panel-footer">
                    <span className="hint-text">{currentTab.hint}</span>
                    <button
                        type="button"
                        className="analyze-button"
                        onClick={handleAnalysisRun}
                        disabled={isCurrentLoading || !hasValidInput}
                    >
                        {isCurrentLoading ? "Scanning..." : "Analyze →"}
                    </button>
                </div>
            </main>

            {/* Loading Overlay */}
            {isCurrentLoading && (
                <div className="loading-container" aria-busy="true" aria-live="polite">
                    <div className="loading-label">ANALYZING</div>
                    <div className="loading-text">Scanning vectors for fraud configurations...</div>
                </div>
            )}

            {/* Results Ingestion Terminal */}
            {currentResult && !isCurrentLoading && (
                <article className="result-card" aria-live="polite">
                    {currentResult.error ? (
                        <div className="error-display" style={{ padding: "1.25rem", color: "#A32D2D" }}>
                            {currentResult.summary}
                        </div>
                    ) : (
                        <>
                            <div className="result-header">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span
                                        className="verdict-badge"
                                        style={{
                                            background: getVerdictStyle(currentResult.verdict).bg,
                                            color: getVerdictStyle(currentResult.verdict).color,
                                        }}
                                    >
                                        {currentResult.verdict}
                                    </span>
                                    <span className="confidence-text">{currentResult.confidence}% confidence assessment</span>
                                </div>
                                <div className="risk-section">
                                    <span className="risk-label">RISK FACTOR</span>
                                    <div className="risk-bar-container">
                                        <div
                                            className="risk-bar"
                                            style={{
                                                width: `${currentResult.riskScore}%`,
                                                background: getRiskBarColor(currentResult.riskScore),
                                            }}
                                        />
                                    </div>
                                    <span className="risk-score" style={{ color: getRiskBarColor(currentResult.riskScore) }}>
                                        {currentResult.riskScore}%
                                    </span>
                                </div>
                            </div>

                            <div className="result-summary">
                                <p className="summary-text">{currentResult.summary}</p>
                            </div>

                            {currentResult.signals?.length > 0 && (
                                <div className="signals-section">
                                    <p className="signals-title">INTERCEPTED SIGNALS</p>
                                    <div className="signals-list">
                                        {currentResult.signals.map((signal, i) => (
                                            <div key={i} className="signal-item">
                                                <span className="signal-bullet" aria-hidden="true">◆</span>
                                                <span className="signal-text">{signal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </article>
            )}

            {/* Fallback Frame */}
            {!currentResult && !isCurrentLoading && (
                <div className="empty-state" aria-hidden="true">
                    <div className="empty-icon">{currentTab.icon}</div>
                    <p className="empty-hint">{currentTab.hint}</p>
                </div>
            )}
        </div>
    );
};

// Render the application matching your CDN pipeline context
ReactDOM.createRoot(document.getElementById("root")).render(<FraudGuard />);
