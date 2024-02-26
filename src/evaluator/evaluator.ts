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
  LetStatement,
  Identifier,
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
import { Environment } from "../environment/environment";

export const NULL: NullObj = new NullObj();
export const TRUE: BooleanObj = new BooleanObj(true);
export const FALSE: BooleanObj = new BooleanObj(false);

export function evaluate(env: Environment, node?: Node): Obj | undefined {
  switch (node?.kind()) {
    // Statements
    case NodeKind.Program:
      return evalProgram((node as Program).statements, env);

    case NodeKind.ExpressionStatement:
      return evaluate(env, (node as ExpressionStatement).expression);

    case NodeKind.BlockStatement:
      return evalBlockStatement(env, node as BlockStatement);

    case NodeKind.ReturnStatement: {
      const val = evaluate(env, (node as ReturnStatement).returnValue);
      if (isError(val)) {
        return val;
      }
      return new ReturnValueObj(val!);
    }

    case NodeKind.LetStatement: {
      const letStatement = node as LetStatement;
      const val = evaluate(env, letStatement.value);
      if (isError(val)) {
        return val;
      }
      env.set(letStatement.name!.value, val!);
    }

    // Expressions
    case NodeKind.Identifier: {
      const identifier = node as Identifier;
      const [val, ok] = env.get(identifier.value);
      if (!ok) {
        return newError(`identifier not found: ${identifier.value}`);
      }

      return val;
    }

    case NodeKind.IntegerLiteral:
      return new IntegerObj((node as IntegerLiteral).value);

    case NodeKind.Boolean:
      return nativeBoolToBooleanObject((node as Boolean).value);

    case NodeKind.IfExpression:
      return evalIfExpression(env, node as IfExpression);

    case NodeKind.PrefixExpression: {
      const prefixExp = node as PrefixExpression;
      const right = evaluate(env, prefixExp.right);
      if (isError(right)) {
        return right;
      }

      return evalPrefixExpression(prefixExp.operator, right);
    }

    case NodeKind.InfixExpression: {
      const infixExp = node as InfixExpression;
      const left = evaluate(env, infixExp.left);
      if (isError(left)) {
        return left;
      }

      const right = evaluate(env, infixExp.right);
      if (isError(right)) {
        return right;
      }

      return evalInfixExpression(infixExp.operator, left, right);
    }
  }

  return undefined;
}

function evalProgram(stmts: Statement[], env: Environment): Obj | undefined {
  let result: Obj | undefined = undefined;
  for (const statement of stmts) {
    result = evaluate(env, statement);

    switch (result?.type()) {
      case ObjType.RETURN_VALUE_OBJ:
        const returnValue = result as ReturnValueObj;
        return returnValue.value;

      case ObjType.ERROR_OBJ:
        return result;
    }
  }

  return result;
}

function evalBlockStatement(env: Environment, block: BlockStatement): Obj {
  let result: Obj | undefined = undefined;
  for (const statement of block.statements) {
    result = evaluate(env, statement);

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

function evalIfExpression(env: Environment, ie: IfExpression): Obj {
  const condition = evaluate(env, ie.condition)!;
  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return evaluate(env, ie.consequence)!;
  } else if (ie.alternative !== undefined) {
    return evaluate(env, ie.alternative)!;
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
