import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getSession } from 'next-auth/react';

// Path to config file
const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json');

// Ensure the data directory and config file exist
function ensureConfigFileExists() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      console.log('Creating data directory...');
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create default config file if it doesn't exist
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log('Creating default config file...');
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ openaiApiKey: '' }, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring config file exists:', error);
    return false;
  }
}

// Function to read config
function readConfig() {
  try {
    // Make sure config file exists
    ensureConfigFileExists();
    
    // Read and parse config
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    try {
      return JSON.parse(configData);
    } catch (parseError) {
      console.error('Error parsing config, returning default:', parseError);
      return { openaiApiKey: '' };
    }
  } catch (error) {
    console.error('Error reading config:', error);
    return { openaiApiKey: '' };
  }
}

// Function to write config
function writeConfig(config: any) {
  try {
    // Make sure config file exists
    ensureConfigFileExists();
    
    // Write config to file
    console.log('Writing config to file...');
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('Config written successfully');
    
    // Set environment variable
    if (config.openaiApiKey) {
      // Use a safer way to set environment variable
      const envVarName = 'OPENAI_API_KEY';
      process.env[envVarName] = config.openaiApiKey;
      console.log('OPENAI_API_KEY environment variable updated');
    }
    
    return true;
  } catch (error) {
    console.error('Error writing config:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.method === 'GET') {
    const config = readConfig();
    
    // Check for environment variable first
    const hasEnvironmentKey = !!process.env.OPENAI_API_KEY;
    
    // Mask API key
    const maskedConfig = {
      ...config,
      openaiApiKey: config.openaiApiKey ? '********' : '',
      hasOpenaiApiKey: !!config.openaiApiKey || hasEnvironmentKey,
      hasEnvironmentKey: hasEnvironmentKey
    };
    
    return res.status(200).json(maskedConfig);
  } 
  else if (req.method === 'POST') {
    const { openaiApiKey } = req.body;
    
    if (typeof openaiApiKey !== 'string') {
      return res.status(400).json({ error: 'Invalid configuration' });
    }
    
    const currentConfig = readConfig();
    const newConfig = { ...currentConfig, openaiApiKey };
    
    const success = writeConfig(newConfig);
    
    if (success) {
      console.log('Config saved successfully');
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Failed to save configuration' });
    }
  } 
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}