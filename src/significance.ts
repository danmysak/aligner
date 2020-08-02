import {Dictionary} from "./dictionary.ts";

function computeRelativeEntropy(a: number, p: number): number {
  return a * Math.log(a / p) + (1 - a) * Math.log((1 - a) / (1 - p));
}

function computeChernoffBound(k: number, n: number, p: number): number {
  if (k <= 0 || p >= 1) {
    return 0;
  }
  if (k >= n || p <= 0) {
    return 1;
  }
  return Math.exp(-n * computeRelativeEntropy(k / n, p));
}

function isSignificant([sourceOccurrences, targetOccurrences]: [number, number], coOccurrences: number,
                       fragmentCount: number, significanceLevel: number): boolean {
  sourceOccurrences = Math.min(sourceOccurrences, fragmentCount);
  targetOccurrences = Math.min(targetOccurrences, fragmentCount);
  coOccurrences = Math.min(coOccurrences, sourceOccurrences, targetOccurrences);
  if (coOccurrences <= 1) { // Single co-occurrences should not be generalized
    return false;
  }
  if (coOccurrences <= sourceOccurrences * targetOccurrences / fragmentCount) { // Less than random average
    return false;
  }
  return computeChernoffBound(sourceOccurrences - coOccurrences, sourceOccurrences,
    1 - targetOccurrences / fragmentCount) < significanceLevel;
}

export function pickSignificantCorrespondences(dictionary: Dictionary, fragmentCount: number,
                                               significanceLevel: number): Dictionary {
  const significantCorrespondences = Dictionary.createEmpty();
  for (const [[source, target], count] of dictionary.enumerate()) {
    if (source !== null && target !== null && isSignificant(
      [dictionary.retrieve(source, null), dictionary.retrieve(null, target)], count, fragmentCount, significanceLevel
    )) {
      significantCorrespondences.modify(source, target, count);
    }
  }
  return significantCorrespondences;
}