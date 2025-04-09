import { create } from 'zustand';

// Map of MIDI notes to pad indexes for Maschine Mikro MK3
const MIDI_NOTE_TO_PAD_MAP = {
  12: 0,  13: 1,  14: 2,  15: 3,
  8: 4,   9: 5,   10: 6,  11: 7,
  4: 8,   5: 9,   6: 10,  7: 11,
  0: 12,  1: 13,  2: 14,  3: 15
};

// Storage keys
const STORAGE_KEYS = {
  SOUNDS: 'mwc_padSounds',
  SEQUENCE: 'mwc_sequence',
  BPM: 'mwc_bpm',
  PROJECTS: 'mwc_savedProjects'
};

const DEFAULT_PROJECT_NAME = 'Untitled Project';

const useStore = create((set, get) => ({
  // MIDI state
  midiConnected: false,
  activePad: null,
  
  // Sound mapping
  sounds: Array(16).fill(null),
  loadedBuffers: {},
  
  // Sequencer state
  isRecording: false,
  isPlaying: false,
  bpm: 120,
  currentBeat: 0,
  sequence: Array(16).fill().map(() => Array(16).fill(0)), // 16 pads x 16 steps
  
  // Project state
  currentProjectName: DEFAULT_PROJECT_NAME,
  savedProjects: [],
  
  // Initialize store
  init: () => {
    get().loadSoundsFromStorage();
    get().loadSequenceFromStorage();
    get().loadBpmFromStorage();
    get().loadSavedProjects();
  },
  
  // Actions for MIDI
  setMidiConnected: (connected) => set({ midiConnected: connected }),
  
  setActivePad: (midiNote, velocity) => {
    const padIndex = MIDI_NOTE_TO_PAD_MAP[midiNote];
    
    if (padIndex !== undefined) {
      set({ activePad: { index: padIndex, velocity } });
      
      // If recording, add to sequence at current beat
      const { isRecording, currentBeat, sequence } = get();
      if (isRecording && velocity > 0) {
        const newSequence = [...sequence];
        newSequence[padIndex][currentBeat] = velocity;
        set({ sequence: newSequence });
      }
      
      // Reset active pad after a short delay
      setTimeout(() => {
        if (get().activePad?.index === padIndex) {
          set({ activePad: null });
        }
      }, 100);
    }
  },
  
  // Actions for sound management
  assignSound: (padIndex, soundUrl) => {
    if (padIndex >= 0 && padIndex < 16) {
      const newSounds = [...get().sounds];
      newSounds[padIndex] = soundUrl;
      set({ sounds: newSounds });
      
      // Store in local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SOUNDS, JSON.stringify(newSounds));
      }
    }
  },
  
  loadSoundsFromStorage: () => {
    if (typeof window !== 'undefined') {
      const storedSounds = localStorage.getItem(STORAGE_KEYS.SOUNDS);
      if (storedSounds) {
        try {
          const sounds = JSON.parse(storedSounds);
          set({ sounds });
        } catch (e) {
          console.error('Failed to load sounds from storage', e);
        }
      }
    }
  },
  
  setBuffer: (soundUrl, buffer) => {
    set(state => ({
      loadedBuffers: { ...state.loadedBuffers, [soundUrl]: buffer }
    }));
  },
  
  getBuffer: (soundUrl) => get().loadedBuffers[soundUrl],
  
  // Actions for sequencer
  toggleRecording: () => {
    const isRecording = !get().isRecording;
    set({ isRecording });
    
    // If starting to record, also start playing if not already
    if (isRecording && !get().isPlaying) {
      get().togglePlaying();
    }
  },
  
  togglePlaying: () => {
    const isPlaying = !get().isPlaying;
    set({ isPlaying, currentBeat: 0 });
  },
  
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
  
  setBpm: (bpm) => {
    const newBpm = Math.max(40, Math.min(240, bpm));
    set({ bpm: newBpm });
    
    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BPM, newBpm.toString());
    }
  },
  
  loadBpmFromStorage: () => {
    if (typeof window !== 'undefined') {
      const storedBpm = localStorage.getItem(STORAGE_KEYS.BPM);
      if (storedBpm) {
        try {
          const bpm = parseInt(storedBpm, 10);
          if (!isNaN(bpm)) {
            set({ bpm });
          }
        } catch (e) {
          console.error('Failed to load BPM from storage', e);
        }
      }
    }
  },
  
  clearSequence: () => {
    set({ 
      sequence: Array(16).fill().map(() => Array(16).fill(0)),
      currentBeat: 0
    });
    
    // Clear sequence in local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.SEQUENCE);
    }
  },
  
  updateSequenceStep: (padIndex, stepIndex, velocity) => {
    if (
      padIndex >= 0 && padIndex < 16 &&
      stepIndex >= 0 && stepIndex < 16
    ) {
      const newSequence = [...get().sequence];
      newSequence[padIndex] = [...newSequence[padIndex]];
      newSequence[padIndex][stepIndex] = velocity;
      set({ sequence: newSequence });
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SEQUENCE, JSON.stringify(newSequence));
      }
    }
  },
  
  loadSequenceFromStorage: () => {
    if (typeof window !== 'undefined') {
      const storedSequence = localStorage.getItem(STORAGE_KEYS.SEQUENCE);
      if (storedSequence) {
        try {
          const sequence = JSON.parse(storedSequence);
          if (Array.isArray(sequence) && sequence.length === 16) {
            set({ sequence });
          }
        } catch (e) {
          console.error('Failed to load sequence from storage', e);
        }
      }
    }
  },
  
  // Project management
  setCurrentProjectName: (name) => {
    set({ currentProjectName: name || DEFAULT_PROJECT_NAME });
  },
  
  saveProject: (name) => {
    const projectName = name || get().currentProjectName || DEFAULT_PROJECT_NAME;
    
    const project = {
      name: projectName,
      date: new Date().toISOString(),
      sounds: get().sounds,
      sequence: get().sequence,
      bpm: get().bpm
    };
    
    // Update or add to saved projects
    const savedProjects = [...get().savedProjects];
    const existingIndex = savedProjects.findIndex(p => p.name === projectName);
    
    if (existingIndex >= 0) {
      savedProjects[existingIndex] = project;
    } else {
      savedProjects.push(project);
    }
    
    set({ 
      savedProjects,
      currentProjectName: projectName
    });
    
    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(savedProjects));
    }
    
    return projectName;
  },
  
  loadProject: (projectNameOrIndex) => {
    const { savedProjects } = get();
    
    if (!savedProjects.length) return false;
    
    let project;
    if (typeof projectNameOrIndex === 'number') {
      project = savedProjects[projectNameOrIndex];
    } else {
      project = savedProjects.find(p => p.name === projectNameOrIndex);
    }
    
    if (!project) return false;
    
    // Load project data
    set({
      sounds: project.sounds,
      sequence: project.sequence,
      bpm: project.bpm,
      currentProjectName: project.name
    });
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SOUNDS, JSON.stringify(project.sounds));
      localStorage.setItem(STORAGE_KEYS.SEQUENCE, JSON.stringify(project.sequence));
      localStorage.setItem(STORAGE_KEYS.BPM, project.bpm.toString());
    }
    
    return true;
  },
  
  deleteProject: (projectNameOrIndex) => {
    const { savedProjects, currentProjectName } = get();
    
    if (!savedProjects.length) return false;
    
    let indexToDelete;
    if (typeof projectNameOrIndex === 'number') {
      indexToDelete = projectNameOrIndex;
    } else {
      indexToDelete = savedProjects.findIndex(p => p.name === projectNameOrIndex);
    }
    
    if (indexToDelete < 0 || indexToDelete >= savedProjects.length) return false;
    
    const newProjects = [...savedProjects];
    const deletedProject = newProjects.splice(indexToDelete, 1)[0];
    
    set({ savedProjects: newProjects });
    
    // If we deleted the current project, reset the name
    if (deletedProject.name === currentProjectName) {
      set({ currentProjectName: DEFAULT_PROJECT_NAME });
    }
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(newProjects));
    }
    
    return true;
  },
  
  loadSavedProjects: () => {
    if (typeof window !== 'undefined') {
      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (storedProjects) {
        try {
          const projects = JSON.parse(storedProjects);
          if (Array.isArray(projects)) {
            set({ savedProjects: projects });
          }
        } catch (e) {
          console.error('Failed to load saved projects from storage', e);
        }
      }
    }
  },
  
  exportProject: () => {
    const project = {
      name: get().currentProjectName,
      date: new Date().toISOString(),
      sounds: get().sounds,
      sequence: get().sequence,
      bpm: get().bpm,
      version: '1.0.0'
    };
    
    return JSON.stringify(project, null, 2);
  },
  
  importProject: (jsonString) => {
    try {
      const project = JSON.parse(jsonString);
      
      // Validate project data
      if (!project.sounds || !project.sequence || !project.bpm) {
        throw new Error('Invalid project data');
      }
      
      // Load project data
      set({
        sounds: project.sounds,
        sequence: project.sequence,
        bpm: project.bpm,
        currentProjectName: project.name || 'Imported Project'
      });
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SOUNDS, JSON.stringify(project.sounds));
        localStorage.setItem(STORAGE_KEYS.SEQUENCE, JSON.stringify(project.sequence));
        localStorage.setItem(STORAGE_KEYS.BPM, project.bpm.toString());
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import project:', error);
      return false;
    }
  },
  
  // MIDI note to pad index mapping
  midiNoteToPadIndex: (note) => MIDI_NOTE_TO_PAD_MAP[note]
}));

export default useStore;