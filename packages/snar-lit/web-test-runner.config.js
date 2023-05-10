// import {playwrightLauncher} from '@web/test-runner-playwright';

const mode = process.env.MODE || "dev";

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  nodeResolve: {
    exportConditions: mode === "dev" ? ["development"] : [],
  },

  files: ["out/**/*_test.js"],
  filterBrowserLogs: ({ type }) => type === "error" || type === "log",
  // browsers: [
  //   playwrightLauncher({
  //     product: 'chromium',
  //   }),
  // ],
  testFramework: {
    config: {
      ui: "tdd", // suite and test
      // ui: 'bdd', // describe and it
      timeout: "6000",
    },
  },
};
