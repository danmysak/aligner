import {Token} from "./preprocessor.ts";
import {Dictionary} from "./dictionary.ts";

export class SingleDictionary {
  private readonly dictionary: Dictionary;

  constructor() {
    this.dictionary = Dictionary.createEmpty();
  }

  enumerate(): Array<[Token[], number]> {
    return this.dictionary.enumerate().map(([[key], value]) => [key as Token[], value]);
  }

  modify(tokens: Token[], delta: number) {
    this.dictionary.modify(tokens, null, delta);
  }
}