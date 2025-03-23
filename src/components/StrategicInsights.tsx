import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaLightbulb, FaExclamationTriangle, FaClock, FaCodeBranch } from 'react-icons/fa';

type Recommendation = {
  id: string;
  type: 'technical-debt' | 'architecture' | 'security' | 'performance' | 'maintainability';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
};

type StrategicInsightsProps = {
  recommendations: Recommendation[];
  overview?: string;
  roadmap?: string;
};

export default function StrategicInsights({ recommendations, overview, roadmap }: StrategicInsightsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'technical-debt' | 'architecture' | 'security' | 'performance' | 'roadmap'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Filter recommendations by tab and priority
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesTab = activeTab === 'all' || rec.type === activeTab;
    const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
    return matchesTab && matchesPriority;
  });

  // Count recommendations by type
  const counts = {
    'all': recommendations.length,
    'technical-debt': recommendations.filter(r => r.type === 'technical-debt').length,
    'architecture': recommendations.filter(r => r.type === 'architecture').length,
    'security': recommendations.filter(r => r.type === 'security').length,
    'performance': recommendations.filter(r => r.type === 'performance').length,
  };

  // Get badge color by priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900 text-red-300';
      case 'medium': return 'bg-yellow-900 text-yellow-300';
      case 'low': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  // Get icon by recommendation type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical-debt': return <FaExclamationTriangle className="text-yellow-400" />;
      case 'architecture': return <FaCodeBranch className="text-purple-400" />;
      case 'security': return <FaLightbulb className="text-red-400" />;
      case 'performance': return <FaClock className="text-cyber-teal" />;
      case 'maintainability': return <FaCodeBranch className="text-blue-400" />;
      default: return <FaLightbulb className="text-cyber-teal" />;
    }
  };

  return (
    <div className="bg-cyber-dark rounded-lg border border-cyber-gray overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-cyber-gray">
        <h2 className="text-xl font-bold text-white mb-4">Strategic Insights</h2>
        
        {overview && (
          <div className="mb-6 prose prose-sm max-w-none prose-invert">
            <ReactMarkdown>
              {overview}
            </ReactMarkdown>
          </div>
        )}
        
        {/* Tab navigation */}
        <div className="flex flex-wrap border-b border-cyber-gray">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('all')}
          >
            All Recommendations ({counts.all})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'technical-debt' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('technical-debt')}
          >
            Technical Debt ({counts['technical-debt']})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'architecture' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('architecture')}
          >
            Architecture ({counts['architecture']})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'security' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('security')}
          >
            Security ({counts['security']})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'performance' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance ({counts['performance']})
          </button>
          {roadmap && (
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'roadmap' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('roadmap')}
            >
              Roadmap
            </button>
          )}
        </div>
        
        {/* Priority filter */}
        <div className="flex gap-2 mt-4">
          <span className="text-sm text-gray-400 mr-2">Priority:</span>
          <button 
            onClick={() => setPriorityFilter('all')}
            className={`px-3 py-1 rounded-md text-xs ${priorityFilter === 'all' ? 'bg-cyber-purple/20 text-cyber-highlight' : 'bg-cyber-gray/20 text-gray-400 hover:bg-cyber-gray/30'}`}
          >
            All
          </button>
          <button 
            onClick={() => setPriorityFilter('high')}
            className={`px-3 py-1 rounded-md text-xs ${priorityFilter === 'high' ? 'bg-red-900/30 text-red-300' : 'bg-cyber-gray/20 text-gray-400 hover:bg-cyber-gray/30'}`}
          >
            High
          </button>
          <button 
            onClick={() => setPriorityFilter('medium')}
            className={`px-3 py-1 rounded-md text-xs ${priorityFilter === 'medium' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-cyber-gray/20 text-gray-400 hover:bg-cyber-gray/30'}`}
          >
            Medium
          </button>
          <button 
            onClick={() => setPriorityFilter('low')}
            className={`px-3 py-1 rounded-md text-xs ${priorityFilter === 'low' ? 'bg-green-900/30 text-green-300' : 'bg-cyber-gray/20 text-gray-400 hover:bg-cyber-gray/30'}`}
          >
            Low
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {activeTab === 'roadmap' && roadmap ? (
          <div className="prose max-w-none prose-invert">
            <ReactMarkdown>
              {roadmap}
            </ReactMarkdown>
          </div>
        ) : (
          <>
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400">No recommendations found for the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRecommendations.map((recommendation) => (
                  <div key={recommendation.id} className="bg-cyber-black/50 rounded-lg border border-cyber-gray overflow-hidden">
                    <div className="p-4 border-b border-cyber-gray flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {getTypeIcon(recommendation.type)}
                        </div>
                        <div>
                          <h3 className="text-md font-semibold text-white">{recommendation.title}</h3>
                          <div className="text-xs text-gray-400 capitalize">{recommendation.type.replace('-', ' ')}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority} priority
                        </span>
                        <span className="text-xs px-2 py-1 rounded-md bg-gray-800 text-gray-300">
                          {recommendation.effort} effort
                        </span>
                        <span className="text-xs px-2 py-1 rounded-md bg-gray-800 text-gray-300">
                          {recommendation.impact} impact
                        </span>
                      </div>
                    </div>
                    <div className="p-4 prose prose-sm max-w-none prose-invert">
                      <ReactMarkdown>
                        {recommendation.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}