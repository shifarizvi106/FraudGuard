const TABS = {
  image: {
    label: "◈ Detect AI-generated images",
    ph: "Paste an image URL — e.g. https://example.com/photo.jpg",
    hint: "Paste a public URL or upload a file",
    icon: "◈",
    emptyHint: "Drop an image URL or upload a file to start",
    upload: true,
    sys: `You are an image forensics expert. A real person is asking you to look at an image and tell them honestly whether it looks AI-generated or real. Be direct and specific — not robotic.

Look hard for:
- Wrong hands: extra fingers, fused knuckles, melted palms
- Teeth that are weirdly uniform or slightly warped
- Ears that look like Play-Doh
- Hair that clumps like plastic
- Eyes that have duplicate catchlights, strange reflections, or irises that look copy-pasted
- Backgrounds with repeated texture tiles or objects that trail off into mush
- Fabric or clothing that folds wrong — like it's floating
- Text in the image that's illegible or made-up letters
- Lighting that hits faces from a direction no light source could come from
- AI tool watermarks: tiny "mj", "DALL-E", "Firefly", "SD", "Sora"
- Skin that is too smooth — like poured plastic, no pores, no texture
- Bokeh that looks painted on (Midjourney signature)
- Hard-to-explain perfection — real photos have some grit

If you see even 2-3 of these, call it out. Don't be soft about it.

Respond ONLY in this exact JSON format — no extra text, no backticks:
{"verdict":"AI-GENERATED","confidence":85,"riskScore":88,"signals":["specific thing you saw","another specific thing"],"summary":"2-3 sentences like you're telling a friend what you noticed"}`
  },
  text: {
    label: "❋ Detect AI-written text",
    ph: "Paste any text here — article, product description, email, social caption, essay...",
    hint: "Works on anything written",
    icon: "❋",
    emptyHint: "Paste any text to check if a human wrote it",
    upload: false,
    sys: `You are an editor who's been reading both human and AI-generated writing for years. You know the difference by feel. A real person wants to know if this text was written by an AI or a human. Be honest and specific.

AI writing tends to:
- Open with broad throat-clearing: "In today's world...", "It's important to understand...", "When it comes to..."
- Group things in threes: "fast, reliable, and efficient"
- Use transitions that sound like an essay robot: "Moreover,", "Furthermore,", "It's worth noting that,"
- Have zero personality — no opinions, no weird tangents, no moments of genuine uncertainty
- Cover a topic too comprehensively and too evenly, like it's afraid to leave anything out
- Use perfect grammar even in casual contexts where a real person wouldn't
- Never say anything surprising or slightly wrong or uniquely phrased
- Have a paragraph structure that's suspiciously clean: intro → 3 points → conclusion, every time
- Hedge everything: "may", "might", "could potentially", "in some cases"
- Lack any lived experience — no specific memory, no actual opinion, no friction

Human writing tends to:
- Have an uneven rhythm — some sentences are really long and then suddenly short
- Contradict itself slightly or course-correct mid-thought
- Have a weird word choice that's distinctly theirs
- Have a slightly off metaphor or a reference that doesn't quite land
- Use "I" naturally without it sounding corporate

Quote specific phrases from the text as evidence. Be like a human talking to another human.

Respond ONLY in this exact JSON format — no extra text, no backticks:
{"verdict":"AI-WRITTEN","confidence":80,"riskScore":78,"signals":["quoted phrase or pattern you noticed","another one"],"summary":"2-3 sentences like you're telling a friend what tipped you off"}`
  },
  product: {
    label: "◉ Check product for fraud",
    ph: "Paste the full product listing — title, description, price, specs, reviews...",
    hint: "More listing detail = better scan",
    icon: "◉",
    emptyHint: "Paste a product listing to check if it's legit",
    upload: false,
    sys: `You are a consumer protection investigator who's seen thousands of fake and scam product listings online. A real person wants to know if this product is legit or a scam. Be blunt and specific.

Red flags you watch for:
- Price way below what this product normally costs (check your knowledge of real market prices)
- Description copied from another listing or the manufacturer's site — slightly off phrasing
- Brand name that's almost right but not quite: "Adiddas", "Nyke", "Appple", "Samsumg"
- Specs that are technically impossible or contradict each other
- "Inspired by" or "style of [brand]" buried in the description
- Stock photos that are obviously from a search engine, not the actual product
- Vague material descriptions: "high quality", "premium", "durable" — but no actual specs
- Reviews that all use the same structure: "[Product] arrived on time and works great! 5 stars!"
- Reviews posted in a cluster on the same date
- No return policy, or a return policy that heavily punishes the buyer
- "Limited stock!!!" urgency with no real basis
- Electrical items with no CE, FCC, or UL certification mentioned
- Claims that are physically impossible: "500mAh battery lasts 30 days"
- Shipping from an address that doesn't match where the seller claims to be
- Payment only via weird methods: wire transfer, crypto, gift card

Also check: does this product even make sense? Is the listing describing something real?

Quote specifics from the listing. Tell them what would make you walk away.

Respond ONLY in this exact JSON format — no extra text, no backticks:
{"verdict":"FRAUDULENT","confidence":85,"riskScore":90,"signals":["specific thing in the listing","another thing"],"summary":"2-3 sentences like a friend warning you not to buy this"}`
  },
  seller: {
    label: "◎ Check seller legitimacy",
    ph: "Paste seller info — profile bio, account age, ratings, reviews, return policy, contact details...",
    hint: "More profile detail = better scan",
    icon: "◎",
    emptyHint: "Paste a seller profile to check if they're legit",
    upload: false,
    sys: `You are a marketplace fraud investigator. A real person wants to know if this seller is trustworthy or a scam. Be direct and human about it.

Things that set off your alarm:
- Account created very recently but claiming lots of sales
- Seller location says one country, shipping origin says another
- Profile photo or banner looks AI-generated or like a stock photo
- Business name is generic or a slight misspelling of a real brand
- Contact email is gmail/yahoo for a claimed registered business
- No physical address, no phone number, no business registration
- All reviews are 5 stars and they all say basically the same thing: "Great seller! Fast shipping!"
- Reviews posted in suspicious bursts — 20 in one week, then silence
- Reviewers with no other review history, or accounts created same time as the reviews
- Review text doesn't match what the seller sells (reviewing a charger but describing a dress)
- Seller has a weirdly wide product range: electronics AND handbags AND food AND toys
- Products change frequently — different category last month vs this month (dropshipping rotation)
- Return policy is vague, one-sided, or missing entirely
- Unrealistically fast shipping from the claimed origin country
- Pressuring language in messages: "offer expires in 1 hour", "only 2 left"
- Asking for payment outside the platform

Good signs to mention if they exist: consistent niche, mix of good and critical reviews, seller responding to complaints professionally, verifiable address.

Quote specifics. Tell them what you'd do if you were the one deciding whether to buy.

Respond ONLY in this exact JSON format — no extra text, no backticks:
{"verdict":"FRAUDULENT","confidence":82,"riskScore":85,"signals":["specific thing from the profile","another thing"],"summary":"2-3 sentences like a friend telling you whether to trust this seller"}`
  }
};

let active = "image";
let imgFile = null;

// ── init ──
document.querySelectorAll(".tab").forEach(btn =>
  btn.addEventListener("click", () => go(btn.dataset.tab))
);
document.getElementById("ta").addEventListener("input", function () {
  if (active === "image" && this.value.trim()) dropImg(false);
  sync();
});
document.getElementById("fi").addEventListener("change", function () {
  const f = this.files[0];
  if (!f) return;
  imgFile = f;
  const url = URL.createObjectURL(f);
  document.getElementById("thumb").src = url;
  document.getElementById("fname").textContent = f.name;
  document.getElementById("fsize").textContent = (f.size / 1024).toFixed(0) + " KB";
  document.getElementById("prev").classList.add("show");
  document.getElementById("ta").disabled = true;
  document.getElementById("ta").value = "";
  sync();
});

function go(tab) {
  active = tab;
  imgFile = null;
  const cfg = TABS[tab];

  document.querySelectorAll(".tab").forEach(b => b.classList.remove("on"));
  document.querySelector(`[data-tab="${tab}"]`).classList.add("on");

  document.getElementById("plabel").textContent = cfg.label;
  document.getElementById("ta").placeholder = cfg.ph;
  document.getElementById("ta").value = "";
  document.getElementById("ta").disabled = false;
  document.getElementById("hint").textContent = cfg.hint;
  document.getElementById("upbtn").style.display = cfg.upload ? "" : "none";
  document.getElementById("prev").classList.remove("show");
  document.getElementById("eicon").textContent = cfg.icon;
  document.getElementById("ehint").textContent = cfg.emptyHint;

  hide("loading"); hide("result"); hide("errbox");
  show("empty");
  sync();
}

function sync() {
  const has = document.getElementById("ta").value.trim().length > 0 || !!imgFile;
  document.getElementById("abtn").disabled = !has;
}

function dropImg(clearText = true) {
  imgFile = null;
  document.getElementById("prev").classList.remove("show");
  document.getElementById("thumb").src = "";
  document.getElementById("fi").value = "";
  document.getElementById("ta").disabled = false;
  if (clearText) document.getElementById("ta").value = "";
  sync();
}

window.clearImg = () => dropImg(true);
window.doAnalyze = analyze;

async function analyze() {
  const cfg = TABS[active];
  const txt = document.getElementById("ta").value.trim();

  hide("empty"); hide("result"); hide("errbox");
  show("loading");
  document.getElementById("abtn").disabled = true;

  try {
    let messages;

    if (active === "image" && imgFile) {
      const b64 = await toB64(imgFile);
      messages = [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: imgFile.type, data: b64 } },
          { type: "text", text: "Look at this image carefully and tell me if it's AI-generated. Respond only with the JSON." }
        ]
      }];
    } else if (active === "image" && txt) {
      messages = [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: txt } },
          { type: "text", text: "Look at this image carefully and tell me if it's AI-generated. Respond only with the JSON." }
        ]
      }];
    } else {
      messages = [{
        role: "user",
        content: txt + "\n\nRespond only with the JSON."
      }];
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: cfg.sys,
        messages
      })
    });

    if (!res.ok) throw new Error("API " + res.status);

    const data = await res.json();
    const raw = data.content.map(c => c.text || "").join("").trim();

    // strip any accidental backticks
    const clean = raw.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(clean);

    render(parsed);
  } catch (e) {
    hide("loading");
    const eb = document.getElementById("errbox");
    eb.textContent = "Something went wrong — check the URL is publicly accessible, or try again in a moment.";
    eb.classList.add("show");
  } finally {
    document.getElementById("abtn").disabled = false;
    sync();
  }
}

function render(r) {
  hide("loading");

  const verdict = (r.verdict || "UNKNOWN").toUpperCase();
  const score = Math.min(100, Math.max(0, Number(r.riskScore) || 0));
  const conf = Number(r.confidence) || 0;

  // badge
  const vEl = document.getElementById("rv");
  vEl.textContent = verdict;
  vEl.className = "badge " + vClass(verdict);

  // confidence
  document.getElementById("rconf").textContent = conf + "% confidence";

  // risk bar
  document.getElementById("rbar").style.width = score + "%";
  document.getElementById("rbar").className = "riskfill " + rfClass(score);
  const rpEl = document.getElementById("rpct");
  rpEl.textContent = score + "%";
  rpEl.className = "riskpct " + rpClass(score);

  // summary
  document.getElementById("rsumm").textContent = r.summary || "";

  // signals
  const sEl = document.getElementById("rsigs-list");
  sEl.innerHTML = (r.signals || []).map(s =>
    `<div class="sig"><div class="sigdot"></div><span class="sigtext">${esc(s)}</span></div>`
  ).join("");

  // band
  const bk = bucket(score);
  document.getElementById("rbands").innerHTML =
    `<span class="band bd-${bk}">${bk.toUpperCase()} RISK &mdash; ${score}/100</span>`;

  show("result");
  document.getElementById("result").classList.add("show");
}

function bucket(s) {
  if (s >= 80) return "critical";
  if (s >= 60) return "high";
  if (s >= 35) return "medium";
  return "low";
}
function vClass(v) {
  if (v.includes("FRAUD") || v.includes("AI-WRITTEN") || v.includes("AI-GENERATED")) return "vd";
  if (v.includes("SUSPICIOUS") || v.includes("LIKELY AI")) return "vw";
  if (v.includes("UNCERTAIN")) return "vg";
  return "vs";
}
function rfClass(s) { return s >= 65 ? "rf-danger" : s >= 40 ? "rf-warn" : "rf-safe"; }
function rpClass(s) { return s >= 65 ? "rp-danger" : s >= 40 ? "rp-warn" : "rp-safe"; }

function esc(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function toB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result.split(",")[1]);
    r.onerror = () => rej(new Error("read error"));
    r.readAsDataURL(file);
  });
}
function show(id) { document.getElementById(id).style.display = ""; }
function hide(id) { document.getElementById(id).style.display = "none"; }
