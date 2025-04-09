import { useState, useEffect, useRef } from 'react';
import useStore from '../utils/store';

export default function Controls() {
  const [showSettings, setShowSettings] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const bpm = useStore(state => state.bpm);
  const sounds = useStore(state => state.sounds);
  const sequence = useStore(state => state.sequence);
  const savedProjects = useStore(state => state.savedProjects);
  const currentProjectName = useStore(state => state.currentProjectName);
  
  const loadSavedProjects = useStore(state => state.loadSavedProjects);
  const clearSequence = useStore(state => state.clearSequence);
  const setBpm = useStore(state => state.setBpm);
  const setCurrentProjectName = useStore(state => state.setCurrentProjectName);
  const saveProject = useStore(state => state.saveProject);
  const loadProject = useStore(state => state.loadProject);
  const deleteProject = useStore(state => state.deleteProject);
  const exportProject = useStore(state => state.exportProject);
  const importProject = useStore(state => state.importProject);
  
  // Initialize store on component mount
  useEffect(() => {
    useStore.getState().init();
  }, []);
  
  const handleBpmChange = (e) => {
    setBpm(parseInt(e.target.value, 10));
  };

  const handleSaveProject = () => {
    const name = newProjectName || currentProjectName;
    const projectName = saveProject(name);
    
    setFeedback({ 
      message: `Project '${projectName}' saved successfully!`, 
      type: 'success' 
    });
    
    // Clear feedback after 3 seconds
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    
    // Reset form
    setNewProjectName('');
  };
  
  const handleLoadProject = (nameOrIndex) => {
    if (loadProject(nameOrIndex)) {
      setShowProjects(false);
      setFeedback({ 
        message: 'Project loaded successfully!', 
        type: 'success' 
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    } else {
      setFeedback({ 
        message: 'Failed to load project.', 
        type: 'error' 
      });
    }
  };
  
  const handleDeleteProject = (nameOrIndex) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      if (deleteProject(nameOrIndex)) {
        setFeedback({ 
          message: 'Project deleted successfully.', 
          type: 'success' 
        });
        
        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      } else {
        setFeedback({ 
          message: 'Failed to delete project.', 
          type: 'error' 
        });
      }
    }
  };

  const handleExport = () => {
    const exportString = exportProject();
    setExportData(exportString);
    
    // Select and focus the textarea for easy copying
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.select();
      }
    }, 100);
  };
  
  const handleImport = () => {
    if (!importData.trim()) {
      setFeedback({ 
        message: 'Please enter project data to import.', 
        type: 'error' 
      });
      return;
    }
    
    if (importProject(importData)) {
      setImportData('');
      setShowProjects(false);
      setFeedback({ 
        message: 'Project imported successfully!', 
        type: 'success' 
      });
    } else {
      setFeedback({ 
        message: 'Failed to import project. Invalid format.', 
        type: 'error' 
      });
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };
  
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contents = e.target.result;
        setImportData(contents);
      } catch (error) {
        console.error('Error reading file:', error);
        setFeedback({ 
          message: 'Error reading file.', 
          type: 'error' 
        });
      }
    };
    reader.readAsText(file);
  };
  
  const handleExportToFile = () => {
    const exportString = exportProject();
    const blob = new Blob([exportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProjectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mwc.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset everything? This will clear all sounds and patterns.')) {
      clearSequence();
      
      // Reset all sounds
      const emptySounds = Array(16).fill(null);
      useStore.setState({ sounds: emptySounds });
      localStorage.setItem('mwc_padSounds', JSON.stringify(emptySounds));
      
      setFeedback({ 
        message: 'Project reset successfully.', 
        type: 'success' 
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-grow flex gap-4">
          <button 
            className={`btn ${showProjects ? 'btn-primary' : ''}`}
            onClick={() => {
              setShowProjects(!showProjects);
              setShowSettings(false);
              // Load fresh projects data
              if (!showProjects) {
                loadSavedProjects();
              }
            }}
          >
            Projects
          </button>
          
          <button 
            className={`btn ${showSettings ? 'btn-primary' : ''}`}
            onClick={() => {
              setShowSettings(!showSettings);
              setShowProjects(false);
            }}
          >
            Settings
          </button>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-300 mr-2">Current project:</span>
          <span className="font-medium text-white">{currentProjectName}</span>
        </div>
      </div>
      
      {/* Feedback message */}
      {feedback.message && (
        <div className={`mb-6 p-4 rounded-lg shadow-md animate-fadeIn
          ${feedback.type === 'success' ? 'bg-green-900 bg-opacity-30 text-green-200 border border-green-800' : 
                                         'bg-red-900 bg-opacity-30 text-red-200 border border-red-800'}`}>
          {feedback.message}
        </div>
      )}
      
      {/* Project Manager */}
      {showProjects && (
        <div className="w-full bg-surface rounded-xl border border-zinc-800 p-6 mb-8 shadow-lg animate-fadeIn">
          <h3 className="font-medium text-lg mb-6 text-gray-100">Project Manager</h3>
          
          <div className="mb-8">
            <h4 className="text-sm font-medium mb-3 text-gray-200">Save Project</h4>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-grow p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button 
                className="btn btn-primary"
                onClick={handleSaveProject}
              >
                Save
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <h4 className="text-sm font-medium mb-3 text-gray-200">Saved Projects</h4>
            {savedProjects.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 border border-zinc-800 rounded-lg bg-zinc-900 bg-opacity-50">No saved projects yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
                {savedProjects.map((project, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors shadow-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-100">{project.name}</span>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(project.date).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        className="text-sm px-3 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
                        onClick={() => handleLoadProject(index)}
                      >
                        Load
                      </button>
                      <button 
                        className="text-sm px-3 py-2 bg-zinc-700 hover:bg-red-900 text-gray-200 rounded-lg transition-colors shadow-sm"
                        onClick={() => handleDeleteProject(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-200">Import/Export</h4>
              <div className="flex gap-3">
                <button 
                  className="text-sm px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg shadow-sm transition-colors"
                  onClick={handleExport}
                >
                  Export
                </button>
                <button 
                  className="text-sm px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg shadow-sm transition-colors"
                  onClick={handleExportToFile}
                >
                  Export to File
                </button>
              </div>
            </div>
            
            {exportData ? (
              <div className="mb-4">
                <textarea
                  ref={textAreaRef}
                  value={exportData}
                  readOnly
                  className="w-full h-36 p-3 bg-zinc-900 border border-zinc-700 rounded-lg font-mono text-xs shadow-inner"
                  onClick={(e) => e.target.select()}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Copy this data to save your project or export it to a file above.
                </p>
              </div>
            ) : (
              <div className="mb-4 flex gap-3">
                <input
                  type="text"
                  placeholder="Paste project data here to import"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="flex-grow p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button 
                  className="btn bg-zinc-800 hover:bg-zinc-700"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.mwc.json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  File
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importData.trim()}
                >
                  Import
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full bg-surface rounded-xl border border-zinc-800 p-6 mb-8 shadow-lg animate-fadeIn">
          <h3 className="font-medium text-lg mb-6 text-gray-100">Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <label htmlFor="settings-bpm" className="w-32 text-gray-300">BPM:</label>
              <div className="flex-grow px-1">
                <input
                  id="settings-bpm"
                  type="range"
                  min="40"
                  max="240"
                  value={bpm}
                  onChange={handleBpmChange}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              <span className="ml-4 w-12 text-center font-medium text-accent">{bpm}</span>
            </div>
            
            {/* Project Stats */}
            <div className="border-t border-zinc-800 pt-6 mt-6">
              <h4 className="text-sm font-medium mb-4 text-gray-200">Project Stats</h4>
              <div className="bg-zinc-800 rounded-lg p-4 shadow-inner">
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Pads with sounds:</span> 
                    <span className="font-medium text-white">{sounds.filter(s => !!s).length} / 16</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Pattern steps used:</span> 
                    <span className="font-medium text-white">{sequence.reduce((count, padSteps) => count + padSteps.filter(v => v > 0).length, 0)}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between">
              <button
                className="btn px-6"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
              
              <button
                className="btn bg-red-900 hover:bg-red-800 px-6"
                onClick={handleResetAll}
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}