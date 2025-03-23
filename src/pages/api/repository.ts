import type { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from 'octokit';

// GitHub API token should be set as an environment variable
const octokit = new Octokit({
  auth: process.env.GITHUB_API_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { owner, repo } = req.query;
  
  if (!owner || !repo) {
    return res.status(400).json({ error: 'Owner and repo parameters are required' });
  }
  
  try {
    // Fetch basic repository information
    const repoInfo = await octokit.rest.repos.get({
      owner: owner as string,
      repo: repo as string,
    });
    
    // Fetch repository contents (files and directories)
    const contents = await octokit.rest.repos.getContent({
      owner: owner as string,
      repo: repo as string,
      path: '',
    });
    
    // Fetch contributors
    const contributors = await octokit.rest.repos.listContributors({
      owner: owner as string,
      repo: repo as string,
    });
    
    // Fetch commit activity
    const commitActivity = await octokit.rest.repos.getCommitActivityStats({
      owner: owner as string,
      repo: repo as string,
    });
    
    // Fetch programming languages used
    const languages = await octokit.rest.repos.listLanguages({
      owner: owner as string,
      repo: repo as string,
    });
    
    // Process and structure the data for visualization
    const structuredData = {
      basicInfo: repoInfo.data,
      structure: Array.isArray(contents.data) ? contents.data : [contents.data],
      contributors: contributors.data,
      commitActivity: commitActivity.data,
      languages: languages.data,
    };
    
    return res.status(200).json(structuredData);
  } catch (error) {
    console.error('Error fetching repository data:', error);
    return res.status(500).json({ error: 'Failed to fetch repository data' });
  }
}