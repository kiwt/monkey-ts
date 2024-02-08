import { Token, TokenKind } from "../token/token";

export interface Node {
  tokenLiteral(): string;
}

export interface Statement extends Node {
  statementNode(): void;
}

export interface Expression extends Node {
  expressionNode(): void;
}

export class Program implements Node {
  constructor(public statements: Statement[]) {}

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }
}

export class LetStatement implements Statement {
  constructor(
    public token: Token,
    public name?: Identifier,
    public value?: Expression
  ) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }
}

export class ReturnStatement implements Statement {
  constructor(public token: Token, public returnValue: Expression) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }
}

export class Identifier implements Expression {
  constructor(public token: Token, public value: string) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }
}
