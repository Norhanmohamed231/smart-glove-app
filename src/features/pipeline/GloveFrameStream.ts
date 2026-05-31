import type { GloveFrame } from '../parser/types';

type FrameListener = (frame: GloveFrame) => void;

export class GloveFrameStream {
  private listeners = new Set<FrameListener>();

  emit(frame: GloveFrame): void {
    for (const listener of this.listeners) {
      listener(frame);
    }
  }

  subscribe(listener: FrameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const gloveFrameStream = new GloveFrameStream();
