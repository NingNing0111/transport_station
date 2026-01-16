import { Link } from 'react-router-dom';
import { Package, Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">中转站应用</h1>
          </Link>
          <a
            href="https://github.com/NingNing0111/transport_station"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="GitHub仓库"
          >
            <Github className="h-6 w-6" />
          </a>
        </div>
      </div>
    </header>
  );
}
