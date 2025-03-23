import { useState, useEffect } from 'react';
import { FaGithub, FaStar, FaCodeBranch, FaExclamationCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

type RepositoryAnalysisProps = {
  owner: string;
  repo: string;
};

export default function RepositoryAnalysis({ owner, repo }: RepositoryAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    async function fetchAnalysis() {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`/api/analyze-repository?owner=${owner}&repo=${repo}`);
        
        if (!response.ok) {
          throw new Error('Failed to analyze repository');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred during repository analysis');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalysis();
  }, [owner, repo]);
  
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="loader mb-4"></div>
        <p className="text-gray-400">Analyzing repository structure...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 text-center">
        <FaExclamationCircle className="text-red-500 text-2xl mx-auto mb-3" />
        <p className="text-red-200 mb-2">Error analyzing repository</p>
        <p className="text-red-300/80 text-sm">{error}</p>
      </div>
    );
  }
  
  if (!analysis) {
    return null;
  }
  
  const { repoInfo, summary, documentation } = analysis;
  
  return (
    <div className="bg-cyber-dark rounded-lg border border-cyber-gray overflow-hidden">
      {/* Repository Header */}
      <div className="p-6 border-b border-cyber-gray">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {repoInfo.name}
            </h1>
            <p className="text-gray-400 mb-4">
              {repoInfo.description || 'No description provided'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-400">
                <FaStar className="text-yellow-500" />
                <span>{repoInfo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <FaCodeBranch />
                <span>{repoInfo.forks_count}</span>
              </div>
              {repoInfo.language && (
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="w-3 h-3 rounded-full bg-cyber-purple"></span>
                  <span>{repoInfo.language}</span>
                </div>
              )}
            </div>
          </div>
          <a 
            href={repoInfo.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-cyber-gray hover:bg-gray-700 transition duration-150 text-white py-2 px-4 rounded-md text-sm"
          >
            <FaGithub />
            View on GitHub
          </a>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-cyber-gray">
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'structure' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('structure')}
        >
          Structure
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="prose max-w-none">
            <ReactMarkdown>{documentation.overview}</ReactMarkdown>
          </div>
        )}
        
        {activeTab === 'structure' && (
          <div className="prose max-w-none">
            <ReactMarkdown>{documentation.structure}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
