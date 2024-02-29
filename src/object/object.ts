import { BlockStatement, Identifier } from "../ast/ast";
import { Environment } from "./environment";
import { start } from "../repl/repl";

export type ObjType = (typeof ObjType)[keyof typeof ObjType];

export const ObjType = {
  INTEGER_OBJ: "INTEGER",
  BOOLEAN_OBJ: "BOOLEAN",
  STRING_OBJ: "STRING",
  NULL_OBJ: "NULL",
  RETURN_VALUE_OBJ: "RETURN_VALUE",
  FUNCTION_OBJ: "FUNCTION",
  BUILTIN_OBJ: "BUILTIN",
  ARRAY_OBJ: "ARRAY",
  ERROR_OBJ: "ERROR",
} as const;

export interface Obj {
  type(): ObjType;
  inspect(): string;
}

export class IntegerObj implements Obj {
  constructor(public value: number) {}
  type(): ObjType {
    return ObjType.INTEGER_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }
}

export class BooleanObj implements Obj {
  constructor(public value: boolean) {}

  type(): ObjType {
    return ObjType.BOOLEAN_OBJ;
  }

  inspect(): string {
    return String(this.value);
  }
}

export class StringObj implements Obj {
  constructor(public value: string) {}
  type(): ObjType {
    return ObjType.STRING_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }
}

export class NullObj implements Obj {
  constructor() {}
  type(): ObjType {
    return ObjType.NULL_OBJ;
  }
  inspect(): string {
    return "null";
  }
}

export class ReturnValueObj implements Obj {
  constructor(public value: Obj) {}

  type(): ObjType {
    return ObjType.RETURN_VALUE_OBJ;
  }
  inspect(): string {
    return this.value.inspect();
  }
}

export class FunctionObj implements Obj {
  constructor(
    public env: Environment,
    public parameters: Identifier[],
    public body?: BlockStatement
  ) {}

  type(): ObjType {
    return ObjType.FUNCTION_OBJ;
  }
  inspect(): string {
    let out = "";

    let params: string[] = [];
    for (const p of this.parameters) {
      params.push(p.string());
    }

    out += "fn";
    out += "(";
    out += params.join(", ");
    out += ") {\n";
    out += this.body?.string();
    out += "\n}";

    return out;
  }
}

export type BuiltinFunction = (...args: Obj[]) => Obj;
export class BuiltinObj implements Obj {
  constructor(public fn: BuiltinFunction) {}

  type(): ObjType {
    return ObjType.BUILTIN_OBJ;
  }
  inspect(): string {
    return "builtin function";
  }
}

export class ArrayObj implements Obj {
  constructor(public elements: Obj[]) {}

  type(): ObjType {
    return ObjType.ARRAY_OBJ;
  }
  inspect(): string {
    let out = "";

    let elements: string[] = [];
    for (const e of this.elements) {
      elements.push(e.inspect());
    }

    out += "[";
    out += elements.join(", ");
    out += "]";

    return out;
  }
}

export class ErrorObj implements Obj {
  constructor(public message: string) {}

  type(): ObjType {
    return ObjType.ERROR_OBJ;
  }
  inspect(): string {
    return "ERROR: " + this.message;
  }
}
