import fs from 'fs';
import path from 'path';
import { Adapter } from 'next-auth/adapters';

// Path to our JSON file
const DATA_FILE = path.join(process.cwd(), 'data/users.json');

// Make sure the data directory exists
try {
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
  }
  
  // Initialize the file if it doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      users: [],
      accounts: [],
      sessions: [],
    }));
  }
} catch (error) {
  console.error('Error initializing data file:', error);
}

// Read data from JSON file
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { users: [], accounts: [], sessions: [] };
  }
};

// Write data to JSON file
const writeData = (data: any) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data file:', error);
  }
};

// Simple JSON file adapter for NextAuth.js
export const JSONFileAdapter: Adapter = {
  async createUser(user: any) {
    const data = readData();
    const newUser = {
      id: Date.now().toString(),
      ...user,
      emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
    };
    
    data.users.push(newUser);
    writeData(data);
    
    return newUser;
  },
  
  async getUser(id: string) {
    const data = readData();
    const user = data.users.find((user: any) => user.id === id);
    return user || null;
  },
  
  async getUserByEmail(email: string) {
    const data = readData();
    const user = data.users.find((user: any) => user.email === email);
    return user || null;
  },
  
  async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string, provider: string }) {
    const data = readData();
    const account = data.accounts.find((account: any) => 
      account.providerAccountId === providerAccountId && 
      account.provider === provider
    );
    
    if (!account) return null;
    
    const user = data.users.find((user: any) => user.id === account.userId);
    return user || null;
  },
  
  async updateUser(user: any) {
    const data = readData();
    const index = data.users.findIndex((u: any) => u.id === user.id);
    
    if (index !== -1) {
      data.users[index] = {
        ...data.users[index],
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : data.users[index].emailVerified,
      };
      
      writeData(data);
      return data.users[index];
    }
    
    return null;
  },
  
  async linkAccount(account: any) {
    const data = readData();
    const newAccount = {
      ...account,
      id: Date.now().toString(),
    };
    
    data.accounts.push(newAccount);
    writeData(data);
    
    return newAccount;
  },
  
  async createSession(session: any) {
    const data = readData();
    
    // Clean up expired sessions first
    const now = new Date();
    data.sessions = data.sessions.filter((s: any) => {
      try {
        return new Date(s.expires) > now;
      } catch (e) {
        return false; // Remove sessions with invalid dates
      }
    });
    
    // Create new session with a generous expiry time (30 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    
    const newSession = {
      ...session,
      id: Date.now().toString(),
      expires: expires.toISOString(),
    };
    
    data.sessions.push(newSession);
    writeData(data);
    
    return newSession;
  },
  
  async getSessionAndUser(sessionToken: string) {
    const data = readData();
    const session = data.sessions.find((s: any) => s.sessionToken === sessionToken);
    
    if (!session) return null;
    
    const user = data.users.find((u: any) => u.id === session.userId);
    
    if (!user) return null;
    
    return {
      session,
      user,
    };
  },
  
  async updateSession(session: any) {
    const data = readData();
    const index = data.sessions.findIndex((s: any) => s.sessionToken === session.sessionToken);
    
    if (index !== -1) {
      data.sessions[index] = {
        ...data.sessions[index],
        ...session,
        expires: session.expires ? new Date(session.expires).toISOString() : data.sessions[index].expires,
      };
      
      writeData(data);
      return data.sessions[index];
    }
    
    return null;
  },
  
  async deleteSession(sessionToken: string) {
    const data = readData();
    const index = data.sessions.findIndex((s: any) => s.sessionToken === sessionToken);
    
    if (index !== -1) {
      data.sessions.splice(index, 1);
      writeData(data);
    }
  },
};