import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseRest, todayInSaoPaulo } from "@/lib/supabase-rest";

type SupabaseCheckin = {
  id: string;
  service_type: string;
  checked_in_at: string;
  checked_out_at: string | null;
  date: string;
  volunteer: {
    id: string;
    name: string;
    area: { id: string; name: string };
  };
};

function formatCheckin(row: SupabaseCheckin) {
  return {
    id: row.id,
    serviceType: row.service_type,
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at,
    date: row.date,
    volunteer: row.volunteer,
  };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceType = searchParams.get("serviceType");

  const result = await supabaseRest<SupabaseCheckin[]>("crachas_checkins", {
    query: {
      select: "*,volunteer:crachas_volunteers(*,area:crachas_areas(id,name))",
      ...(date ? { date: `eq.${date}` } : {}),
      ...(serviceType ? { service_type: `eq.${serviceType}` } : {}),
      order: "checked_out_at.asc.nullsfirst,checked_in_at.desc",
    },
  });

  return NextResponse.json(result.map(formatCheckin));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { volunteerId, serviceType } = await req.json();
  if (!volunteerId || !serviceType) {
    return NextResponse.json({ error: "Voluntario e tipo de culto obrigatorios" }, { status: 400 });
  }

  const today = todayInSaoPaulo();

  const existing = await supabaseRest<unknown[]>("crachas_checkins", {
    query: {
      select: "id",
      volunteer_id: `eq.${volunteerId}`,
      service_type: `eq.${serviceType}`,
      date: `eq.${today}`,
      checked_out_at: "is.null",
      limit: "1",
    },
  });

  if (existing.length > 0) {
    return NextResponse.json({ error: "Voluntario ja esta com cracha neste culto" }, { status: 409 });
  }

  const [checkin] = await supabaseRest<SupabaseCheckin[]>("crachas_checkins", {
    method: "POST",
    body: {
      volunteer_id: volunteerId,
      service_type: serviceType,
      date: today,
    },
    query: {
      select: "*,volunteer:crachas_volunteers(*,area:crachas_areas(id,name))",
    },
    prefer: "return=representation",
  });

  return NextResponse.json(formatCheckin(checkin));
}
