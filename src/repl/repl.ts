import * as readline from "readline";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind } from "../token/token";

export function start(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt(">>");
  rl.prompt();

  rl.on("line", (input: string) => {
    const lexer = new Lexer(input);
    let tok = lexer.nextToken();

    while (tok.Type != TokenKind.Eof) {
      console.log(tok);
      tok = lexer.nextToken();
    }
  }).on("close", () => {
    process.exit(0);
  });
}
