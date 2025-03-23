import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { analyzeRepository } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { owner, repo } = req.query;
  
  if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo)) {
    return res.status(400).json({ error: 'Invalid owner or repo parameter' });
  }
  
  try {
    const analysis = await analyzeRepository(session.accessToken, owner, repo);
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error('Error analyzing repository:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze repository' });
  }
}
