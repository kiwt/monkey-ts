import { Obj } from "./object";

export class Environment {
  store: Map<string, Obj>;

  constructor() {
    this.store = new Map<string, Obj>();
  }

  public get(name: string): [Obj | undefined, boolean] {
    const obj = this.store.get(name);
    return [obj, obj !== undefined];
  }

  public set(name: string, val: Obj): Obj {
    this.store.set(name, val);
    return val;
  }
}
