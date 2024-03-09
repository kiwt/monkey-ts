import { Token } from "../token/token";

export type NodeType = (typeof NodeKind)[keyof typeof NodeKind];

export const NodeKind = {
  Program: 1,
  LetStatement: 2,
  ReturnStatement: 3,
  ExpressionStatement: 4,
  BlockStatement: 5,
  Identifier: 6,
  IntegerLiteral: 7,
  PrefixExpression: 8,
  InfixExpression: 9,
  IfExpression: 10,
  Boolean: 11,
  FunctionLiteral: 12,
  CallExpression: 13,
  StringLiteral: 14,
  ArrayLiteral: 15,
  IndexExpression: 16,
  HashLiteral: 17,
} as const;

export interface Node {
  tokenLiteral(): string;
  string(): string;
  kind(): NodeType;
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

  string(): string {
    let out = "";
    for (const s of this.statements) {
      out += s.string();
    }

    return out;
  }

  kind(): NodeType {
    return NodeKind.Program;
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

  string(): string {
    let out = "";
    out += this.tokenLiteral() + " ";
    out += this.name?.string();
    out += " = ";

    if (this.value !== undefined) {
      out += this.value.string();
    }

    out += ";";

    return out;
  }

  kind(): NodeType {
    return NodeKind.LetStatement;
  }
}

export class ReturnStatement implements Statement {
  constructor(public token: Token, public returnValue?: Expression) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";
    out += this.tokenLiteral() + " ";

    if (this.returnValue !== undefined) {
      out += this.returnValue.string();
    }

    out += ";";

    return out;
  }

  kind(): NodeType {
    return NodeKind.ReturnStatement;
  }
}

export class ExpressionStatement implements Statement {
  constructor(public token: Token, public expression?: Expression) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    if (this.expression !== undefined) {
      return this.expression.string();
    }

    return "";
  }

  kind(): NodeType {
    return NodeKind.ExpressionStatement;
  }
}

export class BlockStatement implements Statement {
  constructor(public token: Token, public statements: Statement[]) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    for (const s of this.statements) {
      out += s.string();
    }

    return out;
  }

  kind(): NodeType {
    return NodeKind.BlockStatement;
  }
}

export class Identifier implements Expression {
  constructor(public token: Token, public value: string) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    return this.value;
  }

  kind(): NodeType {
    return NodeKind.Identifier;
  }
}

export class IntegerLiteral implements Expression {
  constructor(public token: Token, public value: number) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    return this.token.Literal;
  }

  kind(): NodeType {
    return NodeKind.IntegerLiteral;
  }
}

export class StringLiteral implements Expression {
  constructor(public token: Token, public value: string) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    return this.token.Literal;
  }

  kind(): NodeType {
    return NodeKind.StringLiteral;
  }
}

export class PrefixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public right?: Expression
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    out += "(";
    out += this.operator;
    out += this.right?.string();
    out += ")";

    return out;
  }

  kind(): NodeType {
    return NodeKind.PrefixExpression;
  }
}

export class InfixExpression implements Expression {
  constructor(
    public token: Token, // The operator token, e.g. +
    public operator: string,
    public left?: Expression,
    public right?: Expression
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    out += "(";
    out += this.left?.string();
    out += " " + this.operator + " ";
    out += this.right?.string();
    out += ")";

    return out;
  }

  kind(): NodeType {
    return NodeKind.InfixExpression;
  }
}

export class IfExpression implements Expression {
  constructor(
    public token: Token, // The 'if' token
    public condition?: Expression,
    public consequence?: BlockStatement,
    public alternative?: BlockStatement
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    out += "if";
    out += this.condition?.string();
    out += " ";
    out += this.consequence?.string();

    if (this.alternative !== undefined) {
      out += "else ";
      out += this.alternative?.string();
    }

    return out;
  }

  kind(): NodeType {
    return NodeKind.IfExpression;
  }
}

export class Boolean implements Expression {
  constructor(public token: Token, public value: boolean) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    return this.token.Literal;
  }

  kind(): NodeType {
    return NodeKind.Boolean;
  }
}

export class FunctionLiteral implements Expression {
  constructor(
    public token: Token,
    public parameters: Identifier[],
    public body?: BlockStatement
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    let params: string[] = [];
    for (const p of this.parameters) {
      params.push(p.string());
    }

    out += this.tokenLiteral();
    out += "(";
    out += params.join(", ");
    out += ")";
    out += this.body?.string();

    return out;
  }

  kind(): NodeType {
    return NodeKind.FunctionLiteral;
  }
}

export class ArrayLiteral implements Expression {
  constructor(public token: Token, public elements: Expression[]) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    let elements: string[] = [];
    for (const el of this.elements) {
      elements.push(el.string());
    }

    out += "[";
    out += elements.join(", ");
    out += "]";

    return out;
  }

  kind(): NodeType {
    return NodeKind.ArrayLiteral;
  }
}

export class CallExpression implements Expression {
  constructor(
    public token: Token,
    public args: Expression[],
    public func?: Expression
  ) {}

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    let argStrings: string[] = [];
    for (const p of this.args) {
      argStrings.push(p.string());
    }

    out += this.func?.string();
    out += "(";
    out += argStrings.join(", ");
    out += ")";

    return out;
  }

  kind(): NodeType {
    return NodeKind.CallExpression;
  }
}

export class IndexExpression implements Expression {
  constructor(
    public token: Token, // The [ Token
    public left: Expression,
    public index?: Expression
  ) {}

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    out += "(";
    out += this.left.string();
    out += "[";
    out += this.index?.string();
    out += "])";

    return out;
  }

  kind(): NodeType {
    return NodeKind.IndexExpression;
  }
}

export class HashLiteral implements Expression {
  constructor(public token: Token, public pairs: Map<Expression, Expression>) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.Literal;
  }

  string(): string {
    let out = "";

    let pairs: string[] = [];
    for (const [key, value] of this.pairs) {
      pairs.push(key.string() + ":" + value.string());
    }

    out += "{";
    out += pairs.join(", ");
    out += "}";

    return out;
  }

  kind(): NodeType {
    return NodeKind.HashLiteral;
  }
}
