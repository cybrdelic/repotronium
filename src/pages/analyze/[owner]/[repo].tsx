import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [hasAttemptedBusinessFetch, setHasAttemptedBusinessFetch] = useState(false);

  // Use refs to track mounting/unmounting and prevent state updates after unmounting
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Function to fetch the basic analysis
  const fetchBasicAnalysis = useCallback(async () => {
    if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo) || loading) return;

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

      // Only update state if component is still mounted
      if (isMounted.current) {
        setBasicAnalysis(data);
      }
    } catch (err: any) {
      console.error('Error fetching basic analysis:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch repository analysis');
      }
    } finally {
      if (isMounted.current) {
        setLoading(null);
      }
    }
  }, [owner, repo, loading]);

  // Function to fetch the advanced analysis
  const fetchAdvancedAnalysis = useCallback(async () => {
    if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo) || loading) return;

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
      if (isMounted.current) {
        setAdvancedAnalysis(data);
      }
    } catch (err: any) {
      console.error('Error fetching advanced analysis:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch advanced repository analysis');
      }
    } finally {
      if (isMounted.current) {
        setLoading(null);
      }
    }
  }, [owner, repo, loading]);

  // Function to fetch business insights
  const fetchBusinessInsights = useCallback(async () => {
    // Don't fetch if any of these conditions are true
    if (!advancedAnalysis || !basicAnalysis || loading || hasAttemptedBusinessFetch) return;

    console.log('Starting business insights fetch...');
    setLoading('business');
    setError(null);
    setHasAttemptedBusinessFetch(true);

    try {
      // Create combined analysis data for better insights
      const analysisData = {
        ...basicAnalysis,
        ...advancedAnalysis,
        owner,
        repo,
        // Ensure files property exists and is an array
        files: advancedAnalysis.fileComplexityAnalysis || []
      };

      console.log('Fetching business insights with data:',
        JSON.stringify({
          hasFiles: !!analysisData.files,
          fileCount: analysisData.files?.length || 0
        }));

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
        if (isMounted.current) {
          setBusinessInsights(data.businessInsights);
        }
      } else {
        throw new Error('No business insights returned from API');
      }
    } catch (err: any) {
      console.error('Error fetching business insights:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to generate business insights');
      }
    } finally {
      if (isMounted.current) {
        setLoading(null);
      }
    }
  }, [advancedAnalysis, basicAnalysis, hasAttemptedBusinessFetch, loading, owner, repo]);

  // Load basic analysis when the component mounts
  useEffect(() => {
    if (owner && repo && !basicAnalysis && !loading && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      fetchBasicAnalysis();
    }
  }, [owner, repo, basicAnalysis, loading, fetchBasicAnalysis, hasAttemptedFetch]);

  // Load business insights when advanced analysis is loaded and business tab is active
  useEffect(() => {
    // Force loading business insights when switching to the tab
    if (activeTab === 'business' && advancedAnalysis && !loading) {
      // Only reload if we don't have insights yet or if there was an error
      if ((!businessInsights || !businessInsights.documentation) && !hasAttemptedBusinessFetch) {
        console.log('Triggering business insights fetch from useEffect');
        fetchBusinessInsights();
      } else {
        console.log('Using cached business insights or already attempted fetch');
      }
    }
  }, [advancedAnalysis, activeTab, businessInsights, loading, fetchBusinessInsights, hasAttemptedBusinessFetch]);

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
    if (owner && repo && !businessInsights && !loading && !hasAttemptedBusinessFetch) {
      const storageKey = `business-insights-${owner}-${repo}`;
      try {
        const storedInsights = sessionStorage.getItem(storageKey);
        if (storedInsights) {
          console.log('Loading business insights from session storage');
          setBusinessInsights(JSON.parse(storedInsights));
          setHasAttemptedBusinessFetch(true);
        }
      } catch (err) {
        console.error('Failed to load business insights from session storage:', err);
      }
    }
  }, [owner, repo, businessInsights, loading, hasAttemptedBusinessFetch]);

  // Load advanced analysis when switching to a tab that needs it
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // If advanced analysis is needed but not loaded yet, fetch it
    if (['dependencies', 'quality', 'strategic', 'business'].includes(tab) && !advancedAnalysis && !loading) {
      fetchAdvancedAnalysis();
    }

    // Reset the business fetch flag when manually switching to business tab
    if (tab === 'business' && !businessInsights) {
      setHasAttemptedBusinessFetch(false);
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
            onClick={() => {
              if (loading === 'basic' || !basicAnalysis) {
                setHasAttemptedFetch(false);
                fetchBasicAnalysis();
              } else if (activeTab === 'business' && error.includes('business insights')) {
                setHasAttemptedBusinessFetch(false);
                fetchBusinessInsights();
              } else {
                fetchAdvancedAnalysis();
              }
            }}
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
              : loading === 'business'
                ? 'Generating business insights...'
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
              error={hasAttemptedBusinessFetch && !businessInsights ?
                'Failed to generate business insights. The repository may not have enough data for analysis.' :
                businessInsights?.error}
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
