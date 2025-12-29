// Navbar component
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              QuickSplit
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/scan" className="text-gray-700 hover:text-blue-600">
              Scan
            </Link>
            <Link to="/history" className="text-gray-700 hover:text-blue-600">
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

