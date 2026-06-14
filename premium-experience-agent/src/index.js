#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs, printHelp } from "./config.js";
import { chooseReference, loadReferenceKnowledge, scanProject } from "./scanner.js";
import { buildDryRunSummary, buildPremiumImprovementPrompt } from "./prompts.js";
import { notify } from "./notifications.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const knowledge = await loadReferenceKnowledge();
  const scan = await scanProject({ target: args.target, maxFiles: args.maxFiles });
  const reference = chooseReference(scan, knowledge, args.referenceStyle);
  const summary = buildDryRunSummary({ scan, reference });
  const reportPath = await writeReport(args.reportDir, { scan, reference, summary });

  console.log(summary);
  console.log(`Report: ${reportPath}`);

  if (args.mode === "dry-run") {
    await notify(summary);
    return;
  }

  if (args.mode !== "pr") {
    throw new Error(`Unsupported mode: ${args.mode}`);
  }

  if (scan.totalFindings === 0) {
    await notify(`${summary}\n\nNo PR requested because the scanner found no clear opportunities.`);
    return;
  }

  if (!process.env.CURSOR_API_KEY) {
    throw new Error("CURSOR_API_KEY is required for --mode pr.");
  }

  const prompt = buildPremiumImprovementPrompt({ scan, reference, knowledge });
  const cursorSummary = await runCursorAgent(prompt, args);
  console.log(`Cursor run:\n${cursorSummary}`);
  await notify(`${summary}\n\nCursor run:\n${cursorSummary}`);
}

async function writeReport(reportDir, payload) {
  await fs.mkdir(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-");
  const reportPath = path.join(reportDir, `premium-experience-${stamp}.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return reportPath;
}

async function runCursorAgent(prompt, args) {
  const { Agent, CursorAgentError } = await import("@cursor/sdk");
  const options = buildCursorOptions(args);

  try {
    const result = await Agent.prompt(prompt, options);
    const status = result?.status || "unknown";
    const resultText = result?.result || result?.text || "";

    if (status !== "finished") {
      process.exitCode = 2;
    }

    return [
      `status: ${status}`,
      result?.id ? `runId: ${result.id}` : null,
      resultText ? truncate(resultText, 2500) : null
    ].filter(Boolean).join("\n");
  } catch (error) {
    if (CursorAgentError && error instanceof CursorAgentError) {
      process.exitCode = 1;
      return `startup failure: ${error.message}; retryable=${Boolean(error.isRetryable)}`;
    }

    throw error;
  }
}

function buildCursorOptions(args) {
  const modelId = process.env.CURSOR_MODEL || "auto";
  const repoUrl = process.env.CURSOR_REPO_URL || githubRepoUrl();
  const repoRef = process.env.CURSOR_REPO_REF || process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF;

  const base = {
    apiKey: process.env.CURSOR_API_KEY,
    model: { id: modelId }
  };

  if (process.env.CURSOR_CLOUD_REPOS_JSON) {
    return {
      ...base,
      cloud: {
        repos: JSON.parse(process.env.CURSOR_CLOUD_REPOS_JSON),
        autoCreatePR: true,
        autoCreatePr: true,
        skipReviewerRequest: true
      }
    };
  }

  if (repoUrl) {
    const repo = repoRef ? { url: repoUrl, ref: repoRef } : { url: repoUrl };
    return {
      ...base,
      cloud: {
        repos: [repo],
        autoCreatePR: args.applyMode === "pr",
        autoCreatePr: args.applyMode === "pr",
        skipReviewerRequest: true
      }
    };
  }

  return {
    ...base,
    local: {
      cwd: args.target,
      settingSources: []
    }
  };
}

function githubRepoUrl() {
  if (!process.env.GITHUB_REPOSITORY) return "";
  return `https://github.com/${process.env.GITHUB_REPOSITORY}.git`;
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 20)}\n... truncated`;
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exitCode = process.exitCode || 1;
});
