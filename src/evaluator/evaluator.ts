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
  FunctionLiteral,
  CallExpression,
  Expression,
  StringLiteral,
  ArrayLiteral,
  IndexExpression,
} from "../ast/ast";
import {
  ArrayObj,
  BooleanObj,
  BuiltinObj,
  ErrorObj,
  FunctionObj,
  IntegerObj,
  NullObj,
  Obj,
  ObjType,
  ReturnValueObj,
  StringObj,
} from "../object/object";
import { Environment } from "../object/environment";
import * as readline from "readline";
import { builtins } from "./builtin";

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
      break;
    }

    // Expressions
    case NodeKind.Identifier:
      return evalIdentifier(env, node as Identifier);

    case NodeKind.IntegerLiteral:
      return new IntegerObj((node as IntegerLiteral).value);

    case NodeKind.FunctionLiteral: {
      const fn = node as FunctionLiteral;
      const params = fn.parameters;
      const body = fn.body;
      return new FunctionObj(env, params, body);
    }

    case NodeKind.Boolean:
      return nativeBoolToBooleanObject((node as Boolean).value);

    case NodeKind.StringLiteral:
      return new StringObj((node as StringLiteral).value);

    case NodeKind.CallExpression: {
      const fn = evaluate(env, (node as CallExpression).func);
      if (isError(fn)) {
        return fn;
      }
      const args = evalExpressions(env, (node as CallExpression).args);
      if (args.length === 1 && isError(args[0])) {
        return args[0];
      }

      return applyFunction(args, fn);
    }

    case NodeKind.ArrayLiteral: {
      const elements = evalExpressions(env, (node as ArrayLiteral).elements);
      if (elements.length === 1 && isError(elements[0])) {
        return elements[0];
      }
      return new ArrayObj(elements);
    }

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

    case NodeKind.IndexExpression: {
      const left = evaluate(env, (node as IndexExpression).left);
      if (isError(left)) {
        return left;
      }
      const index = evaluate(env, (node as IndexExpression).index);
      if (isError(index)) {
        return index;
      }

      return evalIndexExpression(left, index);
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

  if (
    left.type() === ObjType.STRING_OBJ &&
    right.type() === ObjType.STRING_OBJ
  ) {
    return evalStringInfixExpression(operator, left, right);
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

function evalExpressions(env: Environment, exps: Expression[]): Obj[] {
  const result: Obj[] = [];

  for (const e of exps) {
    const evaluated = evaluate(env, e);
    if (!evaluated) {
      return [];
    }

    if (isError(evaluated)) {
      return [evaluated];
    }
    result.push(evaluated);
  }

  return result;
}

function evalIdentifier(env: Environment, node: Identifier): Obj | undefined {
  const [val, ok] = env.get(node.value);
  if (ok) {
    return val;
  }

  const builtin = builtins.get(node.value);
  if (builtin !== undefined) {
    return builtin;
  }

  return newError(`identifier not found: ${node.value}`);
}

function evalStringInfixExpression(
  operator: string,
  left: Obj,
  right: Obj
): Obj {
  if (operator !== "+") {
    return newError(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
  }

  const leftVal = (left as StringObj).value;
  const rightVal = (right as StringObj).value;

  return new StringObj(leftVal + rightVal);
}

function evalIndexExpression(left?: Obj, index?: Obj): Obj {
  switch (true) {
    case left?.type() === ObjType.ARRAY_OBJ &&
      index?.type() == ObjType.INTEGER_OBJ:
      return evalArrayIndexExpression(left, index);

    default:
      return newError(`index operator not supported: ${left?.type()}`);
  }
}

function evalArrayIndexExpression(array: Obj, index: Obj): Obj {
  const arrayObject = array as ArrayObj;
  const idx = (index as IntegerObj).value;
  const max = arrayObject.elements.length - 1;

  if (idx < 0 || idx > max) {
    return NULL;
  }
  return arrayObject.elements[idx];
}

function applyFunction(args: Obj[], fn?: Obj): Obj | undefined {
  if (!fn) {
    return undefined;
  }

  switch (fn.type()) {
    case ObjType.FUNCTION_OBJ: {
      const func = fn as FunctionObj;
      if (!(func instanceof FunctionObj)) {
        return newError(`not a function: ${fn?.type()}`);
      }
      const extendedEnv = extendFunctionEnv(args, func);
      const evaluated = evaluate(extendedEnv, func.body);
      return unwrapReturnValue(evaluated!);
    }

    case ObjType.BUILTIN_OBJ: {
      return (fn as BuiltinObj).fn(...args);
    }

    default:
      return newError(`not a function: ${fn?.type()}`);
  }
}

function extendFunctionEnv(args: Obj[], fn: FunctionObj): Environment {
  const env = new Environment(fn?.env);

  for (let paramIdx = 0; paramIdx < fn.parameters.length; paramIdx++) {
    const param = fn.parameters[paramIdx];
    env.set(param.value, args[paramIdx]);
  }

  return env;
}

function unwrapReturnValue(obj: Obj): Obj | undefined {
  const returnValue = obj as ReturnValueObj;
  if (returnValue instanceof ReturnValueObj) {
    return returnValue.value;
  }

  return obj;
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

export function newError(format: string, ...args: any[]): ErrorObj {
  const message = `${format}${args.map((arg) => typeof arg).join(",")}`;
  return new ErrorObj(message);
}
