import {Token, Tokenizer, Normalizer, getPreprocessor, tokenSeparator} from "./preprocessor.ts";
import {Dictionary} from "./dictionary.ts";
import {countSimple, countAligned} from "./counter.ts";
import {Model} from "./model.ts";
import {applyTokenized} from "./model-applier.ts";
import {pickSignificantCorrespondences} from "./significance.ts";

export interface BuildOptions {
  tokenizer: Tokenizer,
  normalizer: Normalizer,
  repeatIterations: number,
  significanceLevel: number
}

type Tokens = Array<[Token[], Token[]]>;

function tokenize(pairs: Array<[string, string]>,
                  tokenizer: Tokenizer, normalizer: Normalizer): Tokens {
  const preprocessor = getPreprocessor(tokenizer, normalizer);
  return pairs.map(([source, target]) => [preprocessor(source), preprocessor(target)]);
}

function createModelData(tokens: Tokens): [Dictionary, number] {
  const dictionary = Dictionary.createEmpty();
  for (const [source, target] of tokens) {
    countSimple(source, target, dictionary);
  }
  return [dictionary, tokens.length];
}

function updateModelData(model: Model, tokens: Tokens): [Dictionary, number] {
  const dictionary = Dictionary.createEmpty();
  let fragmentCount = 0;
  for (const [source, target] of tokens) {
    const [alignment] = applyTokenized(source, target, model);
    countAligned(alignment, dictionary);
    fragmentCount += alignment.filter(([source, target]) => source.length > 0 && target.length > 0).length;
  }
  return [dictionary, fragmentCount];
}

function createModel([dictionary, fragmentCount]: [Dictionary, number], significanceLevel: number) {
  return new Model(pickSignificantCorrespondences(dictionary, fragmentCount, significanceLevel));
}

export function build(pairs: Array<[string, string]>, options: BuildOptions): Model {
  const tokens = tokenize(pairs, options.tokenizer, options.normalizer);
  let model = createModel(createModelData(tokens), options.significanceLevel);
  for (let i = 0; i < options.repeatIterations; i++) {
    model = createModel(updateModelData(model, tokens), options.significanceLevel);
  }
  return model;
}