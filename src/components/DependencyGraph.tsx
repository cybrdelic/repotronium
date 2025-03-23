import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FaExpand, FaCompress, FaSearch, FaDownload } from 'react-icons/fa';

// Dynamically import ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-cyber-dark rounded-md border border-cyber-gray">
      <div className="loader"></div>
    </div>
  ),
});

// Define simplified types for Force Graph compatibility
type NodeId = string | number;

// Define node interface based on ForceGraph requirements
interface GraphNode {
  id: NodeId;
  group: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  [key: string]: any;
}

// Define link interface based on ForceGraph requirements
interface GraphLink {
  source: NodeId | GraphNode;
  target: NodeId | GraphNode;
  value?: number;
  index?: number;
  [key: string]: any;
}

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

type DependencyGraphProps = {
  data: GraphData;
  title?: string;
};

export default function DependencyGraph({ data, title = 'Code Dependency Graph' }: DependencyGraphProps) {
  // Use ForceGraphMethods from react-force-graph for the ref type
  const graphRef = useRef<any>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Using React.SetStateAction to avoid type issues with Set
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<GraphData>(data);
  
  // Process data for visualization
  useEffect(() => {
    if (!data || !data.nodes || !data.links) {
      setFilteredData({ nodes: [], links: [] });
      return;
    }
    
    // If search term is provided, filter nodes
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      
      // Filter nodes matching search
      const matchingNodes = data.nodes.filter(node => 
        String(node?.id || '').toLowerCase().includes(searchLower)
      );
      
      // Get IDs of matching nodes
      const matchingNodeIds = new Set(matchingNodes.map(node => node.id));
      
      // Filter links connected to matching nodes
      const relevantLinks = data.links.filter(link => {
        if (!link) return false;
        const source = typeof link.source === 'object' ? link.source?.id : link.source;
        const target = typeof link.target === 'object' ? link.target?.id : link.target;
        if (source === undefined || target === undefined) return false;
        return matchingNodeIds.has(source) || matchingNodeIds.has(target);
      });
      
      // Create filtered graph data
      setFilteredData({
        nodes: matchingNodes,
        links: relevantLinks
      });
    } else {
      // No search term, use full data
      setFilteredData(data);
    }
  }, [data, searchTerm]);

  // Handle node hover highlighting
  const handleNodeHover = (node: any | null, previousNode: any | null) => {
    if (!node || node.id === undefined) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    
    // Get connected nodes and links
    const connectedNodes = new Set([String(node.id)]);
    const connectedLinks = new Set();
    
    // Find connections
    if (data && data.links) {
      data.links.forEach(link => {
        if (!link) return;
        
        const source = typeof link.source === 'object' ? link.source?.id : link.source;
        const target = typeof link.target === 'object' ? link.target?.id : link.target;
        
        if (source === undefined || target === undefined) return;
        
        const nodeIdStr = String(node.id);
        
        if (String(source) === nodeIdStr || String(target) === nodeIdStr) {
          connectedNodes.add(String(source));
          connectedNodes.add(String(target));
          connectedLinks.add(link);
        }
      });
    }
    
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Export graph as image
  const exportImage = () => {
    if (!graphRef.current) return;
    
    const canvas = graphRef.current.canvas();
    if (!canvas) return;
    
    try {
      // Create a download link
      const link = document.createElement('a');
      link.download = 'dependency-graph.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting graph image:', error);
    }
  };

  // Define node colors based on group
  const getNodeColor = (node: any) => {
    if (!node) return '#cccccc'; // Default gray if node is undefined
    
    const colors = [
      '#3a86ff', // blue
      '#ff006e', // pink
      '#8338ec', // purple
      '#fb5607', // orange
      '#ffbe0b', // yellow
      '#00f5d4', // teal
      '#06d6a0', // green
      '#118ab2', // dark blue
      '#ef476f', // red
    ];
    
    const isHighlighted = highlightNodes.size === 0 || (node.id !== undefined && highlightNodes.has(String(node.id)));
    
    // Get color based on group, use modulo for safety
    const nodeGroup = (node.group !== undefined) ? node.group : 1;
    const baseColor = colors[(nodeGroup - 1) % colors.length];
    
    // Return dimmed color if not highlighted
    return isHighlighted ? baseColor : `${baseColor}33`; // 33 is 20% opacity in hex
  };
  
  // Define link colors based on highlighting
  const getLinkColor = (link: any) => {
    if (!link || !link.source || !link.target) return '#ffffff33'; // Default transparent white
    
    const source = typeof link.source === 'object' ? link.source?.id : link.source;
    const target = typeof link.target === 'object' ? link.target?.id : link.target;
    
    if (source === undefined || target === undefined) return '#ffffff33';
    
    const isHighlighted = 
      highlightLinks.size === 0 || 
      highlightLinks.has(link) ||
      (highlightNodes.has(String(source)) && highlightNodes.has(String(target)));
    
    return isHighlighted ? '#ffffff' : '#ffffff33'; // White with varying opacity
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-cyber-black p-4' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              className="bg-cyber-dark border border-cyber-gray rounded-md py-2 pl-9 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyber-highlight w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <button 
            onClick={exportImage}
            className="bg-cyber-gray hover:bg-gray-700 transition duration-150 text-white p-2 rounded-md"
            title="Export as image"
          >
            <FaDownload />
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="bg-cyber-gray hover:bg-gray-700 transition duration-150 text-white p-2 rounded-md"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
      
      <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px]'} bg-cyber-dark rounded-md border border-cyber-gray overflow-hidden`}>
        {filteredData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredData}
            nodeAutoColorBy="group"
            nodeRelSize={6}
            nodeLabel={(node) => String(node.id)}
            linkLabel={(link) => {
              if (!link || !link.source || !link.target) return '';
              const source = typeof link.source === 'object' ? link.source?.id : link.source;
              const target = typeof link.target === 'object' ? link.target?.id : link.target;
              return `${source || ''} → ${target || ''}`;
            }}
            linkWidth={(link) => link && highlightLinks.has(link) ? 2 : 1}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={(link) => link && highlightLinks.has(link) ? 2 : 0}
            nodeCanvasObject={(node, ctx, globalScale) => {
              if (!node || node.id === undefined) return;
              
              // Draw circle
              const label = String(node.id || '');
              const fontSize = 12/globalScale;
              const isHighlighted = highlightNodes.size === 0 || 
                (node.id !== undefined && highlightNodes.has(String(node.id)));
              
              // Ensure x and y exist
              const x = node.x || 0;
              const y = node.y || 0;
              
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = getNodeColor(node);
              ctx.fill();
              
              if (isHighlighted && globalScale >= 0.4) {
                // Show labels for highlighted nodes or when zoomed in enough
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isHighlighted ? '#ffffff' : '#ffffff88';
                ctx.fillText(label, x, y + 10);
              }
            }}
            linkColor={getLinkColor}
            onNodeHover={handleNodeHover}
            cooldownTicks={100}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">No dependencies found or matching your search.</p>
          </div>
        )}
      </div>
      
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 bg-cyber-dark hover:bg-cyber-gray transition duration-150 text-white p-2 rounded-md"
        >
          <FaCompress />
        </button>
      )}
    </div>
  );
}