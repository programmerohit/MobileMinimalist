import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define App model
export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
  selected: boolean("selected").default(false),
});

export const insertAppSchema = createInsertSchema(apps).omit({
  id: true,
});

// Define Settings model
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  restrictedMode: boolean("restricted_mode").default(false),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

// Type exports
export type App = typeof apps.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
