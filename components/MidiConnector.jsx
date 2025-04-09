import { useEffect, useState } from 'react';
import useMidi from '../hooks/useMidi';
import useStore from '../utils/store';

export default function MidiConnector() {
  const { isSupported, isConnected, midiInputs, selectedInput, error, connectToInput, lastMidiMessage } = useMidi();
  const [showDevices, setShowDevices] = useState(false);
  const setMidiConnected = useStore(state => state.setMidiConnected);
  const setActivePad = useStore(state => state.setActivePad);
  
  // Update app state when MIDI connection changes
  useEffect(() => {
    setMidiConnected(isConnected);
  }, [isConnected, setMidiConnected]);
  
  // Listen for MIDI pad hits
  useEffect(() => {
    if (lastMidiMessage) {
      const { note, velocity } = lastMidiMessage;
      
      // Note ON messages (status 144) for pads
      if (lastMidiMessage.type === 'noteOn') {
        setActivePad(note, velocity);
      }
    }
  }, [lastMidiMessage, setActivePad]);
  
  // Show error if WebMIDI is not supported
  if (!isSupported) {
    return (
      <div className="p-4 mb-4 bg-red-800 bg-opacity-25 border border-red-700 rounded-md">
        <h3 className="font-bold text-red-400">MIDI Not Supported</h3>
        <p className="text-sm">
          Your browser doesn't support WebMIDI. Please try Chrome, Edge, or Opera.
        </p>
      </div>
    );
  }
  
  // Show error message if we have one
  if (error) {
    return (
      <div className="p-4 mb-4 bg-red-800 bg-opacity-25 border border-red-700 rounded-md">
        <h3 className="font-bold text-red-400">MIDI Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 mb-4 bg-gray-800 rounded-md border border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h3 className="font-bold mb-1">MIDI Connection</h3>
          <p className="text-sm">
            {isConnected 
              ? <span className="text-green-400">✓ Connected to {midiInputs.find(i => i.id === selectedInput)?.name || 'MIDI device'}</span>
              : <span className="text-yellow-400">⚠ No MIDI device connected</span>
            }
          </p>
        </div>
        
        <div>
          <button 
            className="btn"
            onClick={() => setShowDevices(!showDevices)}
          >
            {showDevices ? 'Hide Devices' : 'Show Devices'}
          </button>
        </div>
      </div>
      
      {showDevices && (
        <div className="mt-4">
          <h4 className="text-sm font-bold mb-2">Available MIDI Devices:</h4>
          {midiInputs.length === 0 ? (
            <p className="text-sm text-gray-400">No MIDI devices detected. Please connect a device and refresh.</p>
          ) : (
            <ul className="space-y-2">
              {midiInputs.map(input => (
                <li 
                  key={input.id}
                  className={`text-sm p-2 rounded cursor-pointer ${selectedInput === input.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                  onClick={() => connectToInput(input.id)}
                >
                  {input.name} ({input.manufacturer})
                  {selectedInput === input.id && <span className="ml-2 text-green-400">✓</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}