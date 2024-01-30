/**
 * @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 * @returns {ReturnType<import("@11ty/eleventy/src/defaultConfig")>}
 */
module.exports = function (eleventyConfig) {
	return {
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
		dir: {
			input: 'site',
			output: '_dev',
		},
	};
};
