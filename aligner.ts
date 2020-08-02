import {Tokenizer, Normalizer, tokenizerOrDefault, normalizerOrDefault} from "./preprocessor.ts";
import {StringAlignment} from "./alignments.ts";
import {Model} from "./model.ts";
import {build} from "./model-builder.ts";
import {apply} from "./model-applier.ts";

const defaults = {
  repeatIterations: 0,
  significanceLevel: 0.05
};

export interface TrainOptions {
  tokenizer?: Tokenizer,
  normalizer?: Normalizer,
  repeatIterations?: number,
  significanceLevel?: number
}

export interface AlignOptions {
  tokenizer?: Tokenizer,
  normalizer?: Normalizer
}

export function train(pairs: Array<[string, string]>, options: TrainOptions = {}): Model {
  return build(pairs, {
    tokenizer: tokenizerOrDefault(options.tokenizer),
    normalizer: normalizerOrDefault(options.normalizer),
    repeatIterations: options.repeatIterations ?? defaults.repeatIterations,
    significanceLevel: options.significanceLevel ?? defaults.significanceLevel
  });
}

export function align(source: string, target: string, model: Model,
                      options: AlignOptions = {}): [StringAlignment, number] {
  return apply(source, target, {
    tokenizer: tokenizerOrDefault(options.tokenizer),
    normalizer: normalizerOrDefault(options.normalizer),
    model: model
  });
}