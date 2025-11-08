/**
 * Evaluates a boolean entitlement expression.
 *
 * @param {string} expr - A boolean expression using identifiers, parentheses, and operators: 
 *                        && (AND), || (OR), ! (NOT). Identifiers can contain letters, digits, 
 *                        underscores, hyphens, and dots (e.g., "role.admin", "feature_read").
 * @param {string[]} entitlements
 * 
 * @returns {boolean}
 */
export function evaluateEntitlementExpression(expression, entitlements) {
  const tokens = tokenize(expression);
  let i = 0;

  const currentToken = () => tokens[i];
  const nextToken = () => tokens[i++];

  function evaluateExpression() {
    return evaluateOr();
  }

  function evaluateOr() {
    let left = evaluateAnd();
    while (currentToken() === "||") {
      nextToken(); // skip '||'
      const right = evaluateAnd();
      left = left || right;
    }
    return left;
  }

  function evaluateAnd() {
    let left = evaluateNot();
    while (currentToken() === "&&") {
      nextToken(); // skip '&&'
      const right = evaluateNot();
      left = left && right;
    }
    return left;
  }

  function evaluateNot() {
    if (currentToken() === "!") {
      nextToken();
      return !evaluateNot();
    }
    return parseIdentifierOrGroup();
  }

  function parseIdentifierOrGroup() {
    if (currentToken() === "(") {
      nextToken(); // skip '('
      const value = evaluateExpression();
      nextToken(); // skip ')'
      return value;
    }
    const id = nextToken(); // identifier
    return entitlements.includes(id);
  }

  return evaluateExpression();
}

function tokenize(str) {
  return str.match(/[A-Za-z0-9_.-]+|&&|\|\||!|\(|\)/g) || [];
}
