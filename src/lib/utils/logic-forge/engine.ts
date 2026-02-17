import type { LogicAST, TruthTableData, KarnaughMapData } from '$lib/types/logic-forge';

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
  | 'IMPLIES'
  | 'EQUIV'
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
  'xnor': 'XNOR',
  '->': 'IMPLIES',
  'implies': 'IMPLIES',
  '<->': 'EQUIV',
  'equiv': 'EQUIV',
  'iff': 'EQUIV'
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
                // It's part of a variable, fall through
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
  // Expression -> ImpliesExpr
  // ImpliesExpr -> OrExpr ( (IMPLIES|EQUIV) OrExpr )*
  // OrExpr -> XorExpr ( (OR|NOR) XorExpr )*
  // XorExpr -> AndExpr ( (XOR|XNOR) AndExpr )*
  // AndExpr -> NotExpr ( (AND|NAND) NotExpr )*
  // NotExpr -> NOT NotExpr | Primary
  // Primary -> LPAREN Expression RPAREN | VAR | CONST

  function parseExpression(): LogicAST {
    return parseImplies();
  }

  function parseImplies(): LogicAST {
    let left = parseOr();
    while (peek().type === 'IMPLIES' || peek().type === 'EQUIV') {
        const op = consume().type;
        const right = parseOr();
        left = { type: op as any, left, right };
    }
    return left;
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
    case 'IMPLIES': return !evaluate(ast.left, values) || evaluate(ast.right, values);
    case 'EQUIV': return evaluate(ast.left, values) === evaluate(ast.right, values);
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

  if (variables.length > 6) {
    throw new Error('Too many variables (max 6). Truth table would be too large.');
  }

  const rows = [];
  const numRows = Math.pow(2, variables.length);

  for (let i = 0; i < numRows; i++) {
    const values: Record<string, boolean> = {};
    const rowValues: boolean[] = [];

    for (let j = 0; j < variables.length; j++) {
      // Create truth table values (00, 01, 10, 11)
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

// --- Simplification Logic (Quine-McCluskey) ---

function getMinterms(truthTable: TruthTableData): number[] {
  return truthTable.rows
    .map((row, index) => row.result ? index : -1)
    .filter(index => index !== -1);
}

function countSetBits(n: number): number {
  let count = 0;
  while (n > 0) {
    n &= (n - 1);
    count++;
  }
  return count;
}

interface Implicant {
  term: string; // binary string with '-' for dont-care
  minterms: number[];
  used: boolean;
}

function combineImplicants(a: Implicant, b: Implicant): Implicant | null {
  let diff = 0;
  let resultTerm = '';

  for (let i = 0; i < a.term.length; i++) {
    if (a.term[i] !== b.term[i]) {
      diff++;
      resultTerm += '-';
    } else {
      resultTerm += a.term[i];
    }
  }

  if (diff === 1) {
    return {
      term: resultTerm,
      minterms: [...a.minterms, ...b.minterms].sort((x, y) => x - y),
      used: false
    };
  }
  return null;
}

function simplifyQuineMcCluskey(truthTable: TruthTableData): string {
    const minterms = getMinterms(truthTable);
    const numVars = truthTable.variables.length;

    if (minterms.length === 0) return '0';
    if (minterms.length === Math.pow(2, numVars)) return '1';

    let implicants: Implicant[] = minterms.map(m => ({
        term: m.toString(2).padStart(numVars, '0'),
        minterms: [m],
        used: false
    }));

    const primeImplicants: Implicant[] = [];

    while (implicants.length > 0) {
        const nextImplicants: Implicant[] = [];
        const currentImplicants = implicants;

        // Group by number of 1s
        const groups: Record<number, Implicant[]> = {};
        for (const imp of currentImplicants) {
            const ones = imp.term.split('1').length - 1;
            if (!groups[ones]) groups[ones] = [];
            groups[ones].push(imp);
        }

        const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);

        for (let i = 0; i < sortedKeys.length - 1; i++) {
            const groupA = groups[sortedKeys[i]];
            const groupB = groups[sortedKeys[i+1]];

            if (!groupB) continue; // Should not happen given logic but safety first

            for (const a of groupA) {
                for (const b of groupB) {
                    const combined = combineImplicants(a, b);
                    if (combined) {
                        a.used = true;
                        b.used = true;
                        // Avoid duplicates
                        if (!nextImplicants.some(imp => imp.term === combined.term)) {
                            nextImplicants.push(combined);
                        }
                    }
                }
            }
        }

        // Add unused implicants to prime list
        for (const imp of currentImplicants) {
            if (!imp.used) {
                if (!primeImplicants.some(p => p.term === imp.term)) {
                    primeImplicants.push(imp);
                }
            }
        }

        implicants = nextImplicants;
    }

    // Essential Prime Implicant Selection (Simplified for now: just take all primes covering minterms)
    // A robust solver would solve the covering problem.
    // For this implementation, we will just return the prime implicants OR'd together.

    // Filter redundant primes?
    // Let's do a simple greedy coverage.
    const uncoveredMinterms = new Set(minterms);
    const selectedPrimes: Implicant[] = [];

    // Sort primes by size (covering more minterms first)
    primeImplicants.sort((a, b) => b.minterms.length - a.minterms.length);

    for (const prime of primeImplicants) {
        const contributes = prime.minterms.some(m => uncoveredMinterms.has(m));
        if (contributes) {
            selectedPrimes.push(prime);
            prime.minterms.forEach(m => uncoveredMinterms.delete(m));
        }
    }

    // Convert to expression string
    const parts = selectedPrimes.map(p => {
        const terms = [];
        for (let i = 0; i < p.term.length; i++) {
            if (p.term[i] === '1') {
                terms.push(truthTable.variables[i]);
            } else if (p.term[i] === '0') {
                terms.push('!' + truthTable.variables[i]);
            }
        }
        return terms.length === 0 ? '1' : terms.join(' & '); // Should not happen for primes unless full cover
    });

    if (parts.length === 0) return '0';
    return parts.join(' | ');
}

export function simplify(ast: LogicAST): LogicAST {
    const truthTable = generateTruthTable(ast);
    const simplifiedExpr = simplifyQuineMcCluskey(truthTable);
    return parseExpression(simplifiedExpr);
}

export function getCanonicalForms(truthTable: TruthTableData): { sop: string, pos: string } {
    const vars = truthTable.variables;
    const minterms: string[] = [];
    const maxterms: string[] = [];

    truthTable.rows.forEach((row, idx) => {
        if (row.result) {
            // SOP: Minterm (AND)
            const parts = row.values.map((val, vIdx) => val ? vars[vIdx] : `!${vars[vIdx]}`);
            minterms.push(`(${parts.join(' & ')})`);
        } else {
            // POS: Maxterm (OR) - Invert values
            const parts = row.values.map((val, vIdx) => val ? `!${vars[vIdx]}` : vars[vIdx]);
            maxterms.push(`(${parts.join(' | ')})`);
        }
    });

    const sop = minterms.length > 0 ? minterms.join(' | ') : '0';
    const pos = maxterms.length > 0 ? maxterms.join(' & ') : '1';

    return { sop, pos };
}

export function getKarnaughMap(truthTable: TruthTableData): KarnaughMapData {
    const vars = truthTable.variables;
    const n = vars.length;

    // Gray codes
    const gray2 = ['00', '01', '11', '10'];
    const gray1 = ['0', '1'];

    let rowLabels: string[] = [];
    let colLabels: string[] = [];
    let grid: (boolean | null)[][] = [];

    // Map minterm index to grid coordinates
    // We assume standard K-Map layouts
    if (n === 2) {
        // A \ B (0, 1)
        rowLabels = ['0', '1']; // Var 0
        colLabels = ['0', '1']; // Var 1
        grid = Array(2).fill(null).map(() => Array(2).fill(false));

        truthTable.rows.forEach((row, idx) => {
             // idx = i*2 + j
             // i = idx >> 1, j = idx & 1
             const r = idx >> 1;
             const c = idx & 1;
             grid[r][c] = row.result;
        });
    } else if (n === 3) {
        // A \ BC (00, 01, 11, 10)
        rowLabels = ['0', '1'];
        colLabels = gray2;
        grid = Array(2).fill(null).map(() => Array(4).fill(false));

        truthTable.rows.forEach((row, idx) => {
            // A = bit 2, B = bit 1, C = bit 0
            const a = (idx >> 2) & 1;
            const b = (idx >> 1) & 1;
            const c = idx & 1;

            // Map BC binary to Gray Code column index
            // 00->0, 01->1, 11->2, 10->3
            const bc = (b << 1) | c;
            let colIdx = 0;
            if (bc === 0) colIdx = 0;
            else if (bc === 1) colIdx = 1;
            else if (bc === 3) colIdx = 2;
            else if (bc === 2) colIdx = 3;

            grid[a][colIdx] = row.result;
        });

    } else if (n === 4) {
        // AB \ CD (00, 01, 11, 10)
        rowLabels = gray2;
        colLabels = gray2;
        grid = Array(4).fill(null).map(() => Array(4).fill(false));

        truthTable.rows.forEach((row, idx) => {
            // A=3, B=2, C=1, D=0
            const ab = (idx >> 2) & 3;
            const cd = idx & 3;

            // Map binary to Gray Code index
            const mapGray = (val: number) => {
                if (val === 0) return 0;
                if (val === 1) return 1;
                if (val === 3) return 2;
                if (val === 2) return 3;
                return 0;
            };

            const r = mapGray(ab);
            const c = mapGray(cd);
            grid[r][c] = row.result;
        });
    }

    return {
        variables: vars,
        grid,
        rowLabels,
        colLabels
    };
}
