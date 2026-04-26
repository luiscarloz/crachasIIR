import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseRest } from "@/lib/supabase-rest";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get("areaId");

  const result = await supabaseRest("crachas_volunteers", {
    query: {
      select: "*,area:crachas_areas(id,name)",
      active: "eq.true",
      ...(areaId ? { area_id: `eq.${areaId}` } : {}),
      order: "name.asc",
    },
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { name, areaId } = await req.json();
  if (!name || !areaId) {
    return NextResponse.json({ error: "Nome e area obrigatorios" }, { status: 400 });
  }

  const [volunteer] = await supabaseRest("crachas_volunteers", {
    method: "POST",
    body: { name, area_id: areaId, active: true },
    query: {
      select: "*,area:crachas_areas(id,name)",
    },
    prefer: "return=representation",
  }) as unknown[];

  return NextResponse.json(volunteer);
}
