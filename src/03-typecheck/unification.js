const { reportError } = require("./errors");
const {
  resolveSymlinksAndCompress,
  getConcreteTypeName,
  getEntry,
  setEntry,
} = require("./db");

function reportTypeMismatch(typeId1, typeId2, node) {
  const type1Name = getConcreteTypeName(typeId1) || "unknown";
  const type2Name = getConcreteTypeName(typeId2) || "unknown";
  reportError(
    `Type mismatch: cannot unify ${type1Name} with ${type2Name}`,
    node,
  );
  return false;
}

const unify = (aTypeId, bTypeId, node) => {
  const aType = resolveSymlinksAndCompress(aTypeId);
  const bType = resolveSymlinksAndCompress(bTypeId);
  if (aType === bType) return true;

  const aEntry = getEntry(aType);
  const bEntry = getEntry(bType);

  if (
    aEntry && aEntry.concrete !== undefined &&
    bEntry && bEntry.concrete !== undefined &&
    aEntry.concrete !== bEntry.concrete
  ) {
    return reportTypeMismatch(aType, bType, node);
  }

  if (aEntry === null) {
    setEntry(
      aType,
      bEntry === null
        ? { symlink: bType }
        : bEntry.concrete !== undefined
          ? { concrete: bEntry.concrete }
          : { symlink: bType },
    );
    return true;
  } else if (bEntry === null) {
    return unify(bTypeId, aTypeId, node);
  } else if (aEntry.concrete !== undefined) {
    setEntry(bType, { symlink: aType });
  } else {
    setEntry(aType, { symlink: bType });
  }

  return true;
};

module.exports = {
  unify,
  reportTypeMismatch,
};


