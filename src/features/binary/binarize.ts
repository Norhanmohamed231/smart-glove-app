import type { GloveFlex } from '../parser/types';
import { FLEX_THRESHOLD } from './constants';

export function flexToBit(value: number): 0 | 1 {
  return value >= FLEX_THRESHOLD ? 1 : 0;
}

export function flexToBits(flex: GloveFlex): number[] {
  return [
    flexToBit(flex.thumb),
    flexToBit(flex.index),
    flexToBit(flex.middle),
    flexToBit(flex.ring),
    flexToBit(flex.pinky),
  ];
}

export function bitsToPattern(bits: number[]): string {
  return bits.map((bit) => (bit === 1 ? '1' : '0')).join('');
}
