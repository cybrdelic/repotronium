import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import RepoCard from './RepoCard';
import { FaSearch, FaExclamationTriangle, FaSync, FaGithub } from 'react-icons/fa';

type Repository = {
  id: number;
  name: string;
  owner: {
    login: string;
  };
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
};

export default function RepoList() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchRepos() {
      if (status === 'loading') return;

      // If not authenticated, show appropriate message but don't try to fetch
      if (status === 'unauthenticated') {
        setError('You need to be signed in to view repositories');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Direct fetch instead of using apiClient for debugging
        const response = await fetch('/api/repositories');

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Not authenticated. Please sign in again.');
          } else {
            throw new Error(`Request failed with status ${response.status}`);
          }
        }

        const data = await response.json();
        setRepos(data);
        setFilteredRepos(data);
      } catch (err: any) {
        console.error('Error fetching repositories:', err);
        setError(err.message || 'An error occurred while fetching repositories');
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [session, status, retryCount]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRepos(repos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = repos.filter(repo =>
      repo.name.toLowerCase().includes(query) ||
      (repo.description && repo.description.toLowerCase().includes(query)) ||
      (repo.language && repo.language.toLowerCase().includes(query))
    );

    setFilteredRepos(filtered);
  }, [searchQuery, repos]);

  // Add retry button for better user experience
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleSignIn = () => {
    signIn('github', { callbackUrl: '/dashboard' });
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loader"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-6 text-center">
        <FaExclamationTriangle className="text-yellow-500 text-3xl mx-auto mb-4" />
        <p className="text-yellow-300 mb-3">You need to be signed in to view repositories</p>
        <button
          onClick={handleSignIn}
          className="bg-yellow-800 hover:bg-yellow-700 text-white py-2 px-6 rounded-md inline-flex items-center gap-2"
        >
          <FaGithub /> Sign In with GitHub
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 text-center">
        <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-4" />
        <p className="text-red-300 mb-3">{error}</p>
        {error.includes('Not authenticated') ? (
          <button
            onClick={handleSignIn}
            className="bg-red-800 hover:bg-red-700 text-white py-2 px-6 rounded-md inline-flex items-center gap-2"
          >
            <FaGithub /> Sign In Again
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="bg-red-800 hover:bg-red-700 text-white py-2 px-6 rounded-md inline-flex items-center gap-2"
          >
            <FaSync className="mr-2" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full bg-cyber-dark border border-cyber-gray rounded-md py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyber-highlight"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredRepos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">
            {repos.length === 0
              ? 'No repositories found. Connect your GitHub account to see your repositories.'
              : 'No repositories match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map(repo => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
