import {Token, tokenSeparator} from "./preprocessor.ts";

type MapObject = {
  [string: string]: number
};

export class Dictionary {
  private readonly map: MapObject;

  private constructor(map: MapObject | null = null) {
    this.map = map || Object.create(null);
  }

  private static constructKeyPart(tokens: Token[] | null): string {
    // Parenthesizing is necessary so that we can differentiate null from an empty string
    return (tokens ?? []).map((token) => `(${token})`).join(tokenSeparator);
  }

  private static parseKeyPart(part: string): Token[] | null {
    return part === '' ? null : part.split(tokenSeparator).map((token) => token.slice(1, -1));
  }

  private static getPartsSeparator(): string {
    return tokenSeparator + tokenSeparator;
  }

  private static constructKey(source: Token[] | null, target: Token[] | null): string {
    return [
      Dictionary.constructKeyPart(source),
      Dictionary.constructKeyPart(target)
    ].join(Dictionary.getPartsSeparator());
  }

  private static parseKey(key: string): [Token[] | null, Token[] | null] {
    const [source, target] = key.split(Dictionary.getPartsSeparator());
    return [Dictionary.parseKeyPart(source), Dictionary.parseKeyPart(target)];
  }

  retrieve(source: Token[] | null, target: Token[] | null): number {
    return this.map[Dictionary.constructKey(source, target)] ?? 0;
  }

  enumerate(): Array<[[Token[] | null, Token[] | null], number]> {
    return Object.entries(this.map).map(([key, value]) => [Dictionary.parseKey(key), value]);
  }

  modify(source: Token[] | null, target: Token[] | null, delta: number) {
    this.map[Dictionary.constructKey(source, target)] = this.retrieve(source, target) + delta;
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  static fromSerialized(data: string): Dictionary {
    const structure = JSON.parse(data);
    return new Dictionary(structure.map);
  }

  static createEmpty(): Dictionary {
    return new Dictionary();
  }
}