export type ObjType = (typeof ObjType)[keyof typeof ObjType];

export const ObjType = {
  INTEGER_OBJ: "integer",
  BOOLEAN_OBJ: "boolean",
  NULL_OBJ: "null",
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

export class NullObj implements Obj {
  constructor() {}
  type(): ObjType {
    return ObjType.NULL_OBJ;
  }
  inspect(): string {
    return "null";
  }
}
