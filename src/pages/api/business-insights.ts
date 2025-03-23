import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { generateDocumentation, getOpenAIClient } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { analysisData } = req.body;
  
  if (!analysisData) {
    return res.status(400).json({ error: 'No analysis data provided' });
  }

  // Create a sanitized version of analysis data for logging if needed
  const analyzingRepoInfo = `${analysisData.owner}/${analysisData.repo}`;
  console.log(`Generating business insights for ${analyzingRepoInfo}`);
  
  try {
    // Check if OpenAI is configured
    const openaiClient = getOpenAIClient();
    
    if (!openaiClient) {
      console.error('OpenAI API key not found - business insights unavailable');
      return res.status(400).json({ 
        error: 'OpenAI API key not found. Please add OPENAI_API_KEY to your .env.local file.' 
      });
    }
    
    // Make sure we have enough data for meaningful insights
    if (!analysisData.files || analysisData.files.length === 0) {
      console.warn('Repository analysis contains no files data');
      return res.status(400).json({ 
        error: 'Repository analysis data is incomplete. Please reanalyze the repository.' 
      });
    }
    
    // Generate business insights documentation
    console.log('Calling OpenAI to generate business insights...');
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
    
    console.log('Business insights generated successfully');
    
    // Make sure we return the insights in the expected format
    return res.status(200).json({ 
      businessInsights: {
        documentation: businessInsights.documentation,
        analysis: businessInsights.documentation, // Also send as analysis for backward compatibility
        type: 'business'
      } 
    });
  } catch (error: any) {
    console.error('Error generating business insights:', error);
    
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