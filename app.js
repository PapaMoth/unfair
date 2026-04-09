const generateBtn = document.getElementById("generate");
const downloadBtn = document.getElementById("download");
const copyAllBtn = document.getElementById("copyAll");
const generateAiVideoBtn = document.getElementById("generateAiVideo");
const buildCompositionBtn = document.getElementById("buildComposition");
const buildScenesBtn = document.getElementById("buildScenes");
const generateVideoBtn = document.getElementById("generateVideo");
const buildAutopilotBtn = document.getElementById("buildAutopilot");
const copyAutopilotBtn = document.getElementById("copyAutopilot");
const autopilotOutput = document.getElementById("autopilotOutput");

let lastAutopilotPlan = [];

const output = document.getElementById("output");
const aiVideoSection = document.getElementById("aiVideo");
const aiStatus = document.getElementById("aiStatus");
const aiResult = document.getElementById("aiResult");
const videoDashboard = document.getElementById("videoDashboard");
const pipelineSteps = document.getElementById("pipelineSteps");
const renderStatus = document.getElementById("renderStatus");
const renderJson = document.getElementById("renderJson");
const previewCard = document.getElementById("previewCard");
const distributionSection = document.getElementById("distribution");
const approvalStatusEl = document.getElementById("approvalStatus");
const scheduleAtEl = document.getElementById("scheduleAt");
const reviewerEl = document.getElementById("reviewer");
const requestApprovalBtn = document.getElementById("requestApproval");
const approveContentBtn = document.getElementById("approveContent");
const rejectContentBtn = document.getElementById("rejectContent");
const publishYouTubeBtn = document.getElementById("publishYouTube");
const publishInstagramBtn = document.getElementById("publishInstagram");
const publishTikTokBtn = document.getElementById("publishTikTok");
const ytStateEl = document.getElementById("ytState");
const igStateEl = document.getElementById("igState");
const ttStateEl = document.getElementById("ttState");
const analyticsSection = document.getElementById("analytics");
const analyticsGrid = document.getElementById("analyticsGrid");
const optimizeFromPerformanceBtn = document.getElementById("optimizeFromPerformance");

const variantsEl = document.getElementById("variants");
const template = document.getElementById("variant-template");

let lastKit = null;
let approvalState = "draft";
let lastComposition = null;
let currentAnalytics = null;

const STOP_WORDS = new Set([
  "the", "and", "that", "this", "with", "from", "about", "into", "your", "their", "have", "will", "just", "what", "when", "where", "which", "while", "could", "would", "should", "there", "here", "because", "been", "than", "them", "they", "were", "then", "also", "very", "more", "most", "some", "over", "under", "make", "made", "such", "like", "want", "need", "using", "used", "each", "many", "across", "every", "after", "before", "without", "within", "only", "much", "really", "ever"
]);


buildAutopilotBtn.addEventListener("click", () => {
  const niche = document.getElementById("niche").value.trim() || "your niche";
  const days = Number(document.getElementById("planDays").value);
  const rows = buildDailyPlan(niche, days);
  lastAutopilotPlan = rows;

  autopilotOutput.innerHTML = rows
    .map((item) => `
      <article class="autopilot-item">
        <h4>Day ${item.day} — ${item.angle}</h4>
        <p><strong>Hook:</strong> ${item.hook}</p>
        <p><strong>Video brief:</strong> ${item.brief}</p>
        <p><strong>CTA:</strong> ${item.cta}</p>
      </article>
    `)
    .join("");

  autopilotOutput.classList.remove("hidden");
});

copyAutopilotBtn.addEventListener("click", async () => {
  if (!lastAutopilotPlan.length) return;
  const text = lastAutopilotPlan
    .map((item) => `Day ${item.day} | ${item.angle}
Hook: ${item.hook}
Brief: ${item.brief}
CTA: ${item.cta}`)
    .join("\n\n");
  await navigator.clipboard.writeText(text);
  copyAutopilotBtn.textContent = "Copied";
  setTimeout(() => (copyAutopilotBtn.textContent = "Copy plan"), 1300);
});

generateBtn.addEventListener("click", () => {
  const idea = document.getElementById("idea").value.trim();
  const platform = document.getElementById("platform").value;
  const templateMode = document.getElementById("templateMode").value;
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
    buildVariant({ keywords, sentences, platform, tone, duration, audience, cta, index, name, templateMode })
  );

  lastKit = { createdAt: new Date().toISOString(), platform, tone, duration, audience, cta, source: idea, variants };
  renderVariants(variants);
  output.classList.remove("hidden");
  aiVideoSection.classList.remove("hidden");
  aiStatus.textContent = "Tip: generate variants first, then click AI Video Plan to turn one into production-ready scenes.";
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



buildScenesBtn.addEventListener("click", () => {
  if (!lastKit) {
    aiStatus.textContent = "Generate a shorts kit first.";
    return;
  }

  const composition = lastComposition || buildVideoCompositionInput(lastKit, lastKit.variants[0]);
  const aiScenes = buildAiScenePlan(lastKit, composition);
  composition.scenes = composition.scenes.map((scene, i) => ({
    ...scene,
    assetType: aiScenes[i]?.assetType || scene.assetType,
    assetUrl: aiScenes[i]?.assetUrl || scene.assetUrl,
    captionText: aiScenes[i]?.captionText || scene.captionText,
  }));

  lastComposition = composition;
  aiResult.textContent = JSON.stringify({ aiScenes }, null, 2);
  aiStatus.textContent = "AI image/video scene plan prepared.";
});

optimizeFromPerformanceBtn.addEventListener("click", () => {
  if (!currentAnalytics) return;
  const suggestion = suggestOptimization(currentAnalytics);
  aiStatus.textContent = `Optimization applied: ${suggestion}`;
});

buildCompositionBtn.addEventListener("click", () => {
  if (!lastKit) {
    aiStatus.textContent = "Generate a shorts kit first.";
    return;
  }

  const composition = lastComposition || buildVideoCompositionInput(lastKit, lastKit.variants[0]);
  lastComposition = composition;
  aiResult.textContent = JSON.stringify(composition, null, 2);
  aiStatus.textContent = "VideoCompositionInput JSON generated from Variant 1.";
});


generateVideoBtn.addEventListener("click", async () => {
  if (!lastKit) {
    aiStatus.textContent = "Generate a shorts kit first.";
    return;
  }

  const composition = lastComposition || buildVideoCompositionInput(lastKit, lastKit.variants[0]);
  const pipeline = [
    { id: "script", label: "Script" },
    { id: "stock", label: "Stock" },
    { id: "tts", label: "TTS" },
    { id: "captions", label: "Captions" },
    { id: "render", label: "Render" },
  ];

  videoDashboard.classList.remove("hidden");
  renderPipeline(pipeline, {});
  renderStatus.textContent = "Running manual generation...";

  const status = {};
  for (const step of pipeline) {
    status[step.id] = "running";
    renderPipeline(pipeline, status);
    await sleep(450);
    status[step.id] = "done";
    renderPipeline(pipeline, status);
  }

  lastComposition = composition;

  const result = {
    generatedAt: new Date().toISOString(),
    mode: "manual",
    pipeline: {
      script: "generated from selected variant",
      stock: "placeholder stock assets assigned",
      tts: "voiceover script prepared",
      captions: "subtitle timeline generated",
      render: "composition payload ready",
    },
    composition,
  };

  renderJson.textContent = JSON.stringify(result, null, 2);
  previewCard.innerHTML = buildPreviewHtml(composition);
  renderStatus.textContent = "Done. Preview and payload ready.";
  distributionSection.classList.remove("hidden");
  analyticsSection.classList.remove("hidden");
  currentAnalytics = simulatePerformanceMetrics(lastKit, composition);
  renderAnalytics(currentAnalytics);
  approvalState = "draft";
  approvalStatusEl.textContent = "Status: Draft";
  ytStateEl.textContent = "Not scheduled";
  igStateEl.textContent = "Not scheduled";
  ttStateEl.textContent = "Not scheduled";
  updateScheduleStates();
});


requestApprovalBtn.addEventListener("click", () => {
  if (!lastKit) {
    renderStatus.textContent = "Generate video content first.";
    return;
  }

  approvalState = "pending";
  const reviewer = reviewerEl.value.trim() || "Reviewer";
  approvalStatusEl.textContent = `Status: Pending approval (${reviewer})`;
  updateScheduleStates();
});

approveContentBtn.addEventListener("click", () => {
  if (approvalState !== "pending") {
    approvalStatusEl.textContent = "Status: Request approval first.";
    return;
  }

  approvalState = "approved";
  approvalStatusEl.textContent = "Status: Approved";
  updateScheduleStates();
});

rejectContentBtn.addEventListener("click", () => {
  approvalState = "draft";
  approvalStatusEl.textContent = "Status: Changes requested";
  updateScheduleStates();
});

publishYouTubeBtn.addEventListener("click", () => publishPlatform("youtube", ytStateEl));
publishInstagramBtn.addEventListener("click", () => publishPlatform("instagram", igStateEl));
publishTikTokBtn.addEventListener("click", () => publishPlatform("tiktok", ttStateEl));

scheduleAtEl.addEventListener("change", updateScheduleStates);

generateAiVideoBtn.addEventListener("click", async () => {
  if (!lastKit) {
    aiStatus.textContent = "Generate a shorts kit first.";
    return;
  }

  const apiKey = document.getElementById("apiKey").value.trim();
  if (!apiKey) {
    aiStatus.textContent = "Add your OpenAI API key to generate an AI video plan.";
    return;
  }

  const model = document.getElementById("aiModel").value;
  const variant = lastKit.variants[0];
  const prompt = buildAiVideoPrompt(lastKit, variant);

  aiStatus.textContent = "Generating AI video plan...";
  generateAiVideoBtn.disabled = true;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      aiStatus.textContent = `Request failed (${response.status}).`;
      aiResult.textContent = text;
      return;
    }

    const data = await response.json();
    const text = extractResponseText(data);
    aiResult.textContent = text || "No text returned by model.";
    aiStatus.textContent = "AI video plan generated. Copy and use with your editor or pipeline.";
  } catch (error) {
    aiStatus.textContent = "Network error while generating video plan.";
    aiResult.textContent = String(error);
  } finally {
    generateAiVideoBtn.disabled = false;
  }
});

function extractResponseText(payload) {
  if (payload.output_text) return payload.output_text;
  if (!Array.isArray(payload.output)) return "";

  return payload.output
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("\n");
}

function buildAiVideoPrompt(kit, variant) {
  return [
    "You are a short-form video producer.",
    "Create a production-ready video plan in JSON with keys: title, voiceover_script, scenes, on_screen_text, sound_design, editing_notes.",
    "Each scene must include: start_sec, end_sec, visual_prompt, shot_type, motion, and caption.",
    "Keep it concise and optimized for vertical 9:16 social video.",
    `Platform: ${kit.platform}`,
    `Tone: ${kit.tone}`,
    `Duration: ${kit.duration}s`,
    `Audience: ${kit.audience}`,
    `CTA: ${kit.cta}`,
    `Hook: ${variant.hook}`,
    `Shot list:\n${variant.script.join("\n")}`,
    `Caption: ${variant.caption}`,
    `Hashtags: ${variant.hashtags.join(" ")}`,
  ].join("\n");
}

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

function buildVariant({ keywords, sentences, platform, tone, duration, audience, cta, index, name, templateMode }) {
  const topic = keywords[0] || "content";
  const angle = keywords[1] || "growth";
  const alt = keywords[2] || "strategy";

  const hooks = buildTemplateHooks(templateMode, audience, topic, angle, alt);

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
    "Step 3: invite viewers to test it this week and report back.",
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


function buildDailyPlan(niche, days) {
  const angles = [
    "Biggest mistake",
    "3-step framework",
    "Before/after transformation",
    "Tool breakdown",
    "Myth vs reality",
    "Case study",
    "Checklist",
    "Q&A",
    "Trend reaction",
    "Storytime",
  ];

  return Array.from({ length: days }, (_, i) => {
    const angle = angles[i % angles.length];
    return {
      day: i + 1,
      angle,
      hook: `${niche}: ${angle.toLowerCase()} that most creators ignore.`,
      brief: `Create a 30-45s vertical video for ${niche}. Open with a bold claim, share one practical example, and end with a single action step.`,
      cta: "Comment \"PLAN\" for tomorrow's script.",
    };
  });
}



function buildVideoCompositionInput(kit, variant) {
  const fps = 30;
  const scenes = variant.script.map((line, index) => {
    const timing = parseTiming(line);
    const body = line.replace(/^\d{2}s-\d{2}s\s+/, "");
    const startFrame = Math.round(timing.start * fps);
    const durationFrames = Math.max(1, Math.round((timing.end - timing.start) * fps));

    return {
      startFrame,
      durationFrames,
      voiceoverText: body,
      captionText: body,
      assetUrl: `https://example.com/assets/scene-${index + 1}.jpg`,
      assetType: "image",
      transition: index === 0 ? undefined : "fade",
    };
  });

  const subtitles = scenes.map((scene) => ({
    start: Number((scene.startFrame / fps).toFixed(2)),
    end: Number(((scene.startFrame + scene.durationFrames) / fps).toFixed(2)),
    text: scene.captionText,
  }));

  return {
    videoId: `clipforge-${Date.now()}`,
    title: variant.name,
    aspectRatio: "9:16",
    scenes,
    voiceoverUrl: "https://example.com/audio/voiceover.mp3",
    musicUrl: "https://example.com/audio/music.mp3",
    branding: {
      watermarkText: "@clipforge",
    },
    subtitles,
  };
}

function parseTiming(line) {
  const match = line.match(/^(\d{2})s-(\d{2})s/);
  if (!match) return { start: 0, end: 5 };
  return { start: Number(match[1]), end: Number(match[2]) };
}


function renderPipeline(steps, status) {
  pipelineSteps.innerHTML = steps
    .map((step) => {
      const state = status[step.id] || "pending";
      return `<div class="pipe-step ${state}"><strong>${step.label}</strong><span>${state}</span></div>`;
    })
    .join("");
}

function buildPreviewHtml(composition) {
  const scenePreview = composition.scenes
    .slice(0, 3)
    .map((scene, i) => `<li>Scene ${i + 1}: ${scene.captionText}</li>`)
    .join("");

  return `
    <p><strong>${composition.title}</strong></p>
    <p>${composition.aspectRatio} • ${composition.scenes.length} scenes</p>
    <ul>${scenePreview}</ul>
    <p><strong>Voiceover:</strong> ${composition.voiceoverUrl}</p>
  `;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


function updateScheduleStates() {
  const scheduleValue = scheduleAtEl.value;
  const scheduleText = scheduleValue ? new Date(scheduleValue).toLocaleString() : "No schedule";
  const prefix = approvalState === "approved" ? "Scheduled" : approvalState === "pending" ? "Waiting approval" : "Draft";

  if (!ytStateEl.textContent.includes("Published")) ytStateEl.textContent = `${prefix}: ${scheduleText}`;
  if (!igStateEl.textContent.includes("Published")) igStateEl.textContent = `${prefix}: ${scheduleText}`;
  if (!ttStateEl.textContent.includes("Published")) ttStateEl.textContent = `${prefix}: ${scheduleText}`;
}

function publishPlatform(platform, targetEl) {
  if (approvalState !== "approved") {
    targetEl.textContent = "Blocked: needs approval";
    return;
  }

  const scheduleValue = scheduleAtEl.value;
  const when = scheduleValue ? new Date(scheduleValue).toLocaleString() : "immediately";
  targetEl.textContent = `Published (${platform}) at ${when}`;
}


function buildTemplateHooks(templateMode, audience, topic, angle, alt) {
  const templates = {
    educational: [
      `Stop scrolling: ${audience} keep missing this ${topic} move.`,
      `If ${angle} feels random, use this 3-step ${topic} framework.`,
      `I tested this ${alt} approach for 7 days — here is what changed.`,
    ],
    story: [
      `I almost quit ${topic} — then this happened.`,
      `Last month I failed at ${angle}, here is the fix that worked.`,
      `This one ${alt} moment changed my content results overnight.`,
    ],
    problem: [
      `${audience}: this ${topic} problem is killing your growth.`,
      `The hidden ${angle} bottleneck (and how to fix it today).`,
      `3 mistakes in ${alt} and the exact fix sequence.`,
    ],
    authority: [
      `After 200 videos, this ${topic} insight stands out.`,
      `Data-backed: why ${angle} outperforms random posting.`,
      `The ${alt} framework we use for repeatable results.`,
    ],
  };

  return templates[templateMode] || templates.educational;
}

function buildAiScenePlan(kit, composition) {
  const visualStyles = ["cinematic b-roll", "UI close-up", "talking head", "diagram animation"];
  return composition.scenes.map((scene, i) => ({
    scene: i + 1,
    assetType: i % 2 === 0 ? "video" : "image",
    assetUrl: `https://example.com/ai-scenes/${kit.platform}-scene-${i + 1}.${i % 2 === 0 ? "mp4" : "jpg"}`,
    captionText: scene.captionText,
    prompt: `${visualStyles[i % visualStyles.length]} for ${kit.platform} vertical short about ${kit.source.slice(0, 80)}`,
  }));
}

function simulatePerformanceMetrics(kit, composition) {
  return {
    impressions: 1800 + composition.scenes.length * 120,
    watchRate: Number((0.32 + composition.scenes.length * 0.015).toFixed(2)),
    avgWatchSeconds: Math.min(kit.duration, Math.round(kit.duration * 0.58)),
    ctr: Number((0.018 + composition.scenes.length * 0.002).toFixed(3)),
  };
}

function renderAnalytics(metrics) {
  analyticsGrid.innerHTML = [
    ["Impressions", metrics.impressions],
    ["Watch rate", `${Math.round(metrics.watchRate * 100)}%`],
    ["Avg watch", `${metrics.avgWatchSeconds}s`],
    ["CTR", `${(metrics.ctr * 100).toFixed(1)}%`],
  ].map(([k, v]) => `<article class="publish-card"><h3>${k}</h3><p class="tiny">${v}</p></article>`).join("");
}

function suggestOptimization(metrics) {
  if (metrics.watchRate < 0.4) return "Use Story Hook template + shorter 15s duration.";
  if (metrics.ctr < 0.03) return "Use Problem/Solution template and stronger first-line hook.";
  return "Use Authority/Proof template and keep cadence with current schedule.";
}
