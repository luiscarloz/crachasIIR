"use client";

import { useState, useEffect } from "react";

type Area = { id: string; name: string };
type Volunteer = { id: string; name: string; area: Area; active: boolean };

export default function VoluntariosPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [newArea, setNewArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterArea, setFilterArea] = useState("");

  useEffect(() => {
    loadAreas();
    loadVolunteers();
  }, []);

  async function loadAreas() {
    const res = await fetch("/api/areas");
    if (res.ok) setAreas(await res.json());
  }

  async function loadVolunteers() {
    const res = await fetch("/api/volunteers");
    if (res.ok) setVolunteers(await res.json());
  }

  async function handleAddVolunteer(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !areaId) return;
    setLoading(true);

    const res = await fetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, areaId }),
    });

    if (res.ok) {
      setName("");
      loadVolunteers();
    }
    setLoading(false);
  }

  async function handleAddArea(e: React.FormEvent) {
    e.preventDefault();
    if (!newArea) return;

    const res = await fetch("/api/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newArea }),
    });

    if (res.ok) {
      setNewArea("");
      loadAreas();
    }
  }

  const filtered = filterArea
    ? volunteers.filter((v) => v.area.id === filterArea)
    : volunteers;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Voluntarios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Volunteer */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Adicionar Voluntario
          </h2>
          <form onSubmit={handleAddVolunteer} className="space-y-3">
            <input
              type="text"
              placeholder="Nome do voluntario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione a area</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              Adicionar
            </button>
          </form>
        </div>

        {/* Add Area */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Adicionar Area</h2>
          <form onSubmit={handleAddArea} className="space-y-3">
            <input
              type="text"
              placeholder="Nome da area"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
            >
              Adicionar Area
            </button>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Areas cadastradas:</p>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <span
                  key={a.id}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">
            Lista de Voluntarios
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filtered.length})
            </span>
          </h2>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todas as areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhum voluntario cadastrado
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((v) => (
              <div key={v.id} className="px-4 py-3 flex justify-between items-center">
                <span className="font-medium text-gray-900">{v.name}</span>
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {v.area.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
