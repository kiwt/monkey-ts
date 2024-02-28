import {
  BuiltinObj,
  IntegerObj,
  NullObj,
  Obj,
  ObjType,
  StringObj,
} from "../object/object";
import { newError } from "./evaluator";

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
        case ObjType.STRING_OBJ: {
          const arg = args[0] as StringObj;
          return new IntegerObj(Number(arg.value.length));
        }
        default:
          return newError(
            `argument to "len" not supported, got ${args[0].type()}`
          );
      }

      return new NullObj();
    }),
  ],
]);
