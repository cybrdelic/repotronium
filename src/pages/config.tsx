import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { NextPageContext } from 'next';
import { FaCog, FaKey, FaSpinner, FaCheck } from 'react-icons/fa';

export default function ConfigPage() {
  const { data: session } = useSession({ required: true });
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  
  const [hasEnvKey, setHasEnvKey] = useState(false);
  
  // Load current config
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to load configuration');
        }
        
        const config = await response.json();
        setHasExistingKey(config.hasOpenaiApiKey);
        setHasEnvKey(config.hasEnvironmentKey || false);
      } catch (err: any) {
        console.error('Error loading config:', err);
        setError(err.message || 'Failed to load configuration');
      }
    }
    
    loadConfig();
  }, []);
  
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    
    try {
      console.log('Saving OpenAI API key...');
      
      // Trim the API key to remove any whitespace
      const trimmedKey = openaiApiKey.trim();
      
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ openaiApiKey: trimmedKey }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }
      
      console.log('OpenAI API key saved successfully');
      setSaved(true);
      setHasExistingKey(!!openaiApiKey);
      
      // Clear the input if successful
      if (openaiApiKey) {
        setTimeout(() => {
          setOpenaiApiKey('');
        }, 2000);
      }
      
      // Force reload to apply new key
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (err: any) {
      console.error('Error saving config:', err);
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuration</h1>
        <p className="text-gray-400">
          Configure Repotronium settings and API keys.
        </p>
      </div>
      
      <div className="max-w-xl bg-cyber-dark rounded-lg border border-cyber-gray p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaKey className="mr-2 text-cyber-teal" /> API Keys Configuration
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-2">
            Advanced features like AI-powered code analysis and strategic insights require an OpenAI API key.
          </p>
          
          <div className="bg-blue-900/30 border border-blue-800 rounded p-4 mb-6">
            <h3 className="text-blue-300 font-semibold mb-2">Recommended Setup</h3>
            <p className="text-gray-300 mb-3">
              For security and ease of use, add your OpenAI API key to the <code className="bg-cyber-black px-2 py-1 rounded">.env.local</code> file in the root directory:
            </p>
            
            <div className="bg-cyber-black p-3 rounded mb-3 font-mono text-sm">
              <p className="text-green-400">OPENAI_API_KEY=your_openai_api_key_here</p>
            </div>
            
            <p className="text-gray-400 text-sm">
              This is the preferred method as it keeps your API key secure and doesn't store it in the application database.
            </p>
            
            <p className="text-gray-400 text-sm mt-2">
              After adding the key to your <code className="bg-cyber-black px-1 rounded">.env.local</code> file, restart the development server for the changes to take effect.
            </p>
          </div>
          
          {hasEnvKey && (
            <div className="bg-green-900/30 border border-green-800 rounded p-3 mb-4">
              <p className="text-green-300 flex items-center">
                <FaCheck className="mr-2" /> OpenAI API key is successfully configured in your environment variables
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Your API key has been loaded from the .env.local file or environment variables. AI-powered features are ready to use.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}