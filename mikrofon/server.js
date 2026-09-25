#!/usr/bin/env node
// Dauer-Mikrofon für Claude Code.
// Startet einen lokalen Webserver. Die Seite hört per Spracherkennung im Browser
// die ganze Zeit zu und schickt jeden gesprochenen Satz an `claude -p`.
// Alle Sätze landen in derselben Claude-Code-Session (via --resume).
//
// Start:  node mikrofon/server.js   (oder: npm run mikrofon)
// Stopp:  "Mikrofon stopp" sagen

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");

const PORT = Number(process.env.PORT) || 4711;
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";
// z.B. --permission acceptEdits (oder MIKROFON_PERMISSION_MODE=acceptEdits),
// damit Claude ohne Rückfrage Dateien ändern darf
const permArg = process.argv.indexOf("--permission");
const PERMISSION_MODE =
  (permArg !== -1 && process.argv[permArg + 1]) || process.env.MIKROFON_PERMISSION_MODE;
const WORKDIR = process.env.MIKROFON_CWD || process.cwd();

let sessionId = process.env.MIKROFON_SESSION || null;
let queue = Promise.resolve();

function askClaude(text) {
  return new Promise((resolve, reject) => {
    const args = ["-p", text, "--output-format", "json"];
    if (sessionId) args.push("--resume", sessionId);
    if (PERMISSION_MODE) args.push("--permission-mode", PERMISSION_MODE);

    const child = spawn(CLAUDE_BIN, args, { cwd: WORKDIR });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) => {
      try {
        const result = JSON.parse(out);
        if (result.session_id) sessionId = result.session_id;
        resolve(result.result ?? "");
      } catch {
        reject(new Error(err || out || `claude beendet mit Code ${code}`));
      }
    });
  });
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => resolve(body));
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(path.join(__dirname, "index.html")).pipe(res);
    return;
  }

  if (req.method === "POST" && req.url === "/ask") {
    let text;
    try {
      text = JSON.parse(await readBody(req)).text?.trim();
    } catch {
      return sendJson(res, 400, { error: "Ungültige Anfrage" });
    }
    if (!text) return sendJson(res, 400, { error: "Kein Text" });

    console.log(`\n🎤 Du: ${text}`);
    // Nacheinander abarbeiten, damit die Session-Reihenfolge stimmt
    const job = queue.then(() => askClaude(text));
    queue = job.catch(() => {});
    try {
      const answer = await job;
      console.log(`🤖 Claude: ${answer}`);
      sendJson(res, 200, { answer, sessionId });
    } catch (e) {
      console.error(`Fehler: ${e.message}`);
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/stop") {
    console.log("\n🛑 Mikrofon gestoppt.");
    if (sessionId) console.log(`Weitermachen im Terminal: claude --resume ${sessionId}`);
    sendJson(res, 200, { ok: true, sessionId });
    return;
  }

  res.writeHead(404);
  res.end();
});

// Nur lokal erreichbar
server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}`;
  console.log(`🎙️  Dauer-Mikrofon läuft: ${url}`);
  console.log(`   Arbeitsordner für Claude: ${WORKDIR}`);
  if (PERMISSION_MODE) console.log(`   Berechtigungsmodus: ${PERMISSION_MODE}`);
  console.log(`   Zum Beenden "Mikrofon stopp" sagen, Server mit Ctrl+C schliessen.`);
  const opener =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start \"\"" : "xdg-open";
  exec(`${opener} ${url}`, () => {});
});
