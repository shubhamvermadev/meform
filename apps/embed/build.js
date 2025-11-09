/**
 * Build script to bundle embed SDK into single file
 */

const fs = require("fs");
const path = require("path");

// Read the compiled JS
const distPath = path.join(__dirname, "dist", "index.js");
const outputPath = path.join(__dirname, "..", "dashboard", "public", "cdn", "v1", "meform.js");

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy and minify (basic minification)
if (fs.existsSync(distPath)) {
  let content = fs.readFileSync(distPath, "utf8");
  
  // Basic minification (remove comments, extra whitespace)
  content = content
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
    .replace(/\/\/.*$/gm, "") // Remove line comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  fs.writeFileSync(outputPath, content);
  console.log(`Built embed SDK to ${outputPath}`);
} else {
  console.error("Compiled file not found. Run 'tsc' first.");
  process.exit(1);
}

