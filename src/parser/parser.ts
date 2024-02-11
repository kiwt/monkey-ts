import {
  Expression,
  ExpressionStatement,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
} from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind, TokenType } from "../token/token";

type PrecedenceType = (typeof Precedence)[keyof typeof Precedence];

const Precedence = {
  Lowest: 0,
  Equals: 1, // ==
  LessGreater: 2, // > or <
  Sum: 3, // +
  Product: 4, // *
  Prefix: 5, // -X or !X
  Call: 6, // myFunction(X)
} as const;

const precedences = new Map<TokenType, PrecedenceType>([
  [TokenKind.Eq, Precedence.Equals],
  [TokenKind.NotEq, Precedence.Equals],
  [TokenKind.Lt, Precedence.LessGreater],
  [TokenKind.Gt, Precedence.LessGreater],
  [TokenKind.Plus, Precedence.Sum],
  [TokenKind.Minus, Precedence.Sum],
  [TokenKind.Slash, Precedence.Product],
  [TokenKind.Asterisk, Precedence.Product],
]);

type PrefixParseFn = () => Expression | undefined;
type InfixParseFn = (_: Expression) => Expression | undefined;

export class Parser {
  l: Lexer;
  errs: string[];
  curToken: Token;
  peekToken: Token;
  prefixParseFns: Map<TokenType, PrefixParseFn>;
  infixParseFns: Map<TokenType, InfixParseFn>;

  constructor(l: Lexer) {
    this.l = l;
    this.errs = [];
    this.curToken = l.nextToken();
    this.peekToken = l.nextToken();
    this.prefixParseFns = new Map<TokenType, PrefixParseFn>([
      [TokenKind.Ident, this.parseIdentifier],
      [TokenKind.Int, this.parseIntegerLiteral],
      [TokenKind.Bang, this.parsePrefixExpression],
      [TokenKind.Minus, this.parsePrefixExpression],
    ]);
    this.infixParseFns = new Map<TokenType, InfixParseFn>([
      [TokenKind.Plus, this.parseInfixExpression],
      [TokenKind.Minus, this.parseInfixExpression],
      [TokenKind.Slash, this.parseInfixExpression],
      [TokenKind.Asterisk, this.parseInfixExpression],
      [TokenKind.Eq, this.parseInfixExpression],
      [TokenKind.NotEq, this.parseInfixExpression],
      [TokenKind.Lt, this.parseInfixExpression],
      [TokenKind.Gt, this.parseInfixExpression],
    ]);
  }

  errors(): string[] {
    return this.errs;
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

  private peekError(t: TokenType): void {
    const msg = `expected next token to be ${t}, got ${this.peekToken.Type} instead`;
    this.errs.push(msg);
  }

  private noPrefixParseFnError(t: TokenType): void {
    const msg = `no prefix parse function for ${t} found`;
    this.errs.push(msg);
  }

  private nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  private parseStatement(): Statement | undefined {
    switch (this.curToken.Type) {
      case TokenKind.Let:
        return this.parseLetStatement();
      case TokenKind.Return:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
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

  private parseExpressionStatement(): ExpressionStatement | undefined {
    const stmt = new ExpressionStatement(this.curToken);

    stmt.expression = this.parseExpression(Precedence.Lowest);

    if (this.curTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return stmt;
  }

  private parseExpression(precedence: PrecedenceType): Expression | undefined {
    const prefix = this.prefixParseFns.get(this.curToken.Type);
    if (prefix === undefined) {
      this.noPrefixParseFnError(this.curToken.Type);
      return undefined;
    }
    let leftExp = prefix();

    while (
      !this.peekTokenIs(TokenKind.Semicolon) &&
      precedence < this.peekPrecedence()
    ) {
      let infix = this.infixParseFns.get(this.peekToken.Type);
      if (infix === undefined) {
        return leftExp;
      }

      this.nextToken();

      if (leftExp === undefined) {
        return undefined;
      }

      leftExp = infix(leftExp);
    }

    return leftExp;
  }

  private parseIdentifier = (): Expression | undefined => {
    return new Identifier(this.curToken, this.curToken.Literal);
  };

  private parseIntegerLiteral = (): Expression | undefined => {
    const lit = new IntegerLiteral(this.curToken, 0);

    const value = Number(this.curToken.Literal);

    if (Number.isNaN(value)) {
      this.errs.push(`could not parse ${this.curToken.Literal} as integer`);
      return undefined;
    }

    lit.value = value;

    return lit;
  };

  private parsePrefixExpression = (): Expression | undefined => {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.Literal
    );

    this.nextToken();

    expression.right = this.parseExpression(Precedence.Prefix);

    return expression;
  };

  private parseInfixExpression = (left: Expression): Expression | undefined => {
    const expression = new InfixExpression(
      this.curToken,
      this.curToken.Literal,
      left
    );

    const precedence = this.curPrecedence();
    this.nextToken();
    expression.right = this.parseExpression(precedence);

    return expression;
  };

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

  private peekPrecedence(): PrecedenceType {
    const p = precedences.get(this.peekToken.Type);
    if (p !== undefined) {
      return p;
    }

    return Precedence.Lowest;
  }

  private curPrecedence(): PrecedenceType {
    const p = precedences.get(this.peekToken.Type);
    if (p !== undefined) {
      return p;
    }

    return Precedence.Lowest;
  }
}
