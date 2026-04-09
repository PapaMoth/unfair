const generateBtn = document.getElementById("generate");
const downloadBtn = document.getElementById("download");
const copyAllBtn = document.getElementById("copyAll");
const output = document.getElementById("output");
const variantsEl = document.getElementById("variants");
const template = document.getElementById("variant-template");

let lastKit = null;

const STOP_WORDS = new Set([
  "the", "and", "that", "this", "with", "from", "about", "into", "your", "their", "have", "will", "just", "what", "when", "where", "which", "while", "could", "would", "should", "there", "here", "because", "been", "than", "them", "they", "were", "then", "also", "very", "more", "most", "some", "over", "under", "make", "made", "such", "like", "want", "need", "using", "used", "each", "many", "across", "every", "after", "before", "without", "within", "only", "much", "really", "ever"
]);

generateBtn.addEventListener("click", () => {
  const idea = document.getElementById("idea").value.trim();
  const platform = document.getElementById("platform").value;
  const tone = document.getElementById("tone").value;
  const duration = Number(document.getElementById("duration").value);
  const audience = document.getElementById("audience").value.trim() || "your audience";
  const cta = document.getElementById("cta").value.trim() || "Follow for part 2";

  if (!idea) {
    alert("Add source text first.");
    return;
  }

  const keywords = extractKeywords(idea);
  const sentences = tokenizeSentences(idea);

  const variants = ["Pattern interrupt", "Problem → Fix", "Story + Lesson"].map((name, index) =>
    buildVariant({ idea, keywords, sentences, platform, tone, duration, audience, cta, index, name })
  );

  lastKit = { createdAt: new Date().toISOString(), platform, tone, duration, audience, cta, source: idea, variants };
  renderVariants(variants);
  output.classList.remove("hidden");
});

downloadBtn.addEventListener("click", () => {
  if (!lastKit) return;
  const blob = new Blob([JSON.stringify(lastKit, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "clipforge-kit.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

copyAllBtn.addEventListener("click", async () => {
  if (!lastKit) return;
  const payload = lastKit.variants
    .map((v, idx) => `Variant ${idx + 1}: ${v.name}\nHook: ${v.hook}\n${v.script.join("\n")}\nCaption: ${v.caption}\nTags: ${v.hashtags.join(" ")}`)
    .join("\n\n");
  await navigator.clipboard.writeText(payload);
  copyAllBtn.textContent = "Copied";
  setTimeout(() => (copyAllBtn.textContent = "Copy all"), 1400);
});

function renderVariants(variants) {
  variantsEl.innerHTML = "";

  variants.forEach((variant, i) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".variant-title").textContent = `Variant ${i + 1}: ${variant.name}`;
    node.querySelector(".variant-hook").textContent = `Hook: ${variant.hook}`;
    node.querySelector(".variant-caption").textContent = variant.caption;
    node.querySelector(".variant-tags").textContent = variant.hashtags.join(" ");

    const scriptEl = node.querySelector(".variant-script");
    scriptEl.innerHTML = variant.script.map((line) => `<li>${line}</li>`).join("");

    const copyBtn = node.querySelector(".copy-variant");
    copyBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText([
        `Hook: ${variant.hook}`,
        ...variant.script,
        `Caption: ${variant.caption}`,
        `Hashtags: ${variant.hashtags.join(" ")}`,
      ].join("\n"));
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = "Copy variant"), 1200);
    });

    variantsEl.appendChild(node);
  });
}

function buildVariant({ keywords, sentences, platform, tone, duration, audience, cta, index, name }) {
  const topic = keywords[0] || "content";
  const angle = keywords[1] || "growth";
  const alt = keywords[2] || "strategy";

  const hooks = [
    `Stop scrolling: ${audience} keep missing this ${topic} move.`,
    `If ${angle} feels random, use this 3-step ${topic} framework.`,
    `I tested this ${alt} approach for 7 days — here is what changed.`,
  ];

  const hook = hooks[index] || hooks[0];
  const script = buildTimestampedScript({ sentences, keywords, duration, tone, cta, index });
  const caption = buildCaption({ topic, angle, platform, tone, audience });
  const hashtags = buildHashtags(keywords, platform);

  return { name, hook, script, caption, hashtags };
}

function buildTimestampedScript({ sentences, keywords, duration, tone, cta, index }) {
  const blocks = Math.max(4, Math.min(8, Math.round(duration / 8)));
  const beat = Math.round(duration / blocks);
  const base = sentences.length ? sentences : fallbackSentences(keywords);

  const intros = {
    energetic: [
      "Open hard with eye contact and one strong promise.",
      "Call out a common mistake in one line.",
      "Show the final result first.",
    ],
    educational: [
      "Start with the single concept viewers must understand.",
      "Define the mistake and why it happens.",
      "Frame the lesson objective in plain language.",
    ],
    storytelling: [
      "Set the scene with a relatable mini-moment.",
      "Introduce a before/after contrast.",
      "Share what triggered the change.",
    ],
    professional: [
      "Lead with a measurable business outcome.",
      "State the operational challenge clearly.",
      "Position the solution in one sentence.",
    ],
  };

  const steps = [intros[tone][index % 3], ...base, `Close with CTA: ${cta}.`].slice(0, blocks);

  return steps.map((line, i) => {
    const start = i * beat;
    const end = Math.min(duration, (i + 1) * beat);
    return `${formatSec(start)}-${formatSec(end)}  ${line}`;
  });
}

function fallbackSentences(keywords) {
  return [
    `Step 1: name the core problem in ${keywords[0] || "your niche"}.`,
    `Step 2: share one fast fix using ${keywords[1] || "a repeatable framework"}.`,
    `Step 3: invite viewers to test it this week and report back.`,
  ];
}

function extractKeywords(text) {
  const counts = new Map();
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function tokenizeSentences(text) {
  return text
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function buildCaption({ topic, angle, platform, tone, audience }) {
  const platformLabel = {
    tiktok: "TikTok",
    reels: "Reels",
    shorts: "YouTube Shorts",
    linkedin: "LinkedIn",
  }[platform];

  return `${platformLabel} ${tone} post for ${audience}: covering ${topic} + ${angle}. Save this framework and use it in your next video.`;
}

function buildHashtags(keywords, platform) {
  const platformTags = {
    tiktok: ["#tiktoktips", "#contentcreator"],
    reels: ["#instagramreels", "#reelsgrowth"],
    shorts: ["#youtubeshorts", "#shortscreator"],
    linkedin: ["#linkedincreator", "#personalbranding"],
  }[platform];

  const keywordTags = keywords.slice(0, 5).map((k) => `#${k.replace(/[^a-z0-9]/gi, "")}`);
  return [...platformTags, "#aitools", "#videomarketing", ...keywordTags];
}

function formatSec(value) {
  const safe = Math.max(0, value);
  return String(safe).padStart(2, "0") + "s";
}
