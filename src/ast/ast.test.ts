import { TokenKind } from "../token/token";
import { Identifier, LetStatement, Program } from "./ast";

test("testString", () => {
  const program = new Program([
    new LetStatement(
      { Type: TokenKind.LET, Literal: "let" },
      new Identifier({ Type: TokenKind.IDENT, Literal: "myVar" }, "myVar"),
      new Identifier(
        { Type: TokenKind.IDENT, Literal: "anotherVar" },
        "anotherVar"
      )
    ),
  ]);

  expect(program.string()).toEqual("let myVar = anotherVar;");
});
