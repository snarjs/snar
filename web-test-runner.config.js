// import {playwrightLauncher} from '@web/test-runner-playwright';

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
	nodeResolve: true,
	files: ['out/**/*_test.js'],
	// browsers: [
	//   playwrightLauncher({
	//     product: 'chromium',
	//   }),
	// ],
	testFramework: {
		config: {
			ui: 'tdd', // suite and test
			// ui: 'bdd', // describe and it
			timeout: '6000',
		},
	},
}
