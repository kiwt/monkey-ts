import {
  LetStatement,
  ReturnStatement,
  Statement,
  ExpressionStatement,
  IntegerLiteral,
  Expression,
  InfixExpression,
} from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { TokenKind } from "../token/token";
import { Parser } from "./parser";
import { Identifier, PrefixExpression } from "../ast/ast";

test("testLetStatement", () => {
  const input = `
   let x 5;
   let = 10;
   let 838383;
   `;

  const expected: string[] = ["x", "y", "foobar"];

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  for (let index in expected) {
    const stmt = program?.statements[index];
    expect(testLetStatement(stmt, expected[index])).toBeFalsy();
  }
});

function testLetStatement(s: Statement | undefined, name: string): boolean {
  if (s === undefined) {
    return false;
  }

  if (s.tokenLiteral() !== TokenKind.Let) {
    return false;
  }

  let letStmt = s as LetStatement;
  if (letStmt === undefined) {
    return false;
  }

  if (letStmt.name?.value !== name) {
    return false;
  }

  if (letStmt.name?.tokenLiteral() !== name) {
    return false;
  }

  return true;
}

test("testReturnStatement", () => {
  const input = `
    return 5;
    return 10;
    return 993322;
   `;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program?.statements).toHaveLength(3);

  for (const stmt of program ? program.statements : []) {
    expect(testReturnStatement(stmt, "return")).toBeTruthy();
  }
});

function testReturnStatement(s: Statement | undefined, name: string): boolean {
  if (s === undefined) {
    return false;
  }

  if (s.tokenLiteral() !== TokenKind.Return) {
    return false;
  }

  let returnStmt = s as ReturnStatement;
  if (returnStmt === undefined) {
    return false;
  }

  if (returnStmt.tokenLiteral() !== name) {
    return false;
  }

  return true;
}

test("testIdentifierExpression", () => {
  const input = `foobar;`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program?.statements).toHaveLength(2);

  expect(
    testIdentifierExpression(program?.statements[0], "foobar")
  ).toBeTruthy();
});

function testIdentifierExpression(
  s: Statement | undefined,
  value: string
): boolean {
  if (s === undefined) {
    return false;
  }

  const stmt = s as ExpressionStatement;
  if (stmt === undefined) {
    return false;
  }

  const ident = stmt.expression as Identifier;
  if (ident === undefined) {
    return false;
  }

  if (ident.value !== value) {
    return false;
  }

  if (ident.tokenLiteral() !== value) {
    return false;
  }

  return true;
}

test("testIntegerLiteralExpression", () => {
  const input = `5;`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program?.statements).toHaveLength(2);

  expect(testIntegerLiteralExpression(program?.statements[0], 5)).toBeTruthy();
});

function testIntegerLiteralExpression(
  s: Statement | undefined,
  value: number
): boolean {
  if (s === undefined) {
    return false;
  }

  const stmt = s as ExpressionStatement;
  if (stmt === undefined) {
    return false;
  }

  const ident = stmt.expression as IntegerLiteral;
  if (ident === undefined) {
    return false;
  }

  if (ident.value !== value) {
    return false;
  }

  if (ident.tokenLiteral() !== String(value)) {
    return false;
  }

  return true;
}

test("testParsingPrefixExpressions", () => {
  const prefixTests = [
    { input: "!5;", operator: "!", integerValue: 5 },
    { input: "-15;", operator: "-", integerValue: 15 },
  ];

  for (const index in prefixTests) {
    const l = new Lexer(prefixTests[index].input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program?.statements).toHaveLength(2);

    expect(
      testParsingPrefixExpression(
        program?.statements[0],
        prefixTests[index].operator,
        prefixTests[index].integerValue
      )
    ).toBeTruthy();
  }
});

function testParsingPrefixExpression(
  s: Statement | undefined,
  operator: string,
  integerValue: number
): boolean {
  if (s === undefined) {
    return false;
  }

  const stmt = s as ExpressionStatement;
  if (stmt === undefined) {
    return false;
  }

  const exp = stmt.expression as PrefixExpression;
  if (exp === undefined) {
    return false;
  }

  if (exp.operator !== operator) {
    return false;
  }

  if (!testIntegerLiteral(exp.right, integerValue)) {
    return false;
  }

  return true;
}

test("testParsingInfixExpressions", () => {
  const infixTests = [
    { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
    { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
    { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
    { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
    { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
    { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
    { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
    { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
  ];

  for (const index in infixTests) {
    const l = new Lexer(infixTests[index].input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program?.statements).toHaveLength(2);

    expect(
      testParsingInfixExpressions(
        program?.statements[0],
        infixTests[index].leftValue,
        infixTests[index].operator,
        infixTests[index].rightValue
      )
    ).toBeTruthy();
  }
});

function testParsingInfixExpressions(
  s: Statement | undefined,
  leftValue: number,
  operator: string,
  rightValue: number
): boolean {
  if (s === undefined) {
    return false;
  }

  const stmt = s as ExpressionStatement;
  if (stmt === undefined) {
    return false;
  }

  const exp = stmt.expression as InfixExpression;
  if (exp === undefined) {
    return false;
  }

  if (!testIntegerLiteral(exp.left, leftValue)) {
    return false;
  }

  if (exp.operator !== operator) {
    return false;
  }

  if (!testIntegerLiteral(exp.right, rightValue)) {
    return false;
  }

  return true;
}

test("testOperatorPrecedenceParsing", () => {
  const tests = [
    { input: "-a * b", expected: "((-a) * b)" },
    { input: "!-a", expected: "(!(-a))" },
    { input: "a + b + c", expected: "((a + b) + c)" },
    { input: "a + b - c", expected: "((a + b) - c)" },
    { input: "a * b * c", expected: "((a * b) * c)" },
    { input: "a * b / c", expected: "((a * b) / c)" },
    { input: "a + b / c", expected: "(a + (b / c))" },
    {
      input: "a + b * c + d / e - f",
      expected: "(((a + (b * c)) + (d / e)) - f)",
    },
    { input: "3 + 4; -5 * 5", expected: "(3 + 4)((-5) * 5)" },
    { input: "5 > 4 == 3 < 4", expected: "((5 > 4) == (3 < 4))" },
    { input: "((5 < 4) != (3 > 4))", expected: "((5 < 4) != (3 > 4))" },
    {
      input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
      expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
    },
    {
      input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
      expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
    },
  ];

  for (const index in tests) {
    const l = new Lexer(tests[index].input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect((program?.string(), tests[index].expected)).toBeTruthy();
  }
});

function testIntegerLiteral(
  il: Expression | undefined,
  value: number
): boolean {
  if (il === undefined) {
    return false;
  }

  const integ = il as IntegerLiteral;
  if (integ === undefined) {
    return false;
  }

  if (integ.tokenLiteral() !== String(value)) {
    return false;
  }

  return true;
}

function checkParserErrors(p: Parser): void {
  const errors = p.errs;

  if (errors.length === 0) {
    return;
  }

  console.log(`parser has ${errors.length} errors`);
  for (const msg of errors) {
    console.log(`parse error: ${msg}`);
  }
}
