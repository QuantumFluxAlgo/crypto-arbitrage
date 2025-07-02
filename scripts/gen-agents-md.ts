import fs from "fs";
import path from "path";

interface Agent {
  name: string;
  language: string;
  port?: number | null;
  purpose: string;
  inputs?: string[];
  outputs?: string[];
  dependencies?: string[];
  gpu?: boolean;
}

const inputPath = path.join(__dirname, "../docs/agents.json");
const outputPath = path.join(__dirname, "../docs/agents.md");

const agents: Agent[] = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

const lines: string[] = [
  "# Agents Overview\n",
  "This document outlines the roles, responsibilities, and interfaces of each autonomous agent in the Crypto Arbitrage Platform.\n"
];

for (const agent of agents) {
  lines.push(`---\n`);
  lines.push(`## ${capitalize(agent.name)} Agent`);
  lines.push(`- **Language**: ${capitalize(agent.language)}`);
  if (agent.port !== undefined && agent.port !== null) lines.push(`- **Port**: ${agent.port}`);
  lines.push(`- **Purpose**: ${agent.purpose}`);
  if (agent.inputs?.length) lines.push(`- **Inputs**: ${agent.inputs.join(", ")}`);
  if (agent.outputs?.length) lines.push(`- **Outputs**: ${agent.outputs.join(", ")}`);
  if (agent.dependencies?.length) lines.push(`- **Dependencies**: ${agent.dependencies.join(", ")}`);
  if (agent.gpu) lines.push(`- **GPU Enabled**: ✅`);
  lines.push("");
}

fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");

console.log(`✅ agents.md generated successfully from agents.json`);

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

