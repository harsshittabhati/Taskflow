import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-blue-600 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;