import { ConditionalExpression, ObjectType } from "typescript";
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
  IfExpression,
  ReturnStatement,
  BlockStatement,
} from "../ast/ast";
import {
  BooleanObj,
  ErrorObj,
  IntegerObj,
  NullObj,
  Obj,
  ObjType,
  ReturnValueObj,
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
      return evalProgram((node as Program).statements);

    case NodeKind.ExpressionStatement:
      return evaluate((node as ExpressionStatement).expression!);

    case NodeKind.BlockStatement:
      return evalBlockStatement(node as BlockStatement);

    case NodeKind.ReturnStatement:
      const val = evaluate((node as ReturnStatement).returnValue);
      if (isError(val)) {
        return val;
      }
      return new ReturnValueObj(val!);

    // Expressions
    case NodeKind.IntegerLiteral:
      return new IntegerObj((node as IntegerLiteral).value);

    case NodeKind.Boolean:
      return nativeBoolToBooleanObject((node as Boolean).value);

    case NodeKind.IfExpression:
      return evalIfExpression(node as IfExpression);

    case NodeKind.PrefixExpression: {
      const prefixExp = node as PrefixExpression;
      const right = evaluate(prefixExp.right);
      if (isError(right)) {
        return right;
      }

      return evalPrefixExpression(prefixExp.operator, right);
    }

    case NodeKind.InfixExpression: {
      const infixExp = node as InfixExpression;
      const left = evaluate(infixExp.left);
      if (isError(left)) {
        return left;
      }

      const right = evaluate(infixExp.right);
      if (isError(right)) {
        return right;
      }

      return evalInfixExpression(infixExp.operator, left, right);
    }
  }

  return undefined;
}

function evalProgram(stmts: Statement[]): Obj {
  let result: Obj | undefined = undefined;
  for (const statement of stmts) {
    result = evaluate(statement);

    switch (result?.type()) {
      case ObjType.RETURN_VALUE_OBJ:
        const returnValue = result as ReturnValueObj;
        return returnValue.value;

      case ObjType.ERROR_OBJ:
        return result;
    }

    // if (returnValue instanceof ReturnValueObj) {
    // return returnValue.value;
    // }
  }

  return result!;
}

function evalBlockStatement(block: BlockStatement): Obj {
  let result: Obj | undefined = undefined;
  for (const statement of block.statements) {
    result = evaluate(statement);

    if (result !== undefined) {
      const rt = result.type();
      if (rt === ObjType.RETURN_VALUE_OBJ || rt === ObjType.ERROR_OBJ) {
        return result;
      }
    }
  }

  return result!;
}

function evalInfixExpression(
  operator: string,
  left?: Obj,
  right?: Obj
): Obj | undefined {
  if (!left || !right) {
    return undefined;
  }

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

  if (left.type() != right.type()) {
    return newError(
      `type mismatch: ${left.type()} ${operator} ${right.type()}`
    );
  }

  return newError(
    `unknown operator: ${left.type()} ${operator} ${right.type()}`
  );
}

function nativeBoolToBooleanObject(input: boolean): BooleanObj {
  if (input) {
    return TRUE;
  }
  return FALSE;
}

function evalPrefixExpression(operator: string, right?: Obj): Obj | undefined {
  if (!right) {
    return undefined;
  }
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);
    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return newError(`unknown operator: ${operator} ${right.type()}`);
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
    return newError(`unknown operator: -${right.type()}`);
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
      return newError(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`
      );
  }
}

function evalIfExpression(ie: IfExpression): Obj {
  const condition = evaluate(ie.condition)!;
  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return evaluate(ie.consequence)!;
  } else if (ie.alternative !== undefined) {
    return evaluate(ie.alternative)!;
  } else {
    return NULL;
  }
}

function isTruthy(obj: Obj): boolean {
  switch (obj) {
    case NULL:
      return false;
    case TRUE:
      return true;
    case FALSE:
      return false;
    default:
      return true;
  }
}

function isError(obj: Obj | undefined): boolean {
  if (obj !== undefined) {
    return obj.type() === ObjType.ERROR_OBJ;
  }
  return false;
}

function newError(format: string, ...args: any[]): ErrorObj {
  const message = `${format}${args.map((arg) => typeof arg).join(",")}`;
  return new ErrorObj(message);
}
