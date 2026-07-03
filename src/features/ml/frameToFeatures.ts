import type { GloveFrame } from '../parser/types';

/** Map a glove frame to the 13-feature vector expected by the LSTM model. */
export function frameToFeatures(frame: GloveFrame): number[] {
  return [
    frame.flex.thumb,
    frame.flex.index,
    frame.flex.middle,
    frame.flex.ring,
    frame.flex.pinky,
    frame.imu.ax,
    frame.imu.ay,
    frame.imu.az,
    frame.imu.gx,
    frame.imu.gy,
    frame.imu.gz,
    frame.orientation.pitch,
    frame.orientation.roll,
  ];
}

export function framesToMatrix(frames: GloveFrame[]): number[][] {
  return frames.map(frameToFeatures);
}
