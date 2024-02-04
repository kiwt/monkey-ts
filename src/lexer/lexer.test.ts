import { Token, TokenKind, TokenType } from "../token/token";
import { Lexer } from "./lexer";

test("testNextToken", () => {
  const input = `let five = 5;
let ten = 10;
   let add = fn(x, y) {
     x + y;
};
   let result = add(five, ten);
   !-/*5;
   5 < 10 > 5;
   if (5 < 10) {
       return true;
   } else {
       return false;
   }

   10 == 10;
   10 != 9; `;
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
    { Type: TokenKind.Bang, Literal: "!" },
    { Type: TokenKind.Minus, Literal: "-" },
    { Type: TokenKind.Slash, Literal: "/" },
    { Type: TokenKind.Asterisk, Literal: "*" },
    { Type: TokenKind.Int, Literal: "5" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.Int, Literal: "5" },
    { Type: TokenKind.Lt, Literal: "<" },
    { Type: TokenKind.Int, Literal: "10" },
    { Type: TokenKind.Gt, Literal: ">" },
    { Type: TokenKind.Int, Literal: "5" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.If, Literal: "if" },
    { Type: TokenKind.LParen, Literal: "(" },
    { Type: TokenKind.Int, Literal: "5" },
    { Type: TokenKind.Lt, Literal: "<" },
    { Type: TokenKind.Int, Literal: "10" },
    { Type: TokenKind.RParen, Literal: ")" },
    { Type: TokenKind.LBrace, Literal: "{" },
    { Type: TokenKind.Return, Literal: "return" },
    { Type: TokenKind.True, Literal: "true" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.RBrace, Literal: "}" },
    { Type: TokenKind.Else, Literal: "else" },
    { Type: TokenKind.LBrace, Literal: "{" },
    { Type: TokenKind.Return, Literal: "return" },
    { Type: TokenKind.False, Literal: "false" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.RBrace, Literal: "}" },
    { Type: TokenKind.Int, Literal: "10" },
    { Type: TokenKind.Eq, Literal: "==" },
    { Type: TokenKind.Int, Literal: "10" },
    { Type: TokenKind.Semicolon, Literal: ";" },
    { Type: TokenKind.Int, Literal: "10" },
    { Type: TokenKind.NotEq, Literal: "!=" },
    { Type: TokenKind.Int, Literal: "9" },
    { Type: TokenKind.Semicolon, Literal: ";" },

    { Type: TokenKind.Eof, Literal: "" },
  ];

  let l = new Lexer(input);

  for (let tok of expected) {
    let a = l.nextToken();
    expect(a).toStrictEqual(tok);
  }
});
