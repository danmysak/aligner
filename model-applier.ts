import {Model} from "./model.ts";
import {Token, Tokenizer, Normalizer, getPreprocessor} from "./preprocessor.ts";
import {StringAlignment, splitOnCondition} from "./alignments.ts";

export interface ApplyOptions {
  tokenizer: Tokenizer,
  normalizer: Normalizer,
  model: Model
}

type Steps = Array<Array<[number, number]>>;
type Route = Array<[number, number]>;

export function apply(source: string, target: string, options: ApplyOptions): StringAlignment {
  const preprocessor = getPreprocessor(options.tokenizer, options.normalizer);
  return applyTokenized(preprocessor(source), preprocessor(target), options.model);
}

function computeGainDelta(sourceSequence: Token[], targetSequence: Token[], model: Model): number {
  const source = model.dictionary.retrieve(sourceSequence, null);
  const correspondence = model.dictionary.retrieve(sourceSequence, targetSequence);
  return Math.min(source, correspondence) <= 1
    ? 0
    : (sourceSequence.length + targetSequence.length) * (correspondence - 1) / (source - 1);
  // 1 is being subtracted to eliminate selection bias
}

function computeStepsAndGainEntry(source: Token[], target: Token[], model: Model,
                                  sourceIndex: number, targetIndex: number,
                                  gains: number[][]): [[number, number], number] {
  if (sourceIndex === 0 || targetIndex === 0) {
    return [[sourceIndex, targetIndex], 0];
  } else {
    const noSourceGain = gains[sourceIndex - 1][targetIndex];
    const noTargetGain = gains[sourceIndex][targetIndex - 1];
    let currentSteps = (noSourceGain > noTargetGain ? [1, 0] : [0, 1]) as [number, number];
    let currentGain = Math.max(noSourceGain, noTargetGain);
    for (let sourceLength = 1; sourceLength <= sourceIndex; sourceLength++) {
      for (let targetLength = 1; targetLength <= targetIndex; targetLength++) {
        const possibleGain = computeGainDelta(
          source.slice(sourceIndex - sourceLength, sourceIndex),
          target.slice(targetIndex - targetLength, targetIndex),
          model
        ) + gains[sourceIndex - sourceLength][targetIndex - targetLength];
        if (possibleGain > currentGain) {
          currentSteps = [sourceLength, targetLength];
          currentGain = possibleGain;
        }
      }
    }
    return [currentSteps, currentGain];
  }
}

function computeSteps(source: Token[], target: Token[], model: Model): Steps {
  const steps: Steps = [];
  const gains: number[][] = [];
  for (let sourceIndex = 0; sourceIndex <= source.length; sourceIndex++) {
    const currentStepsRow: Array<[number, number]> = [];
    const currentGainsRow: number[] = [];
    steps.push(currentStepsRow);
    gains.push(currentGainsRow);
    for (let targetIndex = 0; targetIndex <= target.length; targetIndex++) {
      const [currentSteps, currentGain] = computeStepsAndGainEntry(
        source, target, model, sourceIndex, targetIndex, gains
      );
      currentStepsRow.push(currentSteps);
      currentGainsRow.push(currentGain);
    }
  }
  return steps;
}

function selectPreRoute(source: Token[], target: Token[], steps: Steps): Route {
  const preRoute: Route = [];
  let sourceIndex = source.length;
  let targetIndex = target.length;
  while (sourceIndex > 0 || targetIndex > 0) {
    const [sourceStep, targetStep] = steps[sourceIndex][targetIndex];
    preRoute.push([sourceStep, targetStep]);
    sourceIndex -= sourceStep;
    targetIndex -= targetStep;
  }
  return preRoute.reverse();
}

function selectRoute(source: Token[], target: Token[], steps: Steps): Route {
  const preRoute = selectPreRoute(source, target, steps);
  return splitOnCondition(
    preRoute, ([sourceLength, targetLength]) => sourceLength > 0 && targetLength > 0
  ).map((part) => ({
    corresponding: part.length === 1,
    item: part.reduce(
      ([sourceSum, targetSum], [source, target]) => [sourceSum + source, targetSum + target], [0, 0]
    )})
  ).flatMap(
    ({corresponding, item: [source, target]}) => corresponding
      ? [[source, target]]
      : ([[source, 0], [0, target]].filter(([source, target]) => source > 0 || target > 0) as Route)
  );
}

function restoreAlignmentSide(tokens: Token[], sideRoute: number[]): Token[][] {
  let alignmentSide: Token[][] = [];
  let index = 0;
  for (const length of sideRoute) {
    alignmentSide.push(tokens.slice(index, index + length));
    index += length;
  }
  return alignmentSide;
}

function restoreAlignment(source: Token[], target: Token[], route: Route): StringAlignment {
  const sides = [source, target].map(
    (side, index) => restoreAlignmentSide(side, route.map((step) => step[index]))
  );
  return sides[0].map((source, index) => [source, sides[1][index]]);
}

export function applyTokenized(source: Token[], target: Token[], model: Model): StringAlignment {
  const steps = computeSteps(source, target, model);
  const route = selectRoute(source, target, steps);
  return restoreAlignment(source, target, route);
}