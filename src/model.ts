import {Dictionary} from "./dictionary.ts";

export class Model {
  readonly dictionary: Dictionary;

  constructor(data: Dictionary | string) {
    this.dictionary = typeof data === 'string' ? Dictionary.fromSerialized(data) : data;
  }

  serialize(): string {
    return this.dictionary.serialize();
  }
}