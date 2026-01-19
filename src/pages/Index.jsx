import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Settings as SettingsIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import { uploadCSV, deleteAllRows, getRowCount } from '../utils/supabaseOperations';
import { toast } from 'sonner';
import Papa from 'papaparse';
import SettingsModal from '../components/SettingsModal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    maxRows: 1000
  });

  useEffect(() => {
    const fetchRowCount = async () => {
      try {
        const count = await getRowCount();
        setRowCount(count);
      } catch (error) {
        console.error('Error fetching row count:', error);
      }
    };

    fetchRowCount();

    const savedMaxRows = localStorage.getItem('maxRows');
    if (savedMaxRows) {
      setSettings(prev => ({
        ...prev,
        maxRows: savedMaxRows
      }));
    }
  }, []);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile) => {
    setIsUploading(true);
    try {
      const result = await new Promise((resolve, reject) => {
        Papa.parse(selectedFile, {
          header: true,
          complete: resolve,
          error: reject
        });
      });

      const limitedData = result.data.slice(0, settings.maxRows);
      await uploadCSV(limitedData);
      toast.success(`Successfully uploaded ${limitedData.length} rows`);
      
      // Update row count
      const count = await getRowCount();
      setRowCount(count);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
    }
    setIsUploading(false);
  };

  const handleDeleteAllRows = async () => {
    setIsDeleting(true);
    try {
      await deleteAllRows();
      toast.success('All rows deleted successfully');
      setRowCount(0);
    } catch (error) {
      console.error('Error deleting rows:', error);
      toast.error('Failed to delete rows');
    }
    setIsDeleting(false);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('maxRows', newSettings.maxRows);
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Admin Dashboard</h1>
          <Link to="/">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-blue-700">Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Current database has <span className="font-semibold text-blue-600">{rowCount}</span> visitor records.</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <div className="flex gap-4 w-full justify-center">
              <Button
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="flex items-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={true}
                      variant="destructive"
                      className="flex items-center opacity-60 cursor-not-allowed"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="flex items-center">
                        Delete All Rows
                        <AlertCircle className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete functionality is disabled in this POC</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="outline"
                className="flex items-center"
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                Data Import Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-blue-700">CSV Upload Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">The CSV file should have the following columns:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li><span className="font-semibold">visitor_id</span>: Unique identifier for each visitor</li>
              <li><span className="font-semibold">timestamp</span>: Date and time of the visit (format: YYYY-MM-DD HH:MM:SS)</li>
              <li><span className="font-semibold">camera_id</span>: ID of the camera that captured the visitor</li>
              <li><span className="font-semibold">age_group</span>: Age group of the visitor (e.g., 18-24, 25-34, etc.)</li>
              <li><span className="font-semibold">gender</span>: Gender of the visitor</li>
              <li><span className="font-semibold">visit_duration</span>: Duration of the visit in seconds</li>
            </ul>
            <p className="text-gray-600">The system will import up to {settings.maxRows} rows from the CSV file. You can change this limit in the Data Import Settings.</p>
          </CardContent>
        </Card>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsChange}
        settings={settings}
        type="dataImport"
      />
    </div>
  );
};

export default Index;