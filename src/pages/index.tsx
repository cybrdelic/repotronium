import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaGithub, FaCode, FaBook, FaLightbulb } from 'react-icons/fa';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="cyber-text-gradient">Repotronium</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Comprehensive code analysis and documentation system that transforms complex codebases into clear, actionable insights.
        </p>
        
        {session ? (
          <Link 
            href="/dashboard"
            className="bg-cyber-purple hover:bg-opacity-80 transition duration-200 text-white font-bold py-3 px-8 rounded-md inline-flex items-center gap-2"
          >
            <FaCode />
            Explore Your Repositories
          </Link>
        ) : (
          <button 
            onClick={() => (window as any).location.href = '/api/auth/signin/github'}
            className="cyber-gradient hover:opacity-90 transition duration-200 text-white font-bold py-3 px-8 rounded-md inline-flex items-center gap-2"
          >
            <FaGithub />
            Connect with GitHub
          </button>
        )}
      </section>
      
      {/* Features Section */}
      <section className="py-16 grid md:grid-cols-3 gap-8">
        <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-gray hover:border-cyber-highlight transition duration-200">
          <div className="w-12 h-12 rounded-lg bg-cyber-purple/20 flex items-center justify-center mb-4">
            <FaCode className="text-cyber-purple text-2xl" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">Code Analysis</h3>
          <p className="text-gray-400">
            Recursively analyze repository structure to understand code organization, dependencies, and patterns.
          </p>
        </div>
        
        <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-gray hover:border-cyber-highlight transition duration-200">
          <div className="w-12 h-12 rounded-lg bg-cyber-blue/20 flex items-center justify-center mb-4">
            <FaBook className="text-cyber-blue text-2xl" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">Documentation Generation</h3>
          <p className="text-gray-400">
            Automatically create comprehensive documentation from code, including architecture diagrams and API references.
          </p>
        </div>
        
        <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-gray hover:border-cyber-highlight transition duration-200">
          <div className="w-12 h-12 rounded-lg bg-cyber-teal/20 flex items-center justify-center mb-4">
            <FaLightbulb className="text-cyber-teal text-2xl" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">Strategic Insights</h3>
          <p className="text-gray-400">
            Gain actionable insights about technical debt, architecture improvements, and development roadmaps.
          </p>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 text-center bg-cyber-dark rounded-lg p-8 border border-cyber-gray">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          Transform Your Codebase Today
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto mb-8">
          Connect your GitHub repositories and start generating comprehensive documentation and insights in minutes.
        </p>
        
        {session ? (
          <Link 
            href="/dashboard"
            className="bg-cyber-teal hover:bg-opacity-80 transition duration-200 text-black font-bold py-3 px-8 rounded-md inline-block"
          >
            Go to Dashboard
          </Link>
        ) : (
          <button 
            onClick={() => (window as any).location.href = '/api/auth/signin/github'}
            className="bg-cyber-teal hover:bg-opacity-80 transition duration-200 text-black font-bold py-3 px-8 rounded-md inline-block"
          >
            Get Started for Free
          </button>
        )}
      </section>
    </div>
  );
}
