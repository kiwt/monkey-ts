import {
  Identifier,
  LetStatement,
  Program,
  ReturnStatement,
  Statement,
} from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind, TokenType } from "../token/token";

export class Parser {
  l: Lexer;
  errs: string[];
  curToken: Token;
  peekToken: Token;

  constructor(l: Lexer) {
    this.l = l;
    this.errs = [];
    this.curToken = l.nextToken();
    this.peekToken = l.nextToken();
  }

  errors(): string[] {
    return this.errs;
  }

  private peekError(t: TokenType): void {
    const msg = `expected next token to be ${t}, got ${this.peekToken.Type} instead`;
    this.errs.push(msg);
  }

  private nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  parseProgram(): Program | undefined {
    const program = new Program([]);

    while (this.curToken.Type != TokenKind.Eof) {
      const stmt = this.parseStatement();
      if (stmt !== undefined) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }

    return program;
  }

  private parseStatement(): Statement | undefined {
    switch (this.curToken.Type) {
      case TokenKind.Let:
        return this.parseLetStatement();
      case TokenKind.Return:
        return this.parseReturnStatement();
      default:
        return;
    }
  }

  private parseLetStatement(): LetStatement | undefined {
    const stmt = new LetStatement(this.curToken);

    if (!this.expectPeek(TokenKind.Ident)) {
      return;
    }

    stmt.name = new Identifier(this.curToken, this.curToken.Literal);

    if (!this.expectPeek(TokenKind.Assign)) {
      return;
    }

    // TODO: We're skipping the expressions until we // encounter a semicolon
    while (!this.curTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return stmt;
  }

  private parseReturnStatement(): ReturnStatement | undefined {
    const stmt = new ReturnStatement(this.curToken);

    this.nextToken();

    // TODO: We're skipping the expressions until we // encounter a semicolon
    if (!this.curTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return stmt;
  }

  private curTokenIs(t: TokenType): boolean {
    return this.curToken.Type === t;
  }

  private peekTokenIs(t: TokenType): boolean {
    return this.peekToken.Type === t;
  }

  private expectPeek(t: TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    }
    this.peekError(t);
    return false;
  }
}
