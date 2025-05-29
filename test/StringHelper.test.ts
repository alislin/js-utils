import { setNodeId } from "../src/utils/StringHelper";
// import { describe, expect, test } from '@jest/globals';

test("seed id test", () => {
    expect(setNodeId("t")).toBe("t");
    expect(setNodeId("t", "x")).toBe("t@x");
    expect(setNodeId("t", "x", "y")).toBe("t@x@y");
    expect(setNodeId("t", "x", "y", "z")).toBe("t@x@y@z");
    expect(setNodeId("t", undefined, "y", "z")).toBe("t@y@z");
    expect(setNodeId(undefined, "x", "y")).toBe("x@y");
    expect(setNodeId("t", "x@a")).toBe("t@x@a");
    expect(setNodeId("t", "x@a", "y", "z")).toBe("t@x@a@y@z");
});