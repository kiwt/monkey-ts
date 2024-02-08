import { LetStatement, Program, ReturnStatement, Statement } from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { TokenKind } from "../token/token";
import { Parser } from "./parser";

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
