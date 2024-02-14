import { Token, TokenKind } from "../token/token";
import { Lexer } from "../lexer/lexer";

export interface Node {
  tokenLiteral(): string;
  string(): string;
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
}
