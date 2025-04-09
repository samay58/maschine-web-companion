// Create and initialize the audio context
const createAudioContext = () => {
  // AudioContext must be initialized after user interaction
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
};

// Buffer cache to avoid reloading sounds
const soundBuffers = new Map();

// Load an audio file and decode it to an AudioBuffer
const loadSound = async (audioContext, url) => {
  // Check if the sound is already loaded
  if (soundBuffers.has(url)) {
    return soundBuffers.get(url);
  }
  
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Cache the decoded buffer
    soundBuffers.set(url, audioBuffer);
    
    return audioBuffer;
  } catch (error) {
    console.error(`Error loading sound from ${url}:`, error);
    throw error;
  }
};

// Play a loaded sound
const playSound = (audioContext, buffer, options = {}) => {
  if (!buffer) return null;
  
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  
  // Create gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.value = options.volume || 1.0;
  
  // Connect the nodes
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Start playback
  source.start(0, options.offset || 0);
  
  return {
    source,
    gainNode,
    stop: () => source.stop(),
  };
};

// Load and immediately play a sound
const playSoundFromUrl = async (audioContext, url, options = {}) => {
  try {
    const buffer = await loadSound(audioContext, url);
    return playSound(audioContext, buffer, options);
  } catch (error) {
    console.error('Error playing sound:', error);
    return null;
  }
};

// Create an oscillator for generating tones (useful for testing without samples)
const createTone = (audioContext, options = {}) => {
  const { frequency = 440, type = 'sine', duration = 0.1, volume = 0.5 } = options;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  gainNode.gain.value = volume;
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Schedule envelope
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001, audioContext.currentTime + duration
  );
  
  // Start and stop
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  
  return {
    oscillator,
    gainNode,
  };
};

export {
  createAudioContext,
  loadSound,
  playSound,
  playSoundFromUrl,
  createTone,
};