/**
 * Convert given test structure to markdown.
 *
 * @param {Object} testCases
 * @param {Int} tier
 * @returns {String}
 */
function markify(testCases, tier = 0) {
  const entries = Object.entries(testCases.orSome({}));

  return entries.reduce((markdown, [testCase, children]) => {
    return markdown.concat(
      markifyLine(testCase, indent),
      '\n',
      markify(children, tier + 1),
    );
  }, '');
}

/**
 * Convert line to markdown given its tier in the tree.
 * @param {String} string
 * @param {Int} tier
 * @returns {String}
 */
function markifyLine(string, tier) {
  return tier === 0 ? `**${string}**\n` : `${' '.repeat(tier * 2)}- ${string}`;
}

module.exports = {
  markify,
};
