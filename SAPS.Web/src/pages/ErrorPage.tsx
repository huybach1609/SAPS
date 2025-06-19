import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
}

const ErrorPage = ({ statusCode = 404, message }: ErrorPageProps) => {
  const navigate = useNavigate();

  const getErrorMessage = () => {
    if (message) return message;
    switch (statusCode) {
      case 401:
        return 'You are not authorized to access this page.';
      case 404:
        return 'The page you are looking for does not exist.';
      default:
        return 'Something went wrong.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">{statusCode}</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {statusCode === 401 ? 'Unauthorized' : 'Page Not Found'}
        </h2>
        <p className="text-gray-600 mb-8">{getErrorMessage()}</p>
        <div className="space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 