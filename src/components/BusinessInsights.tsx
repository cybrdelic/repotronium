import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaLightbulb, FaUserTie, FaChartLine, FaCogs, FaRocket } from 'react-icons/fa';

type BusinessInsightsProps = {
  insightsMarkdown?: string;
  isLoading?: boolean;
  error?: string;
};

export default function BusinessInsights({ insightsMarkdown, isLoading = false, error }: BusinessInsightsProps) {
  const [activeSection, setActiveSection] = useState<string>('all');
  
  // This function extracts sections from markdown for navigation
  const extractSections = (markdown?: string) => {
    if (!markdown) return [];
    
    // Debug the markdown content to help troubleshoot
    if (markdown) {
      console.log('Markdown content exists, length:', markdown.length);
      console.log('First 100 characters:', markdown.substring(0, 100));
    }
    
    const sectionRegex = /## ([^\n]+)/g;
    const matches = [...(markdown?.matchAll(sectionRegex) || [])];
    
    console.log('Found sections:', matches.length);
    
    return matches.map(match => ({
      title: match[1],
      id: match[1].toLowerCase().replace(/[^\w]+/g, '-')
    }));
  };
  
  const sections = extractSections(insightsMarkdown);
  
  // Get icon based on section title
  const getSectionIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('executive') || titleLower.includes('summary')) {
      return <FaUserTie className="text-cyber-purple" />;
    } else if (titleLower.includes('value') || titleLower.includes('benefit')) {
      return <FaChartLine className="text-cyber-teal" />;
    } else if (titleLower.includes('feature') || titleLower.includes('implementation')) {
      return <FaCogs className="text-cyber-blue" />;
    } else if (titleLower.includes('next') || titleLower.includes('roadmap')) {
      return <FaRocket className="text-cyber-orange" />;
    } else {
      return <FaLightbulb className="text-cyber-yellow" />;
    }
  };
  
  // This enables scrolling to the selected section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // This transforms the markdown to add IDs to headings for navigation
  const addIdsToHeadings = (markdown?: string) => {
    if (!markdown) return '';
    
    return markdown.replace(/## ([^\n]+)/g, (match, title) => {
      const id = title.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h2 id="${id}" class="scroll-mt-20">${title}</h2>`;
    });
  };
  
  const enhancedMarkdown = addIdsToHeadings(insightsMarkdown);
  
  // Helper to filter markdown to show only a specific section if selected
  const getFilteredMarkdown = () => {
    if (activeSection === 'all' || !insightsMarkdown) return enhancedMarkdown;
    
    const sections = insightsMarkdown.split(/## /);
    const headerSection = sections[0];
    
    const targetSectionTitle = activeSection.replace(/-/g, ' ');
    const targetSection = sections.find(s => 
      s.toLowerCase().startsWith(targetSectionTitle.toLowerCase())
    );
    
    if (!targetSection) return enhancedMarkdown;
    
    return headerSection + '## ' + targetSection;
  };
  
  // Debug output
  useEffect(() => {
    console.log('BusinessInsights component props:', { 
      hasInsights: !!insightsMarkdown, 
      insightsLength: insightsMarkdown?.length || 0,
      isLoading, 
      hasError: !!error 
    });
  }, [insightsMarkdown, isLoading, error]);

  return (
    <div className="bg-cyber-dark rounded-lg border border-cyber-gray overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-cyber-gray">
        <h2 className="text-xl font-bold text-white mb-4">Business Insights</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="loader"></div>
            <span className="ml-3 text-gray-400">Generating business insights...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 rounded-md p-4 my-4">
            <p className="text-red-300">{error}</p>
            {error.includes('OpenAI API key') && (
              <div className="mt-3 text-sm text-gray-400">
                <p>To use business insights, add your OpenAI API key:</p>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Create a file named <code className="bg-gray-800 px-1 rounded">.env.local</code> in the project root</li>
                  <li>Add <code className="bg-gray-800 px-1 rounded">OPENAI_API_KEY=your_key_here</code></li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap border-b border-cyber-gray">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeSection === 'all' ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveSection('all')}
            >
              All Sections
            </button>
            
            {sections.map(section => (
              <button
                key={section.id}
                className={`px-4 py-2 text-sm font-medium flex items-center ${activeSection === section.id ? 'text-cyber-highlight border-b-2 border-cyber-highlight' : 'text-gray-400 hover:text-white'}`}
                onClick={() => {
                  setActiveSection(section.id);
                  scrollToSection(section.id);
                }}
              >
                <span className="mr-2">{getSectionIcon(section.title)}</span>
                {section.title}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6 max-h-[700px] overflow-y-auto">
        {!isLoading && !error && insightsMarkdown ? (
          <div className="prose max-w-none prose-invert prose-headings:text-cyber-highlight prose-headings:font-bold prose-p:text-gray-300 prose-h2:text-xl prose-h3:text-lg">
            <div dangerouslySetInnerHTML={{ __html: getFilteredMarkdown() }} />
          </div>
        ) : !isLoading && !error ? (
          <div className="text-center py-10">
            <p className="text-gray-400">
              No business insights available. Try refreshing the page or analyzing the repository again.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}