import { Identifier, LetStatement, Program, Statement } from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind, TokenType } from "../token/token";

export class Parser {
  l: Lexer;
  curToken: Token;
  peekToken: Token;

  constructor(l: Lexer) {
    this.l = l;
    this.curToken = l.nextToken();
    this.peekToken = l.nextToken();
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
    return false;
  }
}
