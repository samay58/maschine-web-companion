/**
 * Sound Processing Utility for Maschine Web Companion
 * 
 * This script processes audio files to optimize them for the Maschine Web Companion app.
 * It normalizes volume, converts to WAV format, and optimizes file size.
 * 
 * Note: This script requires FFmpeg to be installed on your system.
 * - On macOS: brew install ffmpeg
 * - On Ubuntu/Debian: sudo apt-get install ffmpeg
 * - On Windows: Download from https://ffmpeg.org/download.html
 * 
 * Install dependencies: npm install fs-extra glob
 * Run: node process-sounds.js
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const config = {
  // Source directories to process
  sourceDirs: [
    'drum-kits/**/*.{wav,mp3}',
    'percussion/**/*.{wav,mp3}',
    'textures/**/*.{wav,mp3}',
    'melodic/**/*.{wav,mp3}',
    '*.{wav,mp3}' // Root level sounds
  ],
  
  // Processing options
  options: {
    normalize: true,         // Normalize audio levels
    convertToWav: true,      // Convert all files to WAV
    targetSampleRate: 44100, // 44.1kHz sample rate
    targetBitDepth: 16,      // 16-bit audio
    removeMetadata: true,    // Remove unnecessary metadata
    trim: true,              // Trim silence from beginning and end
  },
  
  // Base directory for sounds
  baseDir: path.resolve(__dirname)
};

/**
 * Processes a single audio file using FFmpeg
 */
async function processAudioFile(filePath) {
  try {
    const { options } = config;
    
    const fileInfo = path.parse(filePath);
    const outputPath = fileInfo.ext.toLowerCase() !== '.wav' || options.normalize || options.trim
      ? path.join(fileInfo.dir, `${fileInfo.name}.wav`)
      : null;
      
    // Skip processing if no changes needed
    if (!outputPath) {
      console.log(`Skipping ${filePath} (already in WAV format, no processing needed)`);
      return { success: true, filePath };
    }
    
    // Create temporary output path for processing
    const tempOutputPath = `${outputPath}.temp`;
    
    // Build FFmpeg command
    let ffmpegArgs = ['-i', `"${filePath}"`];
    
    // Apply audio processing options
    if (options.normalize) {
      ffmpegArgs.push('-af', '"loudnorm=I=-16:LRA=11:TP=-1.5"');
    }
    
    if (options.trim) {
      // Trim silence from beginning and end (adjustment threshold as needed)
      ffmpegArgs.push('-af', '"silenceremove=start_periods=1:start_duration=0.1:start_threshold=-60dB:detection=peak,aformat=dblp,areverse,silenceremove=start_periods=1:start_duration=0.1:start_threshold=-60dB:detection=peak,aformat=dblp,areverse"');
    }
    
    // Set output format options
    ffmpegArgs.push('-ar', options.targetSampleRate);
    ffmpegArgs.push('-sample_fmt', options.targetBitDepth === 16 ? 's16' : 's24');
    
    if (options.removeMetadata) {
      ffmpegArgs.push('-map_metadata', '-1');
    }
    
    // Output path
    ffmpegArgs.push(`"${tempOutputPath}"`);
    
    // Execute FFmpeg command
    const ffmpegCmd = `ffmpeg ${ffmpegArgs.join(' ')} -y`;
    console.log(`Processing ${path.basename(filePath)}...`);
    
    await execAsync(ffmpegCmd, { shell: '/bin/bash' });
    
    // Replace original file if it's not a WAV or rename the temp file
    if (fileInfo.ext.toLowerCase() !== '.wav') {
      await fs.remove(filePath);
    } else if (fs.existsSync(tempOutputPath)) {
      await fs.remove(filePath);
    }
    
    // Rename temp file to final output
    if (fs.existsSync(tempOutputPath)) {
      await fs.rename(tempOutputPath, outputPath);
    }
    
    console.log(`Successfully processed: ${path.basename(outputPath)}`);
    return { success: true, filePath: outputPath };
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}: ${error.message}`);
    return { success: false, filePath, error: error.message };
  }
}

/**
 * Find all audio files matching the patterns in sourceDirs
 */
async function findAudioFiles() {
  try {
    const allFiles = [];
    
    // Use glob to find all matching files
    for (const pattern of config.sourceDirs) {
      const files = await new Promise((resolve, reject) => {
        glob(pattern, { cwd: config.baseDir, absolute: true }, (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });
      
      allFiles.push(...files);
    }
    
    // Remove duplicates
    const uniqueFiles = [...new Set(allFiles)];
    console.log(`Found ${uniqueFiles.length} audio files to process`);
    
    return uniqueFiles;
  } catch (error) {
    console.error(`Error finding audio files: ${error.message}`);
    throw error;
  }
}

/**
 * Main function to process all audio files
 */
async function processAllSounds() {
  try {
    console.log('=== Maschine Web Companion Sound Processor ===');
    console.log('This utility will optimize audio files for the best quality and performance.\n');
    console.log('Checking for FFmpeg installation...');
    
    // Check if FFmpeg is installed
    try {
      const { stdout } = await execAsync('ffmpeg -version');
      console.log(`Found FFmpeg: ${stdout.split('\n')[0]}`);
    } catch (error) {
      console.error('FFmpeg not found. Please install FFmpeg before running this script.');
      console.error('- macOS: brew install ffmpeg');
      console.error('- Ubuntu/Debian: sudo apt-get install ffmpeg');
      console.error('- Windows: Download from https://ffmpeg.org/download.html');
      return;
    }
    
    // Find all audio files
    const audioFiles = await findAudioFiles();
    
    if (audioFiles.length === 0) {
      console.log('No audio files found to process.');
      return;
    }
    
    // Process files
    console.log('\nStarting audio processing...');
    const results = [];
    
    for (const file of audioFiles) {
      const result = await processAudioFile(file);
      results.push(result);
    }
    
    // Report results
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log('\n=== Processing Complete ===');
    console.log(`Successfully processed: ${successCount} files`);
    
    if (failCount > 0) {
      console.log(`Failed to process: ${failCount} files`);
    }
    
    console.log('\nYour sound library is now optimized for web performance!');
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
  }
}

// Run the processing
processAllSounds();