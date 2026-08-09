// Helper function to create WAV header
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export async function convertMp3ToWav(mp3Blob: Blob): Promise<Blob> {
  // Read the MP3 blob into an ArrayBuffer
  const arrayBuffer = await mp3Blob.arrayBuffer();
  
  // Use the browser's AudioContext to decode the MP3
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextClass();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Create WAV structure
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44; // 44 bytes for header
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  
  const channels = [];
  const sampleRate = audioBuffer.sampleRate;
  let offset = 0;
  let pos = 0;
  
  // Write WAVE header
  writeString(view, pos, 'RIFF'); pos += 4;
  view.setUint32(pos, length - 8, true); pos += 4;
  writeString(view, pos, 'WAVE'); pos += 4;
  writeString(view, pos, 'fmt '); pos += 4;
  view.setUint32(pos, 16, true); pos += 4; // Subchunk1Size (16 for PCM)
  view.setUint16(pos, 1, true); pos += 2; // AudioFormat (1 for PCM)
  view.setUint16(pos, numOfChan, true); pos += 2; // NumChannels
  view.setUint32(pos, sampleRate, true); pos += 4; // SampleRate
  view.setUint32(pos, sampleRate * 2 * numOfChan, true); pos += 4; // ByteRate
  view.setUint16(pos, numOfChan * 2, true); pos += 2; // BlockAlign
  view.setUint16(pos, 16, true); pos += 2; // BitsPerSample
  writeString(view, pos, 'data'); pos += 4;
  view.setUint32(pos, length - pos - 4, true); pos += 4; // data size
  
  // Interleave channels and scale to 16-bit
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      // scale to 16-bit signed integer
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}
