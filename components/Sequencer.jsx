import { useEffect, useRef, useState } from 'react';
import useStore from '../utils/store';
import { createAudioContext, loadSound, playSound } from '../utils/audio';

export default function Sequencer() {
  const isPlaying = useStore(state => state.isPlaying);
  const isRecording = useStore(state => state.isRecording);
  const bpm = useStore(state => state.bpm);
  const currentBeat = useStore(state => state.currentBeat);
  const sequence = useStore(state => state.sequence);
  const sounds = useStore(state => state.sounds);
  const getBuffer = useStore(state => state.getBuffer);
  const setBuffer = useStore(state => state.setBuffer);
  const updateSequenceStep = useStore(state => state.updateSequenceStep);
  
  const setCurrentBeat = useStore(state => state.setCurrentBeat);
  const togglePlaying = useStore(state => state.togglePlaying);
  const toggleRecording = useStore(state => state.toggleRecording);
  const setBpm = useStore(state => state.setBpm);
  const clearSequence = useStore(state => state.clearSequence);
  
  // UI state for interactions
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [quantizationLevel, setQuantizationLevel] = useState('16n'); // '4n', '8n', '16n'
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Reference to audio context
  const audioContextRef = useRef(null);
  // Reference to sequencer timer
  const timerRef = useRef(null);
  // Metronome sounds
  const metronomeBufferRef = useRef(null);
  // Track the last scheduled time
  const lastScheduledTimeRef = useRef(0);
  // Track the active notes
  const activeNotesRef = useRef({});
  
  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
      
      // Load metronome sound
      loadSound(audioContextRef.current, '/sounds/hihat-closed.wav')
        .then(buffer => {
          metronomeBufferRef.current = buffer;
        })
        .catch(err => console.error("Failed to load metronome sound:", err));
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle playing state changes
  useEffect(() => {
    if (isPlaying) {
      // Calculate interval based on BPM and quantization
      const stepTimeMs = getStepTime();
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start the sequencer
      timerRef.current = setInterval(() => {
        setCurrentBeat(prevBeat => {
          const nextBeat = (prevBeat + 1) % 16;
          
          // Play sounds for the current beat
          playBeat(nextBeat);
          
          return nextBeat;
        });
      }, stepTimeMs);
    } else {
      // Stop the sequencer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, bpm, setCurrentBeat, quantizationLevel]);
  
  // Get step time in milliseconds based on BPM and quantization
  const getStepTime = () => {
    const beatsPerSecond = bpm / 60;
    const secondsPerBeat = 1 / beatsPerSecond;
    
    switch (quantizationLevel) {
      case '4n': // Quarter notes
        return secondsPerBeat * 1000;
      case '8n': // Eighth notes
        return secondsPerBeat * 500;
      case '16n': // Sixteenth notes
      default:
        return secondsPerBeat * 250;
    }
  };
  
  // Play all sounds for the current beat
  const playBeat = (beat) => {
    if (!audioContextRef.current) return;
    
    // Resume audio context if it's suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Play metronome if enabled (on quarter notes)
    if (metronomeEnabled && beat % 4 === 0 && metronomeBufferRef.current) {
      // Accent the first beat of the bar
      const volume = beat === 0 ? 0.4 : 0.2;
      playSound(audioContextRef.current, metronomeBufferRef.current, { volume });
    }
    
    // Play each pad sound if velocity > 0
    sequence.forEach((padSequence, padIndex) => {
      const velocity = padSequence[beat];
      if (velocity > 0) {
        const soundUrl = sounds[padIndex];
        if (soundUrl) {
          // Get cached buffer or load new one
          const buffer = getBuffer(soundUrl);
          if (buffer) {
            const volume = velocity / 127; // Convert to volume (0-1)
            playSound(audioContextRef.current, buffer, { volume });
          } else {
            // Load and cache the buffer if not already loaded
            loadSound(audioContextRef.current, soundUrl)
              .then(newBuffer => {
                setBuffer(soundUrl, newBuffer);
                const volume = velocity / 127;
                playSound(audioContextRef.current, newBuffer, { volume });
              })
              .catch(error => console.error(`Failed to load sound: ${error}`));
          }
        }
      }
    });
  };
  
  // Handle BPM change
  const handleBpmChange = (e) => {
    setBpm(parseInt(e.target.value, 10));
  };
  
  // Toggle a step in the sequence grid manually
  const toggleStep = (padIndex, stepIndex) => {
    // Get current velocity (0 if unset)
    const currentVelocity = sequence[padIndex][stepIndex];
    
    // Toggle between 0 and 100 (medium velocity)
    const newVelocity = currentVelocity > 0 ? 0 : 100;
    
    // Update the sequence
    updateSequenceStep(padIndex, stepIndex, newVelocity);
    
    // If step is being turned on, play the sound for immediate feedback
    if (newVelocity > 0 && sounds[padIndex] && audioContextRef.current) {
      const buffer = getBuffer(sounds[padIndex]);
      if (buffer) {
        playSound(audioContextRef.current, buffer, { volume: newVelocity / 127 });
      }
    }
  };
  
  // Handle quantization level change
  const handleQuantizationChange = (level) => {
    setQuantizationLevel(level);
    
    // If playing, restart the timer with the new quantization
    if (isPlaying) {
      clearInterval(timerRef.current);
      const stepTimeMs = getStepTime();
      timerRef.current = setInterval(() => {
        setCurrentBeat(prevBeat => {
          const nextBeat = (prevBeat + 1) % 16;
          playBeat(nextBeat);
          return nextBeat;
        });
      }, stepTimeMs);
    }
  };
  
  // Clear a single track
  const clearTrack = (padIndex) => {
    if (window.confirm(`Clear all steps for pad ${padIndex + 1}?`)) {
      const newSequence = [...sequence];
      newSequence[padIndex] = Array(16).fill(0);
      useStore.setState({ sequence: newSequence });
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Sequencer</h2>
        <button 
          className="text-sm text-gray-400 hover:text-white"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold mb-2">Quantization</h3>
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 text-xs rounded ${quantizationLevel === '4n' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
                  onClick={() => handleQuantizationChange('4n')}
                >
                  1/4
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded ${quantizationLevel === '8n' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
                  onClick={() => handleQuantizationChange('8n')}
                >
                  1/8
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded ${quantizationLevel === '16n' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
                  onClick={() => handleQuantizationChange('16n')}
                >
                  1/16
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold mb-2">Metronome</h3>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="metronome" 
                  className="mr-2"
                  checked={metronomeEnabled}
                  onChange={() => setMetronomeEnabled(!metronomeEnabled)}
                />
                <label htmlFor="metronome" className="text-sm">Enable Metronome</label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Transport Controls */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          className={`btn ${isPlaying ? 'bg-yellow-500 text-black' : ''}`}
          onClick={togglePlaying}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        
        <button 
          className={`btn ${isRecording ? 'bg-red-600 text-white' : ''}`}
          onClick={toggleRecording}
        >
          {isRecording ? 'Recording...' : 'Record'}
        </button>
        
        <button 
          className="btn"
          onClick={clearSequence}
        >
          Clear
        </button>
        
        <div className="flex items-center ml-auto">
          <label htmlFor="bpm" className="mr-2 text-sm">BPM:</label>
          <input
            id="bpm"
            type="number"
            min="40"
            max="240"
            value={bpm}
            onChange={handleBpmChange}
            className="w-16 p-1 text-center bg-gray-700 border border-gray-600 rounded"
          />
        </div>
      </div>
      
      {/* Sequencer Grid */}
      <div className="overflow-x-auto">
        <div className="sequencer-grid w-full min-w-[600px] bg-gray-800 rounded-lg border border-gray-700 p-3">
          {/* Beat markers */}
          <div className="grid grid-cols-16 gap-1 mb-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i} 
                className={`text-center text-xs p-1 ${i % 4 === 0 ? 'font-bold' : 'text-gray-400'} ${currentBeat === i ? 'bg-yellow-500 text-black rounded' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Sequence rows */}
          <div className="space-y-1">
            {sequence.map((padSequence, padIndex) => {
              const hasSound = !!sounds[padIndex];
              const padName = hasSound ? sounds[padIndex].split('/').pop().replace(/\.(wav|mp3)$/, '') : '';
              
              return (
                <div key={padIndex} className="grid grid-cols-16 gap-1">
                  {/* Pad label */}
                  <div className="col-span-2 flex items-center gap-1">
                    <div 
                      className={`w-8 text-center text-xs rounded-sm py-1 ${hasSound ? 'bg-gray-700' : 'bg-gray-800 text-gray-500'}`}
                      title={padName}
                    >
                      {padIndex + 1}
                    </div>
                    
                    {hasSound && (
                      <button 
                        className="text-xs text-gray-400 hover:text-white rounded-full p-1"
                        onClick={() => clearTrack(padIndex)}
                        title="Clear track"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Steps */}
                  <div className="col-span-14 grid grid-cols-16 gap-1">
                    {padSequence.map((velocity, stepIndex) => (
                      <div
                        key={stepIndex}
                        className={`h-8 rounded-sm cursor-pointer ${
                          velocity > 0
                            ? 'bg-yellow-500 hover:bg-yellow-400' 
                            : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                        } ${
                          currentBeat === stepIndex ? 'ring-2 ring-white' : ''
                        }`}
                        style={{
                          opacity: velocity > 0 ? velocity / 127 + 0.3 : 1
                        }}
                        onClick={() => toggleStep(padIndex, stepIndex)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Helper text */}
      <div className="mt-4 text-sm text-gray-400">
        <p>Click on grid cells to add/remove notes. Record mode will capture pad hits and quantize them to the grid.</p>
      </div>
      
      <style jsx>{`
        .grid-cols-16 {
          grid-template-columns: repeat(16, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
}