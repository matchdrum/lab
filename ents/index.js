/**
 * Evaluate a boolean entitlement expression against a list of entitlements.
 * Supported tokens: identifiers (letters, digits, underscore, dot),
 * parentheses `(` `)`, operators: `!`, `&&`, `||`.
 *
 * Returns boolean.
 */
function evaluateEntitlementExpression(expr, entitlements) {
  if (typeof expr !== "string") throw new TypeError("Expression must be a string");
  if (!Array.isArray(entitlements)) throw new TypeError("Entitlements must be an array");

  const tokens = tokenize(expr);
  let pos = 0;

  // helper: look at current token without consuming
  function peek() {
    return tokens[pos];
  }
  // helper: consume and return current token
  function consume() {
    const t = tokens[pos];
    pos++;
    return t;
  }
  // helper: expect a specific token, throw if not present
  function expect(value) {
    if (peek() !== value) {
      throw new Error(`Expected '${value}' but found '${peek() ?? "EOF"}'`);
    }
    consume();
  }

  // Grammar (with precedence):
  // Expression := Or
  // Or         := And ( "||" And )*
  // And        := Not ( "&&" Not )*
  // Not        := "!" Not | Primary
  // Primary    := identifier | "(" Or ")"

  function parseExpression() {
    const result = parseOr();
    if (pos < tokens.length) {
      throw new Error(`Unexpected token '${peek()}' at position ${pos}`);
    }
    return result;
  }

  function parseOr() {
    let left = parseAnd();
    while (peek() === "||") {
      consume(); // eat '||'
      const right = parseAnd();
      left = left || right;
    }
    return left;
  }

  function parseAnd() {
    let left = parseNot();
    while (peek() === "&&") {
      consume(); // eat '&&'
      const right = parseNot();
      left = left && right;
    }
    return left;
  }

  function parseNot() {
    if (peek() === "!") {
      consume();
      return !parseNot();
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const t = peek();
    if (t === undefined) {
      throw new Error("Unexpected end of expression");
    }

    if (t === "(") {
      consume(); // '('
      const value = parseOr();
      expect(")");
      return value;
    }

    if (isIdentifier(t)) {
      consume();
      return entitlements.includes(t);
    }

    throw new Error(`Unexpected token '${t}' in primary at position ${pos}`);
  }

  return parseExpression();
}

/** tokenize: returns array of tokens or throws on invalid characters */
function tokenize(input) {
  if (input.trim() === "") throw new Error("Empty expression");

  // Identifier: letters/digits/underscore/dot, but must start with letter or underscore
  // Operators: && || !
  // Parentheses: ( )
  const tokenRegex = /\s*([A-Za-z_][A-Za-z0-9_.]*|&&|\|\||!|\(|\))\s*/g;

  const tokens = [];
  let lastIndex = 0;
  let m;
  while ((m = tokenRegex.exec(input)) !== null) {
    // Ensure regex progressed — prevents infinite loop
    if (m.index !== lastIndex) {
      // There's some unrecognized characters between tokens
      const badSegment = input.slice(lastIndex, m.index).trim();
      if (badSegment.length > 0) {
        throw new Error(`Invalid token segment: '${badSegment}'`);
      }
    }

    tokens.push(m[1]);
    lastIndex = tokenRegex.lastIndex;
  }

  // Check for trailing garbage after last match
  if (lastIndex !== input.length) {
    const bad = input.slice(lastIndex).trim();
    if (bad.length > 0) throw new Error(`Invalid trailing input: '${bad}'`);
  }

  if (tokens.length === 0) throw new Error("No tokens found");
  return tokens;
}

function isIdentifier(tok) {
  return /^[A-Za-z_][A-Za-z0-9_.]*$/.test(tok);
}


const tests = [
    { expr: "A", ent: ["A", "C"], expected: true },
  { expr: "A && (B || !C)", ent: ["A", "C"], expected: false },
  { expr: "A && (!B || C)", ent: ["A", "C"], expected: true },
  { expr: "A&&B||C",          ent: ["C"],       expected: true }, // no spaces
  { expr: "!A || (B && C)",   ent: ["B","C"],   expected: true },
  { expr: "!(A || B) && C",   ent: ["C"],       expected: true },
  { expr: "role.admin && feature.read", ent: ["role.admin", "feature.read"], expected: true }, // dots
  { expr: "A || B && C", ent: ["A","C"], expected: true }, // precedence check
];

for (const { expr, ent, expected } of tests) {
  try {
    const actual = evaluateEntitlementExpression(expr, ent);
    console.log(expr.padEnd(30), "=>", actual, actual === expected ? "OK" : `FAILED (expected ${expected})`);
  } catch (err) {
    console.error(expr.padEnd(30), "ERROR:", err.message);
  }
}
