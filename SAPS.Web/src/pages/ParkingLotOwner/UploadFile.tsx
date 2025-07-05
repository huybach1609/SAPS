
import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Image, Video } from 'lucide-react';
import DefaultLayout from '@/layouts/default';
import { apiUrl } from '@/config/base';

interface UploadResult {
    success: boolean;
    message?: string;
    cloudFrontUrl?: string;
    fileName?: string;
    fileSize?: number;
    contentType?: string;
    error?: string;
}

interface MultipleUploadResult {
    message: string;
    results: UploadResult[];
}

const UploadFile: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // API base URL - adjust this to match your API
    const API_BASE_URL = 'https://localhost:7000/api'; // Change this to your API URL

    const handleFileSelect = (files: FileList | null) => {
        if (files) {
            const fileArray = Array.from(files);
            setSelectedFiles(prev => [...prev, ...fileArray]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setSelectedFiles([]);
        setUploadResults([]);
    };

    const uploadSingleFile = async (file: File): Promise<UploadResult> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${apiUrl}/api/s3/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
                fileName: file.name
            };
        }
    };

    const uploadMultipleFiles = async (): Promise<MultipleUploadResult> => {
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(`${apiUrl}/api/s3/upload-multiple`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            return {
                message: 'Upload failed',
                results: selectedFiles.map(file => ({
                    success: false,
                    error: error instanceof Error ? error.message : 'Upload failed',
                    fileName: file.name
                }))
            };
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);

        try {
            if (selectedFiles.length === 1) {
                // Single file upload
                const result = await uploadSingleFile(selectedFiles[0]);
                setUploadResults([result]);
            } else {
                // Multiple files upload
                const result = await uploadMultipleFiles();
                setUploadResults(result.results);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (contentType: string) => {
        if (contentType.startsWith('image/')) return <Image className="w-4 h-4" />;
        if (contentType.startsWith('video/')) return <Video className="w-4 h-4" />;
        return <File className="w-4 h-4" />;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    return (
        <DefaultLayout >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">File Upload to S3 with CloudFront</h2>

            {/* Drag and Drop Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                    Drag and drop files here, or{' '}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                        browse
                    </button>
                </p>
                <p className="text-sm text-gray-500">Support for single or multiple files</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Selected Files ({selectedFiles.length})
                        </h3>
                        <button
                            onClick={clearAll}
                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {getFileIcon(file.type)}
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-600 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Upload Results</h3>
                    {uploadResults.map((result, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${result.success
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-800">
                                            {result.fileName || `File ${index + 1}`}
                                        </p>
                                        {result.success && result.fileSize && (
                                            <span className="text-sm text-gray-500">
                                                {formatFileSize(result.fileSize)}
                                            </span>
                                        )}
                                    </div>

                                    {result.success ? (
                                        <div className="mt-2">
                                            <p className="text-sm text-green-600 mb-2">Upload successful!</p>
                                            {result.cloudFrontUrl && (
                                                <div className="bg-white p-3 rounded border">
                                                    <p className="text-xs text-gray-500 mb-1">CloudFront URL:</p>
                                                    <div className="flex items-center space-x-2">
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                                                            {result.cloudFrontUrl}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(result.cloudFrontUrl!)}
                                                            className="text-blue-500 hover:text-blue-600 text-xs font-medium whitespace-nowrap"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-600 mt-1">
                                            {result.error || 'Upload failed'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DefaultLayout>
    );
};

export default UploadFile;