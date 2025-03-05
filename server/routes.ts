import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChildSchema, insertWorkshopSchema, insertSessionSchema, insertObservationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Children routes
  app.get("/api/children", async (_req, res) => {
    const children = await storage.getChildren();
    res.json(children);
  });

  app.get("/api/children/:id", async (req, res) => {
    const child = await storage.getChild(Number(req.params.id));
    if (!child) return res.status(404).json({ message: "Kind niet gevonden" });
    res.json(child);
  });

  app.post("/api/children", async (req, res) => {
    const result = insertChildSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige gegevens" });
    }
    const child = await storage.createChild(result.data);
    res.status(201).json(child);
  });

  // Workshops routes
  app.get("/api/workshops", async (_req, res) => {
    const workshops = await storage.getWorkshops();
    res.json(workshops);
  });

  app.get("/api/workshops/:id", async (req, res) => {
    const workshop = await storage.getWorkshop(Number(req.params.id));
    if (!workshop) return res.status(404).json({ message: "Workshop niet gevonden" });
    res.json(workshop);
  });

  app.post("/api/workshops", async (req, res) => {
    const result = insertWorkshopSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige gegevens" });
    }
    const workshop = await storage.createWorkshop(result.data);
    res.status(201).json(workshop);
  });

  app.patch("/api/workshops/:id", async (req, res) => {
    try {
      const workshop = await storage.updateWorkshop(Number(req.params.id), req.body);
      res.json(workshop);
    } catch (error) {
      res.status(404).json({ message: "Workshop niet gevonden" });
    }
  });

  // Sessions routes
  app.get("/api/sessions", async (_req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.post("/api/sessions", async (req, res) => {
    const result = insertSessionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige gegevens" });
    }
    const session = await storage.createSession(result.data);
    res.status(201).json(session);
  });

  // Observations routes
  app.get("/api/children/:id/observations", async (req, res) => {
    const observations = await storage.getObservations(Number(req.params.id));
    res.json(observations);
  });

  app.post("/api/observations", async (req, res) => {
    const result = insertObservationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige gegevens" });
    }
    const observation = await storage.createObservation(result.data);
    res.status(201).json(observation);
  });

  const httpServer = createServer(app);
  return httpServer;
}
