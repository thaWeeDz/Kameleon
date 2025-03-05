import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  notes: text("notes"),
});

export const workshops = pgTable("workshops", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  learningGoals: text("learning_goals").array(),
  materials: text("materials").array(),
  status: text("status").notNull().default("active"),
  imageUrl: text("image_url"),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  attendees: integer("attendees").array(),
  images: text("images").array(),
  audioUrl: text("audio_url"),
});

export const observations = pgTable("observations", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  learningGoals: text("learning_goals").array(),
  images: text("images").array(),
});

export const insertChildSchema = createInsertSchema(children);
export const insertWorkshopSchema = createInsertSchema(workshops);
export const insertSessionSchema = createInsertSchema(sessions);
export const insertObservationSchema = createInsertSchema(observations);

export type Child = typeof children.$inferSelect;
export type Workshop = typeof workshops.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Observation = typeof observations.$inferSelect;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertObservation = z.infer<typeof insertObservationSchema>;
