// import path from "path";
// import fs from "fs";
// import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import clear from "rollup-plugin-clear";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

// tsconfig.json合并选项
// 一般来说默认使用项目的tsconfig.json，如果有个别需要修改的如下，可以在此修改
const override = { compilerOptions: { module: "es2015" } };

// #region 处理所有文件
// 获取 utils 目录中的所有文件
// const utilsDir = "src/utils";
// const utilsFiles = fs
//   .readdirSync(utilsDir)
//   .map((file) => path.join(utilsDir, file));

const config = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      //   export: "named",
    },
    plugins: [
      clear({ targets: ["dist"] }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json", tsconfigOverride: override }),
      // babel({
      //   exclude: "node_modules/**",
      //   babelHelpers: "bundled",
      // }),
      terser(),
    ],
  },
  //   ...utilsFiles.map((file) => ({
  //     input: file,
  //     output: {
  //       file: `dist/${path.basename(file, ".ts")}.js`,
  //       format: "es",
  //       sourcemap: true,
  //       //   export: "named",
  //     },
  //     plugins: [
  //       resolve(),
  //       commonjs(),
  //       typescript({ tsconfig: "./tsconfig.json", tsconfigOverride: override }),
  //       //   babel({
  //       //     exclude: "node_modules/**",
  //       //     babelHelpers: "bundled",
  //       //   }),
  //       terser(),
  //     ],
  //   })),
];

export default config;
// #endregion
