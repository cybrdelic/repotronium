import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { fetchUserRepositories } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use getServerSession instead of getSession for better reliability
    const session = await getServerSession(req, res, authOptions);

    console.log('API /repositories session:', session ? 'Valid session' : 'No session');

    if (!session) {
      console.log('No authenticated session found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Additional check for accessToken
    if (!session.accessToken) {
      console.log('Session found but missing accessToken');
      return res.status(401).json({ error: 'Invalid session: missing access token' });
    }

    console.log('Fetching repositories with token starting with:',
      session.accessToken.substring(0, 5) + '...');

    const repositories = await fetchUserRepositories(session.accessToken);
    console.log(`Successfully fetched ${repositories.length} repositories`);

    return res.status(200).json(repositories);
  } catch (error: any) {
    console.error('Error fetching repositories:', error);

    // More specific error handling
    if (error.message?.includes('Bad credentials') || error.status === 401) {
      return res.status(401).json({
        error: 'GitHub authentication failed. Please sign in again.'
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to fetch repositories',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
