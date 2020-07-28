import {Tokenizer, Normalizer, tokenizerOrDefault, normalizerOrDefault} from "./preprocessor.ts";
import {StringAlignment} from "./alignments.ts";
import {Model} from "./model.ts";
import {build} from "./model-builder.ts";
import {apply} from "./model-applier.ts";

export interface TrainOptions {
  tokenizer?: Tokenizer,
  normalizer?: Normalizer,
  repeatIterations?: number
}

export interface AlignOptions {
  tokenizer?: Tokenizer,
  normalizer?: Normalizer
}

export function train(pairs: Array<[string, string]>, options: TrainOptions = {}): Model {
  return build(pairs, {
    tokenizer: tokenizerOrDefault(options.tokenizer),
    normalizer: normalizerOrDefault(options.normalizer),
    repeatIterations: options.repeatIterations ?? 0
  });
}

export function align(source: string, target: string, model: Model,
                      options: AlignOptions = {}): StringAlignment {
  return apply(source, target, {
    tokenizer: tokenizerOrDefault(options.tokenizer),
    normalizer: normalizerOrDefault(options.normalizer),
    model: model
  });
}