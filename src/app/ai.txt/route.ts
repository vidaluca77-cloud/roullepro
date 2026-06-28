import { NextResponse } from "next/server";

export const revalidate = 3600;

const CONTENT = `User-Agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /dashboard
Disallow: /profil
Disallow: /favoris
Disallow: /auth

# Preferences (https://site.spawning.ai/spawning-ai-txt)
Preference: ai-search=allow
Preference: ai-train=allow
Preference: search=allow

Contact: contact@roullepro.com
`;

export function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
