const { db, resolveSymlinksAndCompress, getConcreteTypeName } = require("./db");
const { reportError } = require("./errors");

function reportTypeMismatch(aTypeId, bTypeId, node) {
  const t1 = getConcreteTypeName(aTypeId) || "unknown";
  const t2 = getConcreteTypeName(bTypeId) || "unknown";
  reportError(`Type mismatch: cannot unify ${t1} with ${t2}`, node);
  return false;
}

function unify(aTypeId, bTypeId, node) {
  const a = resolveSymlinksAndCompress(aTypeId);
  const b = resolveSymlinksAndCompress(bTypeId);
  if (a === b) return true;

  const aEntry = db[a];
  const bEntry = db[b];

  if (aEntry?.concrete && bEntry?.concrete && aEntry.concrete !== bEntry.concrete) {
    return reportTypeMismatch(a, b, node);
  }

  if (aEntry === null) {
    db[a] = bEntry === null ? { symlink: b } : bEntry.concrete ? { concrete: bEntry.concrete } : { symlink: b };
    return true;
  }
  if (bEntry === null) {
    return unify(b, a, node);
  }

  if (aEntry.concrete) db[b] = { symlink: a };
  else db[a] = { symlink: b };

  return true;
}

module.exports = { unify, reportTypeMismatch };
