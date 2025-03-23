import { useState, FormEvent } from 'react';

interface SearchFormProps {
  onSubmit: (owner: string, repo: string) => void;
}

export default function SearchForm({ onSubmit }: SearchFormProps) {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [inputMode, setInputMode] = useState<'manual' | 'url'>('manual');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (inputMode === 'manual' && owner && repo) {
      onSubmit(owner, repo);
    } else if (inputMode === 'url' && urlInput) {
      // Parse GitHub URL to extract owner and repo
      try {
        const url = new URL(urlInput);
        if (url.hostname === 'github.com') {
          const pathParts = url.pathname.split('/').filter(Boolean);
          if (pathParts.length >= 2) {
            const [urlOwner, urlRepo] = pathParts;
            onSubmit(urlOwner, urlRepo);
          }
        } else {
          throw new Error('Not a valid GitHub URL');
        }
      } catch (error) {
        alert('Please enter a valid GitHub repository URL');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-cyber-gray p-6 rounded-lg border border-cyber-purple/30">
      <div className="flex mb-6 border-b border-gray-700">
        <button 
          className={`pb-2 px-4 ${inputMode === 'manual' ? 'text-cyber-teal border-b-2 border-cyber-teal' : 'text-gray-400'}`}
          onClick={() => setInputMode('manual')}
        >
          Manual Input
        </button>
        <button 
          className={`pb-2 px-4 ${inputMode === 'url' ? 'text-cyber-teal border-b-2 border-cyber-teal' : 'text-gray-400'}`}
          onClick={() => setInputMode('url')}
        >
          GitHub URL
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {inputMode === 'manual' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="owner" className="block mb-2 text-sm font-medium text-gray-300">
                Repository Owner
              </label>
              <input
                type="text"
                id="owner"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full p-3 bg-cyber-black border border-gray-700 rounded-md text-white focus:ring-cyber-purple focus:border-cyber-purple"
                placeholder="e.g., facebook"
                required
              />
            </div>
            
            <div>
              <label htmlFor="repo" className="block mb-2 text-sm font-medium text-gray-300">
                Repository Name
              </label>
              <input
                type="text"
                id="repo"
                value={repo}
                onChange={e => setRepo(e.target.value)}
                className="w-full p-3 bg-cyber-black border border-gray-700 rounded-md text-white focus:ring-cyber-purple focus:border-cyber-purple"
                placeholder="e.g., react"
                required
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="github-url" className="block mb-2 text-sm font-medium text-gray-300">
              GitHub Repository URL
            </label>
            <input
              type="url"
              id="github-url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="w-full p-3 bg-cyber-black border border-gray-700 rounded-md text-white focus:ring-cyber-purple focus:border-cyber-purple"
              placeholder="https://github.com/owner/repository"
              required
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full mt-6 py-3 px-4 bg-cyber-purple hover:bg-cyber-purple/80 text-white font-medium rounded-md transition-colors"
        >
          Visualize Repository
        </button>
      </form>
    </div>
  );
}