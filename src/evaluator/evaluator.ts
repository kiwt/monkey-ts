import { ObjectType } from "typescript";
import {
  Node,
  Program,
  NodeKind,
  Statement,
  IntegerLiteral,
  ExpressionStatement,
  Boolean,
  PrefixExpression,
  InfixExpression,
} from "../ast/ast";
import {
  BooleanObj,
  IntegerObj,
  NullObj,
  Obj,
  ObjType,
} from "../object/object";

export const NULL: NullObj = new NullObj();
export const TRUE: BooleanObj = new BooleanObj(true);
export const FALSE: BooleanObj = new BooleanObj(false);

export function evaluate(node?: Node): Obj | undefined {
  if (node === undefined) {
    return undefined;
  }

  switch (node.kind()) {
    // Statements
    case NodeKind.Program:
      return evalStatements((node as Program).statements);

    case NodeKind.ExpressionStatement:
      return evaluate((node as ExpressionStatement).expression!);

    // Expressions
    case NodeKind.IntegerLiteral:
      return new IntegerObj((node as IntegerLiteral).value);

    case NodeKind.Boolean:
      return nativeBoolToBooleanObject((node as Boolean).value);

    case NodeKind.PrefixExpression:
      const prefixExp = node as PrefixExpression;
      return evalPrefixExpression(
        prefixExp.operator,
        evaluate(prefixExp.right)!
      );

    case NodeKind.InfixExpression:
      const infixExp = node as InfixExpression;
      return evalInfixExpression(
        infixExp.operator,
        evaluate(infixExp.left)!,
        evaluate(infixExp.right)!
      );
  }

  return undefined;
}

function evalStatements(stmts: Statement[]): Obj {
  let result: Obj | undefined = undefined;
  for (const statement of stmts) {
    result = evaluate(statement);
  }

  return result!;
}

function evalInfixExpression(operator: string, left: Obj, right: Obj): Obj {
  if (
    left.type() === ObjType.INTEGER_OBJ &&
    right.type() === ObjType.INTEGER_OBJ
  ) {
    return evalIntegerInfixExpression(operator, left, right);
  }

  if (operator === "==") {
    return nativeBoolToBooleanObject(left === right);
  }

  if (operator === "!=") {
    return nativeBoolToBooleanObject(left !== right);
  }

  return NULL;
}

function nativeBoolToBooleanObject(input: boolean): BooleanObj {
  if (input) {
    return TRUE;
  }
  return FALSE;
}

function evalPrefixExpression(operator: string, right: Obj): Obj {
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);

    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return new NullObj();
  }
}

function evalBangOperatorExpression(right: Obj): Obj {
  switch (right) {
    case TRUE:
      return FALSE;
    case FALSE:
      return TRUE;
    case NULL:
      return TRUE;
    default:
      return FALSE;
  }
}

function evalMinusPrefixOperatorExpression(right: Obj): Obj {
  if (right.type() !== ObjType.INTEGER_OBJ) {
    return NULL;
  }

  const value = (right as IntegerObj).value;
  return new IntegerObj(-value);
}

function evalIntegerInfixExpression(
  operator: string,
  left: Obj,
  right: Obj
): Obj {
  const leftVal = (left as IntegerObj).value;
  const rightVal = (right as IntegerObj).value;

  switch (operator) {
    case "+":
      return new IntegerObj(leftVal + rightVal);
    case "-":
      return new IntegerObj(leftVal - rightVal);
    case "*":
      return new IntegerObj(leftVal * rightVal);
    case "/":
      return new IntegerObj(leftVal / rightVal);
    case "<":
      return nativeBoolToBooleanObject(leftVal < rightVal);
    case ">":
      return nativeBoolToBooleanObject(leftVal > rightVal);
    case "==":
      return nativeBoolToBooleanObject(leftVal === rightVal);
    case "!=":
      return nativeBoolToBooleanObject(leftVal !== rightVal);
    default:
      return NULL;
  }
}
