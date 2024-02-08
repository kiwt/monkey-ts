import { LetStatement, Program, Statement } from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { TokenKind } from "../token/token";
import { Parser } from "./parser";

test("testLetStatement", () => {
  const input = `
   let x = 5;
   let y = 10;
   let foobar = 838383;
   `;

  const expected: string[] = ["x", "y", "foobar"];

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  expect(program).not.toBe(undefined);
  for (let index in expected) {
    const stmt = program!.statements[index];
    expect(testLetStatement(stmt, expected[index])).toBeTruthy();
  }
});

function testLetStatement(s: Statement, name: string): boolean {
  if (s.tokenLiteral() !== TokenKind.Let) {
    return false;
  }

  let letStmt = s as LetStatement;
  if (letStmt === undefined) {
    return false;
  }

  if (letStmt.name!.value !== name) {
    return false;
  }

  if (letStmt.name!.tokenLiteral() !== name) {
    return false;
  }

  return true;
}
