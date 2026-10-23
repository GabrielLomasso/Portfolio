// Gera src/data/changelog.json com o histórico do Git deste site, para a seção
// "Este site, commit a commit". Rodar: npm run build:changelog
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SEP = "\u001f";
const raw = execFileSync("git", ["log", `--pretty=format:%h${SEP}%ad${SEP}%s${SEP}%D`, "--date=short", "--no-merges", "--decorate=short"], {
  encoding: "utf8",
});

const commits = raw
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [hash, date, subject, refs = ""] = line.split(SEP);
    // Só as tags interessam (branches mudam a cada commit)
    const tags = refs
      .split(", ")
      .filter((ref) => ref.startsWith("tag: "))
      .map((ref) => ref.slice(5));
    return { hash, date, subject, tags };
  });

const out = path.resolve(import.meta.dirname, "../src/data/changelog.json");
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), commits }, null, 2) + "\n");
console.log(`changelog: ${commits.length} commits em ${out}`);
