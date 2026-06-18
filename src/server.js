import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkTrade, evaluateDmvAnswer, getState, listDmvCandidates, listDmvTests, resetState, runDmvExam } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const port = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/check-trade") {
      const body = await readJson(req);
      sendJson(res, 200, checkTrade(body));
      return;
    }

    if (req.method === "GET" && req.url === "/api/state") {
      sendJson(res, 200, getState());
      return;
    }

    if (req.method === "GET" && req.url === "/api/dmv/candidates") {
      sendJson(res, 200, listDmvCandidates());
      return;
    }

    if (req.method === "GET" && req.url === "/api/dmv/tests") {
      sendJson(res, 200, listDmvTests());
      return;
    }

    if (req.method === "POST" && req.url === "/api/dmv/run") {
      const body = await readJson(req);
      sendJson(res, 200, runDmvExam(body));
      return;
    }

    if (req.method === "POST" && req.url === "/api/dmv/evaluate-answer") {
      const body = await readJson(req);
      sendJson(res, 200, evaluateDmvAnswer(body));
      return;
    }

    if (req.method === "POST" && req.url === "/api/reset") {
      resetState();
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET") {
      await serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`AI Trading DMV running at http://localhost:${port}`);
});

async function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    sendText(res, 403, "Forbidden", "text/plain");
    return;
  }

  try {
    const data = await readFile(filePath);
    sendBuffer(res, 200, data, contentType(filePath));
  } catch {
    sendText(res, 404, "Not found", "text/plain");
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function sendJson(res, status, payload) {
  sendText(res, status, JSON.stringify(payload, null, 2), "application/json");
}

function sendText(res, status, text, type) {
  res.writeHead(status, {
    "Content-Type": `${type}; charset=utf-8`,
    "Cache-Control": "no-store"
  });
  res.end(text);
}

function sendBuffer(res, status, data, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(data);
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}
