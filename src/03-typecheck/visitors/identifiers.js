const { freshTypeId } = require("../db");
const { lookupInScopes } = require("../scope");

function visitIdentifier(node) {
  const found = lookupInScopes(node.name);
  if (found !== undefined) {
    node.typeId = found;
    return node.typeId;
  }
  if (node.typeId === undefined) {
    node.typeId = freshTypeId();
  }
  return node.typeId;
}

module.exports = {
  visitIdentifier,
};


