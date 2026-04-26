import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseRest } from "@/lib/supabase-rest";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const [checkin] = await supabaseRest<{ checked_out_at: string | null }[]>("crachas_checkins", {
    query: {
      select: "checked_out_at",
      id: `eq.${params.id}`,
      limit: "1",
    },
  });

  if (!checkin) {
    return NextResponse.json({ error: "Check-in nao encontrado" }, { status: 404 });
  }

  const updated = checkin.checked_out_at
    ? checkin
    : await supabaseRest("crachas_checkins", {
        method: "PATCH",
        body: { checked_out_at: new Date().toISOString() },
        query: {
          id: `eq.${params.id}`,
        },
        prefer: "return=representation",
      });

  return NextResponse.json({ ok: true, checkin: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  await supabaseRest("crachas_checkins", {
    method: "DELETE",
    query: {
      id: `eq.${params.id}`,
    },
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
