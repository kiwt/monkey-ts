import { BlockStatement, Identifier } from "../ast/ast";
import { Environment } from "./environment";

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
  HASH_OBJ: "HASH",
  ERROR_OBJ: "ERROR",
} as const;

export interface Obj {
  type(): ObjType;
  inspect(): string;
}

export interface Hashable {
  hashKey(): HashKey;
}

export class IntegerObj implements Obj, Hashable {
  constructor(public value: number) {}
  type(): ObjType {
    return ObjType.INTEGER_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }

  hashKey(): HashKey {
    return new HashKey(this.type(), this.value);
  }
}

export class BooleanObj implements Obj, Hashable {
  constructor(public value: boolean) {}

  type(): ObjType {
    return ObjType.BOOLEAN_OBJ;
  }

  inspect(): string {
    return String(this.value);
  }

  hashKey(): HashKey {
    const value = this.value ? 1 : 0;
    return new HashKey(ObjType.BOOLEAN_OBJ, value);
  }
}

export class StringObj implements Obj, Hashable {
  constructor(public value: string) {}
  type(): ObjType {
    return ObjType.STRING_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }

  hashKey(): HashKey {
    let hash = 0;
    for (let i = 0; i < this.value.length; i++) {
      const char = this.value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return new HashKey(this.type(), hash);
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

export class HashKey {
  constructor(public key: ObjType, public value: number) {}
}

export class HashPair {
  constructor(public key: Obj, public value: Obj) {}
}

export class HashObj implements Obj {
  constructor(public pairs: Map<HashKey, HashPair>) {}

  type(): ObjType {
    return ObjType.HASH_OBJ;
  }
  inspect(): string {
    let out = "";

    let pairs: string[] = [];
    for (const [pair, _] of this.pairs) {
      pairs.push(`${pair.key}: ${pair.value}`);
    }

    out += "{";
    out += pairs.join(", ");
    out += "}";

    return out;
  }
}
