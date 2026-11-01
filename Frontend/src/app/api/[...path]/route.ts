import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_BASE =
  process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";

export const dynamic = "force-dynamic";

async function proxyToFastApi(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const targetUrl = `${INTERNAL_API_BASE}/api/${targetPath}`;
  const sessionId = req.headers.get("x-session-id") || "default";

  try {
    const init: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId,
      },
      cache: "no-store",
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const bodyText = await req.text();
      if (bodyText) {
        init.body = bodyText;
      }
    }

    const response = await fetch(targetUrl, init);
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(`[API Proxy Error] Failed to reach ${targetUrl}:`, error);
    return NextResponse.json(
      { error: "Interne Python-API nicht erreichbar." },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyToFastApi(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyToFastApi(req, context);
}
