import { Token, TokenKind, TokenType } from "./token";
import { Lexer } from "./lexer";

test("testNextToken", () => {
  const input = `let five = 5;
  let ten = 10;
     let add = fn(x, y) {
       x + y;
  };
     let result = add(five, ten);
     `;

  const expected: Token[] = [
    { Type: TokenKind.Let, Literal: "let" },
    { Type: TokenKind.Ident, Literal: "five" },
    { Type: TokenKind.Assign, Literal: "=" },
    { Type: TokenKind.Int, Literal: "5" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.Let, Literal: "let" },
    { Type: TokenKind.Ident, Literal: "ten" },
    { Type: TokenKind.Assign, Literal: "=" },
    { Type: TokenKind.Int, Literal: "10" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.Let, Literal: "let" },
    { Type: TokenKind.Ident, Literal: "add" },
    { Type: TokenKind.Assign, Literal: "=" },
    { Type: TokenKind.Function, Literal: "fn" },
    { Type: TokenKind.LParen, Literal: "(" },
    { Type: TokenKind.Ident, Literal: "x" },
    { Type: TokenKind.Comma, Literal: "," },
    { Type: TokenKind.Ident, Literal: "y" },
    { Type: TokenKind.RParen, Literal: ")" },
    { Type: TokenKind.LBrace, Literal: "{" },
    { Type: TokenKind.Ident, Literal: "x" },
    { Type: TokenKind.Plus, Literal: "+" },
    { Type: TokenKind.Ident, Literal: "y" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.RBrace, Literal: "}" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.Let, Literal: "let" },
    { Type: TokenKind.Ident, Literal: "result" },
    { Type: TokenKind.Assign, Literal: "=" },
    { Type: TokenKind.Ident, Literal: "add" },
    { Type: TokenKind.LParen, Literal: "(" },
    { Type: TokenKind.Ident, Literal: "five" },
    { Type: TokenKind.Comma, Literal: "," },
    { Type: TokenKind.Ident, Literal: "ten" },
    { Type: TokenKind.RParen, Literal: ")" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.Eof, Literal: "" },
  ];

  let l = new Lexer(input);

  for (let tok of expected) {
    let a = l.nextToken();
    expect(a).toStrictEqual(tok);
  }
});
