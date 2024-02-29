export interface Token {
  Type: TokenType;
  Literal: string;
}

// type TokenKind = { readonly ILLEGAL: "ILLEGAL"}; { readonly EOF: "EOF"} ...
// keyof TokenKind = "ILLEGAL" | "EOF" ...
// type TokenType = "ILLEGAL" | "EOF" ...
export type TokenType = (typeof TokenKind)[keyof typeof TokenKind];

export const TokenKind = {
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",

  // Identifiers + literals
  IDENT: "IDENT", // add, foobar, x, y, ...
  INT: "INT",
  STRING: "STRING",

  // Operators
  ASSIGN: "=",
  PLUS: "+",
  MINUS: "-",
  BANG: "!",
  ASTERISK: "*",
  SLASH: "/",

  LT: "<",
  GT: ">",
  EQ: "==",
  NOT_EQ: "!=",

  // Delimiters
  COMMA: ",",
  SEMICOLON: ";",

  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",
  LBRACKET: "[",
  RBRACKET: "]",

  // Keywords
  FUNCTION: "FUNCTION",
  LET: "LET",
  TRUE: "TRUE",
  FALSE: "FALSE",
  IF: "IF",
  ELSE: "ELSE",
  RETURN: "RETURN",
} as const;

const keywords = new Map<string, TokenType>([
  ["fn", TokenKind.FUNCTION],
  ["let", TokenKind.LET],
  ["true", TokenKind.TRUE],
  ["false", TokenKind.FALSE],
  ["if", TokenKind.IF],
  ["else", TokenKind.ELSE],
  ["return", TokenKind.RETURN],
]);

export function lookupIdent(ident: string): TokenType {
  const tokType = keywords.get(ident);
  if (tokType) {
    return tokType;
  }

  return TokenKind.IDENT;
}
