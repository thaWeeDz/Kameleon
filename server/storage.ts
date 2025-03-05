import {
  type Child, type InsertChild,
  type Workshop, type InsertWorkshop,
  type Session, type InsertSession,
  type Observation, type InsertObservation,
  type Recording, type InsertRecording,
  type TaggedMoment, type InsertTaggedMoment
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

  // Recordings
  getRecordings(sessionId: number): Promise<Recording[]>;
  getRecording(id: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  updateRecording(id: number, recording: Partial<Recording>): Promise<Recording>;

  // Tagged Moments
  getTaggedMoments(recordingId: number): Promise<TaggedMoment[]>;
  getTaggedMoment(id: number): Promise<TaggedMoment | undefined>;
  createTaggedMoment(moment: InsertTaggedMoment): Promise<TaggedMoment>;
  updateTaggedMoment(id: number, moment: Partial<TaggedMoment>): Promise<TaggedMoment>;
}

export class MemStorage implements IStorage {
  private children: Map<number, Child>;
  private workshops: Map<number, Workshop>;
  private sessions: Map<number, Session>;
  private observations: Map<number, Observation>;
  private recordings: Map<number, Recording>;
  private taggedMoments: Map<number, TaggedMoment>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.children = new Map();
    this.workshops = new Map();
    this.sessions = new Map();
    this.observations = new Map();
    this.recordings = new Map();
    this.taggedMoments = new Map();
    this.currentIds = {
      children: 1,
      workshops: 1,
      sessions: 1,
      observations: 1,
      recordings: 1,
      taggedMoments: 1
    };
  }

  // Children methods
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

  // Workshop methods
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

  // Session methods
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

  // Observation methods
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

  // Recording methods
  async getRecordings(sessionId: number): Promise<Recording[]> {
    return Array.from(this.recordings.values())
      .filter(rec => rec.sessionId === sessionId);
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    const id = this.currentIds.recordings++;
    const newRecording = { ...recording, id };
    this.recordings.set(id, newRecording);
    return newRecording;
  }

  async updateRecording(id: number, recording: Partial<Recording>): Promise<Recording> {
    const existing = this.recordings.get(id);
    if (!existing) throw new Error("Recording not found");
    const updated = { ...existing, ...recording };
    this.recordings.set(id, updated);
    return updated;
  }

  // Tagged Moment methods
  async getTaggedMoments(recordingId: number): Promise<TaggedMoment[]> {
    return Array.from(this.taggedMoments.values())
      .filter(moment => moment.recordingId === recordingId);
  }

  async getTaggedMoment(id: number): Promise<TaggedMoment | undefined> {
    return this.taggedMoments.get(id);
  }

  async createTaggedMoment(moment: InsertTaggedMoment): Promise<TaggedMoment> {
    const id = this.currentIds.taggedMoments++;
    const newMoment = { ...moment, id };
    this.taggedMoments.set(id, newMoment);
    return newMoment;
  }

  async updateTaggedMoment(id: number, moment: Partial<TaggedMoment>): Promise<TaggedMoment> {
    const existing = this.taggedMoments.get(id);
    if (!existing) throw new Error("Tagged moment not found");
    const updated = { ...existing, ...moment };
    this.taggedMoments.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();