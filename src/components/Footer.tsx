export default function Footer() {
  return (
    <footer className="bg-cyber-dark py-6 border-t border-cyber-gray">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">
          Repotronium &copy; {new Date().getFullYear()} | Comprehensive Code Analysis and Documentation System
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Built with Next.js, TypeScript, and Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
