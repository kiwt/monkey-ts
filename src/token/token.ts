export interface Token {
  Type: TokenType;
  Literal: string;
}

// type TokenKind = { readonly Illegal: "illegal"}; { readonly Eof: "eof"} ...
// keyof TokenKind = "Illegal" | "Eof" ...
// type TokenType = "illegal" | "eof" ...
export type TokenType = (typeof TokenKind)[keyof typeof TokenKind];

export const TokenKind = {
  Illegal: "illegal",
  Eof: "eof",

  // Identifiers + literals
  Ident: "ident", // add, foobar, x, y, ...
  Int: "int",

  // Operators
  Assign: "=",
  Plus: "+",
  Minus: "-",
  Bang: "!",
  Asterisk: "*",
  Slash: "/",

  Lt: "<",
  Gt: ">",
  Eq: "==",
  NotEq: "!=",

  // Delimiters
  Comma: ",",
  Semicolon: ";",

  LParen: "(",
  RParen: ")",
  LBrace: "{",
  RBrace: "}",

  // Keywords
  Function: "function",
  Let: "let",
  True: "true",
  False: "false",
  If: "if",
  Else: "else",
  Return: "return",
} as const;

const keywords = new Map<string, TokenType>([
  ["fn", TokenKind.Function],
  ["let", TokenKind.Let],
  ["true", TokenKind.True],
  ["false", TokenKind.False],
  ["if", TokenKind.If],
  ["else", TokenKind.Else],
  ["return", TokenKind.Return],
]);

export function lookupIdent(ident: string): TokenType {
  const tokType = keywords.get(ident);
  if (tokType) {
    return tokType;
  }

  return TokenKind.Ident;
}
