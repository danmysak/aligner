export type Token = string;
export type Tokenizer = (string: string) => Token[];
export type Normalizer = (token: Token) => Token;

export const tokenSeparator = String.fromCharCode(0);

function defaultTokenizer(string: string): Token[] {
  return string.split('');
}

function defaultNormalizer(token: Token): Token {
  return token;
}

export function tokenizerOrDefault(tokenizer: Tokenizer | undefined): Tokenizer {
  return tokenizer ?? defaultTokenizer;
}

export function normalizerOrDefault(normalizer: Normalizer | undefined): Normalizer {
  return normalizer ?? defaultNormalizer;
}

function preprocess(tokenizer: Tokenizer, normalizer: Normalizer, string: string): Token[] {
  return tokenizer(string).map(normalizer).map((token) => {
    if (token.includes(tokenSeparator)) {
      throw new Error(
        `Tokens contain a character with code ${tokenSeparator.charCodeAt(0)} which is reserved`
      );
    }
    return token;
  });
}

export function getPreprocessor(tokenizer: Tokenizer, normalizer: Normalizer) {
  return preprocess.bind(null, tokenizer, normalizer);
}