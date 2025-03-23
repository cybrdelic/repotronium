import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import { NextPageContext } from 'next';
import RepositoryAnalysis from '@/components/RepositoryAnalysis';
import DependencyGraph from '@/components/DependencyGraph';
import CodeQualityReport from '@/components/CodeQualityReport';
import StrategicInsights from '@/components/StrategicInsights';
import BusinessInsights from '@/components/BusinessInsights';
import { FaCodeBranch, FaChartBar, FaLightbulb, FaSpinner, FaBriefcase } from 'react-icons/fa';

export default function AnalyzePage() {
  const router = useRouter();
  const { owner, repo } = router.query;
  const { data: session } = useSession({ required: true });
  const [activeTab, setActiveTab] = useState('overview');
  const [basicAnalysis, setBasicAnalysis] = useState<any>(null);
  const [advancedAnalysis, setAdvancedAnalysis] = useState<any>(null);
  const [businessInsights, setBusinessInsights] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch the basic analysis
  const fetchBasicAnalysis = async () => {
    if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo)) return;
    
    setLoading('basic');
    setError(null);
    
    try {
      // Use absolute URL to avoid parsing errors
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/analyze-repository?owner=${owner}&repo=${repo}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching repository analysis: ${response.statusText}`);
      }
      
      const data = await response.json();
      setBasicAnalysis(data);
    } catch (err: any) {
      console.error('Error fetching basic analysis:', err);
      setError(err.message || 'Failed to fetch repository analysis');
    } finally {
      setLoading(null);
    }
  };
  
  // Function to fetch the advanced analysis
  const fetchAdvancedAnalysis = async () => {
    if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo)) return;
    
    setLoading('advanced');
    setError(null);
    
    try {
      // Use absolute URL to avoid parsing errors
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/advanced-analysis?owner=${owner}&repo=${repo}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching advanced analysis: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAdvancedAnalysis(data);
    } catch (err: any) {
      console.error('Error fetching advanced analysis:', err);
      setError(err.message || 'Failed to fetch advanced repository analysis');
    } finally {
      setLoading(null);
    }
  };
  
  // Function to fetch business insights
  const fetchBusinessInsights = async () => {
    if (!advancedAnalysis) return;
    
    setLoading('business');
    setError(null);
    
    try {
      // Create combined analysis data for better insights
      const analysisData = {
        ...basicAnalysis,
        ...advancedAnalysis,
        owner,
        repo
      };
      
      console.log('Fetching business insights...');
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/business-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate business insights');
      }
      
      const data = await response.json();
      console.log('Business insights received:', data.businessInsights ? 'Success' : 'Empty');
      
      if (data.businessInsights) {
        setBusinessInsights(data.businessInsights);
      } else {
        throw new Error('No business insights returned from API');
      }
    } catch (err: any) {
      console.error('Error fetching business insights:', err);
      setError(err.message || 'Failed to generate business insights');
    } finally {
      setLoading(null);
    }
  };
  
  // Load basic analysis when the component mounts
  useEffect(() => {
    if (owner && repo && !basicAnalysis && !loading) {
      fetchBasicAnalysis();
    }
  }, [owner, repo, basicAnalysis, loading]);
  
  // Load business insights when advanced analysis is loaded and business tab is active
  useEffect(() => {
    // Force loading business insights when switching to the tab
    if (activeTab === 'business' && advancedAnalysis && !loading) {
      // Only reload if we don't have insights yet or if there was an error
      if (!businessInsights || !businessInsights.documentation) {
        console.log('Triggering business insights fetch from useEffect');
        fetchBusinessInsights();
      } else {
        console.log('Using cached business insights');
      }
    }
  }, [advancedAnalysis, activeTab, businessInsights, loading]);
  
  // Store business insights in session storage to persist between page refreshes
  useEffect(() => {
    // Save business insights to sessionStorage when received
    if (businessInsights?.documentation && owner && repo) {
      const storageKey = `business-insights-${owner}-${repo}`;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(businessInsights));
        console.log('Business insights saved to session storage');
      } catch (err) {
        console.error('Failed to save business insights to session storage:', err);
      }
    }
  }, [businessInsights, owner, repo]);
  
  // Load business insights from session storage on initial page load
  useEffect(() => {
    if (owner && repo && !businessInsights && !loading) {
      const storageKey = `business-insights-${owner}-${repo}`;
      try {
        const storedInsights = sessionStorage.getItem(storageKey);
        if (storedInsights) {
          console.log('Loading business insights from session storage');
          setBusinessInsights(JSON.parse(storedInsights));
        }
      } catch (err) {
        console.error('Failed to load business insights from session storage:', err);
      }
    }
  }, [owner, repo, businessInsights, loading]);
  
  // Load advanced analysis when switching to a tab that needs it
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // If advanced analysis is needed but not loaded yet, fetch it
    if (['dependencies', 'quality', 'strategic', 'business'].includes(tab) && !advancedAnalysis && !loading) {
      fetchAdvancedAnalysis();
    }
    
    // If business tab is selected and business insights aren't loaded yet, fetch them
    if (tab === 'business' && !businessInsights && !loading) {
      // If we have advanced analysis, fetch business insights; otherwise it will be triggered after advanced analysis loads
      if (advancedAnalysis) {
        fetchBusinessInsights();
      }
    }
  };
  
  if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo)) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Invalid Repository</h1>
        <p className="text-gray-400 mb-6">The repository owner or name is invalid.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-cyber-gray hover:bg-gray-700 transition duration-150 text-white py-2 px-6 rounded-md"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Repository Analysis</h1>
        <p className="text-gray-400">
          Comprehensive analysis and documentation for {owner}/{repo}.
        </p>
      </div>
      
      {/* Tab navigation */}
      <div className="flex flex-wrap border-b border-cyber-gray mb-6">
        <button
          className={`px-6 py-3 flex items-center ${activeTab === 'overview' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
          onClick={() => handleTabChange('overview')}
        >
          <FaCodeBranch className="mr-2" /> Overview
        </button>
        <button
          className={`px-6 py-3 flex items-center ${activeTab === 'dependencies' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
          onClick={() => handleTabChange('dependencies')}
        >
          <FaCodeBranch className="mr-2" /> Dependencies
        </button>
        <button
          className={`px-6 py-3 flex items-center ${activeTab === 'quality' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
          onClick={() => handleTabChange('quality')}
        >
          <FaChartBar className="mr-2" /> Code Quality
        </button>
        <button
          className={`px-6 py-3 flex items-center ${activeTab === 'strategic' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
          onClick={() => handleTabChange('strategic')}
        >
          <FaLightbulb className="mr-2" /> Strategic Insights
        </button>
        <button
          className={`px-6 py-3 flex items-center ${activeTab === 'business' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
          onClick={() => handleTabChange('business')}
        >
          <FaBriefcase className="mr-2" /> Business Insights
        </button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 text-center mb-6">
          <p className="text-red-300 mb-2">{error}</p>
          <button
            onClick={() => loading === 'basic' ? fetchBasicAnalysis() : fetchAdvancedAnalysis()}
            className="mt-4 bg-red-800 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="text-cyber-teal text-4xl animate-spin mb-4" />
          <p className="text-gray-400">
            {loading === 'basic' 
              ? 'Analyzing repository structure...' 
              : 'Performing advanced code analysis...'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This may take a few moments
          </p>
        </div>
      )}
      
      {/* Tab content */}
      {!loading && !error && (
        <>
          {activeTab === 'overview' && basicAnalysis && (
            <RepositoryAnalysis owner={owner as string} repo={repo as string} />
          )}
          
          {activeTab === 'dependencies' && advancedAnalysis?.dependencyGraph && (
            <DependencyGraph 
              data={advancedAnalysis.dependencyGraph} 
              title="Repository Dependency Graph" 
            />
          )}
          
          {activeTab === 'quality' && (
            <CodeQualityReport 
              files={advancedAnalysis?.fileComplexityAnalysis || []} 
            />
          )}
          
          {activeTab === 'strategic' && advancedAnalysis?.strategicRecommendations && (
            <StrategicInsights 
              recommendations={advancedAnalysis.strategicRecommendations}
              overview={advancedAnalysis.aiAnalysis?.architecture?.analysis}
              roadmap={advancedAnalysis.roadmap}
            />
          )}
          
          {activeTab === 'business' && (
            <BusinessInsights 
              insightsMarkdown={businessInsights?.documentation || businessInsights?.analysis}
              isLoading={loading === 'business'}
              error={businessInsights?.error}
            />
          )}
        </>
      )}
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