import {Token} from "./preprocessor.ts";

export type StringAlignment = Array<[Token[], Token[]]>;

export function splitOnCondition<T>(array: T[], condition: (item: T) => boolean): T[][] {
  const parts: T[][] = [];
  let splitOnLast = true;
  for (const item of array) {
    const shouldSplit = condition(item);
    if (shouldSplit || splitOnLast) {
      parts.push([item]);
    } else {
      parts.slice(-1)[0].push(item);
    }
    splitOnLast = shouldSplit;
  }
  return parts;
}