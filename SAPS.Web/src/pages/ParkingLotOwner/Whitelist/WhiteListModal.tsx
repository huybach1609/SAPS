import { apiUrl } from "@/config/base";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure, UseDisclosureProps } from "@heroui/react";
import { AlertCircle, Check, Cross, Download, FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function AddFileModal({ addFileModalDisclosure, parkingLotId }: { addFileModalDisclosure: UseDisclosureProps, parkingLotId: string }) {
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [apiStatus, setApiStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
    const [apiError, setApiError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File): void => {
        const validTypes: string[] = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const validExtensions: string[] = ['.csv', '.xls', '.xlsx'];

        const isValidType: boolean = validTypes.includes(file.type) ||
            validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isValidType) {
            setUploadStatus('error');
            return;
        }

        setUploadedFile(file);
        setUploadStatus('success');
    };

    const openFileDialog = (): void => {
        fileInputRef.current?.click();
    };

    const downloadSample = (): void => {
        // Create sample CSV content
        const csvContent: string = "CitizenID\n123456789012\n234567890123\n345678901234";
        const blob: Blob = new Blob([csvContent], { type: 'text/csv' });
        const url: string = window.URL.createObjectURL(blob);
        const a: HTMLAnchorElement = document.createElement('a');
        a.href = url;
        a.download = 'sample_citizen_ids.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const resetUpload = (): void => {
        setUploadedFile(null);
        setUploadStatus('idle');
        setApiStatus('idle');
        setApiError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // The function to upload file to API
    const handleApiUpload = async () => {
        if (!uploadedFile) return;
        setApiStatus('fetching');
        setApiError(null);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            // Replace with your actual API endpoint
            const response = await fetch(apiUrl + `/api/whitelist/${parkingLotId}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                setApiStatus('error');
                setApiError(errorText || 'Upload failed');
                return;
            }

            setApiStatus('success');
        } catch (err: any) {
            setApiStatus('error');
            setApiError(err?.message || 'Upload failed');
        }
    };

    return (
        <Modal isOpen={addFileModalDisclosure.isOpen} onOpenChange={addFileModalDisclosure.onChange}
            size="4xl"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <Button isIconOnly variant="light" size="sm" onPress={addFileModalDisclosure.onClose}>
                               <Cross size={16} /> 
                            </Button>
                            <h2 className="text-xl font-bold text-gray-900">Upload Whitelist</h2>
                            <p className="text-gray-600">
                                Upload a CSV or Excel file containing Citizen IDs to add users to the whitelist.
                            </p>

                        </ModalHeader>
                        <ModalBody>
                            <div className="border-2 border-dashed border-blue-200 rounded-2xl py-8  mb-2 bg-blue-50/50 transition-all duration-300">
                                <div
                                    className={`relative ${dragActive ? 'scale-105' : ''} transition-transform duration-200`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xls,.xlsx"
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />

                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            {uploadStatus === 'success' ? (
                                                <Check className="w-10 h-10 text-green-600" />
                                            ) : uploadStatus === 'error' ? (
                                                <AlertCircle className="w-10 h-10 text-red-600" />
                                            ) : (
                                                <Upload className="w-10 h-10 text-purple-600" />
                                            )}
                                        </div>

                                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                            {uploadStatus === 'success' ? 'File Ready to Upload!' :
                                                uploadStatus === 'error' ? 'Upload Failed' :
                                                    'Upload CSV or Excel File'}
                                        </h2>

                                        <p className="text-gray-600 mb-8">
                                            {uploadStatus === 'success' ? `${uploadedFile?.name} is ready for processing` :
                                                uploadStatus === 'error' ? 'Please upload a valid CSV or Excel file' :
                                                    'Select a file containing Citizen IDs to add users to the whitelist'}
                                        </p>

                                        {uploadStatus === 'success' && (
                                            <div className="flex flex-col gap-3 items-center">
                                                <div className="flex gap-3 justify-center">
                                                    <button
                                                        onClick={resetUpload}
                                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                                        disabled={apiStatus === 'fetching'}
                                                    >
                                                        Upload Another File
                                                    </button>
                                                    <button
                                                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                                        onClick={handleApiUpload}
                                                        disabled={apiStatus === 'fetching' || apiStatus === 'success'}
                                                    >
                                                        {apiStatus === 'fetching' && (
                                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                        )}
                                                        {apiStatus === 'success' ? "Uploaded!" : "Upload to API"}
                                                    </button>
                                                </div>
                                                {apiStatus === 'error' && (
                                                    <div className="text-red-600 text-sm mt-2">{apiError}</div>
                                                )}
                                                {apiStatus === 'success' && (
                                                    <div className="text-green-600 text-sm mt-2">File uploaded to server successfully.</div>
                                                )}
                                            </div>
                                        )}

                                        {uploadStatus === 'error' && (
                                            <div className="flex flex-col items-center gap-4">
                                                <button
                                                    onClick={resetUpload}
                                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        )}

                                        {uploadStatus === 'idle' && (
                                            <button
                                                onClick={openFileDialog}
                                                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                            >
                                                <FileText className="w-5 h-5" />
                                                Choose File
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center text-gray-500 text-sm mb-2">
                                Supported formats: CSV, Excel (.xlsx, .xls)
                            </div>

                            {/* File Requirements */}
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">File Requirements:</h3>
                                </div>

                                <div className="space-y-3 mb-2">
                                    <p className="text-sm">File should contain Citizen IDs (12-digit numbers)</p>
                                    <p className="text-sm">First column should be titled "CitizenID" or "Citizen_ID"</p>
                                    <p className="text-sm">Maximum 100 users per upload</p>
                                    <div className="flex items-start gap-3">
                                        <div>
                                            <p className="text-sm">Example format: CitizenID</p>
                                            <div className="bg-white rounded-lg p-3 border border-blue-200 font-mono text-sm">
                                                <div className="text-blue-600 font-semibold">123456789012</div>
                                                <div className="text-blue-600 font-semibold">234567890123</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={downloadSample}
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors shadow-md hover:shadow-lg"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Sample File
                                </button>
                            </div>

                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
