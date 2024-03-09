import {
  ArrayLiteral,
  BlockStatement,
  Boolean,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  HashLiteral,
  Identifier,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  StringLiteral,
} from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind, TokenType } from "../token/token";

type PrecedenceType = (typeof Precedence)[keyof typeof Precedence];

const Precedence = {
  LOWEST: 1,
  EQUALS: 2, // ==
  LESSGREATER: 3, // > or <
  SUM: 4, // +
  PRODUCT: 5, // *
  PREFIX: 6, // -X or !X
  CALL: 7, // myFunction(X)
  INDEX: 8, // array[index]
} as const;

const precedences = new Map<TokenType, PrecedenceType>([
  [TokenKind.EQ, Precedence.EQUALS],
  [TokenKind.NOT_EQ, Precedence.EQUALS],
  [TokenKind.LT, Precedence.LESSGREATER],
  [TokenKind.GT, Precedence.LESSGREATER],
  [TokenKind.PLUS, Precedence.SUM],
  [TokenKind.MINUS, Precedence.SUM],
  [TokenKind.SLASH, Precedence.PRODUCT],
  [TokenKind.ASTERISK, Precedence.PRODUCT],
  [TokenKind.LPAREN, Precedence.CALL],
  [TokenKind.LBRACKET, Precedence.INDEX],
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
      [TokenKind.IDENT, this.parseIdentifier],
      [TokenKind.INT, this.parseIntegerLiteral],
      [TokenKind.STRING, this.parseStringLiteral],
      [TokenKind.FUNCTION, this.parseFunctionLiteral],
      [TokenKind.BANG, this.parsePrefixExpression],
      [TokenKind.MINUS, this.parsePrefixExpression],
      [TokenKind.LPAREN, this.parseGroupedExpression],
      [TokenKind.IF, this.parseIfExpression],
      [TokenKind.TRUE, this.parseBoolean],
      [TokenKind.FALSE, this.parseBoolean],
      [TokenKind.LBRACKET, this.parseArrayLiteral],
      [TokenKind.LBRACE, this.parseHashLiteral],
    ]);
    this.infixParseFns = new Map<TokenType, InfixParseFn>([
      [TokenKind.PLUS, this.parseInfixExpression],
      [TokenKind.MINUS, this.parseInfixExpression],
      [TokenKind.SLASH, this.parseInfixExpression],
      [TokenKind.ASTERISK, this.parseInfixExpression],
      [TokenKind.EQ, this.parseInfixExpression],
      [TokenKind.NOT_EQ, this.parseInfixExpression],
      [TokenKind.LT, this.parseInfixExpression],
      [TokenKind.GT, this.parseInfixExpression],
      [TokenKind.LPAREN, this.parseCallExpression],
      [TokenKind.LBRACKET, this.parseIndexExpression],
    ]);
  }

  errors(): string[] {
    return this.errs;
  }

  parseProgram(): Program | undefined {
    const program = new Program([]);

    while (this.curToken.Type != TokenKind.EOF) {
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
      case TokenKind.LET:
        return this.parseLetStatement();
      case TokenKind.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement | undefined {
    const stmt = new LetStatement(this.curToken);

    if (!this.expectPeek(TokenKind.IDENT)) {
      return undefined;
    }

    stmt.name = new Identifier(this.curToken, this.curToken.Literal);

    if (!this.expectPeek(TokenKind.ASSIGN)) {
      return undefined;
    }

    this.nextToken();

    stmt.value = this.parseExpression(Precedence.LOWEST);

    if (this.peekTokenIs(TokenKind.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  private parseReturnStatement(): ReturnStatement | undefined {
    const stmt = new ReturnStatement(this.curToken);

    this.nextToken();

    stmt.returnValue = this.parseExpression(Precedence.LOWEST);

    if (this.peekTokenIs(TokenKind.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  private parseExpressionStatement(): ExpressionStatement | undefined {
    const stmt = new ExpressionStatement(this.curToken);

    stmt.expression = this.parseExpression(Precedence.LOWEST);

    if (this.peekTokenIs(TokenKind.SEMICOLON)) {
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
      !this.peekTokenIs(TokenKind.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns.get(this.peekToken.Type);
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

  private parseStringLiteral = (): Expression | undefined => {
    return new StringLiteral(this.curToken, this.curToken.Literal);
  };

  private parseFunctionLiteral = (): Expression | undefined => {
    const lit = new FunctionLiteral(this.curToken, []);

    if (!this.expectPeek(TokenKind.LPAREN)) {
      return undefined;
    }

    const params = this.parseFunctionParameters();
    if (params !== undefined) {
      lit.parameters = params;
    }

    if (!this.expectPeek(TokenKind.LBRACE)) {
      return undefined;
    }

    lit.body = this.parseBlockStatement();

    return lit;
  };

  private parseFunctionParameters(): Identifier[] | undefined {
    const identifiers: Identifier[] = [];
    if (this.peekTokenIs(TokenKind.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();
    const ident = new Identifier(this.curToken, this.curToken.Literal);
    identifiers.push(ident);

    while (this.peekTokenIs(TokenKind.COMMA)) {
      this.nextToken();
      this.nextToken();
      const ident = new Identifier(this.curToken, this.curToken.Literal);
      identifiers.push(ident);
    }

    if (!this.expectPeek(TokenKind.RPAREN)) {
      return undefined;
    }

    return identifiers;
  }

  private parseBoolean = (): Expression | undefined => {
    return new Boolean(this.curToken, this.curTokenIs(TokenKind.TRUE));
  };

  private parseArrayLiteral = (): Expression | undefined => {
    const array = new ArrayLiteral(this.curToken, []);
    const expList = this.parseExpressionList(TokenKind.RBRACKET);
    if (expList) {
      array.elements = expList;
    }

    return array;
  };

  private parseHashLiteral = (): Expression | undefined => {
    const hash = new HashLiteral(
      this.curToken,
      new Map<Expression, Expression>()
    );

    while (!this.peekTokenIs(TokenKind.RBRACE)) {
      this.nextToken();
      const key = this.parseExpression(Precedence.LOWEST);

      if (!this.expectPeek(TokenKind.COLON)) {
        return undefined;
      }

      this.nextToken();
      const value = this.parseExpression(Precedence.LOWEST);

      if (key === undefined || value === undefined) {
        return undefined;
      }

      hash.pairs.set(key, value);

      if (
        !this.peekTokenIs(TokenKind.RBRACE) &&
        !this.expectPeek(TokenKind.COMMA)
      ) {
        return undefined;
      }
    }

    if (!this.expectPeek(TokenKind.RBRACE)) {
      return undefined;
    }

    return hash;
  };

  private parsePrefixExpression = (): Expression | undefined => {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.Literal
    );

    this.nextToken();

    expression.right = this.parseExpression(Precedence.PREFIX);

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
    const args = this.parseExpressionList(TokenKind.RPAREN);
    if (args !== undefined) {
      exp.args = args;
    }
    return exp;
  };

  private parseIndexExpression = (left: Expression): Expression | undefined => {
    const exp = new IndexExpression(this.curToken, left);
    this.nextToken();

    exp.index = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenKind.RBRACKET)) {
      return undefined;
    }

    return exp;
  };

  private parseCallArguments(): Expression[] | undefined {
    const args: Expression[] = [];

    if (this.peekTokenIs(TokenKind.RPAREN)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    const exp = this.parseExpression(Precedence.LOWEST);
    if (exp !== undefined) {
      args.push(exp);
    }

    while (this.peekTokenIs(TokenKind.COMMA)) {
      this.nextToken();
      this.nextToken();
      const exp = this.parseExpression(Precedence.LOWEST);
      if (exp !== undefined) {
        args.push(exp);
      }
    }

    if (!this.expectPeek(TokenKind.RPAREN)) {
      return undefined;
    }

    return args;
  }

  private parseGroupedExpression = (): Expression | undefined => {
    this.nextToken();

    const exp = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenKind.RPAREN)) {
      return undefined;
    }

    return exp;
  };

  private parseIfExpression = (): Expression | undefined => {
    const expression = new IfExpression(this.curToken);

    if (!this.expectPeek(TokenKind.LPAREN)) {
      return undefined;
    }

    this.nextToken();
    expression.condition = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenKind.RPAREN)) {
      return undefined;
    }

    if (!this.expectPeek(TokenKind.LBRACE)) {
      return undefined;
    }

    expression.consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TokenKind.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(TokenKind.LBRACE)) {
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
      !this.curTokenIs(TokenKind.RBRACE) &&
      !this.curTokenIs(TokenKind.EOF)
    ) {
      const stmt = this.parseStatement();
      if (stmt !== undefined) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }

    return block;
  };

  private parseExpressionList(end: TokenType): Expression[] | undefined {
    let list: Expression[] = [];

    if (this.peekTokenIs(end)) {
      this.nextToken();
      return list;
    }

    this.nextToken();
    list.push(this.parseExpression(Precedence.LOWEST)!);

    while (this.peekTokenIs(TokenKind.COMMA)) {
      this.nextToken();
      this.nextToken();
      list.push(this.parseExpression(Precedence.LOWEST)!);
    }

    if (!this.expectPeek(end)) {
      return undefined;
    }

    return list;
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

  private peekPrecedence(): PrecedenceType {
    const p = precedences.get(this.peekToken.Type);
    if (p !== undefined) {
      return p;
    }

    return Precedence.LOWEST;
  }

  private curPrecedence(): PrecedenceType {
    const p = precedences.get(this.curToken.Type);
    if (p !== undefined) {
      return p;
    }

    return Precedence.LOWEST;
  }
}
