// loans is an independent Hardhat project. It inherits the shared toolchain from
// common/hardhat.base.js and only points the paths at its own contracts/tests, so the
// directory compiles, tests and deploys on its own — delete flashloans/ and this still works.
const base = require("../common/hardhat.base.js");

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
	...base,
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
};
