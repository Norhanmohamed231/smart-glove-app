import type { GloveFrame } from './types';

const EXPECTED_FIELDS = 14;
/** ESP32 BluetoothSerial often terminates lines with \r only (not \n). */
const LINE_DELIMITER_RE = /\r\n|\n|\r/;
const MAX_BUFFER_CHARS = 16_384;

function buildFrame(values: number[]): GloveFrame | null {
  if (values.length < EXPECTED_FIELDS) return null;

  const [
    timestamp,
    flexThumb,
    flexIndex,
    flexMiddle,
    flexRing,
    flexPinky,
    ax,
    ay,
    az,
    gx,
    gy,
    gz,
    pitch,
    roll,
  ] = values;

  if ([timestamp, flexThumb, flexIndex, flexMiddle, flexRing, flexPinky].some((v) => Number.isNaN(v))) {
    return null;
  }

  return {
    timestamp,
    flex: {
      thumb: flexThumb,
      index: flexIndex,
      middle: flexMiddle,
      ring: flexRing,
      pinky: flexPinky,
    },
    imu: { ax, ay, az, gx, gy, gz },
    orientation: { pitch, roll },
  };
}

export class GloveDataParser {
  private buffer = '';

  pushChunk(chunk: string): GloveFrame[] {
    this.buffer += chunk;

    if (this.buffer.length > MAX_BUFFER_CHARS) {
      this.buffer = this.buffer.slice(-MAX_BUFFER_CHARS / 2);
    }

    const splitLines = this.buffer.split(LINE_DELIMITER_RE);
    this.buffer = splitLines.pop() ?? '';

    const frames: GloveFrame[] = [];
    for (const raw of splitLines) {
      const frame = this.parseLine(raw);
      if (frame) frames.push(frame);
    }
    return frames;
  }

  parseLine(rawLine: string): GloveFrame | null {
    const line = rawLine.trim();
    if (!line || line.startsWith('timestamp,') || line.startsWith('[')) return null;

    const payload = line.startsWith('DATA,') ? line.slice(5) : line;
    const values = payload.split(',').map((part) => Number(part.trim()));

    if (values.some((value) => Number.isNaN(value))) return null;
    return buildFrame(values);
  }

  reset(): void {
    this.buffer = '';
  }
}
