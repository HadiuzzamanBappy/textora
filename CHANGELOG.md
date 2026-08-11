# textora

## 1.1.0

### Minor Changes

- Added Male and Female voice selection support for audio export.
- Enhanced bottom player with Play/Pause controls.
- Added encoded progress tracking (background color) to the audio progress bar.
- Added intelligent fallback to a free web-scraper for translation and TTS when the Google Cloud API is unavailable.

## 1.0.0

### Major Changes

- **Initial Release:** Launched Textora, a secure, browser-native Progressive Web Application (PWA) for text-to-speech translation.
- **Document Reader:** Added drag-and-drop file upload support for reading and parsing large text documents.
- **Progressive Translation:** Implemented client-side text chunking to progressively translate large documents without blocking the browser.
- **Local Audio Synthesis:** Synthesizes audio streams locally on the device with zero cloud audio costs using the Web Speech API.
- **Audio Export:** Export synthesized speech to `.mp3` or `.wav` formats.
