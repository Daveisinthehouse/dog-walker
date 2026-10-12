const ALLOWED_ORIGIN = "https://daveisinthehouse.github.io";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders(origin) }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "access-control-max-age": "86400"
        }
      });
    }

    if (origin && origin !== ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "dog-walker-leaderboard" }, 200, origin);
    }

    if (url.pathname === "/api/leaderboard" && request.method === "GET") {
      try {
        const result = await env.DB.prepare(
          "SELECT player_name, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 10"
        ).all();
        return json(result.results || [], 200, origin);
      } catch (error) {
        return json({ error: "Leaderboard is not ready. Check the D1 database setup." }, 503, origin);
      }
    }

    if (url.pathname === "/api/scores" && request.method === "POST") {
      const contentLength = Number(request.headers.get("Content-Length") || 0);
      if (contentLength > 2048) return json({ error: "Request too large" }, 413, origin);

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, origin);
      }

      const name = typeof body.player_name === "string"
        ? body.player_name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 20)
        : "";
      const score = Number(body.score);

      if (!name) return json({ error: "Please enter a name" }, 400, origin);
      if (!Number.isSafeInteger(score) || score < 0 || score > 10000000) {
        return json({ error: "Invalid score" }, 400, origin);
      }

      try {
        await env.DB.prepare(
          "INSERT INTO scores (player_name, score) VALUES (?, ?)"
        ).bind(name, score).run();
        return json({ ok: true }, 201, origin);
      } catch (error) {
        return json({ error: "Could not save score. Please try again." }, 503, origin);
      }
    }

    return json({ error: "Not found" }, 404, origin);
  }
};
