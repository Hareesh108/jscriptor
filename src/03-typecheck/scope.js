let scopes = [{}];

function resetScopes() {
  scopes = [{}];
}

function pushScope() {
  scopes.push({});
}

function popScope() {
  scopes.pop();
}

function currentScope() {
  return scopes[scopes.length - 1];
}

function defineInCurrentScope(name, typeId) {
  currentScope()[name] = typeId;
}

function lookupInScopes(name) {
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (scopes[i][name] !== undefined) return scopes[i][name];
  }
  return undefined;
}

module.exports = {
  resetScopes,
  pushScope,
  popScope,
  defineInCurrentScope,
  lookupInScopes,
};


