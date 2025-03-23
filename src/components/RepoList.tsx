import { useState, useEffect } from 'react';
import RepoCard from './RepoCard';
import { FaSearch } from 'react-icons/fa';

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
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch('/api/repositories');

        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }

        const data = await response.json();
        setRepos(data);
        setFilteredRepos(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching repositories');
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-200">{error}</p>
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
