let scopes = [{}];

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

function pushScope() {
  scopes.push({});
}

function popScope() {
  scopes.pop();
}

module.exports = { defineInCurrentScope, lookupInScopes, pushScope, popScope };
