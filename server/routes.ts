import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with default data
  await storage.initializeDefaultData();
  // API routes
  
  // Get all apps
  app.get('/api/apps', async (req, res) => {
    try {
      const apps = await storage.getApps();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch apps' });
    }
  });
  
  // Get selected apps
  app.get('/api/apps/selected', async (req, res) => {
    try {
      const selectedApps = await storage.getSelectedApps();
      res.json(selectedApps);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch selected apps' });
    }
  });
  
  // Update app selection
  app.patch('/api/apps/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { selected } = req.body;
      
      if (typeof selected !== 'boolean') {
        return res.status(400).json({ message: 'Selected property must be a boolean' });
      }
      
      const updatedApp = await storage.updateAppSelection(id, selected);
      res.json(updatedApp);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An error occurred while updating app selection' });
      }
    }
  });
  
  // Get settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });
  
  // Update settings
  app.patch('/api/settings', async (req, res) => {
    try {
      const { restrictedMode } = req.body;
      
      if (typeof restrictedMode !== 'boolean') {
        return res.status(400).json({ message: 'Restricted mode must be a boolean' });
      }
      
      const updatedSettings = await storage.updateSettings({ restrictedMode });
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
