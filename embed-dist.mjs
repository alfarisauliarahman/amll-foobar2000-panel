import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(projectDir, "dist");
const outputDirs = [
  path.resolve(projectDir, "release"),
  path.resolve(projectDir, "..", "..", "outputs", "amll-foobar-panel"),
  path.resolve(process.env.USERPROFILE ?? projectDir, "Downloads"),
];

const entry = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
const scriptMatch = entry.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/i);
const styleMatch = entry.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/i);
if (!scriptMatch || !styleMatch) throw new Error("Vite assets were not found in dist/index.html");

const scriptPath = path.join(distDir, scriptMatch[1].replace(/^\.\//, ""));
const stylePath = path.join(distDir, styleMatch[1].replace(/^\.\//, ""));
const script = fs.readFileSync(scriptPath, "utf8").replaceAll("</script>", "<\\/script>");
const style = fs.readFileSync(stylePath, "utf8");
const standalone = entry
  .replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/i, () => `<script type="module">${script}</script>`)
  .replace(/<link[^>]+href="[^"]+\.css"[^>]*>/i, () => `<style>${style}</style>`);

for (const outputDir of outputDirs) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), standalone, "utf8");
}

console.log(`Wrote standalone index.html (${standalone.length} bytes)`);
