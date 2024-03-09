import { StringObj } from "./object";

test("testStringHashKey", () => {
  const hello1 = new StringObj("Hello World");
  const hello2 = new StringObj("Hello World");
  const diff1 = new StringObj("My name is johnny");
  const diff2 = new StringObj("My name is johnny");

  expect(hello1.hashKey()).toEqual(hello2.hashKey());
  expect(diff1.hashKey()).toEqual(diff2.hashKey());
  expect(hello1.hashKey()).not.toEqual(diff1.hashKey());
});
