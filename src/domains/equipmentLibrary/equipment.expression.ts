// ============================================================
// EQUIPMENT EXPRESSION EVALUATOR - Safe expression parser and evaluator
// ============================================================

/**
 * Safe expression evaluator for equipment DSL
 * 
 * Supports:
 * - Arithmetic: +, -, *, /, %, ()
 * - Boolean: &&, ||, !, ==, !=, <, >, <=, >=
 * - Ternary: condition ? valueIfTrue : valueIfFalse
 * - Functions: min(a,b), max(a,b), round(x), ceil(x), floor(x), abs(x)
 * - Strings: concatenation with +, literals in quotes
 * 
 * BLOCKS any arbitrary code execution (eval, Function, etc.)
 */

// ============================================================
// TOKENIZER
// ============================================================

type TokenType = 
  | 'NUMBER'
  | 'STRING'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'QUESTION'
  | 'COLON'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string | number;
  position: number;
}



class Tokenizer {
  private expression: string;
  private pos: number = 0;
  private tokens: Token[] = [];

  constructor(expression: string) {
    this.expression = expression;
  }

  tokenize(): Token[] {
    while (this.pos < this.expression.length) {
      this.skipWhitespace();
      
      if (this.pos >= this.expression.length) break;

      const char = this.expression[this.pos];

      // Number
      if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek()))) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // String literal
      if (char === "'" || char === '"') {
        this.tokens.push(this.readString());
        continue;
      }

      // Identifier or keyword
      if (this.isAlpha(char)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }

      // Operators
      if (this.isOperatorStart(char)) {
        this.tokens.push(this.readOperator());
        continue;
      }

      // Single character tokens
      if (char === '(') {
        this.tokens.push({ type: 'LPAREN', value: '(', position: this.pos++ });
        continue;
      }
      if (char === ')') {
        this.tokens.push({ type: 'RPAREN', value: ')', position: this.pos++ });
        continue;
      }
      if (char === ',') {
        this.tokens.push({ type: 'COMMA', value: ',', position: this.pos++ });
        continue;
      }
      if (char === '?') {
        this.tokens.push({ type: 'QUESTION', value: '?', position: this.pos++ });
        continue;
      }
      if (char === ':') {
        this.tokens.push({ type: 'COLON', value: ':', position: this.pos++ });
        continue;
      }

      throw new ExpressionError(
        `Unexpected character '${char}' at position ${this.pos}`,
        'TOKENIZE_ERROR'
      );
    }

    this.tokens.push({ type: 'EOF', value: '', position: this.pos });
    return this.tokens;
  }

  private skipWhitespace(): void {
    while (this.pos < this.expression.length && /\s/.test(this.expression[this.pos])) {
      this.pos++;
    }
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperatorStart(char: string): boolean {
    return ['+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|'].includes(char);
  }

  private peek(): string {
    return this.expression[this.pos + 1] || '';
  }

  private readNumber(): Token {
    const start = this.pos;
    let hasDecimal = false;

    while (this.pos < this.expression.length) {
      const char = this.expression[this.pos];
      if (this.isDigit(char)) {
        this.pos++;
      } else if (char === '.' && !hasDecimal) {
        hasDecimal = true;
        this.pos++;
      } else {
        break;
      }
    }

    const value = parseFloat(this.expression.slice(start, this.pos));
    return { type: 'NUMBER', value, position: start };
  }

  private readString(): Token {
    const start = this.pos;
    const quote = this.expression[this.pos++];
    let value = '';

    while (this.pos < this.expression.length) {
      const char = this.expression[this.pos];
      if (char === quote) {
        this.pos++;
        return { type: 'STRING', value, position: start };
      }
      if (char === '\\') {
        this.pos++;
        if (this.pos < this.expression.length) {
          const escaped = this.expression[this.pos];
          switch (escaped) {
            case 'n': value += '\n'; break;
            case 't': value += '\t'; break;
            case '\\': value += '\\'; break;
            case "'": value += "'"; break;
            case '"': value += '"'; break;
            default: value += escaped;
          }
          this.pos++;
        }
      } else {
        value += char;
        this.pos++;
      }
    }

    throw new ExpressionError(
      `Unterminated string starting at position ${start}`,
      'TOKENIZE_ERROR'
    );
  }

  private readIdentifier(): Token {
    const start = this.pos;
    while (this.pos < this.expression.length && this.isAlphaNumeric(this.expression[this.pos])) {
      this.pos++;
    }
    const value = this.expression.slice(start, this.pos);
    return { type: 'IDENTIFIER', value, position: start };
  }

  private readOperator(): Token {
    const start = this.pos;
    const char = this.expression[this.pos];

    // Two-character operators
    const twoChar = this.expression.slice(this.pos, this.pos + 2);
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(twoChar)) {
      this.pos += 2;
      return { type: 'OPERATOR', value: twoChar, position: start };
    }

    // Single-character operators
    this.pos++;
    return { type: 'OPERATOR', value: char, position: start };
  }
}

// ============================================================
// PARSER AND EVALUATOR
// ============================================================

/**
 * Custom error class for expression errors
 */
export class ExpressionError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ExpressionError';
  }
}

/**
 * Allowed built-in functions
 */
const ALLOWED_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  min: (a, b) => Math.min(a, b),
  max: (a, b) => Math.max(a, b),
  round: (x) => Math.round(x),
  ceil: (x) => Math.ceil(x),
  floor: (x) => Math.floor(x),
  abs: (x) => Math.abs(x),
  sqrt: (x) => Math.sqrt(x),
  pow: (x, y) => Math.pow(x, y),
};

/**
 * Expression parser and evaluator
 */
class ExpressionEvaluator {
  private tokens: Token[];
  private pos: number = 0;
  private context: Record<string, unknown>;

  constructor(tokens: Token[], context: Record<string, unknown>) {
    this.tokens = tokens;
    this.context = context;
  }

  /**
   * Evaluate the expression and return the result
   */
  evaluate(): unknown {
    const result = this.parseTernary();
    
    if (this.current().type !== 'EOF') {
      throw new ExpressionError(
        `Unexpected token '${this.current().value}' at position ${this.current().position}`,
        'PARSE_ERROR'
      );
    }
    
    return result;
  }

  private current(): Token {
    return this.tokens[this.pos] || { type: 'EOF', value: '', position: -1 };
  }

  private consume(expectedType: TokenType): Token {
    const token = this.current();
    if (token.type !== expectedType) {
      throw new ExpressionError(
        `Expected ${expectedType} but got ${token.type} at position ${token.position}`,
        'PARSE_ERROR'
      );
    }
    this.pos++;
    return token;
  }

  // Ternary: condition ? valueIfTrue : valueIfFalse
  private parseTernary(): unknown {
    let result = this.parseOr();

    if (this.current().type === 'QUESTION') {
      this.pos++; // consume '?'
      const trueValue = this.parseTernary();
      this.consume('COLON');
      const falseValue = this.parseTernary();
      return result ? trueValue : falseValue;
    }

    return result;
  }

  // Or: a || b
  private parseOr(): unknown {
    let left = this.parseAnd();

    while (this.current().type === 'OPERATOR' && this.current().value === '||') {
      this.pos++;
      const right = this.parseAnd();
      left = left || right;
    }

    return left;
  }

  // And: a && b
  private parseAnd(): unknown {
    let left = this.parseEquality();

    while (this.current().type === 'OPERATOR' && this.current().value === '&&') {
      this.pos++;
      const right = this.parseEquality();
      left = left && right;
    }

    return left;
  }

  // Equality: a == b, a != b
  private parseEquality(): unknown {
    let left = this.parseComparison();

    while (this.current().type === 'OPERATOR' && ['==', '!='].includes(this.current().value as string)) {
      const op = this.current().value as string;
      this.pos++;
      const right = this.parseComparison();
      left = op === '==' ? left === right : left !== right;
    }

    return left;
  }

  // Comparison: a < b, a > b, a <= b, a >= b
  private parseComparison(): unknown {
    let left = this.parseAdditive();

    while (this.current().type === 'OPERATOR' && ['<', '>', '<=', '>='].includes(this.current().value as string)) {
      const op = this.current().value as string;
      this.pos++;
      const right = this.parseAdditive();
      
      const numLeft = this.toNumber(left);
      const numRight = this.toNumber(right);
      
      switch (op) {
        case '<': left = numLeft < numRight; break;
        case '>': left = numLeft > numRight; break;
        case '<=': left = numLeft <= numRight; break;
        case '>=': left = numLeft >= numRight; break;
      }
    }

    return left;
  }

  // Additive: a + b, a - b
  private parseAdditive(): unknown {
    let left = this.parseMultiplicative();

    while (this.current().type === 'OPERATOR' && ['+', '-'].includes(this.current().value as string)) {
      const op = this.current().value as string;
      this.pos++;
      const right = this.parseMultiplicative();
      
      if (op === '+') {
        // String concatenation or numeric addition
        if (typeof left === 'string' || typeof right === 'string') {
          left = String(left) + String(right);
        } else {
          left = this.toNumber(left) + this.toNumber(right);
        }
      } else {
        left = this.toNumber(left) - this.toNumber(right);
      }
    }

    return left;
  }

  // Multiplicative: a * b, a / b, a % b
  private parseMultiplicative(): unknown {
    let left = this.parseUnary();

    while (this.current().type === 'OPERATOR' && ['*', '/', '%'].includes(this.current().value as string)) {
      const op = this.current().value as string;
      this.pos++;
      const right = this.parseUnary();
      const numLeft = this.toNumber(left);
      const numRight = this.toNumber(right);
      
      switch (op) {
        case '*': left = numLeft * numRight; break;
        case '/': 
          if (numRight === 0) {
            throw new ExpressionError('Division by zero', 'DIVISION_BY_ZERO');
          }
          left = numLeft / numRight; 
          break;
        case '%': left = numLeft % numRight; break;
      }
    }

    return left;
  }

  // Unary: -a, !a
  private parseUnary(): unknown {
    if (this.current().type === 'OPERATOR' && ['-', '!'].includes(this.current().value as string)) {
      const op = this.current().value as string;
      this.pos++;
      const operand = this.parseUnary();
      
      if (op === '-') {
        return -this.toNumber(operand);
      } else {
        return !operand;
      }
    }

    return this.parsePrimary();
  }

  // Primary: number, string, identifier, function call, parenthesized expression
  private parsePrimary(): unknown {
    const token = this.current();

    switch (token.type) {
      case 'NUMBER':
        this.pos++;
        return token.value as number;

      case 'STRING':
        this.pos++;
        return token.value as string;

      case 'IDENTIFIER': {
        const name = token.value as string;
        this.pos++;

        // Function call
        if (this.current().type === 'LPAREN') {
          return this.parseFunctionCall(name);
        }

        // Variable reference
        if (!(name in this.context)) {
          // Return undefined for missing variables (allows optional fields)
          return undefined;
        }
        return this.context[name];
      }

      case 'LPAREN': {
        this.pos++; // consume '('
        const result = this.parseTernary();
        this.consume('RPAREN');
        return result;
      }

      default:
        throw new ExpressionError(
          `Unexpected token '${token.value}' at position ${token.position}`,
          'PARSE_ERROR'
        );
    }
  }

  // Function call: func(arg1, arg2, ...)
  private parseFunctionCall(name: string): unknown {
    // Security check - only allow whitelisted functions
    if (!(name in ALLOWED_FUNCTIONS)) {
      throw new ExpressionError(
        `Unknown function '${name}'`,
        'UNKNOWN_FUNCTION'
      );
    }

    this.consume('LPAREN');
    const args: number[] = [];

    if (this.current().type !== 'RPAREN') {
      args.push(this.toNumber(this.parseTernary()));
      
      while (this.current().type === 'COMMA') {
        this.pos++;
        args.push(this.toNumber(this.parseTernary()));
      }
    }

    this.consume('RPAREN');

    return ALLOWED_FUNCTIONS[name](...args);
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new ExpressionError(
          `Cannot convert '${value}' to number`,
          'TYPE_ERROR'
        );
      }
      return num;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value === undefined || value === null) return 0;
    
    throw new ExpressionError(
      `Cannot convert ${typeof value} to number`,
      'TYPE_ERROR'
    );
  }
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Evaluate an expression with the given context
 * 
 * @param expression - The expression to evaluate
 * @param context - Variable context (key-value pairs)
 * @returns The result of the evaluation
 * @throws ExpressionError if the expression is invalid or evaluation fails
 * 
 * @example
 * evaluateExpression('width * 2 + 10', { width: 100 }) // returns 210
 * evaluateExpression('depth > 700 ? 1 : 0', { depth: 800 }) // returns 1
 * evaluateExpression("'CHAPA#' + alloy", { alloy: 'SS304' }) // returns 'CHAPA#SS304'
 */
export function evaluateExpression(
  expression: string,
  context: Record<string, unknown>
): unknown {
  // Security: Block dangerous patterns
  const dangerousPatterns = [
    /\beval\b/i,
    /\bFunction\b/i,
    /\bconstructor\b/i,
    /\bprototype\b/i,
    /\b__proto__\b/i,
    /\bwindow\b/i,
    /\bglobal\b/i,
    /\bprocess\b/i,
    /\brequire\b/i,
    /\bimport\b/i,
    /\bexport\b/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(expression)) {
      throw new ExpressionError(
        `Forbidden pattern detected in expression`,
        'SECURITY_VIOLATION'
      );
    }
  }

  // Tokenize
  const tokenizer = new Tokenizer(expression);
  const tokens = tokenizer.tokenize();

  // Parse and evaluate
  const evaluator = new ExpressionEvaluator(tokens, context);
  return evaluator.evaluate();
}

/**
 * Validate an expression without evaluating it
 * 
 * @param expression - The expression to validate
 * @returns true if the expression is valid, false otherwise
 * 
 * @example
 * validateExpression('width * 2 + 10') // returns true
 * validateExpression('width * + 10') // returns false (syntax error)
 */
export function validateExpression(expression: string): boolean {
  try {
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();
    
    // Try to parse with empty context
    const evaluator = new ExpressionEvaluator(tokens, {});
    evaluator.evaluate();
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate an expression with a list of allowed variables
 * 
 * @param expression - The expression to validate
 * @param allowedVariables - List of variable names that are allowed
 * @returns Validation result with any errors
 */
export function validateExpressionWithVariables(
  expression: string,
  allowedVariables: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Security check
    const dangerousPatterns = [
      /\beval\b/i,
      /\bFunction\b/i,
      /\bconstructor\b/i,
      /\bprototype\b/i,
      /\b__proto__\b/i,
      /\bwindow\b/i,
      /\bglobal\b/i,
      /\bprocess\b/i,
      /\brequire\b/i,
      /\bimport\b/i,
      /\bexport\b/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        errors.push('Forbidden pattern detected in expression');
        return { valid: false, errors };
      }
    }

    // Tokenize
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();

    // Extract identifiers from tokens
    const identifiers = tokens
      .filter(t => t.type === 'IDENTIFIER')
      .map(t => t.value as string);

    // Check for unknown variables (excluding functions and boolean literals)
    const knownFunctions = Object.keys(ALLOWED_FUNCTIONS);
    const booleanLiterals = ['true', 'false'];
    const unknownVariables = identifiers.filter(
      id => !allowedVariables.includes(id) && 
            !knownFunctions.includes(id) && 
            !booleanLiterals.includes(id)
    );

    if (unknownVariables.length > 0) {
      errors.push(`Unknown variables: ${unknownVariables.join(', ')}`);
    }

    // Try to parse
    const mockContext = Object.fromEntries(
      allowedVariables.map(v => [v, 0])
    );
    
    const evaluator = new ExpressionEvaluator(tokens, mockContext);
    evaluator.evaluate();

    return { valid: errors.length === 0, errors };
  } catch (e) {
    if (e instanceof ExpressionError) {
      errors.push(e.message);
    } else {
      errors.push('Unknown error validating expression');
    }
    return { valid: false, errors };
  }
}

/**
 * Get a list of all variables referenced in an expression
 * 
 * @param expression - The expression to analyze
 * @returns Array of variable names
 */
export function extractVariables(expression: string): string[] {
  try {
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();

    const knownFunctions = Object.keys(ALLOWED_FUNCTIONS);
    
    return tokens
      .filter(t => t.type === 'IDENTIFIER')
      .map(t => t.value as string)
      .filter(id => !knownFunctions.includes(id));
  } catch {
    return [];
  }
}