import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { analyzeRepository } from '@/lib/github';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use getServerSession instead of getSession for better reliability
  const session = await getServerSession(req, res, authOptions);

  console.log('API /analyze-repository session:', session ? 'Valid session' : 'No session');

  if (!session) {
    console.log('No authenticated session found');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Additional check for accessToken
  if (!session.accessToken) {
    console.log('Session found but missing accessToken');
    return res.status(401).json({ error: 'Invalid session: missing access token' });
  }

  const { owner, repo } = req.query;

  if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo)) {
    return res.status(400).json({ error: 'Invalid owner or repo parameter' });
  }

  try {
    console.log(`Analyzing repository ${owner}/${repo} with token starting with: ${session.accessToken.substring(0, 5)}...`);
    const analysis = await analyzeRepository(session.accessToken, owner, repo);
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error('Error analyzing repository:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze repository' });
  }
}
