import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { motion } from 'framer-motion';

interface RepositoryVisualizerProps {
  repoData: any;
}

export default function RepositoryVisualizer({ repoData }: RepositoryVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'structure' | 'activity' | 'contributors'>('structure');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current || !repoData) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0a');
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Visualization based on active tab
    let objects: THREE.Object3D[] = [];
    
    const createVisualization = () => {
      // Remove existing objects
      objects.forEach(obj => scene.remove(obj));
      objects = [];
      
      if (activeTab === 'structure') {
        createFileStructureVisualization();
      } else if (activeTab === 'activity') {
        createCommitActivityVisualization();
      } else if (activeTab === 'contributors') {
        createContributorsVisualization();
      }
      
      setIsLoaded(true);
    };
    
    const createFileStructureVisualization = () => {
      // Simple file structure visualization for MVP
      const structure = repoData.structure || [];
      const totalFiles = structure.length;
      
      // Create a circular arrangement of spheres
      structure.forEach((item: any, index: number) => {
        const angle = (index / totalFiles) * Math.PI * 2;
        const radius = 8;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Different colors for different file types
        let color;
        if (item.type === 'dir') {
          color = 0x3a86ff; // Blue for directories
        } else {
          // Determine color based on file extension
          const ext = item.name.split('.').pop()?.toLowerCase() || '';
          if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
            color = 0xffbe0b; // Yellow for JavaScript/TypeScript
          } else if (['html', 'css', 'scss', 'sass'].includes(ext)) {
            color = 0xff006e; // Pink for markup/style
          } else if (['md', 'txt', 'json'].includes(ext)) {
            color = 0x8338ec; // Purple for docs/config
          } else {
            color = 0xfb5607; // Orange for other files
          }
        }
        
        const geometry = item.type === 'dir' 
          ? new THREE.BoxGeometry(0.8, 0.8, 0.8) 
          : new THREE.SphereGeometry(0.4, 16, 16);
          
        const material = new THREE.MeshStandardMaterial({ 
          color,
          emissive: color,
          emissiveIntensity: 0.2,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        
        // Add to scene and track
        scene.add(mesh);
        objects.push(mesh);
        
        // Add connection line to center
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, 0),
        ]);
        
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x555555,
          transparent: true,
          opacity: 0.3,
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        objects.push(line);
      });
    };
    
    const createCommitActivityVisualization = () => {
      const commitData = repoData.commitActivity || [];
      
      // Create a bar chart visualization for commit activity
      commitData.forEach((week: any, index: number) => {
        if (!week) return;
        
        const x = index - commitData.length / 2;
        const height = week.total / 5 || 0.1; // Scale height
        
        const geometry = new THREE.BoxGeometry(0.6, height, 0.6);
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x00f5d4,
          emissive: 0x00f5d4,
          emissiveIntensity: 0.2,
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(x * 0.8, height / 2, 0);
        
        scene.add(bar);
        objects.push(bar);
      });
    };
    
    const createContributorsVisualization = () => {
      const contributors = repoData.contributors || [];
      
      // Create a visualization for contributors
      contributors.slice(0, 20).forEach((contributor: any, index: number) => {
        const angle = (index / Math.min(contributors.length, 20)) * Math.PI * 2;
        
        // Size based on contributions
        const contributionSize = Math.min(Math.sqrt(contributor.contributions) / 8, 2);
        const size = Math.max(0.3, contributionSize);
        
        // Position in a spiral
        const radius = 3 + index * 0.3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = index * 0.1;
        
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x9d4edd,
          emissive: 0x9d4edd,
          emissiveIntensity: 0.3,
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        
        scene.add(sphere);
        objects.push(sphere);
      });
    };
    
    // Initial visualization
    createVisualization();
    
    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Add subtle rotation/animation to objects
      objects.forEach(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.rotation.x += 0.003;
          obj.rotation.y += 0.002;
        }
      });
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometries and materials
      objects.forEach(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        } else if (obj instanceof THREE.Line) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
    };
  }, [repoData, activeTab]);
  
  // When active tab changes, update visualization
  useEffect(() => {
    setIsLoaded(false);
  }, [activeTab]);
  
  if (!repoData) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'structure' 
              ? 'bg-cyber-purple text-white' 
              : 'bg-cyber-gray text-gray-300 hover:bg-cyber-gray/80'
          }`}
          onClick={() => setActiveTab('structure')}
        >
          File Structure
        </button>
        
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'activity' 
              ? 'bg-cyber-purple text-white' 
              : 'bg-cyber-gray text-gray-300 hover:bg-cyber-gray/80'
          }`}
          onClick={() => setActiveTab('activity')}
        >
          Commit Activity
        </button>
        
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'contributors' 
              ? 'bg-cyber-purple text-white' 
              : 'bg-cyber-gray text-gray-300 hover:bg-cyber-gray/80'
          }`}
          onClick={() => setActiveTab('contributors')}
        >
          Contributors
        </button>
      </div>
      
      <div className="bg-cyber-gray p-4 rounded-md flex justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-cyber-teal">{repoData.basicInfo?.name}</h2>
          <p className="text-gray-400">{repoData.basicInfo?.description}</p>
        </div>
        
        <div className="text-right">
          <div className="text-gray-300">
            <span className="text-cyber-teal">⭐</span> {repoData.basicInfo?.stargazers_count}
          </div>
          <div className="text-gray-300">
            <span className="text-cyber-teal">🍴</span> {repoData.basicInfo?.forks_count}
          </div>
        </div>
      </div>
      
      <motion.div 
        ref={containerRef}
        className="w-full h-[600px] rounded-lg overflow-hidden border border-cyber-gray"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="text-sm text-gray-400 text-center mt-4">
        Click and drag to rotate • Scroll to zoom • Hold right-click to pan
      </div>
    </div>
  );
}