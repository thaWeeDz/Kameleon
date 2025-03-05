import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertChildSchema, 
  insertWorkshopSchema, 
  insertSessionSchema, 
  insertObservationSchema,
  insertRecordingSchema,
  insertTaggedMomentSchema
} from "@shared/schema";

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/webm', 'audio/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

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

  app.get("/api/sessions/:id", async (req, res) => {
    const session = await storage.getSession(Number(req.params.id));
    if (!session) return res.status(404).json({ message: "Sessie niet gevonden" });
    res.json(session);
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

  // Recordings routes
  app.get("/api/sessions/:id/recordings", async (req, res) => {
    const recordings = await storage.getRecordings(Number(req.params.id));
    res.json(recordings);
  });

  app.get("/api/recordings/:id", async (req, res) => {
    const recording = await storage.getRecording(Number(req.params.id));
    if (!recording) return res.status(404).json({ message: "Opname niet gevonden" });
    res.json(recording);
  });

  app.post("/api/recordings", async (req, res) => {
    const result = insertRecordingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige gegevens" });
    }
    const recording = await storage.createRecording(result.data);
    res.status(201).json(recording);
  });

  app.patch("/api/recordings/:id", async (req, res) => {
    try {
      const recording = await storage.updateRecording(Number(req.params.id), req.body);
      res.json(recording);
    } catch (error) {
      res.status(404).json({ message: "Opname niet gevonden" });
    }
  });

  // New route for handling media file uploads
  app.post("/api/recordings/upload", upload.single('media'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Geen bestand ontvangen" });
      }

      const recording = await storage.createRecording({
        sessionId: Number(req.body.sessionId),
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        mediaType: req.body.mediaType,
        status: req.body.status,
        mediaUrl: `/uploads/${req.file.filename}`
      });

      res.status(201).json(recording);
    } catch (error) {
      console.error('Error handling recording upload:', error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het opslaan van de opname" });
    }
  });


  // Tagged Moments routes
  app.get("/api/recordings/:id/moments", async (req, res) => {
    const moments = await storage.getTaggedMoments(Number(req.params.id));
    res.json(moments);
  });

  app.get("/api/moments/:id", async (req, res) => {
    const moment = await storage.getTaggedMoment(Number(req.params.id));
    if (!moment) return res.status(404).json({ message: "Gemarkeerd moment niet gevonden" });
    res.json(moment);
  });

  app.post("/api/moments", async (req, res) => {
    const result = insertTaggedMomentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige gegevens" });
    }
    const moment = await storage.createTaggedMoment(result.data);
    res.status(201).json(moment);
  });

  app.patch("/api/moments/:id", async (req, res) => {
    try {
      const moment = await storage.updateTaggedMoment(Number(req.params.id), req.body);
      res.json(moment);
    } catch (error) {
      res.status(404).json({ message: "Gemarkeerd moment niet gevonden" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}