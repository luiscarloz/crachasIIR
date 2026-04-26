"use client";

import { useState, useEffect, useCallback } from "react";

type Area = { id: string; name: string };
type Volunteer = { id: string; name: string; area: Area };
type CheckIn = {
  id: string;
  serviceType: string;
  checkedInAt: string;
  checkedOutAt: string | null;
  volunteer: Volunteer;
};

const SERVICE_LABELS: Record<string, string> = {
  DOMINGO_1030: "Culto de Domingo 10:30",
  DOMINGO_1830: "Culto de Domingo 18:30",
};

function getDefaultService(): string {
  const now = new Date();
  const hour = now.getHours();

  return hour < 14 ? "DOMINGO_1030" : "DOMINGO_1830";
}

function getLocalDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CheckInPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [serviceType, setServiceType] = useState(getDefaultService());
  const [newVolunteerName, setNewVolunteerName] = useState("");
  const [newVolunteerArea, setNewVolunteerArea] = useState("");
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const today = getLocalDate();
  const pendingCheckouts = checkins.filter((ci) => !ci.checkedOutAt).length;

  const loadCheckins = useCallback(async () => {
    const res = await fetch(
      `/api/checkins?date=${today}&serviceType=${serviceType}`
    );
    if (res.ok) setCheckins(await res.json());
  }, [today, serviceType]);

  const loadVolunteers = useCallback(async (areaId: string) => {
    const res = await fetch(`/api/volunteers?areaId=${areaId}`);
    if (res.ok) setVolunteers(await res.json());
  }, []);

  const loadAreas = useCallback(async () => {
    const res = await fetch("/api/areas");
    if (res.ok) setAreas(await res.json());
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  useEffect(() => {
    loadCheckins();
  }, [loadCheckins]);

  useEffect(() => {
    if (selectedArea) {
      loadVolunteers(selectedArea);
    } else {
      setVolunteers([]);
    }
    setSelectedVolunteer("");
  }, [selectedArea, loadVolunteers]);

  async function registerCheckin(volunteerId: string) {
    setLoading(true);
    setMessage({ text: "", type: "" });

    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volunteerId, serviceType }),
    });

    if (res.ok) {
      setMessage({ text: "Crachá entregue. Check-in registrado.", type: "success" });
      setSelectedVolunteer("");
      loadCheckins();
    } else {
      const data = await res.json();
      setMessage({ text: data.error || "Erro ao fazer check-in", type: "error" });
    }
    setLoading(false);
  }

  async function handleCheckin() {
    if (!selectedVolunteer) return;
    await registerCheckin(selectedVolunteer);
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newVolunteerName.trim() || !newVolunteerArea) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    const volunteerRes = await fetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newVolunteerName.trim(), areaId: newVolunteerArea }),
    });

    if (!volunteerRes.ok) {
      const data = await volunteerRes.json();
      setMessage({ text: data.error || "Erro ao cadastrar voluntário", type: "error" });
      setLoading(false);
      return;
    }

    const volunteer = await volunteerRes.json();
    setNewVolunteerName("");
    setNewVolunteerArea("");
    setShowAddVolunteer(false);
    setSelectedArea(newVolunteerArea);
    await loadVolunteers(newVolunteerArea);
    setLoading(false);
    await registerCheckin(volunteer.id);
  }

  async function handleAddArea(e: React.FormEvent) {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    const res = await fetch("/api/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newAreaName.trim() }),
    });

    if (res.ok) {
      const area = await res.json();
      setNewAreaName("");
      setShowAddArea(false);
      setSelectedArea(area.id);
      setNewVolunteerArea(area.id);
      await loadAreas();
      setMessage({ text: "Área cadastrada.", type: "success" });
    } else {
      const data = await res.json();
      setMessage({ text: data.error || "Erro ao cadastrar área", type: "error" });
    }

    setLoading(false);
  }

  async function handleCheckout(id: string) {
    const res = await fetch(`/api/checkins/${id}`, { method: "PATCH" });
    if (res.ok) {
      setMessage({ text: "Crachá devolvido. Checkout registrado.", type: "success" });
    } else {
      setMessage({ text: "Erro ao registrar checkout", type: "error" });
    }
    await loadCheckins();
  }

  return (
    <div className="space-y-6">
      <div className="bg-stone-950 text-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-stone-300">
              {SERVICE_LABELS[serviceType]} - {formatDate(new Date())}
            </p>
            <h1 className="text-3xl font-bold mt-1">Check-in de Voluntários</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-stone-300">Para devolver</p>
              <p className="text-2xl font-bold">{pendingCheckouts}</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-stone-300">Registros</p>
              <p className="text-2xl font-bold">{checkins.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-stone-950">Check-in de voluntário</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowAddArea(true)}
              className="w-full sm:w-auto rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Cadastrar área
            </button>
            <button
              type="button"
              onClick={() => setShowAddVolunteer(true)}
              className="w-full sm:w-auto rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Cadastrar voluntário novo
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Culto
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
            >
              {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
            >
              <option value="">Selecione a área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voluntário
            </label>
            <select
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
              disabled={!selectedArea}
            >
              <option value="">Selecione o voluntário</option>
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCheckin}
              disabled={!selectedVolunteer || loading}
              className="w-full bg-stone-950 text-white py-2 px-4 rounded-lg hover:bg-stone-800 disabled:bg-stone-400 font-medium"
            >
              {loading ? "Registrando..." : "Retirar crachá"}
            </button>
          </div>
        </div>
      </div>

      {showAddVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-950">
                  Cadastrar voluntário novo
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Depois do cadastro, o check-in já é registrado para o culto selecionado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVolunteer(false)}
                className="rounded-lg px-3 py-1 text-xl leading-none text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                aria-label="Fechar"
              >
                x
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do voluntário
                </label>
                <input
                  type="text"
                  value={newVolunteerName}
                  onChange={(e) => setNewVolunteerName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área
                </label>
                <select
                  value={newVolunteerArea}
                  onChange={(e) => setNewVolunteerArea(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
                >
                  <option value="">Selecione a área</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddVolunteer(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newVolunteerName.trim() || !newVolunteerArea || loading}
                  className="rounded-lg bg-stone-950 px-4 py-2 font-medium text-white hover:bg-stone-800 disabled:bg-stone-400"
                >
                  {loading ? "Registrando..." : "Cadastrar e retirar crachá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-950">
                  Cadastrar área
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  A nova área aparece nos cadastros e no check-in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddArea(false)}
                className="rounded-lg px-3 py-1 text-xl leading-none text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                aria-label="Fechar"
              >
                x
              </button>
            </div>

            <form onSubmit={handleAddArea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da área
                </label>
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="Ex: Recepção"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
                  autoFocus
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddArea(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newAreaName.trim() || loading}
                  className="rounded-lg bg-stone-950 px-4 py-2 font-medium text-white hover:bg-stone-800 disabled:bg-stone-400"
                >
                  {loading ? "Salvando..." : "Cadastrar área"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-stone-200">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-stone-950">
            Voluntários do culto - {SERVICE_LABELS[serviceType]}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({pendingCheckouts} para devolver, {checkins.length} registros)
            </span>
          </h2>
        </div>
        {checkins.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhum crachá retirado ainda
          </div>
        ) : (
          <div className="divide-y">
            {checkins.map((ci) => (
              <div
                key={ci.id}
                className="px-4 py-3 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-gray-900">
                    {ci.volunteer.name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {ci.volunteer.area.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-gray-500">
                    <div>
                      Retirou{" "}
                      {new Date(ci.checkedInAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {ci.checkedOutAt && (
                      <div>
                        Devolveu{" "}
                        {new Date(ci.checkedOutAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                  {ci.checkedOutAt ? (
                    <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      Devolvido
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCheckout(ci.id)}
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
                    >
                      Registrar devolução
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
