import { useState } from 'react';
import Link from 'next/link';
import { FaStar, FaCodeBranch } from 'react-icons/fa';

type RepoCardProps = {
  repo: {
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
};

export default function RepoCard({ repo }: RepoCardProps) {
  return (
    <div className="repo-card bg-cyber-dark rounded-lg p-6 flex flex-col h-full">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-2 text-white">
          {repo.owner.login}/{repo.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {repo.description || 'No description provided'}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-500" />
            <span>{repo.stargazers_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCodeBranch className="text-gray-400" />
            <span>{repo.forks_count}</span>
          </div>
          {repo.language && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-cyber-purple"></span>
              <span>{repo.language}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto flex justify-between items-center">
        <Link 
          href={`/analyze/${repo.owner.login}/${repo.name}`}
          className="text-cyber-highlight hover:text-cyber-purple transition duration-150 font-medium"
        >
          Analyze Repo
        </Link>
        <span className="text-xs text-gray-500">
          Updated {new Date(repo.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
