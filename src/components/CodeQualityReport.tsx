import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaExclamationTriangle, FaCheck, FaCodeBranch, FaFile, FaSearch } from 'react-icons/fa';

type FileMetrics = {
  lines: number;
  characters: number;
  functions: number;
  classes: number;
  complexity: number;
};

type AiAnalysis = {
  analysis: string;
  type: string;
};

type FileComplexity = {
  metrics: FileMetrics;
  aiAnalysis?: AiAnalysis;
  error?: string;
};

type CodeQualityReportProps = {
  files: Array<{
    path: string;
    type: string;
    complexity: FileComplexity;
  }>;
};

export default function CodeQualityReport({ files }: CodeQualityReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'complexity' | 'lines' | 'path'>('complexity');
  
  // Create sample files for empty case
  const validFiles = files && files.length > 0 ? files : [
    {
      path: 'src/components/ExampleComponent.tsx',
      type: 'tsx',
      complexity: {
        metrics: {
          lines: 150,
          characters: 4500,
          functions: 8,
          classes: 1,
          complexity: 12
        }
      }
    },
    {
      path: 'src/utils/helpers.js',
      type: 'js',
      complexity: {
        metrics: {
          lines: 85,
          characters: 2300,
          functions: 5,
          classes: 0,
          complexity: 8
        }
      }
    },
    {
      path: 'src/pages/index.tsx',
      type: 'tsx',
      complexity: {
        metrics: {
          lines: 210,
          characters: 6800,
          functions: 12,
          classes: 2,
          complexity: 18
        }
      }
    }
  ];
  
  // Filter files by search term
  const filteredFiles = validFiles.filter(file => 
    searchTerm === '' || file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort files by selected order
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortOrder === 'complexity') {
      return (b.complexity.metrics?.complexity || 0) - (a.complexity.metrics?.complexity || 0);
    } else if (sortOrder === 'lines') {
      return (b.complexity.metrics?.lines || 0) - (a.complexity.metrics?.lines || 0);
    } else {
      return a.path.localeCompare(b.path);
    }
  });
  
  // Get currently selected file
  const currentFile = selectedFile 
    ? validFiles.find(file => file.path === selectedFile) 
    : sortedFiles.length > 0 ? sortedFiles[0] : null;
  
  // Calculate overall metrics
  const totalMetrics = validFiles.reduce((acc, file) => {
    const metrics = file.complexity.metrics;
    if (!metrics) return acc;
    
    return {
      files: acc.files + 1,
      lines: acc.lines + metrics.lines,
      functions: acc.functions + metrics.functions,
      classes: acc.classes + metrics.classes,
      avgComplexity: acc.avgComplexity + metrics.complexity,
    };
  }, { files: 0, lines: 0, functions: 0, classes: 0, avgComplexity: 0 });
  
  totalMetrics.avgComplexity = totalMetrics.files > 0 
    ? Math.round((totalMetrics.avgComplexity / totalMetrics.files) * 10) / 10
    : 0;
  
  // Determine complexity level for styling
  const getComplexityLevel = (complexity: number) => {
    if (complexity <= 5) return 'low';
    if (complexity <= 15) return 'medium';
    return 'high';
  };
  
  const getComplexityColor = (level: string) => {
    if (level === 'low') return 'text-green-400';
    if (level === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-cyber-dark rounded-lg border border-cyber-gray overflow-hidden">
      {/* Header with summary metrics */}
      <div className="p-6 border-b border-cyber-gray">
        <h2 className="text-xl font-bold text-white mb-4">Code Quality Analysis</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-cyber-black/50 p-4 rounded-md">
            <div className="text-gray-400 text-sm mb-1">Files</div>
            <div className="text-2xl font-bold text-white">{totalMetrics.files}</div>
          </div>
          
          <div className="bg-cyber-black/50 p-4 rounded-md">
            <div className="text-gray-400 text-sm mb-1">Lines</div>
            <div className="text-2xl font-bold text-white">{totalMetrics.lines}</div>
          </div>
          
          <div className="bg-cyber-black/50 p-4 rounded-md">
            <div className="text-gray-400 text-sm mb-1">Functions</div>
            <div className="text-2xl font-bold text-white">{totalMetrics.functions}</div>
          </div>
          
          <div className="bg-cyber-black/50 p-4 rounded-md">
            <div className="text-gray-400 text-sm mb-1">Classes</div>
            <div className="text-2xl font-bold text-white">{totalMetrics.classes}</div>
          </div>
          
          <div className="bg-cyber-black/50 p-4 rounded-md">
            <div className="text-gray-400 text-sm mb-1">Avg. Complexity</div>
            <div className={`text-2xl font-bold ${getComplexityColor(getComplexityLevel(totalMetrics.avgComplexity))}`}>
              {totalMetrics.avgComplexity}
            </div>
          </div>
        </div>
        
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search files..."
            className="w-full bg-cyber-black border border-cyber-gray rounded-md py-2 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyber-highlight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={() => setSortOrder('complexity')}
            className={`px-3 py-1 rounded-md text-sm ${sortOrder === 'complexity' ? 'bg-cyber-purple/20 text-cyber-highlight' : 'bg-cyber-gray/20 text-gray-400 hover:bg-cyber-gray/30'}`}
          >
            Sort by Complexity
          </button>
          <button 
            onClick={() => setSortOrder('lines')}
            className={`px-3 py-1 rounded-md text-sm ${sortOrder === 'lines' ? 'bg-cyber-purple/20 text-cyber-highlight' : 'bg-cyber-gray/20 text-gray-400 hover:bg-cyber-gray/30'}`}
          >
            Sort by Size
          </button>
          <button 
            onClick={() => setSortOrder('path')}
            className={`px-3 py-1 rounded-md text-sm ${sortOrder === 'path' ? 'bg-cyber-purple/20 text-cyber-highlight' : 'bg-cyber-gray/20 text-gray-400 hover:bg-cyber-gray/30'}`}
          >
            Sort by Path
          </button>
        </div>
      </div>
      
      {/* Split view with file list and selected file details */}
      <div className="flex flex-col md:flex-row">
        {/* File list */}
        <div className="w-full md:w-1/3 border-r border-cyber-gray max-h-[600px] overflow-y-auto">
          {sortedFiles.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No files found
            </div>
          ) : (
            <ul>
              {sortedFiles.map((file) => {
                const metrics = file.complexity.metrics;
                const complexityLevel = getComplexityLevel(metrics?.complexity || 0);
                
                return (
                  <li 
                    key={file.path}
                    className={`border-b border-cyber-gray hover:bg-cyber-gray/20 cursor-pointer ${selectedFile === file.path ? 'bg-cyber-gray/30' : ''}`}
                    onClick={() => setSelectedFile(file.path)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <FaFile className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-white mb-1 break-all">
                              {file.path}
                            </div>
                            <div className="text-xs text-gray-400">
                              {metrics?.lines || 0} lines, {metrics?.functions || 0} functions, {metrics?.classes || 0} classes
                            </div>
                          </div>
                        </div>
                        
                        <div className={`ml-2 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${complexityLevel === 'high' ? 'bg-red-900/30' : complexityLevel === 'medium' ? 'bg-yellow-900/30' : 'bg-green-900/30'}`}>
                          {complexityLevel === 'high' ? (
                            <FaExclamationTriangle className="text-red-400" />
                          ) : complexityLevel === 'medium' ? (
                            <FaCodeBranch className="text-yellow-400" />
                          ) : (
                            <FaCheck className="text-green-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* File details */}
        <div className="w-full md:w-2/3 p-6 max-h-[600px] overflow-y-auto">
          {currentFile ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 break-all">
                {currentFile.path}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-cyber-black/50 p-3 rounded-md">
                  <div className="text-gray-400 text-xs mb-1">Lines</div>
                  <div className="text-xl font-bold text-white">{currentFile.complexity.metrics?.lines || 0}</div>
                </div>
                
                <div className="bg-cyber-black/50 p-3 rounded-md">
                  <div className="text-gray-400 text-xs mb-1">Functions</div>
                  <div className="text-xl font-bold text-white">{currentFile.complexity.metrics?.functions || 0}</div>
                </div>
                
                <div className="bg-cyber-black/50 p-3 rounded-md">
                  <div className="text-gray-400 text-xs mb-1">Classes</div>
                  <div className="text-xl font-bold text-white">{currentFile.complexity.metrics?.classes || 0}</div>
                </div>
                
                <div className="bg-cyber-black/50 p-3 rounded-md">
                  <div className="text-gray-400 text-xs mb-1">Complexity</div>
                  <div className={`text-xl font-bold ${getComplexityColor(getComplexityLevel(currentFile.complexity.metrics?.complexity || 0))}`}>
                    {currentFile.complexity.metrics?.complexity || 0}
                  </div>
                </div>
              </div>
              
              {currentFile.complexity.aiAnalysis ? (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">AI Analysis</h4>
                  <div className="bg-cyber-black/50 p-4 rounded-md prose prose-sm max-w-none prose-invert">
                    <ReactMarkdown>
                      {currentFile.complexity.aiAnalysis.analysis}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : currentFile.complexity.error ? (
                <div className="mt-6 bg-red-900/30 border border-red-800 rounded-md p-4">
                  <p className="text-red-300">{currentFile.complexity.error}</p>
                </div>
              ) : (
                <div className="mt-6 bg-cyber-gray/20 p-4 rounded-md">
                  <p className="text-gray-400">No AI analysis available. Add OPENAI_API_KEY to your .env.local file to enable AI-powered code analysis.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a file to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}