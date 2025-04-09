import { useState, useEffect, useCallback } from 'react';

export default function useMidi() {
  const [midiAccess, setMidiAccess] = useState(null);
  const [midiInputs, setMidiInputs] = useState([]);
  const [selectedInput, setSelectedInput] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMidiMessage, setLastMidiMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize MIDI access
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      setError('WebMIDI is not supported in this browser');
      return;
    }
    
    navigator.requestMIDIAccess({ sysex: false })
      .then(access => {
        setMidiAccess(access);
        
        // Listen to connection changes
        access.addEventListener('statechange', handleStateChange);
        
        // Get initial inputs
        updateDevices(access);
      })
      .catch(err => {
        setError(`MIDI access request failed: ${err.message}`);
      });
      
    return () => {
      if (midiAccess) {
        midiAccess.removeEventListener('statechange', handleStateChange);
      }
    };
  }, []);
  
  // Auto-select Maschine Mikro MK3 when available
  useEffect(() => {
    if (midiInputs.length) {
      const maschineInput = midiInputs.find(input => 
        input.name.toLowerCase().includes('maschine') && 
        input.name.toLowerCase().includes('mikro'));
        
      if (maschineInput) {
        setSelectedInput(maschineInput.id);
        connectToInput(maschineInput.id);
      }
    }
  }, [midiInputs]);
  
  // Connect to selected input and listen for MIDI messages
  useEffect(() => {
    if (!midiAccess || !selectedInput) return;
    
    const input = midiAccess.inputs.get(selectedInput);
    if (input) {
      input.addEventListener('midimessage', handleMidiMessage);
      setIsConnected(true);
      
      return () => {
        input.removeEventListener('midimessage', handleMidiMessage);
        setIsConnected(false);
      };
    }
  }, [midiAccess, selectedInput]);
  
  // Update available devices list when connections change
  const updateDevices = useCallback((access) => {
    if (!access) return;
    
    const inputs = [];
    access.inputs.forEach(input => {
      inputs.push({
        id: input.id,
        name: input.name || `MIDI Input ${input.id}`,
        manufacturer: input.manufacturer || 'Unknown',
      });
    });
    
    setMidiInputs(inputs);
  }, []);
  
  // Handle state changes (device connect/disconnect)
  const handleStateChange = useCallback((event) => {
    updateDevices(event.target);
    console.log(`MIDI connection for ${event.port.name} changed: ${event.port.state}`);
    
    // If current device disconnected, reset state
    if (event.port.state === 'disconnected' && event.port.id === selectedInput) {
      setSelectedInput(null);
      setIsConnected(false);
    }
  }, [selectedInput, updateDevices]);
  
  // Process incoming MIDI messages
  const handleMidiMessage = useCallback((message) => {
    const [status, data1, data2] = message.data;
    
    // Console log MIDI data for debugging
    console.log('MIDI data:', status, data1, data2);
    
    // We'll focus on Note On events (144) for pad hits
    if (status === 144) {
      const padInfo = {
        type: 'noteOn',
        note: data1,
        velocity: data2,
        timestamp: message.timeStamp,
      };
      
      setLastMidiMessage(padInfo);
    }
  }, []);
  
  // Connect to a specific MIDI input by ID
  const connectToInput = useCallback((inputId) => {
    if (!midiAccess || !inputId) return;
    
    // Disconnect from current input if any
    if (selectedInput) {
      const currentInput = midiAccess.inputs.get(selectedInput);
      if (currentInput) {
        currentInput.removeEventListener('midimessage', handleMidiMessage);
      }
    }
    
    // Connect to new input
    const newInput = midiAccess.inputs.get(inputId);
    if (newInput) {
      newInput.addEventListener('midimessage', handleMidiMessage);
      setSelectedInput(inputId);
      setIsConnected(true);
      return true;
    }
    
    return false;
  }, [midiAccess, selectedInput, handleMidiMessage]);
  
  return {
    isSupported: !!navigator.requestMIDIAccess,
    isConnected,
    midiInputs,
    selectedInput,
    lastMidiMessage,
    error,
    connectToInput,
  };
}