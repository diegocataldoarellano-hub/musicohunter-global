import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_IGNORES,
  DEFAULT_SCAN_EXTENSIONS,
  REFERENCES_PATH
} from "./config.js";

const MAX_FILE_BYTES = 240_000;

const RULES = [
  {
    id: "fixed-width",
    title: "Layout con medidas fijas",
    severity: "high",
    pattern: /\b(width|min-width|max-width|height|grid-template-columns|flex-basis)\s*:\s*(?:\d{2,4}px|\d+rem\s+\d+rem)/gi,
    recommendation: "Convertir a clamp(), minmax(0, 1fr), auto-fit/auto-fill, fr, cqw/cqh o tokens fluidos."
  },
  {
    id: "hard-breakpoint",
    title: "Breakpoint rigido",
    severity: "medium",
    pattern: /@media[^{]+(?:\d{3,4}px)/gi,
    recommendation: "Preferir container queries y fluid typography para que el componente escale por contexto."
  },
  {
    id: "basic-grid",
    title: "Grid basico sin respiracion",
    severity: "medium",
    pattern: /grid-template-columns\s*:\s*(?:repeat\(\s*\d+\s*,|[^;]*(?:\d+px)[^;]*;)/gi,
    recommendation: "Usar repeat(auto-fit, minmax(clamp(...), 1fr)) y gaps fluidos."
  },
  {
    id: "instant-transition",
    title: "Estados sin micro-interaccion",
    severity: "medium",
    pattern: /:(hover|focus|active)[^{]*{(?![^}]*\b(?:transition|transform|animation|box-shadow)\b)[^}]+}/gi,
    recommendation: "Agregar feedback con transform/opacity/box-shadow y easing spring-like, respetando prefers-reduced-motion."
  },
  {
    id: "missing-reduced-motion",
    title: "Animacion sin fallback accesible",
    severity: "medium",
    pattern: /\b(animation|transition)\s*:/gi,
    negativePattern: /prefers-reduced-motion/i,
    recommendation: "Agregar @media (prefers-reduced-motion: reduce) para evitar mareos y mejorar accesibilidad."
  },
  {
    id: "eager-media",
    title: "Medios sin carga progresiva",
    severity: "medium",
    pattern: /<img\b(?![^>]*\bloading=)(?![^>]*\bdecoding=)[^>]*>/gi,
    recommendation: "Agregar loading=\"lazy\", decoding=\"async\", aspect-ratio y placeholder visual."
  },
  {
    id: "flat-layering",
    title: "Arquitectura visual plana",
    severity: "low",
    pattern: /\b(position\s*:\s*(fixed|absolute)|z-index\s*:)/gi,
    negativePattern: /(--z-|layer-|zIndex|stacking|overlay|modal|popover)/i,
    recommendation: "Definir tokens de capas: base, ui, tools, overlay y modal; evitar z-index arbitrarios."
  },
  {
    id: "weak-states",
    title: "Estados UX incompletos",
    severity: "medium",
    pattern: /\b(fetch|axios|useQuery|loader|submit|save|delete|upload|download)\b/gi,
    negativePattern: /\b(loading|error|empty|success|pending|disabled|aria-busy|skeleton)\b/i,
    recommendation: "Agregar estados visibles: loading, empty, error, success, disabled y mensajes accionables."
  }
];

export async function loadReferenceKnowledge() {
  const raw = await fs.readFile(REFERENCES_PATH, "utf8");
  return JSON.parse(raw);
}

export async function scanProject({ target, maxFiles }) {
  const absoluteTarget = path.resolve(target);
  const files = [];
  await walk(absoluteTarget, absoluteTarget, files, maxFiles);

  const analyzed = [];
  for (const filePath of files) {
    const result = await analyzeFile(filePath, absoluteTarget);
    if (result.findings.length > 0) {
      analyzed.push(result);
    }
  }

  analyzed.sort((a, b) => b.score - a.score);

  return {
    target: absoluteTarget,
    scannedFiles: files.length,
    filesWithFindings: analyzed.length,
    totalFindings: analyzed.reduce((sum, item) => sum + item.findings.length, 0),
    topFiles: analyzed.slice(0, 30),
    createdAt: new Date().toISOString()
  };
}

async function walk(root, current, files, maxFiles) {
  if (files.length >= maxFiles) return;

  let entries;
  try {
    entries = await fs.readdir(current, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (files.length >= maxFiles) return;

    const fullPath = path.join(current, entry.name);
    const relative = normalizePath(path.relative(root, fullPath));

    if (shouldIgnore(relative, entry.name)) continue;

    if (entry.isDirectory()) {
      await walk(root, fullPath, files, maxFiles);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!DEFAULT_SCAN_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) continue;

    try {
      const stat = await fs.stat(fullPath);
      if (stat.size <= MAX_FILE_BYTES) files.push(fullPath);
    } catch {
      // Ignore files that disappear while scanning.
    }
  }
}

function shouldIgnore(relative, name) {
  const normalized = normalizePath(relative);
  return DEFAULT_IGNORES.some((ignored) => {
    const normalizedIgnore = normalizePath(ignored);
    return name === normalizedIgnore || normalized.startsWith(`${normalizedIgnore}/`);
  });
}

async function analyzeFile(filePath, root) {
  const content = await fs.readFile(filePath, "utf8");
  const relativePath = normalizePath(path.relative(root, filePath));
  const findings = [];

  for (const rule of RULES) {
    const matches = [...content.matchAll(rule.pattern)];
    if (matches.length === 0) continue;
    if (rule.negativePattern && rule.negativePattern.test(content)) continue;

    findings.push({
      id: rule.id,
      title: rule.title,
      severity: rule.severity,
      count: matches.length,
      recommendation: rule.recommendation,
      examples: matches.slice(0, 3).map((match) => compact(match[0]))
    });
  }

  return {
    path: relativePath,
    score: scoreFindings(findings),
    signals: inferSignals(content, relativePath),
    findings
  };
}

function scoreFindings(findings) {
  const severityWeight = { high: 5, medium: 3, low: 1 };
  return findings.reduce((score, finding) => {
    return score + (severityWeight[finding.severity] || 1) * Math.min(finding.count, 8);
  }, 0);
}

function inferSignals(content, relativePath) {
  const lower = `${relativePath}\n${content}`.toLowerCase();
  return {
    hasDashboardContext: /dashboard|admin|panel|kanban|board|metrics/.test(lower),
    hasLandingContext: /landing|hero|pricing|marketing|cta/.test(lower),
    hasEditorContext: /editor|note|document|wiki|markdown|contenteditable/.test(lower),
    hasMediaContext: /canvas|webgl|three|shader|gallery|video|image/.test(lower),
    hasFormFlow: /form|input|select|textarea|submit|validation/.test(lower)
  };
}

export function chooseReference(scan, knowledge, requestedReference) {
  if (requestedReference && requestedReference !== "auto") {
    const exact = knowledge.references.find((item) => item.name.toLowerCase() === requestedReference.toLowerCase());
    if (exact) return exact;
  }

  const signals = scan.topFiles.flatMap((file) => Object.entries(file.signals).filter(([, value]) => value).map(([key]) => key));
  const joined = signals.join(" ");

  if (joined.includes("hasEditorContext")) return byName(knowledge, "Notion");
  if (joined.includes("hasMediaContext")) return byName(knowledge, "Apple Vision Pro");
  if (joined.includes("hasLandingContext")) return byName(knowledge, "Vercel");
  return byName(knowledge, "Linear");
}

function byName(knowledge, name) {
  return knowledge.references.find((item) => item.name === name) || knowledge.references[0];
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function compact(value) {
  return value.replace(/\s+/g, " ").trim().slice(0, 180);
}
