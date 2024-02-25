import { Lexer } from "../lexer/lexer";
import { BooleanObj, IntegerObj, Obj } from "../object/object";
import { Parser } from "../parser/parser";
import { evaluate } from "./evaluator";

function testEval(input: string): Obj {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();

  expect(program).toBeDefined();
  return evaluate(program!)!;
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
