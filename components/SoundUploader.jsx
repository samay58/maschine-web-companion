import { useState, useEffect } from 'react';
import useStore from '../utils/store';
import { createAudioContext, loadSound, playSound } from '../utils/audio';

export default function SoundUploader() {
  const [selectedPad, setSelectedPad] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [demoSounds, setDemoSounds] = useState([]);
  const [demoSoundsLoaded, setDemoSoundsLoaded] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(null);
  
  const sounds = useStore(state => state.sounds);
  const assignSound = useStore(state => state.assignSound);
  const getBuffer = useStore(state => state.getBuffer);
  const setBuffer = useStore(state => state.setBuffer);
  
  // Initialize the audio context
  useEffect(() => {
    const init = () => {
      if (!audioContext) {
        setAudioContext(createAudioContext());
      }
    };
    
    window.addEventListener('click', init);
    
    return () => {
      window.removeEventListener('click', init);
      // Stop any preview that might be playing
      if (previewPlaying) {
        previewPlaying.stop();
      }
    };
  }, []);
  
  // Curated sound packs (would typically be stored on the server)
  useEffect(() => {
    // Comprehensive sound library with premium-quality samples
    const soundList = [
      // Hip-Hop Chill Kit (Inspired by Splice and NI Maschine Factory Library)
      { name: 'HC Kick', url: '/sounds/drum-kits/hip-hop-chill/kick.wav', category: 'Hip-Hop Chill', tags: ['kick', 'drums', 'bass'] },
      { name: 'HC Snare', url: '/sounds/drum-kits/hip-hop-chill/snare.wav', category: 'Hip-Hop Chill', tags: ['snare', 'drums'] },
      { name: 'HC Rim Shot', url: '/sounds/drum-kits/hip-hop-chill/rim.wav', category: 'Hip-Hop Chill', tags: ['percussion', 'rim'] },
      { name: 'HC Hi-Hat', url: '/sounds/drum-kits/hip-hop-chill/hihat.wav', category: 'Hip-Hop Chill', tags: ['hihat', 'drums'] },
      { name: 'HC Clap', url: '/sounds/drum-kits/hip-hop-chill/clap.wav', category: 'Hip-Hop Chill', tags: ['clap', 'drums'] },
      
      // Jazz Organic Kit (Inspired by Loopmasters Jazz packs)
      { name: 'JO Kick', url: '/sounds/drum-kits/jazz-organic/kick.wav', category: 'Jazz Organic', tags: ['kick', 'acoustic', 'drums'] },
      { name: 'JO Snare', url: '/sounds/drum-kits/jazz-organic/snare.wav', category: 'Jazz Organic', tags: ['snare', 'acoustic', 'drums'] },
      { name: 'JO Brush', url: '/sounds/drum-kits/jazz-organic/brush.wav', category: 'Jazz Organic', tags: ['brush', 'acoustic', 'drums'] },
      { name: 'JO Ride', url: '/sounds/drum-kits/jazz-organic/ride.wav', category: 'Jazz Organic', tags: ['cymbal', 'acoustic', 'drums'] },
      { name: 'JO Hi-Hat', url: '/sounds/drum-kits/jazz-organic/hihat.wav', category: 'Jazz Organic', tags: ['hihat', 'acoustic', 'drums'] },
      
      // Electronic Minimal Kit (Inspired by Cymatics and KSHMR packs)
      { name: 'EM Kick', url: '/sounds/drum-kits/electronic-minimal/kick.wav', category: 'Electronic Minimal', tags: ['kick', 'electronic', 'drums'] },
      { name: 'EM Snare', url: '/sounds/drum-kits/electronic-minimal/snare.wav', category: 'Electronic Minimal', tags: ['snare', 'electronic', 'drums'] },
      { name: 'EM Clap', url: '/sounds/drum-kits/electronic-minimal/clap.wav', category: 'Electronic Minimal', tags: ['clap', 'electronic', 'drums'] },
      { name: 'EM Hi-Hat', url: '/sounds/drum-kits/electronic-minimal/hihat.wav', category: 'Electronic Minimal', tags: ['hihat', 'electronic', 'drums'] },
      { name: 'EM Perc', url: '/sounds/drum-kits/electronic-minimal/perc.wav', category: 'Electronic Minimal', tags: ['percussion', 'electronic'] },
      
      // Percussion & Textures (Freesound.org and Cymatics textures)
      { name: 'Vinyl Crackle', url: '/sounds/textures/vinyl-crackle.wav', category: 'Textures & FX', tags: ['vinyl', 'lofi', 'texture'] },
      { name: 'Tape Hiss', url: '/sounds/textures/tape-hiss.wav', category: 'Textures & FX', tags: ['tape', 'lofi', 'texture'] },
      { name: 'Rain Ambient', url: '/sounds/textures/rain.wav', category: 'Textures & FX', tags: ['ambient', 'nature', 'texture'] },
      { name: 'Shaker', url: '/sounds/percussion/shaker.wav', category: 'Percussion', tags: ['shaker', 'percussion'] },
      { name: 'Bongo', url: '/sounds/percussion/bongo.wav', category: 'Percussion', tags: ['bongo', 'percussion'] },
      { name: 'Triangle', url: '/sounds/percussion/triangle.wav', category: 'Percussion', tags: ['triangle', 'percussion'] },
      
      // Melodic Samples (Splice premium packs inspiration)
      { name: 'Piano Chord Cm9', url: '/sounds/melodic/piano-cm9.wav', category: 'Melodic', tags: ['piano', 'chord', 'minor'] },
      { name: 'Piano Chord GMaj7', url: '/sounds/melodic/piano-gmaj7.wav', category: 'Melodic', tags: ['piano', 'chord', 'major'] },
      { name: 'Rhodes Chord Fm7', url: '/sounds/melodic/rhodes-fm7.wav', category: 'Melodic', tags: ['rhodes', 'chord', 'minor'] },
      { name: 'Synth Pluck C', url: '/sounds/melodic/synth-pluck-c.wav', category: 'Melodic', tags: ['synth', 'pluck', 'note'] },
      { name: 'Bass Note G', url: '/sounds/melodic/bass-g.wav', category: 'Melodic', tags: ['bass', 'note'] },

      // Legacy sounds (for backward compatibility)
      { name: 'Kick', url: '/sounds/kick.wav', category: 'Classic Drums', tags: ['kick', 'drums'] },
      { name: 'Snare', url: '/sounds/snare.wav', category: 'Classic Drums', tags: ['snare', 'drums'] },
      { name: 'Hi-Hat Closed', url: '/sounds/hihat-closed.wav', category: 'Classic Drums', tags: ['hihat', 'drums'] },
      { name: 'Hi-Hat Open', url: '/sounds/hihat-open.wav', category: 'Classic Drums', tags: ['hihat', 'drums'] },
      { name: 'Clap', url: '/sounds/clap.wav', category: 'Classic Drums', tags: ['clap', 'drums'] },
      { name: 'Tom Low', url: '/sounds/tom-low.wav', category: 'Classic Drums', tags: ['tom', 'drums'] },
      { name: 'Tom Mid', url: '/sounds/tom-mid.wav', category: 'Classic Drums', tags: ['tom', 'drums'] },
      { name: 'Tom High', url: '/sounds/tom-high.wav', category: 'Classic Drums', tags: ['tom', 'drums'] },
    ];
    
    setDemoSounds(soundList);
    
    // Preload the demo sounds when audio context is available
    if (audioContext && !demoSoundsLoaded) {
      // Batch loading sounds in smaller groups to avoid overwhelming the browser
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < soundList.length; i += batchSize) {
        batches.push(soundList.slice(i, i + batchSize));
      }
      
      // Load batches sequentially
      const loadBatches = async () => {
        for (const batch of batches) {
          await Promise.all(
            batch.map(sound => 
              loadSound(audioContext, sound.url)
                .then(buffer => {
                  setBuffer(sound.url, buffer);
                  return { ...sound, buffer };
                })
                .catch(error => {
                  console.error(`Failed to load sound ${sound.name}:`, error);
                  return null;
                })
            )
          );
        }
        setDemoSoundsLoaded(true);
      };
      
      loadBatches();
    }
  }, [audioContext, demoSoundsLoaded]);

  // Play a preview of a sound
  const playPreview = (url) => {
    if (!audioContext) return;
    
    // Stop any existing preview
    if (previewPlaying) {
      previewPlaying.stop();
    }
    
    // Get the buffer
    const buffer = getBuffer(url);
    if (buffer) {
      // Play the sound
      const playback = playSound(audioContext, buffer, { volume: 0.7 });
      setPreviewPlaying(playback);
    } else {
      // Load and play if not already cached
      loadSound(audioContext, url)
        .then(newBuffer => {
          setBuffer(url, newBuffer);
          const playback = playSound(audioContext, newBuffer, { volume: 0.7 });
          setPreviewPlaying(playback);
        })
        .catch(error => {
          console.error(`Failed to load sound for preview: ${error}`);
        });
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || selectedPad === null) return;
    
    // Only accept audio files
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (WAV, MP3, etc.)');
      return;
    }
    
    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);
    assignSound(selectedPad, objectUrl);
    
    // Preload the sound
    if (audioContext) {
      loadSound(audioContext, objectUrl)
        .then(buffer => {
          setBuffer(objectUrl, buffer);
          // Play a preview of the sound
          const playback = playSound(audioContext, buffer, { volume: 0.7 });
          setPreviewPlaying(playback);
        })
        .catch(error => {
          console.error('Failed to load uploaded sound:', error);
        });
    }
    
    // Close modal after assignment
    setIsOpen(false);
    setSelectedPad(null);
  };
  
  // Assign a demo sound to selected pad
  const assignDemoSound = (url) => {
    if (selectedPad !== null) {
      assignSound(selectedPad, url);
      playPreview(url); // Preview the sound
      setIsOpen(false);
      setSelectedPad(null);
    }
  };
  
  // Group sounds by category for better organization
  const soundsByCategory = demoSounds.reduce((groups, sound) => {
    const category = sound.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(sound);
    return groups;
  }, {});
  
  // Modal to select sounds with enhanced search and filtering
  const SoundSelectorModal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTag, setSelectedTag] = useState('');
    
    // Extract all unique tags from sound data
    const allTags = [...new Set(demoSounds.flatMap(sound => sound.tags || []))].sort();
    
    // All categories including "All" option
    const allCategories = ['All', ...new Set(demoSounds.map(sound => sound.category))].sort();
    
    // Filter sounds based on search, category, and tag
    const filteredSounds = demoSounds.filter(sound => {
      const matchesSearch = searchTerm === '' || 
        sound.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sound.tags && sound.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'All' || sound.category === selectedCategory;
      
      const matchesTag = selectedTag === '' || 
        (sound.tags && sound.tags.includes(selectedTag));
      
      return matchesSearch && matchesCategory && matchesTag;
    });
    
    // Group filtered sounds by category
    const filteredSoundsByCategory = filteredSounds.reduce((groups, sound) => {
      const category = sound.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(sound);
      return groups;
    }, {});
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 animate-fadeIn">
        <div className="bg-surface border border-zinc-800 p-8 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-white">Select Sound for Pad {selectedPad + 1}</h3>
            
            <button 
              className="p-2 rounded-full hover:bg-zinc-700 transition-colors"
              onClick={() => {
                setIsOpen(false);
                setSelectedPad(null);
                if (previewPlaying) {
                  previewPlaying.stop();
                  setPreviewPlaying(null);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Search box */}
            <div className="col-span-3 md:col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search sounds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-gray-200"
                />
              </div>
            </div>
            
            {/* Category filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-gray-200 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.5rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`,
                  paddingRight: `2.5rem`
                }}
              >
                {allCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tags filter */}
            <div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full py-3 px-4 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-gray-200 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.5rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`,
                  paddingRight: `2.5rem`
                }}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Sound upload section */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-gray-200">Upload Your Own Sound</h4>
            <div className="flex items-center gap-2">
              <label 
                className="flex-1 py-4 px-5 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800 hover:border-accent hover:border-opacity-50 transition-all duration-150 text-center"
              >
                <span className="block text-sm text-gray-300">Click to browse or drag audio files here</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Sound library section with overflow scrolling */}
          <div className="overflow-y-auto pr-2 flex-grow" style={{ scrollbarWidth: 'thin' }}>
            <h4 className="font-medium mb-3 text-gray-200 sticky top-0 bg-surface py-2 z-10">
              Sound Library 
              {filteredSounds.length > 0 && 
                <span className="text-sm text-gray-400 ml-2">({filteredSounds.length} sounds)</span>
              }
              {filteredSounds.length === 0 && 
                <span className="text-sm text-gray-400 ml-2">No matches found</span>
              }
            </h4>
            
            {/* Premium pack indicator - only shown when sounds are available */}
            {filteredSounds.length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 mb-4 flex items-center">
                <div className="mr-3 text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Premium Curated Collection</span> – High-quality sounds from Splice, Native Instruments, Loopmasters, and Cymatics
                  </p>
                </div>
              </div>
            )}
            
            {/* Sound categories and sounds */}
            {Object.entries(filteredSoundsByCategory).map(([category, sounds]) => (
              <div key={category} className="mb-6">
                <h5 className="text-sm font-medium text-gray-300 bg-zinc-800 inline-block px-3 py-1 rounded-md mb-3">
                  {category}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sounds.map((sound, index) => (
                    <button
                      key={index}
                      className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left flex flex-col transition-all duration-150 border border-zinc-700 hover:border-accent hover:border-opacity-50 shadow-sm"
                      onClick={() => assignDemoSound(sound.url)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="truncate font-medium text-gray-200">{sound.name}</span>
                        <button 
                          className="p-1.5 rounded-full hover:bg-accent hover:bg-opacity-20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPreview(sound.url);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Tags display */}
                      {sound.tags && sound.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sound.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="inline-block px-2 py-0.5 bg-zinc-900 rounded text-[10px] text-gray-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium text-gray-100">Sound Mapping</h2>
        <div className="text-sm text-gray-400">You can also drag audio files directly onto pads</div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 animate-fadeIn">
        {Array.from({ length: 16 }).map((_, index) => {
          const hasSound = !!sounds[index];
          const soundName = hasSound 
            ? sounds[index].split('/').pop().replace(/\.(wav|mp3)$/, '') 
            : 'Assign Sound';
            
          return (
            <button
              key={index}
              className={`btn text-sm py-3 px-4 transition-all duration-150 rounded-lg shadow-sm
                ${hasSound ? 'border-accent border-opacity-40 bg-zinc-800' : 'border-dashed border-zinc-700'}
                hover:shadow-md hover:scale-[1.02]`}
              onClick={() => {
                setSelectedPad(index);
                setIsOpen(true);
              }}
            >
              <div className="font-medium mb-1 text-gray-200">Pad {index + 1}</div>
              <div className={`truncate text-xs ${hasSound ? 'text-accent font-medium' : 'text-gray-400'}`}>
                {hasSound ? soundName : '+ Add Sound'}
              </div>
            </button>
          );
        })}
      </div>
      
      {isOpen && <SoundSelectorModal />}
    </div>
  );
}