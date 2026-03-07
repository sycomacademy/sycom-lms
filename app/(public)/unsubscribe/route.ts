import { db } from "@/packages/db";
import { unsubscribeUserFromMarketingEmails } from "@/packages/db/queries";
import { verifyUnsubscribeToken } from "@/packages/email/unsubscribe";

function renderHtml(title: string, message: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600&display=swap" rel="stylesheet" />
    <style>
      body { font-family: "Work Sans", sans-serif; background: #f7f7f5; color: #111827; margin: 0; }
      main { max-width: 32rem; margin: 10vh auto; background: #ffffff; padding: 2rem; border: 1px solid #382e72; }
      h1 { font-size: 1.5rem; margin: 0 0 0.75rem; font-weight: 600; }
      p { line-height: 1.6; margin: 0; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`;
}

async function handleRequest(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(
      renderHtml(
        "Invalid unsubscribe link",
        "This unsubscribe link is missing a token."
      ),
      {
        headers: { "content-type": "text/html; charset=utf-8" },
        status: 400,
      }
    );
  }

  const payload = verifyUnsubscribeToken(token);

  if (!payload) {
    return new Response(
      renderHtml(
        "Invalid unsubscribe link",
        "This unsubscribe link is invalid or has expired."
      ),
      {
        headers: { "content-type": "text/html; charset=utf-8" },
        status: 400,
      }
    );
  }

  const profile = await unsubscribeUserFromMarketingEmails(db, {
    userId: payload.userId,
  });

  if (!profile) {
    return new Response(
      renderHtml(
        "Subscription not found",
        "We could not find a matching account for this unsubscribe request."
      ),
      {
        headers: { "content-type": "text/html; charset=utf-8" },
        status: 404,
      }
    );
  }

  if (request.method === "POST") {
    return new Response(null, { status: 200 });
  }

  return new Response(
    renderHtml(
      "You are unsubscribed",
      `You will no longer receive non-essential emails at ${payload.email}.`
    ),
    {
      headers: { "content-type": "text/html; charset=utf-8" },
      status: 200,
    }
  );
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}
