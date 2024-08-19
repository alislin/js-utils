import { listEqual,listSum } from "../src/utils/ListHelper";
test("listSum", () => {
    const list = [1, 2, 3, 4, 5];
    expect(listSum(list, x => x)).toBe(15);
});

test("lista equal listb", () => {
    const a = ["1", "m", "n"];
    const b = ["1", "m", "n"];
    expect(listEqual(a, b, x => x)).toBeTruthy();
})