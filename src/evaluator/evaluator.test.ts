import { Environment } from "../object/environment";
import { Lexer } from "../lexer/lexer";
import {
  BooleanObj,
  ErrorObj,
  FunctionObj,
  IntegerObj,
  Obj,
  StringObj,
} from "../object/object";
import { Parser } from "../parser/parser";
import { NULL, evaluate } from "./evaluator";

function testEval(input: string): Obj {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  const env = new Environment();

  expect(program).toBeDefined();
  return evaluate(env, program)!;
}

test("testEvalIntegerExpression", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "5", expected: 5 },
    { input: "10", expected: 10 },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testIntegerObj(evaluated, tt.expected)).toBe(true);
  }
});

test("testEvalIntegerExpression", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "5", expected: 5 },
    { input: "10", expected: 10 },
    { input: "-5", expected: -5 },
    { input: "-10", expected: -10 },
    { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
    { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
    { input: "-50 + 100 + -50", expected: 0 },
    { input: "5 * 2 + 10", expected: 20 },
    { input: "5 + 2 * 10", expected: 25 },
    { input: "20 + 2 * -10", expected: 0 },
    { input: "50 / 2 * 2 + 10", expected: 60 },
    { input: "2 * (5 + 10)", expected: 30 },
    { input: "3 * 3 * 3 + 10", expected: 37 },
    { input: "3 * (3 * 3) + 10", expected: 37 },
    { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testIntegerObj(evaluated, tt.expected)).toBe(true);
  }
});

test("testBooleanExpression", () => {
  const tests: { input: string; expected: boolean }[] = [
    { input: "true", expected: true },
    { input: "false", expected: false },
    { input: "1 < 2", expected: true },
    { input: "1 > 2", expected: false },
    { input: "1 < 1", expected: false },
    { input: "1 > 1", expected: false },
    { input: "1 == 1", expected: true },
    { input: "1 != 1", expected: false },
    { input: "1 == 2", expected: false },
    { input: "1 != 2", expected: true },
    { input: "true == true", expected: true },
    { input: "false == false", expected: true },
    { input: "true == false", expected: false },
    { input: "true != false", expected: true },
    { input: "(1 < 2) == true", expected: true },
    { input: "(1 < 2) == false", expected: false },
    { input: "(1 > 2) == true", expected: false },
    { input: "(1 > 2) == false", expected: true },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testBooleanObj(evaluated, tt.expected)).toBe(true);
  }
});

test("testStringLiteral", () => {
  const input = `"Hello World!"`;
  const evaluated = testEval(input);
  expect(testStringObj(evaluated, "Hello World!")).toBe(true);
});

test("testBangOperator", () => {
  const tests: { input: string; expected: boolean }[] = [
    { input: "!true", expected: false },
    { input: "!false", expected: true },
    { input: "!5", expected: false },
    { input: "!!true", expected: true },
    { input: "!!false", expected: false },
    { input: "!!5", expected: true },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testBooleanObj(evaluated, tt.expected)).toBe(true);
  }
});

test("testIfExpressions", () => {
  const tests: { input: string; expected: any }[] = [
    { input: "if (true) { 10 }", expected: 10 },
    { input: "if (false) { 10 }", expected: null },
    { input: "if (1) { 10 }", expected: 10 },
    { input: "if (1 < 2) { 10 }", expected: 10 },
    { input: "if (1 > 2) { 10 }", expected: null },
    { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
    { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    const integer = tt.expected as number;
    if (typeof integer === "number") {
      expect(testIntegerObj(evaluated, integer)).toBe(true);
    } else {
      expect(testNullObj(evaluated)).toBe(true);
    }
  }
});

test("testReturnStatements", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "return 10;", expected: 10 },
    { input: "return 10; 9;", expected: 10 },
    { input: "return 2 * 5; 9;", expected: 10 },
    { input: "9; return 2 * 5; 9;", expected: 10 },
    {
      input: `if (10 > 1) {
                if (10 > 1) {
                  return 10;
                }
                return 1;
              }`,
      expected: 10,
    },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testIntegerObj(evaluated, tt.expected)).toBe(true);
  }
});

test("testLetStatement", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "let a = 5; a;", expected: 5 },
    { input: "let a = 5 * 5; a;", expected: 25 },
    { input: "let a = 5; let b = a; b;", expected: 5 },
    { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testIntegerObj(evaluated, tt.expected)).toBe(true);
  }
});

test("testFunctionObject", () => {
  const input = "fn(x) { x + 2; };";

  const evaluated = testEval(input);
  expect(testFunctionObj(evaluated, "(x + 2)")).toBe(true);
});

test("testFunctionApplication", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
    { input: "let identity = fn(x) { return x; }; identity(5);", expected: 5 },
    { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
    { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
    {
      input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
      expected: 20,
    },
    { input: "fn(x) { x; }(5)", expected: 5 },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testIntegerObj(evaluated, tt.expected)).toBe(true);
  }
});

test("testClosures", () => {
  const input = `let newAdder = fn(x) {
     fn(y) { x + y };
};
   let addTwo = newAdder(2);
   addTwo(2);`;

  const evaluated = testEval(input);
  expect(testIntegerObj(evaluated, 4)).toBe(true);
});

test("testBuiltinFunctions", () => {
  const tests: { input: string; expected: any }[] = [
    { input: 'len("")', expected: 0 },
    { input: 'len("four")', expected: 4 },
    { input: 'len("hello world")', expected: 11 },
    {
      input: "len(1)",
      expected: `argument to "len" not supported, got INTEGER`,
    },
    {
      input: 'len("one", "two")',
      expected: "wrong number of arguments. got=2, want=1",
    },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);

    switch (typeof tt.expected) {
      case "number":
        expect(testIntegerObj(evaluated, tt.expected as number)).toBe(true);
        break;
      case "string":
        const expectedError = tt.expected as string;
        if (evaluated instanceof ErrorObj) {
          const errObj = evaluated as ErrorObj;
          if (errObj.message !== expectedError) {
            console.error(
              "wrong error message. expected=%q, got=%q",
              expectedError
            );
            expect(true).toBe(false); // fail test.
          }
        } else {
          console.error(
            "object is not Error. got=%s",
            evaluated.constructor.name
          );
          expect(true).toBe(false); // fail test.
        }
        expect(true).toBe(true);
        break;
    }
  }
});

test("testErrorHandling", () => {
  const tests: { input: string; expected: string }[] = [
    {
      input: "5 + true;",
      expected: "type mismatch: INTEGER + BOOLEAN",
    },
    {
      input: "5 + true; 5;",
      expected: "type mismatch: INTEGER + BOOLEAN",
    },
    {
      input: "-true",
      expected: "unknown operator: -BOOLEAN",
    },
    {
      input: "true + false;",
      expected: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "if (10 > 1) { true + false; }",
      expected: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "foobar",
      expected: "identifier not found: foobar",
    },
    {
      input: `"Hello" - "World"`,
      expected: "unknown operator: STRING - STRING",
    },
  ];

  for (const tt of tests) {
    const evaluated = testEval(tt.input);
    expect(testErrorObj(evaluated, tt.expected)).toBe(true);
  }
});

function testIntegerObj(obj: Obj, expected: number): boolean {
  const result = obj as IntegerObj;
  if (result === undefined) {
    console.error(`Obj is not Integer. got=${obj.constructor.name} (${obj})`);
    return false;
  }

  if (result.value !== expected) {
    console.error(`Obj has wrong value. got=${result.value}, want=${expected}`);
    return false;
  }

  return true;
}

function testNullObj(obj: Obj): boolean {
  if (obj != NULL) {
    console.error(`Obj is not NULL. got=${obj}`);
    return false;
  }
  return true;
}

function testBooleanObj(obj: Obj, expected: boolean): boolean {
  const result = obj as BooleanObj;
  if (result === undefined) {
    console.error(`Obj is not Integer. got=${obj.constructor.name} (${obj})`);
    return false;
  }

  if (result.value !== expected) {
    console.error(`Obj has wrong value. got=${result.value}, want=${expected}`);
    return false;
  }

  return true;
}

function testStringObj(obj: Obj, expected: string): boolean {
  const result = obj as StringObj;
  if (result === undefined) {
    console.error(`Obj is not String. got=${obj.constructor.name} (${obj})`);
    return false;
  }

  if (result.value !== expected) {
    console.error(`Obj has wrong value. got=${result.value}, want=${expected}`);
    return false;
  }

  return true;
}

function testFunctionObj(obj: Obj, expected: string): boolean {
  const fn = obj as FunctionObj;
  if (!(fn instanceof FunctionObj)) {
    console.error(`object is not Function. got=${obj.type()}`);
    return false;
  }

  if (fn.parameters.length !== 1) {
    console.error(`function has wrong parameters. Parameters=${fn.parameters}`);
    return false;
  }

  if (fn.body?.string() != expected) {
    console.error(`body is not ${expected}. got=${fn.body?.string()}`);
  }

  return true;
}

function testErrorObj(obj: Obj, expected: string): boolean {
  const result = obj as ErrorObj;
  if (!(result instanceof ErrorObj)) {
    console.error(`no error object returned. got=${obj}`);
    return false;
  }

  if (result.message !== expected) {
    console.error(
      `wrong error message. expected=${expected}, got=${result.message}`
    );
    return false;
  }

  return true;
}
