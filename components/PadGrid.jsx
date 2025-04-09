import { useEffect, useRef, useState } from 'react';
import useStore from '../utils/store';
import { createAudioContext, loadSound, playSound } from '../utils/audio';

export default function PadGrid() {
  const activePad = useStore(state => state.activePad);
  const sounds = useStore(state => state.sounds);
  const assignSound = useStore(state => state.assignSound);
  const setBuffer = useStore(state => state.setBuffer);
  const getBuffer = useStore(state => state.getBuffer);
  const loadSoundsFromStorage = useStore(state => state.loadSoundsFromStorage);
  
  // Track active states with animations
  const [padStates, setPadStates] = useState(Array(16).fill({
    isActive: false,
    isDropTarget: false,
    animationScale: 1
  }));
  
  // Track pad animation frames
  const animationFrames = useRef([]);
  
  // Reference to audio context
  const audioContextRef = useRef(null);
  
  // Initialize
  useEffect(() => {
    // Load sounds from local storage
    loadSoundsFromStorage();
    
    // Audio context must be created after user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = createAudioContext();
        
        // Pre-load assigned sounds
        sounds.forEach(async (soundUrl, index) => {
          if (soundUrl && !getBuffer(soundUrl)) {
            try {
              const buffer = await loadSound(audioContextRef.current, soundUrl);
              setBuffer(soundUrl, buffer);
            } catch (error) {
              console.error(`Failed to load sound ${index}:`, error);
            }
          }
        });
      }
    };
    
    window.addEventListener('click', initAudio);
    
    return () => {
      window.removeEventListener('click', initAudio);
      // Cancel all animations on cleanup
      animationFrames.current.forEach(frame => cancelAnimationFrame(frame));
    };
  }, []);

  // React to active pad changes from MIDI
  useEffect(() => {
    if (activePad) {
      const index = activePad.index;
      const velocity = activePad.velocity;
      
      // Cancel any existing animation for this pad
      if (animationFrames.current[index]) {
        cancelAnimationFrame(animationFrames.current[index]);
      }
      
      // Trigger animation
      if (velocity > 0) {
        // Start pad animation
        animatePad(index, velocity);
        
        // Play associated sound
        const soundUrl = sounds[index];
        if (soundUrl && audioContextRef.current) {
          playPadSound(soundUrl, velocity);
        }
      }
    }
  }, [activePad, sounds]);
  
  // Animate a pad hit with velocity-based intensity
  const animatePad = (index, velocity) => {
    const normalizedVelocity = velocity / 127;
    const startTime = performance.now();
    const duration = 300 + normalizedVelocity * 200; // 300-500ms based on velocity
    const minScale = 0.92 - normalizedVelocity * 0.07; // Scale between 0.92-0.85 based on velocity
    
    // Create a new animation for this pad
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out function
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);
      
      // Scale starts small, returns to 1
      const currentScale = progress < 0.5 
        ? 1 - easedProgress * (1 - minScale) * 2  // First half: scale down
        : minScale + easedProgress * (1 - minScale) * 2;  // Second half: scale up
      
      // Update pad state with animation values
      setPadStates(prev => {
        const newStates = [...prev];
        newStates[index] = {
          ...newStates[index],
          isActive: progress < 1,
          animationScale: currentScale
        };
        return newStates;
      });
      
      // Continue animation until complete
      if (progress < 1) {
        animationFrames.current[index] = requestAnimationFrame(animate);
      } else {
        animationFrames.current[index] = null;
      }
    };
    
    // Start animation
    animationFrames.current[index] = requestAnimationFrame(animate);
  };
  
  // Play sound with appropriate volume
  const playPadSound = (soundUrl, velocity) => {
    // Resume audio context if it's suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Get cached buffer or load new one
    const buffer = getBuffer(soundUrl);
    if (buffer) {
      const volume = velocity / 127; // Convert MIDI velocity to volume
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
  };
  
  // Handle file drop on a pad
  const handleDrop = (e, padIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drop target state
    setPadStates(prev => {
      const newStates = [...prev];
      newStates[padIndex] = { ...newStates[padIndex], isDropTarget: false };
      return newStates;
    });
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Check if it's an audio file
      if (file.type.startsWith('audio/')) {
        const objectUrl = URL.createObjectURL(file);
        
        // Assign the sound to the pad
        assignSound(padIndex, objectUrl);
        
        // Animate the pad to give feedback
        animatePad(padIndex, 100); // Medium velocity animation
        
        // Preload the sound
        if (audioContextRef.current) {
          loadSound(audioContextRef.current, objectUrl)
            .then(buffer => {
              setBuffer(objectUrl, buffer);
              // Play a preview of the sound
              playSound(audioContextRef.current, buffer, { volume: 0.7 });
            })
            .catch(error => {
              console.error('Failed to load dropped sound:', error);
            });
        }
      }
    }
  };
  
  // Handle dragover event to provide visual feedback
  const handleDragOver = (e, padIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show this pad as a drop target
    setPadStates(prev => {
      const newStates = [...prev];
      newStates[padIndex] = { ...newStates[padIndex], isDropTarget: true };
      return newStates;
    });
  };
  
  // Handle drag leave
  const handleDragLeave = (e, padIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove drop target styling
    setPadStates(prev => {
      const newStates = [...prev];
      newStates[padIndex] = { ...newStates[padIndex], isDropTarget: false };
      return newStates;
    });
  };
  
  // Trigger a pad programmatically (for testing without MIDI)
  const handlePadClick = (index) => {
    // Create a synthetic "note on" event with medium velocity
    const velocity = 80;
    
    // Animate the pad
    animatePad(index, velocity);
    
    // Play the sound if assigned
    const soundUrl = sounds[index];
    if (soundUrl && audioContextRef.current) {
      playPadSound(soundUrl, velocity);
    }
  };

  return (
    <div className="aspect-square w-full max-w-xl mx-auto grid grid-cols-4 gap-4 p-6 bg-surface rounded-xl border border-zinc-800 shadow-lg animate-fadeIn">
      {Array.from({ length: 16 }).map((_, index) => {
        const hasSound = !!sounds[index];
        const padState = padStates[index];
        
        // Get the last part of the URL for display
        const soundLabel = hasSound 
          ? sounds[index].split('/').pop().replace(/\.(wav|mp3)$/, '') 
          : 'Drop sound here';
        
        // Style based on pad state
        const padClasses = `
          pad flex items-center justify-center
          ${padState.isActive ? 'active' : ''} 
          ${padState.isDropTarget ? 'border-accent border-opacity-70 border-dashed' : 
            hasSound ? 'border-accent border-opacity-40' : 'border-zinc-700'}
          ${hasSound ? 'bg-zinc-700' : ''}
          cursor-pointer
        `;
        
        return (
          <div 
            key={index}
            className={padClasses}
            style={{ 
              transform: `scale(${padState.animationScale})`,
              boxShadow: padState.isActive ? '0 0 16px rgba(59, 130, 246, 0.5)' : 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
            }}
            onClick={() => handlePadClick(index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={(e) => handleDragLeave(e, index)}
          >
            <div className="text-center w-full py-3">
              <div className="text-sm font-medium mb-2">{index + 1}</div>
              <div className={`text-xs truncate max-w-full px-3 ${hasSound ? 'text-accent font-medium' : 'text-gray-400'}`}>
                {soundLabel}
              </div>
              {!hasSound && (
                <div className="mt-2 text-[10px] text-gray-500">
                  Drag & drop audio file
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}