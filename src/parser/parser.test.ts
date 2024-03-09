import {
  LetStatement,
  ReturnStatement,
  Statement,
  ExpressionStatement,
  IntegerLiteral,
  Expression,
  InfixExpression,
  Identifier,
  PrefixExpression,
  Boolean,
  FunctionLiteral,
  CallExpression,
  IfExpression,
  StringLiteral,
  IndexExpression,
  ArrayLiteral,
  HashLiteral,
} from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";

test("testLetStatement", () => {
  const tests = [
    { input: "let x = 5;", expectedIdentifier: "x", expectedValue: 5 },
    { input: "let y = true;", expectedIdentifier: "y", expectedValue: true },
    {
      input: "let foobar = y;",
      expectedIdentifier: "foobar",
      expectedValue: "y",
    },
  ];

  for (const tt of tests) {
    const l = new Lexer(tt.input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program?.statements).toHaveLength(1);

    const stmt = program?.statements[0] as Statement;
    expect(stmt).toBeDefined();
    expect(testLetStatement(stmt, tt.expectedIdentifier)).toBe(true);

    const letStmt = stmt as LetStatement;
    expect(letStmt).toBeDefined();

    expect(testLiteralExpression(letStmt.value, tt.expectedValue)).toBe(true);
  }
});

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
    expect(testReturnStatement(stmt, "return")).toBe(true);
  }
});

test("testIdentifierExpression", () => {
  const input = `foobar;`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program?.statements).toHaveLength(1);

  expect(testIdentifierExpression(program?.statements[0], "foobar")).toBe(true);
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

  expect(program?.statements).toHaveLength(1);

  expect(testIntegerLiteralExpression(program?.statements[0], 5)).toBe(true);
});

test("testIfExpression", () => {
  const input = `if (x < y) { x };`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program?.statements).toHaveLength(1);

  expect(testIfExpression(program?.statements[0], "x", "<", "y", "x")).toBe(
    true
  );
});

test("testBooleanExpression", () => {
  const booleanTests = [
    { input: "true;", value: true },
    { input: "false;", value: false },
  ];

  for (const index in booleanTests) {
    const l = new Lexer(booleanTests[index].input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program?.statements).toHaveLength(1);

    expect(
      testBooleanExpression(program?.statements[0], booleanTests[index].value)
    ).toBe(true);
  }
});

test("testParsingPrefixExpressions", () => {
  const prefixTests = [
    { input: "!5;", operator: "!", integerValue: 5 },
    { input: "-15;", operator: "-", integerValue: 15 },
    { input: "!true;", operator: "!", integerValue: true },
    { input: "!false;", operator: "!", integerValue: false },
  ];

  for (const index in prefixTests) {
    const l = new Lexer(prefixTests[index].input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program?.statements).toHaveLength(1);

    expect(
      testParsingPrefixExpression(
        program?.statements[0],
        prefixTests[index].operator,
        prefixTests[index].integerValue
      )
    ).toBe(true);
  }
});

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
    {
      input: "true == true",
      leftValue: true,
      operator: "==",
      rightValue: true,
    },
    {
      input: "true != false",
      leftValue: true,
      operator: "!=",
      rightValue: false,
    },
    {
      input: "false == false",
      leftValue: false,
      operator: "==",
      rightValue: false,
    },
  ];

  for (const index in infixTests) {
    const l = new Lexer(infixTests[index].input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program?.statements).toHaveLength(1);

    expect(
      testParsingInfixExpressions(
        program?.statements[0],
        infixTests[index].leftValue,
        infixTests[index].operator,
        infixTests[index].rightValue
      )
    ).toBe(true);
  }
});

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
    {
      input: "true",
      expected: "true",
    },
    {
      input: "false",
      expected: "false",
    },
    {
      input: "3 > 5 == false",
      expected: "((3 > 5) == false)",
    },
    {
      input: "3 < 5 == true",
      expected: "((3 < 5) == true)",
    },
    {
      input: "1 + (2 + 3) + 4",
      expected: "((1 + (2 + 3)) + 4)",
    },
    {
      input: "(5 + 5) * 2",
      expected: "((5 + 5) * 2)",
    },
    {
      input: "2 / (5 + 5)",
      expected: "(2 / (5 + 5))",
    },
    {
      input: "-(5 + 5)",
      expected: "(-(5 + 5))",
    },
    {
      input: "!(true == true)",
      expected: "(!(true == true))",
    },
    {
      input: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
      expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
    },
    {
      input: "add(a + b + c * d / f + g)",
      expected: "add((((a + b) + ((c * d) / f)) + g))",
    },
    {
      input: "a * [1, 2, 3, 4][b * c] * d",
      expected: "((a * ([1, 2, 3, 4][(b * c)])) * d)",
    },
    {
      input: "add(a * b[2], b[1], 2 * [1, 2][1])",
      expected: "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
    },
  ];

  for (const index in tests) {
    const l = new Lexer(tests[index].input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program?.string()).toStrictEqual(tests[index].expected);
  }
});

test("testFunctionLiteralParsing", () => {
  const input = `fn(x, y) { x + y; }`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program?.statements).toHaveLength(1);

  const stmt = program?.statements[0] as ExpressionStatement;
  expect(stmt).toBeDefined();

  const func = stmt.expression as FunctionLiteral;
  expect(func).toBeDefined();
  expect(func.parameters).toHaveLength(2);

  expect(testLiteralExpression(func.parameters[0], "x")).toBe(true);
  expect(testLiteralExpression(func.parameters[1], "y")).toBe(true);

  expect(func.body?.statements).toHaveLength(1);

  const bodyStmt = func.body?.statements[0] as ExpressionStatement;
  expect(bodyStmt).toBeDefined();

  expect(testInfixExpression(bodyStmt.expression, "x", "+", "y")).toBe(true);
});

test("testFunctionParameterParsing", () => {
  const tests = [
    { input: "fn() {};", expectedParams: [] },
    { input: "fn(x) {};", expectedParams: ["x"] },
    { input: "fn(x, y, z) {};", expectedParams: ["x", "y", "z"] },
  ];

  for (const tt of tests) {
    const l = new Lexer(tt.input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    const stmt = program?.statements[0] as ExpressionStatement;
    expect(stmt).toBeDefined();

    const func = stmt.expression as FunctionLiteral;
    expect(func).toBeDefined();

    expect(func?.parameters).toHaveLength(tt.expectedParams.length);

    tt.expectedParams.forEach((ident, index) => {
      expect(testLiteralExpression(func.parameters[index], ident)).toBe(true);
    });
  }
});

test("testCallExpressionParsing", () => {
  const input = `add(1, 2 * 3, 4 + 5);`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program?.statements).toHaveLength(1);

  const stmt = program?.statements[0] as ExpressionStatement;
  expect(stmt).toBeDefined();

  const exp = stmt.expression as CallExpression;
  expect(exp).toBeDefined();

  expect(testIdentifier(exp.func, "add")).toBe(true);

  expect(testLiteralExpression(exp.args[0], 1)).toBe(true);
  expect(testInfixExpression(exp.args[1], 2, "*", 3)).toBe(true);
  expect(testInfixExpression(exp.args[2], 4, "+", 5)).toBe(true);
});

test("testStringLiteralExpression", () => {
  const input = `"hello world"`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program?.statements[0] as ExpressionStatement;
  expect(stmt instanceof ExpressionStatement).toBe(true);

  const literal = stmt.expression as StringLiteral;
  expect(literal instanceof StringLiteral).toBe(true);

  expect(literal.value).toStrictEqual("hello world");
});

test("testParsingIndexExpressions", () => {
  const input = "myArray[1 + 1]";

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program?.statements[0] as ExpressionStatement;
  expect(stmt instanceof ExpressionStatement).toBe(true);

  const indexExp = stmt.expression as IndexExpression;
  expect(indexExp instanceof IndexExpression).toBe(true);

  expect(testIdentifier(indexExp.left, "myArray")).toBe(true);
  expect(testInfixExpression(indexExp.index, 1, "+", 1)).toBe(true);
});

test("testParsingArrayLiterals", () => {
  const input = "[1, 2 * 2, 3 + 3]";

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program?.statements[0] as ExpressionStatement;
  expect(stmt instanceof ExpressionStatement).toBe(true);

  const array = stmt.expression as ArrayLiteral;
  expect(array instanceof ArrayLiteral).toBe(true);

  expect(array.elements).toHaveLength(3);

  expect(testIntegerLiteral(array.elements[0], 1)).toBe(true);
  expect(testInfixExpression(array.elements[1], 2, "*", 2)).toBe(true);
  expect(testInfixExpression(array.elements[2], 3, "+", 3)).toBe(true);
});

test("testParsingHashLiteralsWithExpressions", () => {
  const input = '{"one": 0 + 1, "two": 10 - 8, "three": 15 / 5}';

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program?.statements[0] as ExpressionStatement;
  expect(stmt instanceof ExpressionStatement).toBe(true);

  const hash = stmt.expression as HashLiteral;
  expect(hash instanceof HashLiteral).toBe(true);

  expect(hash.pairs.size).toBe(3);

  const tests = new Map<string, (e: Expression) => boolean>([
    [
      "one",
      (e: Expression) => {
        return testInfixExpression(e, 0, "+", 1);
      },
    ],
    [
      "two",
      (e: Expression) => {
        return testInfixExpression(e, 10, "-", 8);
      },
    ],
    [
      "three",
      (e: Expression) => {
        return testInfixExpression(e, 15, "/", 5);
      },
    ],
  ]);

  for (const [key, value] of hash.pairs) {
    const literal = key as StringLiteral;
    expect(literal instanceof StringLiteral).toBe(true);
    const testFunc = tests.get(literal.string())!;
    expect(testFunc(value)).toBe(true);
  }
});

// test helper functions are below.

function testLetStatement(s: Statement | undefined, name: string): boolean {
  if (s === undefined) {
    return false;
  }

  if (s.tokenLiteral() !== "let") {
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

function testReturnStatement(s: Statement | undefined, name: string): boolean {
  if (s === undefined) {
    return false;
  }

  if (s.tokenLiteral() !== "return") {
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

function testIfExpression(
  s: Statement | undefined,
  leftValue: any,
  operator: string,
  rightValue: any,
  consequence: string
): boolean {
  if (s === undefined) {
    return false;
  }

  const stmt = s as ExpressionStatement;
  if (stmt === undefined) {
    return false;
  }

  const exp = stmt.expression as IfExpression;
  if (exp === undefined) {
    return false;
  }

  if (!testInfixExpression(exp, leftValue, operator, rightValue)) return true;

  if (exp.consequence?.statements.length !== 1) {
    return false;
  }

  const conseq = exp.consequence.statements[0] as ExpressionStatement;
  if (consequence === undefined) {
    return false;
  }

  if (!testIdentifier(conseq.expression, consequence)) {
    return false;
  }

  if (exp.alternative === undefined) {
    return false;
  }

  return true;
}

function testBooleanExpression(
  s: Statement | undefined,
  value: boolean
): boolean {
  if (s === undefined) {
    return false;
  }

  const stmt = s as ExpressionStatement;
  if (stmt === undefined) {
    return false;
  }

  const bo = stmt.expression as Boolean;
  if (bo === undefined) {
    return false;
  }

  if (bo.value !== value) {
    return false;
  }

  if (bo.tokenLiteral() != String(value)) {
    return false;
  }

  return true;
}

function testParsingPrefixExpression(
  s: Statement | undefined,
  operator: string,
  value: any
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

  return testLiteralExpression(exp.right, value);
}

function testParsingInfixExpressions(
  s: Statement | undefined,
  leftValue: any,
  operator: string,
  rightValue: any
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

  if (!testLiteralExpression(exp.left, leftValue)) {
    return false;
  }

  if (exp.operator !== operator) {
    return false;
  }

  if (!testLiteralExpression(exp.right, rightValue)) {
    return false;
  }

  return true;
}

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

function testIdentifier(exp: Expression | undefined, value: string): boolean {
  if (exp === undefined) {
    return false;
  }

  const ident = exp as Identifier;
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

function testBooleanLiteral(
  exp: Expression | undefined,
  value: boolean
): boolean {
  if (exp === undefined) {
    return false;
  }

  const bo = exp as Boolean;
  if (bo === undefined) {
    return false;
  }

  if (bo.value !== value) {
    return false;
  }

  if (bo.tokenLiteral() != String(value)) {
    return false;
  }

  return true;
}

function testInfixExpression(
  exp: Expression | undefined,
  leftValue: any,
  operator: string,
  rightValue: any
): boolean {
  if (exp === undefined) {
    return false;
  }

  const opExp = exp as InfixExpression;
  if (opExp === undefined) {
    return false;
  }

  if (!testLiteralExpression(opExp.left, leftValue)) {
    return false;
  }

  if (opExp.operator != operator) {
    return false;
  }

  if (!testLiteralExpression(opExp.right, rightValue)) {
    return false;
  }

  return true;
}

function testLiteralExpression(
  exp: Expression | undefined,
  expected: any
): boolean {
  switch (typeof expected) {
    case "number":
      return testIntegerLiteral(exp, expected);
    case "string":
      return testIdentifier(exp, expected);
    case "boolean":
      return testBooleanLiteral(exp, expected);
  }

  return false;
}

function checkParserErrors(p: Parser): void {
  const errors = p.errs;

  if (errors.length === 0) {
    return;
  }

  let message = `parser has ${errors.length} errors`;
  for (const msg of errors) {
    message += `parse error: ${msg}` + "\n";
  }
  throw new Error(message);
}
