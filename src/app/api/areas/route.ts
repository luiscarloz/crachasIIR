import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseRest } from "@/lib/supabase-rest";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const sorted = await supabaseRest("crachas_areas", {
    query: {
      select: "*",
      order: "name.asc",
    },
  });

  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

  const [area] = await supabaseRest("crachas_areas", {
    method: "POST",
    body: { name },
    prefer: "return=representation",
  }) as unknown[];

  return NextResponse.json(area);
}
