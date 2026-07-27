import { isDbConfigured, mongoClient } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Always return 200 so the app boots even before the database is configured.
  // We report the live database reachability status separately.
  if (!isDbConfigured) {
    return Response.json({ ok: true, db: "unconfigured" });
  }
  try {
    await mongoClient.db().command({ ping: 1 });
    return Response.json({ ok: true, db: "connected" });
  } catch {
    return Response.json({ ok: true, db: "unreachable" });
  }
}
