"use client";

import { useState, useEffect } from "react";

type ReportEntry = {
  id: string;
  name: string;
  area: string;
  count: number;
  services: string[];
};

type Summary = {
  totalCheckins: number;
  uniqueVolunteers: number;
  maxServices: number;
  month: number;
  year: number;
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function RelatoriosPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState<ReportEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch(`/api/reports?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        setReport(data.report);
        setSummary(data.summary);
      });
  }, [month, year]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Relatorios</h1>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Total de Check-ins</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary.totalCheckins}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Voluntarios Ativos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary.uniqueVolunteers}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Cultos no Mes</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary.maxServices}
            </p>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">
            Ranking de Voluntarios - {MONTHS[month - 1]} {year}
          </h2>
        </div>
        {report.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhum dado para este periodo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">#</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Nome</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Area</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Vezes que Serviu</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Frequencia</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.map((entry, i) => {
                  const freq = summary
                    ? Math.round((entry.count / summary.maxServices) * 100)
                    : 0;
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {entry.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {entry.area}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">
                          {entry.count}
                        </span>
                        <span className="text-sm text-gray-400">
                          {" "}/ {summary?.maxServices}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                freq >= 75
                                  ? "bg-green-500"
                                  : freq >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(freq, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{freq}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
