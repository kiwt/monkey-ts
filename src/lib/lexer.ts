import { Token, TokenType, TokenKind, lookupIdent } from "./token";

export class Lexer {
  private input: string;
  private position: number;
  private readPosition: number;
  private ch: string; // byte

  public constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = "";
    this.readChar();
  }

  readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = "EOF"; // eof
    } else {
      this.ch = this.input[this.readPosition];
    }

    this.position = this.readPosition;
    this.readPosition += 1;
  }

  nextToken(): Token {
    let tok: Token;

    this.skipWhiteSpace();

    switch (this.ch) {
      case "=":
        tok = newToken(TokenKind.Assign, this.ch);
        break;
      case ";":
        tok = newToken(TokenKind.Semicolon, this.ch);
        break;
      case "(":
        tok = newToken(TokenKind.LParen, this.ch);
        break;
      case ")":
        tok = newToken(TokenKind.RParen, this.ch);
        break;
      case ",":
        tok = newToken(TokenKind.Comma, this.ch);
        break;
      case "+":
        tok = newToken(TokenKind.Plus, this.ch);
        break;
      case "{":
        tok = newToken(TokenKind.LBrace, this.ch);
        break;
      case "}":
        tok = newToken(TokenKind.RBrace, this.ch);
        break;
      case "EOF":
        tok = newToken(TokenKind.Eof, "");
        break;
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentifier();
          tok = newToken(lookupIdent(literal), literal);
          return tok;
        } else if (isDigit(this.ch)) {
          tok = newToken(TokenKind.Int, this.readNumber());
          return tok;
        } else {
          tok = newToken(TokenKind.Illegal, this.ch);
          break;
        }
    }

    this.readChar();
    return tok;
  }

  readIdentifier(): string {
    let position = this.position;
    while (isLetter(this.ch)) {
      this.readChar();
    }

    return this.input.substring(position, this.position);
  }

  readNumber(): string {
    let position = this.position;
    while (isDigit(this.ch)) {
      this.readChar();
    }

    return this.input.substring(position, this.position);
  }

  skipWhiteSpace() {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }
}

function isLetter(ch: string): boolean {
  return ("a" <= ch && ch <= "z") || ("A" <= ch && ch <= "Z") || ch == "_";
}

function isDigit(ch: string): boolean {
  return "0" <= ch && ch <= "9";
}

function newToken(type: TokenType, literal: string): Token {
  let tok: Token;
  tok = { Type: type, Literal: literal };
  return tok;
}
