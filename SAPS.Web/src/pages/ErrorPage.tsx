import { Button } from '@heroui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
}

const ErrorPage = ({ statusCode = 404, message }: ErrorPageProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getErrorMessage = () => {
    if (message) return message;
    switch (statusCode) {
      case 401:
        return t('unauthorized');
      case 404:
        return t('not_found');
      default:
        return 'Something went wrong.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-6xl font-bold text-danger  mb-4">{statusCode}</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {statusCode === 401 ? t('unauthorized') : t('not_found')}
        </h2>
        <p className="text-gray-600 mb-8">{getErrorMessage()}</p>
        <div className="space-x-4">
          <Button
            onClick={() => navigate(-1)}
            color="default"
            className="px-6 py-2    "
          >
            Go Back
          </Button>
          <Button
            color="primary"
            onClick={() => navigate('/')}
            className="px-6 py-2 text-primary-50"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 