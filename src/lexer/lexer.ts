import { Token, TokenType, TokenKind, lookupIdent } from "../token/token";

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

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = "\0";
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
        if (this.peekChar() == "=") {
          let ch = this.ch;
          this.readChar();
          tok = newToken(TokenKind.EQ, ch + this.ch);
          break;
        }
        tok = newToken(TokenKind.ASSIGN, this.ch);
        break;
      case "+":
        tok = newToken(TokenKind.PLUS, this.ch);
        break;
      case "-":
        tok = newToken(TokenKind.MINUS, this.ch);
        break;
      case "!":
        if (this.peekChar() == "=") {
          let ch = this.ch;
          this.readChar();
          tok = newToken(TokenKind.NOT_EQ, ch + this.ch);
          break;
        }
        tok = newToken(TokenKind.BANG, this.ch);
        break;
      case "/":
        tok = newToken(TokenKind.SLASH, this.ch);
        break;
      case "*":
        tok = newToken(TokenKind.ASTERISK, this.ch);
        break;
      case "<":
        tok = newToken(TokenKind.LT, this.ch);
        break;
      case ">":
        tok = newToken(TokenKind.GT, this.ch);
        break;
      case ";":
        tok = newToken(TokenKind.SEMICOLON, this.ch);
        break;
      case "(":
        tok = newToken(TokenKind.LPAREN, this.ch);
        break;
      case ")":
        tok = newToken(TokenKind.RPAREN, this.ch);
        break;
      case ",":
        tok = newToken(TokenKind.COMMA, this.ch);
        break;
      case "{":
        tok = newToken(TokenKind.LBRACE, this.ch);
        break;
      case "}":
        tok = newToken(TokenKind.RBRACE, this.ch);
        break;
      case "\0":
        tok = newToken(TokenKind.EOF, "");
        break;
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentifier();
          tok = newToken(lookupIdent(literal), literal);
          return tok;
        } else if (isDigit(this.ch)) {
          tok = newToken(TokenKind.INT, this.readNumber());
          return tok;
        } else {
          tok = newToken(TokenKind.ILLEGAL, this.ch);
          break;
        }
    }

    this.readChar();
    return tok;
  }

  private readIdentifier(): string {
    let position = this.position;
    while (isLetter(this.ch)) {
      this.readChar();
    }

    return this.input.substring(position, this.position);
  }

  private readNumber(): string {
    let position = this.position;
    while (isDigit(this.ch)) {
      this.readChar();
    }

    return this.input.substring(position, this.position);
  }

  private skipWhiteSpace() {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }

  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return "EOF";
    }

    return this.input[this.readPosition];
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
