import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { fetchUserRepositories } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const repositories = await fetchUserRepositories(session.accessToken);
    return res.status(200).json(repositories);
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch repositories' });
  }
}
