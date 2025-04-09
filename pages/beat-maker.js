import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import MidiConnector from '../components/MidiConnector';
import Controls from '../components/Controls';
import SoundUploader from '../components/SoundUploader';

// Dynamically import components that rely on browser APIs
const DynamicPadGrid = dynamic(() => import('../components/PadGrid'), { ssr: false });
const DynamicSequencer = dynamic(() => import('../components/Sequencer'), { ssr: false });

export default function BeatMaker() {
  // Check for browser Web MIDI API support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.requestMIDIAccess) {
      alert('Your browser does not support WebMIDI. Please use Chrome, Edge, or Opera for the best experience.');
    }
  }, []);

  return (
    <Layout title="Beat Maker | Maschine Web Companion">
      <h1 className="text-2xl font-medium text-gray-100 mb-8">Beat Maker Studio</h1>
      
      {/* MIDI connection status and selector */}
      <MidiConnector />
      
      {/* Main controls (save, settings, etc.) */}
      <Controls />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="animate-fadeIn">
          {/* Pad grid for visualizing and interacting with Maschine pads */}
          <h2 className="text-lg font-medium text-gray-100 mb-5">Pad Grid</h2>
          <DynamicPadGrid />
        </div>
        
        <div className="animate-fadeIn" style={{animationDelay: "50ms"}}>
          {/* Sound assignment section */}
          <SoundUploader />
          
          {/* Sequencer for creating patterns */}
          <DynamicSequencer />
        </div>
      </div>
      
      <div className="mt-10 p-6 bg-surface rounded-xl border border-zinc-800 shadow-lg animate-fadeIn" style={{animationDelay: "100ms"}}>
        <h2 className="text-lg font-medium text-gray-100 mb-4">Tips</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
          <li>Connect your Maschine Mikro MK3 controller before starting</li>
          <li>Assign sounds to pads using the Sound Mapping section or <span className="text-accent font-medium">drag and drop audio files directly onto pads</span></li>
          <li>Click on pads with your mouse to test sounds (or use your Maschine controller)</li>
          <li>Hit Record and play your pads to create a sequence</li>
          <li>Adjust BPM in the Sequencer section or Settings panel</li>
          <li>Save your project to browser storage for later use</li>
        </ul>
      </div>
    </Layout>
  );
}