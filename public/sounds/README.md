# Sound Library for Maschine Web Companion

This directory contains premium-quality sound samples organized into curated collections for the Maschine Web Companion app. The sound library is structured to provide producers with inspiring, high-quality sounds across different genres and styles.

## Sound Library Structure

The sound library is organized into the following categories:

```
sounds/
├── drum-kits/
│   ├── hip-hop-chill/     # Lo-fi, chill hip-hop drum samples
│   ├── jazz-organic/      # Acoustic, jazz-influenced drum samples
│   └── electronic-minimal/ # Clean, minimal electronic drum samples
├── percussion/            # Additional percussion elements
├── textures/              # Ambient textures and FX samples
├── melodic/               # Piano, Rhodes, and synth chord samples
└── (legacy sounds)        # Original basic drum samples
```

## Recommended Premium Sound Sources

For the best experience, we recommend adding high-quality sounds from these sources:

### 1. Splice Sounds

Splice offers a vast library of royalty-free samples with a subscription model. Recommended packs:
- **Capsun ProAudio** collections (especially for lo-fi and hip-hop)
- **KSHMR** packs for modern electronic sounds
- **Oliver** packs for clean, well-produced electronic samples

Visit: [Splice](https://splice.com/)

### 2. Native Instruments

The Maschine Factory Library and free Komplete Start provide excellent, production-ready sounds:
- **Maschine Factory Library**: Pre-mapped for Maschine hardware
- **Komplete Start**: Free high-quality instruments and samples

Visit: [Native Instruments](https://www.native-instruments.com/)

### 3. Cymatics

Offers modern, crisp electronic and hip-hop sounds with excellent production quality.
- **Lofi Essentials**: Perfect for chill beats
- **Gems**: A collection of high-impact electronic sounds

Visit: [Cymatics](https://cymatics.fm/)

### 4. Loopmasters

Authentic, well-recorded acoustic and electronic samples:
- **Jazz Essentials** packs for authentic jazz percussion
- **Live Percussion** series for organic percussion sounds

Visit: [Loopmasters](https://www.loopmasters.com/)

### 5. Free Resources

- [Freesound.org](https://freesound.org/): Creative Commons samples
- [SampleRadar](https://www.musicradar.com/news/tech/free-music-samples-download-loops-hits-and-multis-627820): Free sample collections

## Recommended Format

For the best quality and performance:
- **Format**: WAV (preferred) or MP3
- **Sample Rate**: 44.1kHz
- **Bit Depth**: 16-bit or 24-bit
- **Length**: 
  - Drum/percussion samples: Short (0.5-2 seconds)
  - Textures/ambience: Medium (2-8 seconds)
  - Melodic samples: Medium (1-4 seconds)

## Quick Setup: Complete Sound Library

For the fastest setup with premium-quality sounds, run:

```bash
cd public/sounds
npm run setup
```

This all-in-one command will:
1. Install all required dependencies
2. Download curated sound packs from trusted sources
3. Process all sounds for optimal quality and performance

> **Note**: This requires Node.js and FFmpeg to be installed on your system.

## Using the Sound Downloader Tool

To download sounds without processing:

1. Navigate to the sounds directory: `cd public/sounds`
2. Install dependencies: `npm run install-deps`
3. Run the downloader: `npm run download`

The script will:
- Download curated free sound packs from trusted sources
- Extract and organize the sounds into the proper directories
- Filter sounds based on type (drums, percussion, textures, etc.)

> **Note**: The download process respects file licenses, only using legal free sample packs.

## Using the Sound Processor Tool

To optimize sound quality and performance:

1. Make sure FFmpeg is installed on your system
2. Run: `npm run process`

The processor will:
- Normalize volume levels for consistent sound
- Convert files to optimal WAV format
- Set proper sample rate (44.1kHz) and bit depth (16-bit)
- Remove silence and optimize file size
- Clean up metadata for faster loading

## How to Add Your Own Sound Collections

1. Create a new folder under the appropriate category (e.g., `drum-kits/your-kit-name/`)
2. Add WAV or MP3 files to your folder
3. Update the sound list in `components/SoundUploader.jsx` to include your samples
4. Add appropriate tags to make your sounds easy to find

Example entry for a new sound:
```javascript
{ 
  name: 'Your Sound Name', 
  url: '/sounds/your-category/your-sound.wav', 
  category: 'Your Category', 
  tags: ['tag1', 'tag2', 'instrument']
}
```

### Customizing the Sound Downloader

You can edit `download-sounds.js` to add more sources or customize filtering:

1. Add new entries to the `samplePacks` array
2. Specify the source URL, destination folder, and filtering rules
3. Run the downloader to fetch your customized selection

## Legal Considerations

When adding sounds to your project:
- Ensure you have the necessary rights or licenses for any commercial sounds
- Only use royalty-free samples for public projects
- Consider using Creative Commons or public domain samples for open-source projects
- Give credit to sound creators where required

---

Enjoy creating with high-quality sounds that inspire your music production!
