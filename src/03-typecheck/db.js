let db = [];
let nextTypeId = 0;

function resetTypes() {
  db = [];
  nextTypeId = 0;
}

function freshTypeId() {
  const id = nextTypeId++;
  db[id] = null;
  return id;
}

function createConcreteType(typeName) {
  const id = nextTypeId++;
  db[id] = { concrete: typeName };
  return id;
}

function createObjectType(fieldMap) {
  const id = nextTypeId++;
  db[id] = { object: fieldMap };
  return id;
}

function getEntry(id) {
  return db[id];
}

function setEntry(id, value) {
  db[id] = value;
}

function resolveSymlinksAndCompress(typeId) {
  const entry = db[typeId];
  if (entry === null) return typeId;
  if (entry && entry.symlink !== undefined) {
    const ultimateTypeId = resolveSymlinksAndCompress(entry.symlink);
    if (ultimateTypeId !== entry.symlink) {
      db[typeId] = { symlink: ultimateTypeId };
    }
    return ultimateTypeId;
  }
  return typeId;
}

function getConcreteTypeName(typeId) {
  const ultimateId = resolveSymlinksAndCompress(typeId);
  const entry = db[ultimateId];
  if (entry && entry.concrete !== undefined) return entry.concrete;
  return null;
}

function getDb() {
  return db;
}

module.exports = {
  resetTypes,
  freshTypeId,
  createConcreteType,
  createObjectType,
  resolveSymlinksAndCompress,
  getConcreteTypeName,
  getEntry,
  setEntry,
  getDb,
};


