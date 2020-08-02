import {Token} from "./preprocessor.ts";
import {StringAlignment, splitOnCondition} from "./alignments.ts";
import {Dictionary} from "./dictionary.ts";
import {SingleDictionary} from "./single-dictionary.ts";

type Counted = [Token[], number];

function countSequences(tokens: Token[]): Counted[] {
  const dictionary = new SingleDictionary();
  for (let start = 0; start <= tokens.length; start++) {
    for (let end = start + 1; end <= tokens.length; end++) {
      dictionary.modify(tokens.slice(start, end), 1);
    }
  }
  return dictionary.enumerate();
}

function updateSingleSide(counted: Counted[], targetSide: boolean, dictionary: Dictionary) {
  for (const [sequence, count] of counted) {
    dictionary.modify(targetSide ? null : sequence, targetSide ? sequence : null, count);
  }
}

function updateCorrespondences(source: Counted[], target: Counted[], dictionary: Dictionary) {
  for (const [sourceSequence, sourceCount] of source) {
    for (const [targetSequence, targetCount] of target) {
      dictionary.modify(sourceSequence, targetSequence, Math.min(sourceCount, targetCount));
    }
  }
}

export function countSimple(source: Token[], target: Token[], dictionary: Dictionary): void {
  const [sourceCounted, targetCounted] = [source, target].map(countSequences);
  updateSingleSide(sourceCounted, false, dictionary);
  updateSingleSide(targetCounted, true, dictionary);
  updateCorrespondences(sourceCounted, targetCounted, dictionary);
}

function mergeUnalignedPortions(alignment: StringAlignment): StringAlignment {
  return splitOnCondition(alignment, ([source, target]) => source.length > 0 && target.length > 0)
    .map((aligned) => [aligned.flatMap((pair) => pair[0]), aligned.flatMap((pair) => pair[1])]);
}

export function countAligned(alignment: StringAlignment, dictionary: Dictionary): void {
  for (const [source, target] of mergeUnalignedPortions(alignment)) {
    countSimple(source, target, dictionary);
  }
}