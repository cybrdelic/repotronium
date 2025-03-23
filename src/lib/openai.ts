import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import getConfig from 'next/config';

// Get server-side runtime config
const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };

// Path to config file
const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json');

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

// Get OpenAI API key from environment variables (including .env.local)
function getOpenAIApiKey(): string | null {
  try {
    // Check if we're in a server environment 
    if (typeof window === 'undefined') {
      // Server-side: Use serverRuntimeConfig (safer than process.env)
      const configKey = serverRuntimeConfig.OPENAI_API_KEY;
      if (configKey) {
        console.log('Using OpenAI API key from server runtime config');
        return configKey;
      }
      
      // Fallback to process.env only on the server side
      const envKey = process.env.OPENAI_API_KEY;
      if (envKey) {
        console.log('Using OpenAI API key from environment variable');
        return envKey;
      }
      
      console.log('No OpenAI API key found in server configuration');
    } else {
      // Client-side: We don't want to expose the API key here
      console.log('Running in browser, API key access restricted for security');
    }
    
    return null;
  } catch (error) {
    console.error('Error getting OpenAI API key:', error);
    return null;
  }
}

// Initialize the OpenAI client if an API key is available
export function getOpenAIClient() {
  // Always check for new API key (in case it was updated)
  const apiKey = getOpenAIApiKey();
  
  if (apiKey) {
    console.log('OpenAI API key found, initializing client');
    // Create a new client on each call to ensure we're using the latest API key
    return new OpenAI({
      apiKey,
    });
  } else {
    console.log('No OpenAI API key found');
    return null;
  }
}

// Function to analyze code using OpenAI
export async function analyzeCodeWithLLM(code: string, language: string, analysisType: 'documentation' | 'quality' | 'security' | 'architecture') {
  const client = getOpenAIClient();
  
  if (!client) {
    return { error: 'OpenAI API key not configured' };
  }
  
  try {
    let prompt = '';
    
    // Define different prompts based on analysis type
    if (analysisType === 'documentation') {
      prompt = `Generate comprehensive documentation for the following ${language} code. 

Include:
1. A high-level description of what the code does
2. Function/class explanations
3. Parameter descriptions
4. Return value descriptions
5. Usage examples

Code to document:
\`\`\`${language}
${code}
\`\`\``;
    } 
    else if (analysisType === 'quality') {
      prompt = `Analyze the following ${language} code for quality issues and suggest improvements.

Include:
1. Code smells
2. Potential bugs
3. Performance issues
4. Maintainability concerns
5. Refactoring suggestions

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;
    }
    else if (analysisType === 'security') {
      prompt = `Perform a security analysis of the following ${language} code. 

Identify:
1. Potential security vulnerabilities
2. Input validation issues
3. Authentication/authorization concerns
4. Data exposure risks
5. Security best practices that should be applied

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;
    }
    else if (analysisType === 'architecture') {
      prompt = `Analyze the architectural patterns in the following ${language} code. 

Identify:
1. Design patterns used
2. Component responsibilities
3. Dependency relationships
4. Architectural strengths
5. Architectural improvement suggestions

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;
    }
    
    // Call OpenAI API with the appropriate prompt
    const completion = await client.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 for more detailed analysis
      messages: [
        { role: 'system', content: 'You are an expert software engineer specializing in code analysis, documentation, and best practices.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
    });
    
    return {
      analysis: completion.choices[0].message.content,
      type: analysisType,
    };
  } catch (error) {
    console.error('Error analyzing code with OpenAI:', error);
    return { error: 'Failed to analyze code with AI' };
  }
}

// Function to analyze repository architecture
export async function analyzeRepositoryArchitecture(repoStructure: any) {
  const client = getOpenAIClient();
  
  if (!client) {
    return { error: 'OpenAI API key not configured' };
  }
  
  try {
    // Only include essential data to reduce token usage
    const simplified = {
      moduleCount: repoStructure.dependencies?.modules?.length || 0,
      dependencyCount: repoStructure.dependencies?.dependencies?.length || 0,
      fileTypes: getFileTypeDistribution(repoStructure.files || []),
      topLevelStructure: getTopLevelStructure(repoStructure.files || [])
    };
    
    // Convert simplified structure to a string representation
    const structureDescription = JSON.stringify(simplified, null, 2);
    
    const prompt = `Analyze the following repository structure and provide architectural insights. 

Based on this structure, please provide:

1. An overview of the application architecture
2. Identification of main components and their likely responsibilities
3. Suggestions for the architectural pattern being used
4. Recommendations for potential architectural improvements
5. A high-level component diagram description

Repository structure:
${structureDescription}`;
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert software architect with deep knowledge of different architectural patterns and best practices.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
    });
    
    return {
      analysis: completion.choices[0].message.content,
      type: 'architecture',
    };
  } catch (error) {
    console.error('Error analyzing repository architecture with OpenAI:', error);
    return { error: 'Failed to analyze repository architecture' };
  }
}

// Helper to get file type distribution
function getFileTypeDistribution(files: any[]) {
  const distribution: Record<string, number> = {};
  
  files.forEach(file => {
    const type = file.type || file.path?.split('.').pop() || 'unknown';
    distribution[type] = (distribution[type] || 0) + 1;
  });
  
  return distribution;
}

// Helper to get top-level directory structure
function getTopLevelStructure(files: any[]) {
  const structure: Record<string, number> = {};
  
  files.forEach(file => {
    const path = file.path || '';
    const topDir = path.split('/')[0];
    if (topDir) {
      structure[topDir] = (structure[topDir] || 0) + 1;
    }
  });
  
  return structure;
}

// Function to generate strategic recommendations
export async function generateStrategicRecommendations(repoAnalysis: any) {
  const client = getOpenAIClient();
  
  if (!client) {
    return { error: 'OpenAI API key not configured' };
  }
  
  try {
    // Create a simplified version with only essential data
    const simplified = {
      architecture: repoAnalysis.architecture?.analysis?.substring(0, 1000) || '',
      fileCount: repoAnalysis.files?.length || 0,
      complexityStats: getComplexityStats(repoAnalysis.files || []),
      fileTypes: getFileTypeDistribution(repoAnalysis.files || [])
    };
    
    // Convert simplified analysis to a string representation
    const analysisDescription = JSON.stringify(simplified, null, 2);
    
    const prompt = `Based on the following repository analysis, generate strategic recommendations for improving the codebase.

Please provide:

1. Prioritized technical debt issues
2. Architecture improvement recommendations
3. Potential security concerns
4. Performance optimization suggestions
5. Maintainability enhancements
6. Knowledge sharing recommendations
7. Suggested roadmap for implementing these improvements

Repository analysis:
${analysisDescription}`;
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert technical leader with experience in strategic planning, architecture, and technical debt management.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
    });
    
    return {
      recommendations: completion.choices[0].message.content,
      type: 'strategic',
    };
  } catch (error) {
    console.error('Error generating strategic recommendations with OpenAI:', error);
    return { error: 'Failed to generate strategic recommendations' };
  }
}

// Helper to calculate complexity statistics
function getComplexityStats(files: any[]) {
  const stats = {
    averageLines: 0,
    averageComplexity: 0,
    maxComplexity: 0,
    mostComplexFile: ''
  };
  
  if (files.length === 0) return stats;
  
  let totalLines = 0;
  let totalComplexity = 0;
  
  files.forEach(file => {
    const metrics = file.complexity?.metrics || {};
    const lines = metrics.lines || 0;
    const complexity = metrics.complexity || 0;
    
    totalLines += lines;
    totalComplexity += complexity;
    
    if (complexity > stats.maxComplexity) {
      stats.maxComplexity = complexity;
      stats.mostComplexFile = file.path || '';
    }
  });
  
  stats.averageLines = Math.round(totalLines / files.length);
  stats.averageComplexity = Math.round(totalComplexity / files.length);
  
  return stats;
}

// Function to generate different types of documentation
export async function generateDocumentation(repoAnalysis: any, docType: 'technical' | 'user' | 'api' | 'marketing' | 'business') {
  const client = getOpenAIClient();
  
  if (!client) {
    return { error: 'OpenAI API key not configured' };
  }
  
  try {
    // Convert repository analysis to a string representation
    const analysisDescription = JSON.stringify(repoAnalysis, null, 2);
    
    let prompt = '';
    
    if (docType === 'technical') {
      prompt = `Generate comprehensive technical documentation based on the following repository analysis.

Include:
1. Architecture overview
2. Component descriptions and relationships
3. Data models
4. Technical workflows
5. Setup and configuration instructions

Repository analysis:
${analysisDescription}`;
    }
    else if (docType === 'user') {
      prompt = `Generate user documentation based on the following repository analysis.

Include:
1. Feature descriptions
2. Usage instructions
3. Configuration options
4. Troubleshooting guide
5. FAQs

Repository analysis:
${analysisDescription}`;
    }
    else if (docType === 'api') {
      prompt = `Generate API documentation based on the following repository analysis.

Include:
1. Endpoint descriptions
2. Request/response formats
3. Authentication requirements
4. Error codes and handling
5. Example requests

Repository analysis:
${analysisDescription}`;
    }
    else if (docType === 'marketing') {
      prompt = `Generate marketing materials based on the following repository analysis.

Include:
1. Key feature highlights
2. Benefits for users
3. Technical advantages
4. Comparison with alternatives
5. Potential use cases

Repository analysis:
${analysisDescription}`;
    }
    else if (docType === 'business') {
      prompt = `Generate comprehensive business-level insights for this project based on the repository analysis.

The response should be formatted as a Markdown document with the following sections:

## Executive Summary
[A brief overview of what the project is and its primary business value]

## Core Value Proposition
[What problem does this software solve? How does it help its users?]

## Key Features & Implementation Status
[List major features with completion status percentages and brief descriptions]

## User Flows
[Description of main user journeys through the application]

## Business Benefits & Use Cases
[Specific benefits for different stakeholders and potential application scenarios]

## Implementation Roadmap
[Current status and future development plans]

## Competitive Advantages
[What makes this project unique compared to alternatives]

## Next Steps for Maximum Impact
[Actionable recommendations to improve business value]

For each section, focus on business terminology rather than technical details. Emphasize user-facing features, potential value to stakeholders, and the project's completeness. Make realistic estimations about feature completeness based on code analysis.

Repository analysis:
${analysisDescription}`;
    }
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `You are an expert in creating ${docType} documentation for software products.` },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2500,
    });
    
    const generatedContent = completion.choices[0].message.content;
    console.log(`Generated ${docType} content (first 100 chars): ${generatedContent.substring(0, 100)}...`);
    
    return {
      documentation: generatedContent,
      analysis: generatedContent, // Include both fields for flexibility
      type: docType,
    };
  } catch (error) {
    console.error(`Error generating ${docType} documentation with OpenAI:`, error);
    return { error: `Failed to generate ${docType} documentation` };
  }
}
