import { Obj } from "./object";

export class Environment {
  private store: Map<string, Obj>;
  private outer?: Environment;

  constructor(outer?: Environment) {
    this.store = new Map();
    this.outer = outer;
  }

  public get(name: string): [Obj | undefined, boolean] {
    let obj = this.store.get(name);
    if (!obj && this.outer) {
      return this.outer.get(name);
    }
    return [obj, obj !== undefined];
  }

  public set(name: string, val: Obj): Obj {
    this.store.set(name, val);
    return val;
  }
}
