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
   10 != 9;
    `;
  const expected: Token[] = [
    { Type: TokenKind.LET, Literal: "let" },
    { Type: TokenKind.IDENT, Literal: "five" },
    { Type: TokenKind.ASSIGN, Literal: "=" },
    { Type: TokenKind.INT, Literal: "5" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.LET, Literal: "let" },
    { Type: TokenKind.IDENT, Literal: "ten" },
    { Type: TokenKind.ASSIGN, Literal: "=" },
    { Type: TokenKind.INT, Literal: "10" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.LET, Literal: "let" },
    { Type: TokenKind.IDENT, Literal: "add" },
    { Type: TokenKind.ASSIGN, Literal: "=" },
    { Type: TokenKind.FUNCTION, Literal: "fn" },
    { Type: TokenKind.LPAREN, Literal: "(" },
    { Type: TokenKind.IDENT, Literal: "x" },
    { Type: TokenKind.COMMA, Literal: "," },
    { Type: TokenKind.IDENT, Literal: "y" },
    { Type: TokenKind.RPAREN, Literal: ")" },
    { Type: TokenKind.LBRACE, Literal: "{" },
    { Type: TokenKind.IDENT, Literal: "x" },
    { Type: TokenKind.PLUS, Literal: "+" },
    { Type: TokenKind.IDENT, Literal: "y" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.RBRACE, Literal: "}" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.LET, Literal: "let" },
    { Type: TokenKind.IDENT, Literal: "result" },
    { Type: TokenKind.ASSIGN, Literal: "=" },
    { Type: TokenKind.IDENT, Literal: "add" },
    { Type: TokenKind.LPAREN, Literal: "(" },
    { Type: TokenKind.IDENT, Literal: "five" },
    { Type: TokenKind.COMMA, Literal: "," },
    { Type: TokenKind.IDENT, Literal: "ten" },
    { Type: TokenKind.RPAREN, Literal: ")" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.BANG, Literal: "!" },
    { Type: TokenKind.MINUS, Literal: "-" },
    { Type: TokenKind.SLASH, Literal: "/" },
    { Type: TokenKind.ASTERISK, Literal: "*" },
    { Type: TokenKind.INT, Literal: "5" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.INT, Literal: "5" },
    { Type: TokenKind.LT, Literal: "<" },
    { Type: TokenKind.INT, Literal: "10" },
    { Type: TokenKind.GT, Literal: ">" },
    { Type: TokenKind.INT, Literal: "5" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.IF, Literal: "if" },
    { Type: TokenKind.LPAREN, Literal: "(" },
    { Type: TokenKind.INT, Literal: "5" },
    { Type: TokenKind.LT, Literal: "<" },
    { Type: TokenKind.INT, Literal: "10" },
    { Type: TokenKind.RPAREN, Literal: ")" },
    { Type: TokenKind.LBRACE, Literal: "{" },
    { Type: TokenKind.RETURN, Literal: "return" },
    { Type: TokenKind.TRUE, Literal: "true" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.RBRACE, Literal: "}" },
    { Type: TokenKind.ELSE, Literal: "else" },
    { Type: TokenKind.LBRACE, Literal: "{" },
    { Type: TokenKind.RETURN, Literal: "return" },
    { Type: TokenKind.FALSE, Literal: "false" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.RBRACE, Literal: "}" },
    { Type: TokenKind.INT, Literal: "10" },
    { Type: TokenKind.EQ, Literal: "==" },
    { Type: TokenKind.INT, Literal: "10" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.INT, Literal: "10" },
    { Type: TokenKind.NOT_EQ, Literal: "!=" },
    { Type: TokenKind.INT, Literal: "9" },
    { Type: TokenKind.SEMICOLON, Literal: ";" },
    { Type: TokenKind.EOF, Literal: "" },
  ];

  let l = new Lexer(input);

  for (let tok of expected) {
    let a = l.nextToken();
    expect(a).toStrictEqual(tok);
  }
});
