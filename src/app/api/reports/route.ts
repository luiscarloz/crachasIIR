import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseRest } from "@/lib/supabase-rest";

type ReportCheckin = {
  volunteer_id: string;
  service_type: string;
  volunteer: {
    id: string;
    name: string;
    area?: { name: string } | null;
  } | null;
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const filtered = await supabaseRest<ReportCheckin[]>("crachas_checkins", {
    query: {
      select: "volunteer_id,service_type,volunteer:crachas_volunteers(id,name,area:crachas_areas(name))",
      date: `gte.${startDate.toISOString().slice(0, 10)}`,
      and: `(date.lte.${endDate.toISOString().slice(0, 10)})`,
    },
  });

  const volunteerMap = new Map<string, {
    id: string;
    name: string;
    area: string;
    count: number;
    services: string[];
  }>();

  for (const ci of filtered) {
    const vol = ci.volunteer;
    if (!vol) continue;
    const area = vol.area;

    if (!volunteerMap.has(ci.volunteer_id)) {
      volunteerMap.set(ci.volunteer_id, {
        id: vol.id,
        name: vol.name,
        area: area?.name || "Sem area",
        count: 0,
        services: [],
      });
    }
    const entry = volunteerMap.get(ci.volunteer_id)!;
    entry.count++;
    entry.services.push(ci.service_type);
  }

  const report = Array.from(volunteerMap.values()).sort((a, b) => b.count - a.count);

  let saturdays = 0;
  let sundays = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) sundays++;
    if (d.getDay() === 6) saturdays++;
  }
  const maxServices = saturdays + sundays * 2;

  return NextResponse.json({
    report,
    summary: {
      totalCheckins: filtered.length,
      uniqueVolunteers: volunteerMap.size,
      maxServices,
      month,
      year,
    },
  });
}
