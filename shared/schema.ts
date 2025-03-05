import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing tables remain unchanged
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

// New tables for recordings feature
export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  mediaType: text("media_type").notNull(), // 'audio' or 'video'
  mediaUrl: text("media_url"),
  transcription: text("transcription"),
  status: text("status").notNull().default("recording"), // recording, processing, ready
});

export const taggedMoments = pgTable("tagged_moments", {
  id: serial("id").primaryKey(),
  recordingId: integer("recording_id").notNull(),
  timestamp: text("timestamp").notNull(),
  startOffset: integer("start_offset"), // in seconds, for post-processing
  endOffset: integer("end_offset"), // in seconds, for post-processing
  note: text("note"),
  transcription: text("transcription"),
  children: integer("children_ids").array(), // Associated children
});

// Existing observations table updated to link with tagged moments
export const observations = pgTable("observations", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  learningGoals: text("learning_goals").array(),
  images: text("images").array(),
  taggedMomentId: integer("tagged_moment_id"), // Optional link to a tagged moment
});

// Create insert schemas
export const insertChildSchema = createInsertSchema(children);
export const insertWorkshopSchema = createInsertSchema(workshops);
export const insertSessionSchema = createInsertSchema(sessions);
export const insertObservationSchema = createInsertSchema(observations);
export const insertRecordingSchema = createInsertSchema(recordings);
export const insertTaggedMomentSchema = createInsertSchema(taggedMoments);

// Export types
export type Child = typeof children.$inferSelect;
export type Workshop = typeof workshops.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Observation = typeof observations.$inferSelect;
export type Recording = typeof recordings.$inferSelect;
export type TaggedMoment = typeof taggedMoments.$inferSelect;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertObservation = z.infer<typeof insertObservationSchema>;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type InsertTaggedMoment = z.infer<typeof insertTaggedMomentSchema>;