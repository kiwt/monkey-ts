import {
  BlockStatement,
  Boolean,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
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
  [TokenKind.LParen, Precedence.Call],
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
      [TokenKind.Function, this.parseFunctionLiteral],
      [TokenKind.Bang, this.parsePrefixExpression],
      [TokenKind.Minus, this.parsePrefixExpression],
      [TokenKind.LParen, this.parseGroupedExpression],
      [TokenKind.If, this.parseIfExpression],
      [TokenKind.True, this.parseBoolean],
      [TokenKind.False, this.parseBoolean],
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
      [TokenKind.LParen, this.parseCallExpression],
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

    this.nextToken();

    stmt.value = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return stmt;
  }

  private parseReturnStatement(): ReturnStatement | undefined {
    const stmt = new ReturnStatement(this.curToken);

    this.nextToken();

    stmt.returnValue = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return stmt;
  }

  private parseExpressionStatement(): ExpressionStatement | undefined {
    const stmt = new ExpressionStatement(this.curToken);

    stmt.expression = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
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

  private parseFunctionLiteral = (): Expression | undefined => {
    const lit = new FunctionLiteral(this.curToken, []);

    if (!this.expectPeek(TokenKind.LParen)) {
      return undefined;
    }

    const params = this.parseFunctionParameters();
    if (params !== undefined) {
      lit.parameters = params;
    }

    if (!this.expectPeek(TokenKind.LBrace)) {
      return undefined;
    }

    lit.body = this.parseBlockStatement();

    return lit;
  };

  private parseFunctionParameters(): Identifier[] | undefined {
    const identifiers: Identifier[] = [];
    if (this.peekTokenIs(TokenKind.RParen)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();
    const ident = new Identifier(this.curToken, this.curToken.Literal);
    identifiers.push(ident);

    while (this.peekTokenIs(TokenKind.Comma)) {
      this.nextToken();
      this.nextToken();
      const ident = new Identifier(this.curToken, this.curToken.Literal);
      identifiers.push(ident);
    }

    if (!this.expectPeek(TokenKind.RParen)) {
      return undefined;
    }

    return identifiers;
  }

  private parseBoolean = (): Expression | undefined => {
    return new Boolean(this.curToken, this.curTokenIs(TokenKind.True));
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

  private parseCallExpression = (func: Expression): Expression | undefined => {
    const exp = new CallExpression(this.curToken, [], func);
    const args = this.parseCallArguments();
    if (args !== undefined) {
      exp.args = args;
    }
    return exp;
  };

  private parseCallArguments(): Expression[] | undefined {
    const args: Expression[] = [];

    if (this.peekTokenIs(TokenKind.RParen)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    const exp = this.parseExpression(Precedence.Lowest);
    if (exp !== undefined) {
      args.push(exp);
    }

    while (this.peekTokenIs(TokenKind.Comma)) {
      this.nextToken();
      this.nextToken();
      const exp = this.parseExpression(Precedence.Lowest);
      if (exp !== undefined) {
        args.push(exp);
      }
    }

    if (!this.expectPeek(TokenKind.RParen)) {
      return undefined;
    }

    return args;
  }

  private parseGroupedExpression = (): Expression | undefined => {
    this.nextToken();

    const exp = this.parseExpression(Precedence.Lowest);

    if (!this.expectPeek(TokenKind.RParen)) {
      return undefined;
    }

    return exp;
  };

  private parseIfExpression = (): Expression | undefined => {
    const expression = new IfExpression(this.curToken);

    if (!this.expectPeek(TokenKind.LParen)) {
      return undefined;
    }

    this.nextToken();
    expression.condition = this.parseExpression(Precedence.Lowest);

    if (!this.expectPeek(TokenKind.RParen)) {
      return undefined;
    }

    if (!this.expectPeek(TokenKind.LBrace)) {
      return undefined;
    }

    expression.consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TokenKind.Else)) {
      this.nextToken();

      if (!this.expectPeek(TokenKind.LBrace)) {
        return undefined;
      }

      expression.alternative = this.parseBlockStatement();
    }

    return expression;
  };

  private parseBlockStatement = (): BlockStatement | undefined => {
    const block = new BlockStatement(this.curToken, []);

    this.nextToken();

    while (
      !this.curTokenIs(TokenKind.RBrace) &&
      !this.curTokenIs(TokenKind.Eof)
    ) {
      const stmt = this.parseStatement();
      if (stmt !== undefined) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }

    return block;
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
