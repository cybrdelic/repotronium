import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { generateDocumentation, getOpenAIClient } from '@/lib/openai';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Block any method other than POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use getServerSession instead of getSession for better reliability
  const session = await getServerSession(req, res, authOptions);

  console.log('API /business-insights session:', session ? 'Valid session' : 'No session');

  if (!session) {
    console.log('No authenticated session found');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Additional check for accessToken
  if (!session.accessToken) {
    console.log('Session found but missing accessToken');
    return res.status(401).json({ error: 'Invalid session: missing access token' });
  }

  const { analysisData } = req.body;

  if (!analysisData) {
    return res.status(400).json({ error: 'No analysis data provided' });
  }

  // Create a sanitized version of analysis data for logging if needed
  const analyzingRepoInfo = `${analysisData.owner}/${analysisData.repo}`;

  // Validate the files property specifically to avoid common infinite loop issues
  if (!analysisData.files || !Array.isArray(analysisData.files) || analysisData.files.length === 0) {
    console.warn(`Repository analysis for ${analyzingRepoInfo} contains no valid files data`);
    return res.status(400).json({
      error: 'Repository analysis data is incomplete. The repository may not have enough data for analysis.'
    });
  }

  // Log file count to help with debugging
  console.log(`Generating business insights for ${analyzingRepoInfo} with ${analysisData.files.length} files`);

  try {
    // Check if OpenAI is configured
    const openaiClient = getOpenAIClient();

    if (!openaiClient) {
      console.error('OpenAI API key not found - business insights unavailable');
      return res.status(400).json({
        error: 'OpenAI API key not found. Please add OPENAI_API_KEY to your .env.local file.'
      });
    }

    // Generate business insights documentation
    console.log(`Starting OpenAI generation for ${analyzingRepoInfo}...`);
    const businessInsights = await generateDocumentation(analysisData, 'business');

    if ('error' in businessInsights) {
      console.error('Error from OpenAI generation:', businessInsights.error);
      return res.status(500).json({ error: businessInsights.error });
    }

    // Validate the response content
    if (!businessInsights.documentation || businessInsights.documentation.length < 50) {
      console.error('OpenAI returned empty or very short response');
      return res.status(500).json({
        error: 'Failed to generate meaningful business insights. Please try again later.'
      });
    }

    console.log(`Business insights successfully generated for ${analyzingRepoInfo}`);

    // Make sure we return the insights in the expected format
    return res.status(200).json({
      businessInsights: {
        documentation: businessInsights.documentation,
        analysis: businessInsights.documentation, // Also send as analysis for backward compatibility
        type: 'business'
      }
    });
  } catch (error: any) {
    console.error(`Error generating business insights for ${analyzingRepoInfo}:`, error);

    // Provide more specific error messages based on the error type
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        error: 'OpenAI API key is invalid or has expired. Please check your API key configuration.'
      });
    } else if (error.message && error.message.includes('timeout')) {
      return res.status(500).json({
        error: 'The request to generate business insights timed out. Please try again with a smaller repository.'
      });
    } else if (error.message && error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'OpenAI rate limit reached. Please try again later.'
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to generate business insights'
    });
  }
}
