export type TokenType = 'NUMBER' | 'IDENTIFIER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'COMMA';

export interface Token {
  type: TokenType;
  value: string;
}

export class MathEngine {
  private scope: Record<string, number> = {
    pi: Math.PI,
    PI: Math.PI,
    e: Math.E,
    E: Math.E
  };

  evaluate(expression: string, extraScope: Record<string, number> = {}): number {
    if (!expression.trim()) return 0;
    try {
      const tokens = this.tokenize(expression);
      const rpn = this.shuntingYard(tokens);
      return this.solveRPN(rpn, { ...this.scope, ...extraScope });
    } catch (e) {
      console.error(e);
      throw new Error('Invalid Expression');
    }
  }

  private tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    // Remove spaces but keep structure
    expr = expr.replace(/\s+/g, '');

    while (i < expr.length) {
      const char = expr[i];

      if (/[0-9]/.test(char) || (char === '.')) {
        let num = char;
        i++;
        while (i < expr.length && (/[0-9]/.test(expr[i]) || expr[i] === '.')) {
          num += expr[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: num });
      } else if (/[a-zA-Z]/.test(char)) {
        let id = char;
        i++;
        while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
          id += expr[i];
          i++;
        }
        tokens.push({ type: 'IDENTIFIER', value: id });
      } else if (['+', '-', '*', '/', '^', '%'].includes(char)) {
        // Handle unary minus
        if (char === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'OPERATOR' || tokens[tokens.length - 1].type === 'LPAREN')) {
             // Treat as unary minus by pushing -1 and *
             // Actually, easier to make a special UNARY_MINUS operator or just modify the next number if it is a number
             // But simpler standard way: 0 - x or -1 * x
             // Let's treat it as a special operator '~' internally
             tokens.push({ type: 'OPERATOR', value: '~' });
        } else {
             tokens.push({ type: 'OPERATOR', value: char });
        }
        i++;
      } else if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
      } else if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
      } else if (char === ',') {
        tokens.push({ type: 'COMMA', value: ',' });
        i++;
      } else {
        throw new Error(`Unknown character: ${char}`);
      }
    }
    return tokens;
  }

  private shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    const precedence: Record<string, number> = {
      '+': 1, '-': 1,
      '*': 2, '/': 2, '%': 2,
      '^': 3,
      '~': 4 // Unary minus
    };

    const associativity: Record<string, 'L' | 'R'> = {
      '+': 'L', '-': 'L',
      '*': 'L', '/': 'L', '%': 'L',
      '^': 'R',
      '~': 'R'
    };

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'IDENTIFIER') {
        // Check if it's a function or variable
        // If next token is LPAREN, it's a function
        // We handle functions by pushing to stack
        // But here we don't look ahead easily.
        // We assume all identifiers are variables unless processed later?
        // No, Shunting yard handles functions.
        // If it is a function (sin, cos etc), push to stack.
        // If variable (x, pi), push to output.
        // We need to know if it is a function.
        if (this.isFunction(token.value)) {
            operatorStack.push(token);
        } else {
            outputQueue.push(token);
        }
      } else if (token.type === 'COMMA') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
          outputQueue.push(operatorStack.pop()!);
        }
      } else if (token.type === 'OPERATOR') {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type === 'OPERATOR' &&
          (
            (associativity[token.value] === 'L' && precedence[token.value] <= precedence[operatorStack[operatorStack.length - 1].value]) ||
            (associativity[token.value] === 'R' && precedence[token.value] < precedence[operatorStack[operatorStack.length - 1].value])
          )
        ) {
          outputQueue.push(operatorStack.pop()!);
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
          outputQueue.push(operatorStack.pop()!);
        }
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'LPAREN') {
          operatorStack.pop(); // Pop '('
        }
        // If token at top of stack is function, pop it to output
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'IDENTIFIER') {
             outputQueue.push(operatorStack.pop()!);
        }
      }
    }

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop()!);
    }

    return outputQueue;
  }

  private solveRPN(tokens: Token[], scope: Record<string, number>): number {
    const stack: number[] = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        stack.push(parseFloat(token.value));
      } else if (token.type === 'IDENTIFIER') {
        if (token.value in scope) {
            stack.push(scope[token.value]);
        } else if (this.isFunction(token.value)) {
             // Should verify arity, but simpler here
             const fn = this.getFunction(token.value);
             // We need to know arity. Most are 1. pow is 2.
             // Simplification: only support 1-arg functions for now except pow/log?
             // Or rely on stack size.
             // Actually most common math functions are 1 arg.
             const arg = stack.pop();
             if (arg === undefined) throw new Error('Missing argument');
             stack.push(fn(arg));
        } else {
            throw new Error(`Unknown variable: ${token.value}`);
        }
      } else if (token.type === 'OPERATOR') {
        if (token.value === '~') {
            const a = stack.pop();
            if (a === undefined) throw new Error('Missing operand');
            stack.push(-a);
        } else {
            const b = stack.pop();
            const a = stack.pop();
            if (a === undefined || b === undefined) throw new Error('Missing operands');

            switch (token.value) {
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/': stack.push(a / b); break;
                case '%': stack.push(a % b); break;
                case '^': stack.push(Math.pow(a, b)); break;
            }
        }
      }
    }

    if (stack.length !== 1) throw new Error('Invalid Expression');
    return stack[0];
  }

  private isFunction(name: string): boolean {
      return ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs', 'floor', 'ceil', 'round', 'exp'].includes(name);
  }

  private getFunction(name: string): (x: number) => number {
      const fns: Record<string, (x: number) => number> = {
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan,
          asin: Math.asin,
          acos: Math.acos,
          atan: Math.atan,
          log: Math.log10,
          ln: Math.log,
          sqrt: Math.sqrt,
          abs: Math.abs,
          floor: Math.floor,
          ceil: Math.ceil,
          round: Math.round,
          exp: Math.exp
      };
      return fns[name];
  }
}

export class Matrix {
  static add(a: number[][], b: number[][]): number[][] {
    if (a.length !== b.length || a[0].length !== b[0].length) throw new Error('Dimensions mismatch');
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  }

  static sub(a: number[][], b: number[][]): number[][] {
    if (a.length !== b.length || a[0].length !== b[0].length) throw new Error('Dimensions mismatch');
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
  }

  static multiply(a: number[][], b: number[][]): number[][] {
    if (a[0].length !== b.length) throw new Error('Invalid dimensions for multiplication');
    const result = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }

  static transpose(m: number[][]): number[][] {
    return m[0].map((_, i) => m.map(row => row[i]));
  }

  static determinant(m: number[][]): number {
    if (m.length !== m[0].length) throw new Error('Must be square matrix');
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    let det = 0;
    for (let i = 0; i < m.length; i++) {
      det += Math.pow(-1, i) * m[0][i] * this.determinant(this.minor(m, 0, i));
    }
    return det;
  }

  private static minor(m: number[][], row: number, col: number): number[][] {
    return m.filter((_, i) => i !== row).map(r => r.filter((_, j) => j !== col));
  }

  static inverse(m: number[][]): number[][] {
    const det = this.determinant(m);
    if (det === 0) throw new Error('Matrix is singular (not invertible)');

    if (m.length === 1) return [[1 / m[0][0]]];

    // Adjugate matrix
    const adj = m.map((row, i) => row.map((_, j) => {
      return Math.pow(-1, i + j) * this.determinant(this.minor(m, i, j));
    }));

    // Transpose adjugate (to get Adjugate, actually Cofactor matrix transposed is Adjugate)
    // Wait, adj above is Cofactor matrix. Transpose it to get Adjugate.
    const cofactor = adj;
    const adjugate = this.transpose(cofactor);

    return adjugate.map(row => row.map(val => val / det));
  }
}

export class Statistics {
  static mean(data: number[]): number {
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  static median(data: number[]): number {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static mode(data: number[]): number[] {
    if (data.length === 0) return [];
    const counts: Record<number, number> = {};
    let max = 0;
    data.forEach(n => {
      counts[n] = (counts[n] || 0) + 1;
      if (counts[n] > max) max = counts[n];
    });
    return Object.keys(counts).filter(k => counts[parseFloat(k)] === max).map(parseFloat);
  }

  static variance(data: number[]): number {
    if (data.length < 2) return 0;
    const m = this.mean(data);
    return data.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (data.length - 1);
  }

  static stdDev(data: number[]): number {
    return Math.sqrt(this.variance(data));
  }

  static range(data: number[]): number {
    if (data.length === 0) return 0;
    return Math.max(...data) - Math.min(...data);
  }

  static sum(data: number[]): number {
      return data.reduce((a, b) => a + b, 0);
  }
}
