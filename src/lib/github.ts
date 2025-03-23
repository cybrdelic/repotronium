import { Octokit } from 'octokit';

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function fetchUserRepositories(accessToken: string) {
  const octokit = createOctokit(accessToken);
  
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100,
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
}

export async function fetchRepository(accessToken: string, owner: string, repo: string) {
  const octokit = createOctokit(accessToken);
  
  try {
    const repoInfo = await octokit.rest.repos.get({ owner, repo });
    return repoInfo.data;
  } catch (error) {
    console.error(`Error fetching repository ${owner}/${repo}:`, error);
    throw error;
  }
}

export async function fetchRepositoryContents(accessToken: string, owner: string, repo: string, path = '') {
  const octokit = createOctokit(accessToken);
  
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching repository contents ${owner}/${repo}/${path}:`, error);
    throw error;
  }
}

export async function fetchFileContent(accessToken: string, owner: string, repo: string, path: string) {
  const octokit = createOctokit(accessToken);
  
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    
    if (Array.isArray(data)) {
      throw new Error('Path points to a directory, not a file');
    }
    
    // GitHub API returns content as base64 encoded
    // Check if data has content property (file type response)
    if ('content' in data) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { content, sha: data.sha, name: data.name };
    } else {
      throw new Error('Response does not contain file content');
    }
  } catch (error) {
    console.error(`Error fetching file content ${owner}/${repo}/${path}:`, error);
    throw error;
  }
}

export async function recursivelyFetchDirectory(accessToken: string, owner: string, repo: string, path = ''): Promise<any[]> {
  const octokit = createOctokit(accessToken);
  
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    
    if (!Array.isArray(data)) {
      // This is a file, not a directory
      if ('content' in data) {
        return [{
          type: 'file',
          path,
          name: data.name,
          sha: data.sha,
          size: data.size,
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
        }];
      } else {
        // Not a text file or doesn't have content
        return [{
          type: 'file',
          path,
          name: data.name,
          sha: data.sha,
          size: data.size,
          content: '',
        }];
      }
    }
    
    // Process directories recursively
    const contents = [];
    
    for (const item of data) {
      if (item.type === 'file') {
        const fileData = await fetchFileContent(accessToken, owner, repo, item.path);
        contents.push({
          type: 'file',
          path: item.path,
          name: item.name,
          sha: item.sha,
          size: item.size,
          content: fileData.content,
        });
      } else if (item.type === 'dir') {
        const dirContents = await recursivelyFetchDirectory(accessToken, owner, repo, item.path);
        contents.push({
          type: 'dir',
          path: item.path,
          name: item.name,
          contents: dirContents,
        });
      }
    }
    
    return contents;
  } catch (error) {
    console.error(`Error recursively fetching directory ${owner}/${repo}/${path}:`, error);
    throw error;
  }
}

export async function analyzeRepository(accessToken: string, owner: string, repo: string) {
  // Start with basic repository information
  const repoInfo = await fetchRepository(accessToken, owner, repo);
  
  // Get top-level contents to understand the repository structure
  const contents = await fetchRepositoryContents(accessToken, owner, repo);
  
  // For an MVP, we'll limit the recursive fetching to a sample of the repository
  // In a real implementation, you would use a more sophisticated approach
  // to handle large repositories efficiently
  let sampleContents = [];
  if (Array.isArray(contents)) {
    const directories = contents.filter(item => item.type === 'dir').slice(0, 2);
    
    for (const dir of directories) {
      try {
        const dirContents = await recursivelyFetchDirectory(accessToken, owner, repo, dir.path);
        sampleContents.push({
          type: 'dir',
          path: dir.path,
          name: dir.name,
          contents: dirContents,
        });
      } catch (error) {
        console.error(`Error analyzing directory ${dir.path}:`, error);
        // Continue with other directories
      }
    }
  }
  
  // Analyze the code structure and generate documentation
  const analysis = {
    repoInfo,
    structure: sampleContents,
    summary: {
      name: repoInfo.name,
      description: repoInfo.description,
      language: repoInfo.language,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      lastUpdated: repoInfo.updated_at,
    },
    documentation: {
      overview: generateOverview(repoInfo, sampleContents),
      structure: generateStructureDocumentation(sampleContents),
    }
  };
  
  return analysis;
}

// Helper function to generate an overview of the repository
function generateOverview(repoInfo: any, structure: any[]) {
  return `
# ${repoInfo.name}

${repoInfo.description || 'No description provided.'}

## Overview

This repository is primarily written in ${repoInfo.language || 'multiple languages'} and was last updated on ${new Date(repoInfo.updated_at).toLocaleDateString()}.

- Stars: ${repoInfo.stargazers_count}
- Forks: ${repoInfo.forks_count}
- Open Issues: ${repoInfo.open_issues_count}

## Repository Structure

This documentation provides an overview of the key components and how they relate to each other.
${generateStructureSummary(structure)}
`;
}

// Helper function to generate a summary of the repository structure
function generateStructureSummary(structure: any[]) {
  if (!structure || structure.length === 0) {
    return '\nNo structure information available.';
  }
  
  let summary = '\n';
  
  for (const item of structure) {
    if (item.type === 'dir') {
      summary += `\n### ${item.name}/\n\n`;
      summary += summarizeDirectory(item.contents, 0);
    }
  }
  
  return summary;
}

// Helper function to recursively summarize a directory
function summarizeDirectory(contents: any[], level: number) {
  if (!contents || contents.length === 0) {
    return 'Empty directory.';
  }
  
  let summary = '';
  
  // Group by type
  const dirs = contents.filter(item => item.type === 'dir');
  const files = contents.filter(item => item.type === 'file');
  
  // Summarize directories first
  for (const dir of dirs) {
    summary += `${'  '.repeat(level)}- **${dir.name}/**\n`;
    if (dir.contents) {
      summary += summarizeDirectory(dir.contents, level + 1);
    }
  }
  
  // Then list files
  for (const file of files) {
    summary += `${'  '.repeat(level)}- ${file.name}\n`;
  }
  
  return summary;
}

// Helper function to generate structure documentation
function generateStructureDocumentation(structure: any[]) {
  if (!structure || structure.length === 0) {
    return 'No structure information available.';
  }
  
  let documentation = '# Code Structure\n\n';
  
  for (const item of structure) {
    if (item.type === 'dir') {
      documentation += `## ${item.name}/\n\n`;
      documentation += documentDirectory(item.contents, item.name);
    }
  }
  
  return documentation;
}

// Helper function to document a directory
function documentDirectory(contents: any[], dirPath: string) {
  if (!contents || contents.length === 0) {
    return 'Empty directory.\n\n';
  }
  
  let documentation = '';
  
  // Group by type
  const dirs = contents.filter(item => item.type === 'dir');
  const files = contents.filter(item => item.type === 'file');
  
  // Document directories first
  for (const dir of dirs) {
    documentation += `### ${dirPath}/${dir.name}/\n\n`;
    if (dir.contents) {
      documentation += documentDirectory(dir.contents, `${dirPath}/${dir.name}`);
    }
  }
  
  // Then document files
  for (const file of files) {
    documentation += `### ${file.name}\n\n`;
    
    // Attempt to determine file purpose based on name and extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['md', 'markdown', 'txt'].includes(ext)) {
      documentation += `Documentation file.\n\n`;
      // Include content for documentation files
      documentation += `\`\`\`\n${file.content.substring(0, 300)}${file.content.length > 300 ? '...' : ''}\n\`\`\`\n\n`;
    } else if (['js', 'ts', 'jsx', 'tsx'].includes(ext)) {
      documentation += `JavaScript/TypeScript file.\n\n`;
      // Try to extract function and class names
      const functionMatches = file.content.match(/function\s+(\w+)\s*\(/g) || [];
      const classMatches = file.content.match(/class\s+(\w+)/g) || [];
      const exportMatches = file.content.match(/export\s+(default\s+)?(const|let|var|function|class)\s+(\w+)/g) || [];
      
      if (functionMatches.length > 0 || classMatches.length > 0 || exportMatches.length > 0) {
        documentation += 'Contains:\n';
        
        for (const match of functionMatches) {
          const name = match.replace('function', '').replace('(', '').trim();
          documentation += `- Function \`${name}\`\n`;
        }
        
        for (const match of classMatches) {
          const name = match.replace('class', '').trim();
          documentation += `- Class \`${name}\`\n`;
        }
        
        for (const match of exportMatches) {
          const name = match.replace(/export\s+(default\s+)?(const|let|var|function|class)\s+/, '').trim();
          documentation += `- Export \`${name}\`\n`;
        }
        
        documentation += '\n';
      }
    } else if (['json', 'yaml', 'yml'].includes(ext)) {
      documentation += `Configuration file.\n\n`;
    } else if (['css', 'scss', 'less'].includes(ext)) {
      documentation += `Stylesheet file.\n\n`;
    } else if (['html', 'htm'].includes(ext)) {
      documentation += `HTML file.\n\n`;
    } else if (['py'].includes(ext)) {
      documentation += `Python file.\n\n`;
      // Try to extract function and class names
      const functionMatches = file.content.match(/def\s+(\w+)\s*\(/g) || [];
      const classMatches = file.content.match(/class\s+(\w+)\s*[:\(]/g) || [];
      
      if (functionMatches.length > 0 || classMatches.length > 0) {
        documentation += 'Contains:\n';
        
        for (const match of functionMatches) {
          const name = match.replace('def', '').replace('(', '').trim();
          documentation += `- Function \`${name}\`\n`;
        }
        
        for (const match of classMatches) {
          const name = match.replace('class', '').replace(':', '').replace('(', '').trim();
          documentation += `- Class \`${name}\`\n`;
        }
        
        documentation += '\n';
      }
    } else {
      documentation += `File type: ${ext || 'unknown'}\n\n`;
    }
  }
  
  return documentation;
}
