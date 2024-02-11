import { TokenKind } from "../token/token";
import { Identifier, LetStatement, Program } from "./ast";

test("testString", () => {
  const program = new Program([
    new LetStatement(
      { Type: TokenKind.Let, Literal: "let" },
      new Identifier({ Type: TokenKind.Ident, Literal: "myVar" }, "myVar"),
      new Identifier(
        { Type: TokenKind.Ident, Literal: "anotherVar" },
        "anotherVar"
      )
    ),
  ]);

  expect(program.string()).toEqual("let myVar = anotherVar;");
});
