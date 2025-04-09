/**
 * Sound Download Utility for Maschine Web Companion
 * 
 * This script helps download and organize free sample packs from popular sources.
 * It requires Node.js and the following packages:
 * - node-fetch
 * - fs-extra
 * - adm-zip
 * 
 * Install dependencies: npm install node-fetch fs-extra adm-zip
 * Run: node download-sounds.js
 */

const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

// Configuration
const config = {
  // These are free sample packs from legitimate sources
  samplePacks: [
    {
      name: 'Hip-Hop Chill Kit',
      url: 'https://assets.cmcdn.cymatics.com/free-packs/Cymatics+-+Lofi+LITE+Sample+Pack.zip',
      destination: 'drum-kits/hip-hop-chill',
      filter: filename => filename.toLowerCase().includes('drum') || filename.toLowerCase().includes('percussion')
    },
    {
      name: 'Jazz Organic Kit',
      url: 'https://cdn.loopmasters.com/free/LM-FREE-JazzEssentials.zip',
      destination: 'drum-kits/jazz-organic',
      filter: filename => filename.toLowerCase().includes('drum') || filename.toLowerCase().includes('percussion')
    },
    {
      name: 'Electronic Minimal Kit',
      url: 'https://assets.cmcdn.cymatics.com/free-packs/Cymatics+-+7+Minimal+Percussion+Loops.zip',
      destination: 'drum-kits/electronic-minimal',
      filter: filename => filename.toLowerCase().includes('drum') || filename.toLowerCase().includes('percussion')
    },
    {
      name: 'Textures & FX',
      url: 'https://assets.cmcdn.cymatics.com/free-packs/Cymatics+-+Free+Ambience+Pack.zip',
      destination: 'textures',
      filter: filename => filename.toLowerCase().includes('fx') || 
                         filename.toLowerCase().includes('texture') || 
                         filename.toLowerCase().includes('ambient')
    },
    {
      name: 'Melodic Samples',
      url: 'https://assets.cmcdn.cymatics.com/free-packs/Cymatics+-+Free+MIDI+Chord+Pack.zip',
      destination: 'melodic',
      filter: filename => filename.toLowerCase().includes('chord') || 
                         filename.toLowerCase().includes('keys') || 
                         filename.toLowerCase().includes('synth')
    }
  ],
  
  // Base directory for sounds
  baseDir: path.resolve(__dirname)
};

/**
 * Downloads a file from a URL
 */
async function downloadFile(url, destination) {
  try {
    console.log(`Downloading ${url} to ${destination}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    await fs.writeFile(destination, buffer);
    
    console.log(`Download complete: ${destination}`);
    return destination;
  } catch (error) {
    console.error(`Download error: ${error.message}`);
    throw error;
  }
}

/**
 * Extracts a zip file, filtering contents based on configuration
 */
async function extractZip(zipPath, destination, filterFn) {
  try {
    console.log(`Extracting ${zipPath} to ${destination}...`);
    
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    
    // Create destination directory if it doesn't exist
    await fs.ensureDir(destination);
    
    // Extract only audio files matching the filter
    let extractedFiles = 0;
    
    for (const entry of entries) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!entry.isDirectory && (ext === '.wav' || ext === '.mp3')) {
        if (!filterFn || filterFn(entry.entryName)) {
          // Simplify filename to just the basename
          const simpleFilename = path.basename(entry.entryName);
          const outputPath = path.join(destination, simpleFilename);
          
          // Extract file
          zip.extractEntryTo(entry, destination, false, true);
          extractedFiles++;
          
          console.log(`Extracted: ${simpleFilename}`);
        }
      }
    }
    
    console.log(`Extraction complete: ${extractedFiles} files`);
    return extractedFiles;
  } catch (error) {
    console.error(`Extraction error: ${error.message}`);
    throw error;
  }
}

/**
 * Main function to download and extract all configured sample packs
 */
async function downloadSamplePacks() {
  try {
    console.log('=== Maschine Web Companion Sound Downloader ===');
    console.log('This utility will download free sample packs and organize them for use with the app.\n');
    
    // Create temp directory for downloads
    const tempDir = path.join(config.baseDir, 'temp');
    await fs.ensureDir(tempDir);
    
    // Process each sample pack
    for (const pack of config.samplePacks) {
      try {
        console.log(`\nProcessing pack: ${pack.name}`);
        
        // Create destination directory
        const destDir = path.join(config.baseDir, pack.destination);
        await fs.ensureDir(destDir);
        
        // Download zip file
        const zipPath = path.join(tempDir, `${pack.name.replace(/\s+/g, '-')}.zip`);
        await downloadFile(pack.url, zipPath);
        
        // Extract and filter files
        await extractZip(zipPath, destDir, pack.filter);
        
        console.log(`${pack.name} processing complete`);
      } catch (error) {
        console.error(`Error processing ${pack.name}: ${error.message}`);
        // Continue with other packs even if one fails
      }
    }
    
    // Clean up temp directory
    console.log('\nCleaning up temporary files...');
    await fs.remove(tempDir);
    
    console.log('\n=== Download Complete ===');
    console.log('Sound files have been organized into their respective directories.');
    console.log('You can now use these sounds in the Maschine Web Companion app.');
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
  }
}

// Run the download process
downloadSamplePacks();