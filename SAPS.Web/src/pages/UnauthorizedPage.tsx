// import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {t('unauthorized')}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {/* keep custom text in English for now */}
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full  py-2"
            onClick={() => navigate("/")}
            startContent={<ArrowLeft size={16} />}
          >
            Go to Home
          </Button>

          <Button
            className="w-full  py-2"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
