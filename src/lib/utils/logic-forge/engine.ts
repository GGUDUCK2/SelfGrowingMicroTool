import type { LogicAST, TruthTableData } from '$lib/types/logic-forge';

type TokenType =
  | 'LPAREN'
  | 'RPAREN'
  | 'NOT'
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NAND'
  | 'NOR'
  | 'XNOR'
  | 'VAR'
  | 'CONST'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

const OPERATORS: Record<string, TokenType> = {
  '&': 'AND',
  '&&': 'AND',
  'and': 'AND',
  '|': 'OR',
  '||': 'OR',
  'or': 'OR',
  '!': 'NOT',
  '~': 'NOT',
  'not': 'NOT',
  '^': 'XOR',
  'xor': 'XOR',
  'nand': 'NAND',
  'nor': 'NOR',
  'xnor': 'XNOR'
};

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Check for operators
    // Sort keys by length desc to match longest operators first (e.g. NAND before N)
    const opMatch = Object.keys(OPERATORS)
        .sort((a, b) => b.length - a.length)
        .find(op => expr.substr(i).toLowerCase().startsWith(op));

    if (opMatch) {
        // Need to ensure word operators are not just prefixes of variables
        // e.g. "order" should not be tokenized as "or" + "der"
        const isWordOp = /^[a-z]+$/i.test(opMatch);
        if (isWordOp) {
            const nextChar = expr[i + opMatch.length];
            if (nextChar && /[a-zA-Z0-9_]/.test(nextChar)) {
                // It's part of a variable
            } else {
                tokens.push({ type: OPERATORS[opMatch], value: opMatch });
                i += opMatch.length;
                continue;
            }
        } else {
            tokens.push({ type: OPERATORS[opMatch], value: opMatch });
            i += opMatch.length;
            continue;
        }
    }

    // Variables or Constants (0/1/T/F)
    if (/[a-zA-Z0-9_]/.test(char)) {
      let value = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        value += expr[i];
        i++;
      }

      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 't') {
        tokens.push({ type: 'CONST', value: '1' });
      } else if (lower === 'false' || lower === '0' || lower === 'f') {
        tokens.push({ type: 'CONST', value: '0' });
      } else {
        tokens.push({ type: 'VAR', value });
      }
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

export function parseExpression(expr: string): LogicAST {
  const tokens = tokenize(expr);
  let current = 0;

  function peek(): Token {
    return tokens[current];
  }

  function consume(): Token {
    return tokens[current++];
  }

  function match(type: TokenType): boolean {
    if (peek().type === type) {
      consume();
      return true;
    }
    return false;
  }

  // Grammar:
  // Expression -> OrExpr
  // OrExpr -> XorExpr ( (OR|NOR) XorExpr )*
  // XorExpr -> AndExpr ( (XOR|XNOR) AndExpr )*
  // AndExpr -> NotExpr ( (AND|NAND) NotExpr )*
  // NotExpr -> NOT NotExpr | Primary
  // Primary -> LPAREN Expression RPAREN | VAR | CONST

  function parseExpression(): LogicAST {
    return parseOr();
  }

  function parseOr(): LogicAST {
    let left = parseXor();
    while (peek().type === 'OR' || peek().type === 'NOR') {
      const op = consume().type;
      const right = parseXor();
      left = { type: op as any, left, right };
    }
    return left;
  }

  function parseXor(): LogicAST {
    let left = parseAnd();
    while (peek().type === 'XOR' || peek().type === 'XNOR') {
        const op = consume().type;
        const right = parseAnd();
        left = { type: op as any, left, right };
    }
    return left;
  }

  function parseAnd(): LogicAST {
    let left = parseNot();
    while (peek().type === 'AND' || peek().type === 'NAND') {
        const op = consume().type;
        const right = parseNot();
        left = { type: op as any, left, right };
    }
    return left;
  }

  function parseNot(): LogicAST {
    if (match('NOT')) {
      return { type: 'NOT', operand: parseNot() };
    }
    return parsePrimary();
  }

  function parsePrimary(): LogicAST {
    const token = consume();
    if (token.type === 'CONST') {
      return { type: 'CONST', value: token.value === '1' };
    }
    if (token.type === 'VAR') {
      return { type: 'VAR', name: token.value };
    }
    if (token.type === 'LPAREN') {
      const expr = parseExpression();
      if (!match('RPAREN')) {
        throw new Error("Expected ')'");
      }
      return expr;
    }
    throw new Error(`Unexpected token: ${token.value}`);
  }

  const ast = parseExpression();
  if (peek().type !== 'EOF') {
    throw new Error("Unexpected trailing tokens");
  }
  return ast;
}

export function evaluate(ast: LogicAST, values: Record<string, boolean>): boolean {
  switch (ast.type) {
    case 'CONST': return ast.value;
    case 'VAR': return values[ast.name] || false;
    case 'NOT': return !evaluate(ast.operand, values);
    case 'AND': return evaluate(ast.left, values) && evaluate(ast.right, values);
    case 'OR': return evaluate(ast.left, values) || evaluate(ast.right, values);
    case 'XOR': return evaluate(ast.left, values) !== evaluate(ast.right, values);
    case 'NAND': return !(evaluate(ast.left, values) && evaluate(ast.right, values));
    case 'NOR': return !(evaluate(ast.left, values) || evaluate(ast.right, values));
    case 'XNOR': return evaluate(ast.left, values) === evaluate(ast.right, values);
  }
}

export function getVariables(ast: LogicAST): Set<string> {
  const vars = new Set<string>();
  function traverse(node: LogicAST) {
    if (node.type === 'VAR') {
      vars.add(node.name);
    } else if (node.type === 'NOT') {
      traverse(node.operand);
    } else if ('left' in node) {
        traverse(node.left);
        traverse(node.right);
    }
  }
  traverse(ast);
  return vars;
}

export function generateTruthTable(ast: LogicAST): TruthTableData {
  const variableSet = getVariables(ast);
  const variables = Array.from(variableSet).sort();
  const rows = [];

  const numRows = Math.pow(2, variables.length);
  for (let i = 0; i < numRows; i++) {
    const values: Record<string, boolean> = {};
    const rowValues: boolean[] = [];

    for (let j = 0; j < variables.length; j++) {
      // Create truth table values (00, 01, 10, 11)
      // Using big-endian (MSB first) usually readable
      // i is 0..3.
      // var 0 (MSB): (i >> (n-1-j)) & 1
      const val = ((i >> (variables.length - 1 - j)) & 1) === 1;
      values[variables[j]] = val;
      rowValues.push(val);
    }

    rows.push({
      values: rowValues,
      result: evaluate(ast, values)
    });
  }

  return { variables, rows };
}
