export type Area = { id: string; name: string; createdAt: Date };
export type Volunteer = { id: string; name: string; areaId: string; active: boolean; createdAt: Date };
export type CheckIn = { id: string; volunteerId: string; serviceType: string; checkedInAt: Date; checkedOutAt: Date | null; date: string };

type MockStore = {
  nextId: number;
  areas: Area[];
  volunteers: Volunteer[];
  checkins: CheckIn[];
};

const globalForMockData = globalThis as typeof globalThis & {
  __crachasIirStore?: MockStore;
};

function createStore(): MockStore {
  let nextId = 1;
  const genStoreId = () => String(nextId++);

  const areas: Area[] = [
    "Louvor", "Midia", "Recepcao", "Kids", "Estacionamento",
    "Intercessao", "Diaconia", "Som", "Transmissao", "Limpeza",
  ].map((name) => ({ id: genStoreId(), name, createdAt: new Date() }));

  const volunteers: Volunteer[] = [
    { name: "Ana Silva", area: "Louvor" },
    { name: "Carlos Santos", area: "Louvor" },
    { name: "Maria Oliveira", area: "Recepcao" },
    { name: "Joao Pedro", area: "Kids" },
    { name: "Julia Costa", area: "Midia" },
    { name: "Lucas Souza", area: "Som" },
    { name: "Fernanda Lima", area: "Intercessao" },
    { name: "Rafael Alves", area: "Estacionamento" },
    { name: "Beatriz Rocha", area: "Diaconia" },
    { name: "Pedro Mendes", area: "Transmissao" },
    { name: "Camila Reis", area: "Limpeza" },
    { name: "Bruno Ferreira", area: "Louvor" },
  ].map(({ name, area }) => ({
    id: genStoreId(),
    name,
    areaId: areas.find((a) => a.name === area)!.id,
    active: true,
    createdAt: new Date(),
  }));

  return { nextId, areas, volunteers, checkins: [] };
}

const store = globalForMockData.__crachasIirStore ?? createStore();
globalForMockData.__crachasIirStore = store;

export const areas = store.areas;
export const volunteers = store.volunteers;
export const checkins = store.checkins;

function genId() {
  return String(store.nextId++);
}

export function getAreaById(id: string) { return areas.find((a) => a.id === id); }
export function getVolunteerById(id: string) { return volunteers.find((v) => v.id === id); }

export function volunteerWithArea(v: Volunteer) {
  const area = getAreaById(v.areaId);
  return { ...v, area: area ? { id: area.id, name: area.name } : null };
}

export function checkinWithVolunteer(ci: CheckIn) {
  const vol = getVolunteerById(ci.volunteerId);
  return { ...ci, volunteer: vol ? volunteerWithArea(vol) : null };
}

export { genId };
