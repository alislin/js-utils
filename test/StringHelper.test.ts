import { getDate } from "../src/utils/StringHelper";
// require("../src/utils/StringHelper")
test("获取日期字串", () => {
    expect(getDate("2023-10-6", " ")).toBe("2023 10 06");
    expect(getDate(1722838816923)).toBe("2024-08-05");
})