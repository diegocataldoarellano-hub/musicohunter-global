import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AGENT_ROOT = path.resolve(__dirname, "..");
export const DEFAULT_REPORT_DIR = path.join(AGENT_ROOT, "reports");
export const REFERENCES_PATH = path.join(AGENT_ROOT, "config", "references.json");

export const DEFAULT_SCAN_EXTENSIONS = [
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".sass",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".svelte",
  ".vue"
];

export const DEFAULT_IGNORES = [
  ".git",
  ".cursor",
  ".github",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".vercel",
  "coverage",
  "dist",
  "build",
  "node_modules",
  "premium-experience-agent",
  "venv",
  "venv_pdf_word",
  "agent-transcripts",
  "agent-tools",
  "design-bank",
  "glosor_epistemic_chroma",
  "glosor_norbu_ocr_texts",
  "supercanvas-pro/assets/template-banks"
];

export function parseArgs(argv) {
  const args = {
    mode: "dry-run",
    target: process.cwd(),
    maxFiles: Number(process.env.PREMIUM_AGENT_MAX_FILES || 120),
    reportDir: DEFAULT_REPORT_DIR,
    referenceStyle: process.env.PREMIUM_AGENT_REFERENCE || "auto",
    applyMode: process.env.PREMIUM_AGENT_APPLY_MODE || "pr"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--mode" && next) {
      args.mode = next;
      index += 1;
    } else if (arg === "--target" && next) {
      args.target = path.resolve(next);
      index += 1;
    } else if (arg === "--max-files" && next) {
      args.maxFiles = Number(next);
      index += 1;
    } else if (arg === "--report-dir" && next) {
      args.reportDir = path.resolve(next);
      index += 1;
    } else if (arg === "--reference" && next) {
      args.referenceStyle = next;
      index += 1;
    } else if (arg === "--help") {
      args.help = true;
    }
  }

  if (!Number.isFinite(args.maxFiles) || args.maxFiles < 1) {
    args.maxFiles = 120;
  }

  return args;
}

export function printHelp() {
  console.log(`
Premium Experience Agent

Usage:
  node src/index.js --mode dry-run --target ..
  node src/index.js --mode pr --target ..

Modes:
  dry-run  Scans the target project and writes a report only.
  pr       Uses Cursor SDK/Cloud to request improvements and PRs.

Environment:
  CURSOR_API_KEY                 Required for --mode pr.
  CURSOR_REPO_URL                Git URL used by Cursor Cloud.
  CURSOR_REPO_REF                Branch/ref to analyze. Defaults to current branch in CI.
  CURSOR_MODEL                   Cursor model id. Defaults to auto.
  PREMIUM_AGENT_REFERENCE        auto, Linear, Vercel, Apple Vision Pro, Notion.
  PREMIUM_AGENT_MAX_FILES        Max files to inspect locally.
  DISCORD_WEBHOOK_URL            Optional summary notification.
  TELEGRAM_BOT_TOKEN             Optional Telegram notification token.
  TELEGRAM_CHAT_ID               Optional Telegram chat id.
`);
}
