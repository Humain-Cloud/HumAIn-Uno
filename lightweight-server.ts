// Ultra-lightweight Bun HTTP server for Humain-Uno
// Serves static files from .next build and API responses from file cache
// Uses ~20-30MB memory vs ~100MB+ for full Next.js server

const PORT = 3000;
const PROJECT_DIR = "/home/z/my-project";
const NEXT_DIR = `${PROJECT_DIR}/.next`;
const STANDALONE_DIR = `${NEXT_DIR}/standalone`;
const STATIC_DIR = `${STANDALONE_DIR}/.next/static`;
const CACHE_DIR = `${PROJECT_DIR}/.cache-api`;

const MIME: Record<string, string> = {
  html: "text/html", js: "text/javascript", css: "text/css",
  json: "application/json", png: "image/png", jpg: "image/jpeg",
  svg: "image/svg+xml", ico: "image/x-icon", woff2: "font/woff2",
  woff: "font/woff", ttf: "font/ttf",
};

// Pre-load all API cache files into memory
const apiCache = new Map<string, any>();
function preloadCache() {
  try {
    const files = Bun.fileSystem.readdirSync(CACHE_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const key = file.replace(".json", "");
        const raw = Bun.file(`${CACHE_DIR}/${file}`).text();
        // We'll load these asynchronously
      }
    }
  } catch {}
}

// Actually pre-load synchronously
try {
  const { readdirSync, readFileSync } = require("fs");
  const files = readdirSync(CACHE_DIR);
  for (const file of files) {
    if (file.endsWith(".json")) {
      const key = file.replace(".json", "");
      try {
        const raw = readFileSync(`${CACHE_DIR}/${file}`, "utf-8");
        const entry = JSON.parse(raw);
        apiCache.set(key, entry.data);
      } catch {}
    }
  }
  console.log(`Pre-loaded ${apiCache.size} API cache entries`);
} catch (e) {
  console.log("No API cache to load");
}

// Read the main HTML page once
let indexHtml: string | null = null;
try {
  const { readFileSync } = require("fs");
  // Try to find the HTML file
  const possiblePaths = [
    `${STANDALONE_DIR}/server/app/index.html`,
    `${STANDALONE_DIR}/server/app.html`,
  ];
  for (const p of possiblePaths) {
    try {
      indexHtml = readFileSync(p, "utf-8");
      console.log(`Loaded index HTML from ${p}`);
      break;
    } catch {}
  }
} catch {}

function getExt(path: string): string {
  const parts = path.split(".");
  return parts[parts.length - 1] || "";
}

// Cache key mapping for API routes
function findApiCache(urlPath: string, searchParams: URLSearchParams): any | null {
  if (urlPath === "/api/stats") {
    return apiCache.get("stats_platform");
  }
  if (urlPath === "/api/categories") {
    return apiCache.get("categories_all");
  }
  if (urlPath === "/api/industries") {
    return apiCache.get("industries_all");
  }
  if (urlPath === "/api/knowledge") {
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "20";
    const key = `knowledge_list____${page}_${pageSize}`;
    if (apiCache.has(key)) return apiCache.get(key);
    // Fallback: find any knowledge cache
    for (const [k, v] of apiCache.entries()) {
      if (k.startsWith("knowledge_list____")) return v;
    }
  }
  return null;
}

const server = Bun.serve({
  port: PORT,
  hostname: "::",
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // API routes - serve from cache
    if (path.startsWith("/api/")) {
      const cached = findApiCache(path, url.searchParams);
      if (cached) {
        return new Response(JSON.stringify(cached), {
          headers: { "Content-Type": "application/json" },
        });
      }
      // No cache - return empty response
      return new Response(JSON.stringify({ error: "Not cached", data: [], total: 0 }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Static files from .next
    if (path.startsWith("/_next/")) {
      const filePath = `${STANDALONE_DIR}${path}`;
      try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
          const ext = getExt(path);
          const contentType = MIME[ext] || "application/octet-stream";
          return new Response(file, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      } catch {}
    }

    // Public files (favicon, etc.)
    if (path.startsWith("/favicon") || path.startsWith("/images/")) {
      try {
        const file = Bun.file(`${STANDALONE_DIR}/public${path}`);
        if (await file.exists()) {
          return new Response(file);
        }
      } catch {}
    }

    // All other routes - serve index HTML (SPA)
    if (indexHtml) {
      return new Response(indexHtml, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Generate minimal HTML if no cached version
    return new Response(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Humain-Uno - AI Agent Marketplace</title>
<link rel="stylesheet" href="/_next/static/chunks/34d933785a17edf3.css"/>
<link rel="stylesheet" href="/_next/static/chunks/5ec4d1fa25f0dfd2.css"/>
</head><body>
<div id="__next"></div>
<script src="/_next/static/chunks/fb1b0b9da3f03023.js" async=""></script>
<script src="/_next/static/chunks/771dedee3f5e1621.js" async=""></script>
<script src="/_next/static/chunks/a711291fe4270a33.js" async=""></script>
<script src="/_next/static/chunks/turbopack-c16380eb108a730b.js" async=""></script>
<script src="/_next/static/chunks/2508311655314fc5.js" async=""></script>
<script src="/_next/static/chunks/aad3b56441dc3945.js" async=""></script>
<script src="/_next/static/chunks/ff1a16fafef87110.js" async=""></script>
<script src="/_next/static/chunks/d2be314c3ece3fbe.js" async=""></script>
<script src="/_next/static/chunks/35ba08cf00416e17.js" async=""></script>
</body></html>`, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(`Lightweight server running on http://[::]:${PORT}`);
