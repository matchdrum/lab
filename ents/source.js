/**
 * Evaluates a boolean entitlement expression.
 *
 * @param {string} expression - A boolean expression using identifiers, parentheses, and operators: 
 *                        && (AND), || (OR), ! (NOT). Identifiers can contain letters, digits, 
 *                        underscores, hyphens, and dots (e.g., "role.admin", "feature_read").
 * @param {string[]} entitlements
 * 
 * @returns {boolean}
 */
export function evaluateEntitlementExpression(expression, entitlements) {
  if (!validateExpressionString(expression))
    return false

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
      nextToken();
      const right = evaluateAnd();
      left = left || right;
    }
    return left;
  }

  function evaluateAnd() {
    let left = evaluateNot();
    while (currentToken() === "&&") {
      nextToken(); 
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
      nextToken(); 
      const value = evaluateExpression();
      nextToken(); 
      return value;
    }
    const id = nextToken(); 
    return entitlements.includes(id);
  }

  return evaluateExpression();
}

function tokenize(str) {
  return str.match(/[A-Za-z0-9_.-]+|&&|\|\||!|\(|\)/g) || [];
}


/**
 * Validates a boolean entitlement expression string.
 * Returns true if valid, false otherwise.
 *
 * @param {string} expr - The boolean expression string to validate.
 * @returns {boolean} - True if valid, false if invalid.
 */
function validateExpressionString(expr) {
  if (typeof expr !== "string" || expr.trim() === "") return false;

  // Allowed tokens: identifiers (letters, digits, underscore, hyphen, dot), &&, ||, !, parentheses
  const invalidChars = expr.replace(/\s*([A-Za-z_][A-Za-z0-9_.-]*|&&|\|\||!|\(|\))\s*/g, "");
  if (invalidChars.length > 0) return false;

  return true;
}

function isValidString(str) {
  // Regex to allow letters, digits, underscore, hyphen, dot, parentheses, !, &&, ||
  const regex = /^(?:[a-zA-Z0-9_.\-()]|!|&&|\|\|)*$/;
  return regex.test(str);
}

// Example usage:
console.log(isValidString("abc_123"));       // true
console.log(isValidString("a && b || !c"));  // true
console.log(isValidString("invalid@char"));  // false
console.log(isValidString("(a-b).c"));       // true