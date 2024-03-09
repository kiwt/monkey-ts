import {
  ArrayObj,
  BuiltinObj,
  IntegerObj,
  NullObj,
  Obj,
  ObjType,
  StringObj,
} from "../object/object";
import { NULL, newError } from "./evaluator";

export const builtins = new Map<string, BuiltinObj>([
  [
    "len",
    new BuiltinObj(function (...args: Obj[]): Obj {
      if (args.length !== 1) {
        return newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      switch (args[0].type()) {
        case ObjType.ARRAY_OBJ:
          const arg = args[0] as ArrayObj;
          return new IntegerObj(arg.elements.length);

        case ObjType.STRING_OBJ: {
          const arg = args[0] as StringObj;
          return new IntegerObj(Number(arg.value.length));
        }
        default:
          return newError(
            `argument to "len" not supported, got ${args[0].type()}`
          );
      }
    }),
  ],
  [
    "first",
    new BuiltinObj(function (...args: Obj[]): Obj {
      if (args.length !== 1) {
        return newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      if (args[0].type() !== ObjType.ARRAY_OBJ) {
        return newError(
          `argument to "first" must be ARRAY, got ${args[0].type()}`
        );
      }

      const arr = args[0] as ArrayObj;
      if (arr.elements.length > 0) {
        return arr.elements[0];
      }

      return NULL;
    }),
  ],
  [
    "last",
    new BuiltinObj(function (...args: Obj[]): Obj {
      if (args.length !== 1) {
        return newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      if (args[0].type() !== ObjType.ARRAY_OBJ) {
        return newError(
          `argument to "last" must be ARRAY, got ${args[0].type()}`
        );
      }

      const arr = args[0] as ArrayObj;
      if (arr.elements.length > 0) {
        return arr.elements[arr.elements.length - 1];
      }

      return NULL;
    }),
  ],
  [
    "rest",
    new BuiltinObj(function (...args: Obj[]): Obj {
      if (args.length !== 1) {
        return newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      if (args[0].type() !== ObjType.ARRAY_OBJ) {
        return newError(
          `argument to "rest" must be ARRAY, got ${args[0].type()}`
        );
      }

      const arr = args[0] as ArrayObj;
      if (arr.elements.length > 0) {
        const newElements = arr.elements.slice(1);
        return new ArrayObj(newElements);
      }

      return NULL;
    }),
  ],
  [
    "push",
    new BuiltinObj(function (...args: Obj[]): Obj {
      if (args.length !== 2) {
        return newError(
          `wrong number of arguments. got=${args.length}, want=2`
        );
      }

      if (args[0].type() !== ObjType.ARRAY_OBJ) {
        return newError(
          `argument to "push" must be ARRAY, got ${args[0].type()}`
        );
      }

      const arr = args[0] as ArrayObj;
      if (arr.elements.length > 0) {
        const newElements = [...arr.elements, args[1]];
        return new ArrayObj(newElements);
      }

      return NULL;
    }),
  ],
  [
    "puts",
    new BuiltinObj(function (...args: Obj[]): Obj {
      for (const arg of args) {
        console.log(arg.inspect());
      }

      return NULL;
    }),
  ],
]);
