import React, { useState } from 'react';
import { X, Search, Grid, List, Download, Eye, Trash2 } from 'lucide-react';

interface Screenshot {
  id: string;
  deviceId: string;
  name: string;
  type: 'home' | 'settings' | 'channels' | 'apps' | 'guide' | 'no-signal' | 'error' | 'custom';
  url: string;
  timestamp: string;
  size: string;
}

interface ScreenshotBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectScreenshot: (screenshot: Screenshot) => void;
  currentDeviceId?: string;
}

// Screenshots будут загружаться из API, пока пустой массив
const mockScreenshots: Screenshot[] = [];

const typeColors = {
  home: 'bg-blue-100 text-blue-800',
  settings: 'bg-purple-100 text-purple-800',
  channels: 'bg-green-100 text-green-800',
  apps: 'bg-orange-100 text-orange-800',
  guide: 'bg-indigo-100 text-indigo-800',
  'no-signal': 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
  custom: 'bg-gray-100 text-gray-800'
};

const ScreenshotBrowser: React.FC<ScreenshotBrowserProps> = ({
  open,
  onOpenChange,
  onSelectScreenshot,
  currentDeviceId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Filter screenshots - will work with API data when implemented
  const filteredScreenshots = mockScreenshots.filter(screenshot => {
    const matchesSearch = screenshot.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDevice = !currentDeviceId || screenshot.deviceId === currentDeviceId;
    const matchesType = selectedType === 'all' || screenshot.type === selectedType;
    
    return matchesSearch && matchesDevice && matchesType;
  });

  const handleSelectScreenshot = () => {
    if (selectedScreenshot) {
      const screenshot = mockScreenshots.find(s => s.id === selectedScreenshot);
      if (screenshot) {
        onSelectScreenshot(screenshot);
        onOpenChange(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Screenshot Browser</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search screenshots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="home">Home</option>
              <option value="settings">Settings</option>
              <option value="channels">Channels</option>
              <option value="apps">Apps</option>
              <option value="guide">Guide</option>
              <option value="no-signal">No Signal</option>
              <option value="error">Error</option>
              <option value="custom">Custom</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Screenshots List */}
          <div className="flex-1 overflow-auto p-6">
            {filteredScreenshots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No screenshots found</p>
                <p className="text-sm">Screenshots will be loaded from API when implemented</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
                {filteredScreenshots.map((screenshot) => (
                  <div
                    key={screenshot.id}
                    onClick={() => setSelectedScreenshot(screenshot.id)}
                    className={`cursor-pointer border rounded-lg overflow-hidden transition-all ${
                      selectedScreenshot === screenshot.id 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <div>
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <img 
                            src={screenshot.url} 
                            alt={screenshot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm truncate">{screenshot.name}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${typeColors[screenshot.type]}`}>
                              {screenshot.type}
                            </span>
                            <span className="text-xs text-gray-500">{screenshot.size}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center p-3">
                        <div className="w-16 h-12 bg-gray-100 rounded flex-shrink-0 mr-3">
                          <img 
                            src={screenshot.url} 
                            alt={screenshot.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{screenshot.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${typeColors[screenshot.type]}`}>
                              {screenshot.type}
                            </span>
                            <span className="text-xs text-gray-500">{screenshot.size}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredScreenshots.length} screenshot{filteredScreenshots.length !== 1 ? 's' : ''} found
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelectScreenshot}
              disabled={!selectedScreenshot}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Select Screenshot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotBrowser;
