let db = [];
let nextTypeId = 0;

function freshTypeId() {
  const id = nextTypeId++;
  db[id] = null;
  return id;
}

function createConcreteType(name) {
  const id = nextTypeId++;
  db[id] = { concrete: name };
  return id;
}

function createObjectType(fields) {
  const id = nextTypeId++;
  db[id] = { object: fields };
  return id;
}

function resolveSymlinksAndCompress(typeId) {
  const entry = db[typeId];
  if (entry === null) return typeId;
  if (entry && entry.symlink !== undefined) {
    const ultimate = resolveSymlinksAndCompress(entry.symlink);
    db[typeId] = { symlink: ultimate };
    return ultimate;
  }
  return typeId;
}

function getConcreteTypeName(typeId) {
  const ultimateId = resolveSymlinksAndCompress(typeId);
  const entry = db[ultimateId];
  return entry?.concrete || null;
}

function isObjectType(typeId) {
  typeId = resolveSymlinksAndCompress(typeId);
  return db[typeId]?.kind === "object";
}

module.exports = {
  db,
  freshTypeId,
  createConcreteType,
  createObjectType,
  resolveSymlinksAndCompress,
  getConcreteTypeName,
  isObjectType
};
