import {
  type Child, type InsertChild,
  type Workshop, type InsertWorkshop,
  type Session, type InsertSession,
  type Observation, type InsertObservation
} from "@shared/schema";

export interface IStorage {
  // Children
  getChildren(): Promise<Child[]>;
  getChild(id: number): Promise<Child | undefined>;
  createChild(child: InsertChild): Promise<Child>;

  // Workshops
  getWorkshops(): Promise<Workshop[]>;
  getWorkshop(id: number): Promise<Workshop | undefined>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;
  updateWorkshop(id: number, workshop: Partial<Workshop>): Promise<Workshop>;

  // Sessions
  getSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;

  // Observations
  getObservations(childId: number): Promise<Observation[]>;
  createObservation(observation: InsertObservation): Promise<Observation>;
}

export class MemStorage implements IStorage {
  private children: Map<number, Child>;
  private workshops: Map<number, Workshop>;
  private sessions: Map<number, Session>;
  private observations: Map<number, Observation>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.children = new Map();
    this.workshops = new Map();
    this.sessions = new Map();
    this.observations = new Map();
    this.currentIds = {
      children: 1,
      workshops: 1,
      sessions: 1,
      observations: 1
    };
  }

  // Children
  async getChildren(): Promise<Child[]> {
    return Array.from(this.children.values());
  }

  async getChild(id: number): Promise<Child | undefined> {
    return this.children.get(id);
  }

  async createChild(child: InsertChild): Promise<Child> {
    const id = this.currentIds.children++;
    const newChild = { ...child, id };
    this.children.set(id, newChild);
    return newChild;
  }

  // Workshops
  async getWorkshops(): Promise<Workshop[]> {
    return Array.from(this.workshops.values());
  }

  async getWorkshop(id: number): Promise<Workshop | undefined> {
    return this.workshops.get(id);
  }

  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const id = this.currentIds.workshops++;
    const newWorkshop = { ...workshop, id };
    this.workshops.set(id, newWorkshop);
    return newWorkshop;
  }

  async updateWorkshop(id: number, workshop: Partial<Workshop>): Promise<Workshop> {
    const existing = this.workshops.get(id);
    if (!existing) throw new Error("Workshop not found");
    const updated = { ...existing, ...workshop };
    this.workshops.set(id, updated);
    return updated;
  }

  // Sessions
  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = this.currentIds.sessions++;
    const newSession = { ...session, id };
    this.sessions.set(id, newSession);
    return newSession;
  }

  // Observations
  async getObservations(childId: number): Promise<Observation[]> {
    return Array.from(this.observations.values())
      .filter(obs => obs.childId === childId);
  }

  async createObservation(observation: InsertObservation): Promise<Observation> {
    const id = this.currentIds.observations++;
    const newObservation = { ...observation, id };
    this.observations.set(id, newObservation);
    return newObservation;
  }
}

export const storage = new MemStorage();
