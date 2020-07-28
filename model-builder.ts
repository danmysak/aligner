import {Token, Tokenizer, Normalizer, getPreprocessor, tokenSeparator} from "./preprocessor.ts";
import {Dictionary} from "./dictionary.ts";
import {countSimple, countAligned} from "./counter.ts";
import {Model} from "./model.ts";
import {applyTokenized} from "./model-applier.ts";

export interface BuildOptions {
  tokenizer: Tokenizer,
  normalizer: Normalizer,
  repeatIterations: number
}

type Tokens = Array<[Token[], Token[]]>;

function tokenize(pairs: Array<[string, string]>,
                  tokenizer: Tokenizer, normalizer: Normalizer): Tokens {
  const preprocessor = getPreprocessor(tokenizer, normalizer);
  return pairs.map(([source, target]) => [preprocessor(source), preprocessor(target)]);
}

function createModel(tokens: Tokens): Model {
  const dictionary = Dictionary.createEmpty();
  for (const [source, target] of tokens) {
    countSimple(source, target, dictionary);
  }
  return new Model(dictionary);
}

function updateModel(model: Model, tokens: Tokens): Model {
  const dictionary = Dictionary.createEmpty();
  for (const [source, target] of tokens) {
    countAligned(applyTokenized(source, target, model), dictionary);
  }
  return new Model(dictionary);
}

export function build(pairs: Array<[string, string]>, options: BuildOptions): Model {
  const tokens = tokenize(pairs, options.tokenizer, options.normalizer);
  let model = createModel(tokens);
  for (let i = 0; i < options.repeatIterations; i++) {
    model = updateModel(model, tokens);
  }
  return model;
}