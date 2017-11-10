/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 18);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

//     JavaScript Expression Parser (JSEP) 0.3.2
//     JSEP may be freely distributed under the MIT License
//     http://jsep.from.so/

/*global module: true, exports: true, console: true */
(function (root) {
	'use strict';
	// Node Types
	// ----------

	// This is the full set of types that any JSEP node can be.
	// Store them here to save space when minified
	var COMPOUND = 'Compound',
		IDENTIFIER = 'Identifier',
		MEMBER_EXP = 'MemberExpression',
		LITERAL = 'Literal',
		THIS_EXP = 'ThisExpression',
		CALL_EXP = 'CallExpression',
		UNARY_EXP = 'UnaryExpression',
		BINARY_EXP = 'BinaryExpression',
		LOGICAL_EXP = 'LogicalExpression',
		CONDITIONAL_EXP = 'ConditionalExpression',
		ARRAY_EXP = 'ArrayExpression',

		PERIOD_CODE = 46, // '.'
		COMMA_CODE  = 44, // ','
		SQUOTE_CODE = 39, // single quote
		DQUOTE_CODE = 34, // double quotes
		OPAREN_CODE = 40, // (
		CPAREN_CODE = 41, // )
		OBRACK_CODE = 91, // [
		CBRACK_CODE = 93, // ]
		QUMARK_CODE = 63, // ?
		SEMCOL_CODE = 59, // ;
		COLON_CODE  = 58, // :

		throwError = function(message, index) {
			var error = new Error(message + ' at character ' + index);
			error.index = index;
			error.description = message;
			throw error;
		},

	// Operations
	// ----------

	// Set `t` to `true` to save space (when minified, not gzipped)
		t = true,
	// Use a quickly-accessible map to store all of the unary operators
	// Values are set to `true` (it really doesn't matter)
		unary_ops = {'-': t, '!': t, '~': t, '+': t},
	// Also use a map for the binary operations but set their values to their
	// binary precedence for quick reference:
	// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
		binary_ops = {
			'||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
			'==': 6, '!=': 6, '===': 6, '!==': 6,
			'<': 7,  '>': 7,  '<=': 7,  '>=': 7,
			'<<':8,  '>>': 8, '>>>': 8,
			'+': 9, '-': 9,
			'*': 10, '/': 10, '%': 10
		},
	// Get return the longest key length of any object
		getMaxKeyLen = function(obj) {
			var max_len = 0, len;
			for(var key in obj) {
				if((len = key.length) > max_len && obj.hasOwnProperty(key)) {
					max_len = len;
				}
			}
			return max_len;
		},
		max_unop_len = getMaxKeyLen(unary_ops),
		max_binop_len = getMaxKeyLen(binary_ops),
	// Literals
	// ----------
	// Store the values to return for the various literals we may encounter
		literals = {
			'true': true,
			'false': false,
			'null': null
		},
	// Except for `this`, which is special. This could be changed to something like `'self'` as well
		this_str = 'this',
	// Returns the precedence of a binary operator or `0` if it isn't a binary operator
		binaryPrecedence = function(op_val) {
			return binary_ops[op_val] || 0;
		},
	// Utility function (gets called from multiple places)
	// Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
		createBinaryExpression = function (operator, left, right) {
			var type = (operator === '||' || operator === '&&') ? LOGICAL_EXP : BINARY_EXP;
			return {
				type: type,
				operator: operator,
				left: left,
				right: right
			};
		},
		// `ch` is a character code in the next three functions
		isDecimalDigit = function(ch) {
			return (ch >= 48 && ch <= 57); // 0...9
		},
		isIdentifierStart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
                    (ch >= 128 && !binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
		},
		isIdentifierPart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
					(ch >= 48 && ch <= 57) || // 0...9
                    (ch >= 128 && !binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
		},

		// Parsing
		// -------
		// `expr` is a string with the passed in expression
		jsep = function(expr) {
			// `index` stores the character number we are currently at while `length` is a constant
			// All of the gobbles below will modify `index` as we move along
			var index = 0,
				charAtFunc = expr.charAt,
				charCodeAtFunc = expr.charCodeAt,
				exprI = function(i) { return charAtFunc.call(expr, i); },
				exprICode = function(i) { return charCodeAtFunc.call(expr, i); },
				length = expr.length,

				// Push `index` up to the next non-space character
				gobbleSpaces = function() {
					var ch = exprICode(index);
					// space or tab
					while(ch === 32 || ch === 9 || ch === 10 || ch === 13) {
						ch = exprICode(++index);
					}
				},

				// The main parsing function. Much of this code is dedicated to ternary expressions
				gobbleExpression = function() {
					var test = gobbleBinaryExpression(),
						consequent, alternate;
					gobbleSpaces();
					if(exprICode(index) === QUMARK_CODE) {
						// Ternary expression: test ? consequent : alternate
						index++;
						consequent = gobbleExpression();
						if(!consequent) {
							throwError('Expected expression', index);
						}
						gobbleSpaces();
						if(exprICode(index) === COLON_CODE) {
							index++;
							alternate = gobbleExpression();
							if(!alternate) {
								throwError('Expected expression', index);
							}
							return {
								type: CONDITIONAL_EXP,
								test: test,
								consequent: consequent,
								alternate: alternate
							};
						} else {
							throwError('Expected :', index);
						}
					} else {
						return test;
					}
				},

				// Search for the operation portion of the string (e.g. `+`, `===`)
				// Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
				// and move down from 3 to 2 to 1 character until a matching binary operation is found
				// then, return that binary operation
				gobbleBinaryOp = function() {
					gobbleSpaces();
					var biop, to_check = expr.substr(index, max_binop_len), tc_len = to_check.length;
					while(tc_len > 0) {
						if(binary_ops.hasOwnProperty(to_check)) {
							index += tc_len;
							return to_check;
						}
						to_check = to_check.substr(0, --tc_len);
					}
					return false;
				},

				// This function is responsible for gobbling an individual expression,
				// e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
				gobbleBinaryExpression = function() {
					var ch_i, node, biop, prec, stack, biop_info, left, right, i;

					// First, try to get the leftmost thing
					// Then, check to see if there's a binary operator operating on that leftmost thing
					left = gobbleToken();
					biop = gobbleBinaryOp();

					// If there wasn't a binary operator, just return the leftmost node
					if(!biop) {
						return left;
					}

					// Otherwise, we need to start a stack to properly place the binary operations in their
					// precedence structure
					biop_info = { value: biop, prec: binaryPrecedence(biop)};

					right = gobbleToken();
					if(!right) {
						throwError("Expected expression after " + biop, index);
					}
					stack = [left, biop_info, right];

					// Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
					while((biop = gobbleBinaryOp())) {
						prec = binaryPrecedence(biop);

						if(prec === 0) {
							break;
						}
						biop_info = { value: biop, prec: prec };

						// Reduce: make a binary expression from the three topmost entries.
						while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
							right = stack.pop();
							biop = stack.pop().value;
							left = stack.pop();
							node = createBinaryExpression(biop, left, right);
							stack.push(node);
						}

						node = gobbleToken();
						if(!node) {
							throwError("Expected expression after " + biop, index);
						}
						stack.push(biop_info, node);
					}

					i = stack.length - 1;
					node = stack[i];
					while(i > 1) {
						node = createBinaryExpression(stack[i - 1].value, stack[i - 2], node);
						i -= 2;
					}
					return node;
				},

				// An individual part of a binary expression:
				// e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
				gobbleToken = function() {
					var ch, to_check, tc_len;

					gobbleSpaces();
					ch = exprICode(index);

					if(isDecimalDigit(ch) || ch === PERIOD_CODE) {
						// Char code 46 is a dot `.` which can start off a numeric literal
						return gobbleNumericLiteral();
					} else if(ch === SQUOTE_CODE || ch === DQUOTE_CODE) {
						// Single or double quotes
						return gobbleStringLiteral();
					} else if(isIdentifierStart(ch) || ch === OPAREN_CODE) { // open parenthesis
						// `foo`, `bar.baz`
						return gobbleVariable();
					} else if (ch === OBRACK_CODE) {
						return gobbleArray();
					} else {
						to_check = expr.substr(index, max_unop_len);
						tc_len = to_check.length;
						while(tc_len > 0) {
							if(unary_ops.hasOwnProperty(to_check)) {
								index += tc_len;
								return {
									type: UNARY_EXP,
									operator: to_check,
									argument: gobbleToken(),
									prefix: true
								};
							}
							to_check = to_check.substr(0, --tc_len);
						}

						return false;
					}
				},
				// Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
				// keep track of everything in the numeric literal and then calling `parseFloat` on that string
				gobbleNumericLiteral = function() {
					var number = '', ch, chCode;
					while(isDecimalDigit(exprICode(index))) {
						number += exprI(index++);
					}

					if(exprICode(index) === PERIOD_CODE) { // can start with a decimal marker
						number += exprI(index++);

						while(isDecimalDigit(exprICode(index))) {
							number += exprI(index++);
						}
					}

					ch = exprI(index);
					if(ch === 'e' || ch === 'E') { // exponent marker
						number += exprI(index++);
						ch = exprI(index);
						if(ch === '+' || ch === '-') { // exponent sign
							number += exprI(index++);
						}
						while(isDecimalDigit(exprICode(index))) { //exponent itself
							number += exprI(index++);
						}
						if(!isDecimalDigit(exprICode(index-1)) ) {
							throwError('Expected exponent (' + number + exprI(index) + ')', index);
						}
					}


					chCode = exprICode(index);
					// Check to make sure this isn't a variable name that start with a number (123abc)
					if(isIdentifierStart(chCode)) {
						throwError('Variable names cannot start with a number (' +
									number + exprI(index) + ')', index);
					} else if(chCode === PERIOD_CODE) {
						throwError('Unexpected period', index);
					}

					return {
						type: LITERAL,
						value: parseFloat(number),
						raw: number
					};
				},

				// Parses a string literal, staring with single or double quotes with basic support for escape codes
				// e.g. `"hello world"`, `'this is\nJSEP'`
				gobbleStringLiteral = function() {
					var str = '', quote = exprI(index++), closed = false, ch;

					while(index < length) {
						ch = exprI(index++);
						if(ch === quote) {
							closed = true;
							break;
						} else if(ch === '\\') {
							// Check for all of the common escape codes
							ch = exprI(index++);
							switch(ch) {
								case 'n': str += '\n'; break;
								case 'r': str += '\r'; break;
								case 't': str += '\t'; break;
								case 'b': str += '\b'; break;
								case 'f': str += '\f'; break;
								case 'v': str += '\x0B'; break;
								default : str += '\\' + ch;
							}
						} else {
							str += ch;
						}
					}

					if(!closed) {
						throwError('Unclosed quote after "'+str+'"', index);
					}

					return {
						type: LITERAL,
						value: str,
						raw: quote + str + quote
					};
				},

				// Gobbles only identifiers
				// e.g.: `foo`, `_value`, `$x1`
				// Also, this function checks if that identifier is a literal:
				// (e.g. `true`, `false`, `null`) or `this`
				gobbleIdentifier = function() {
					var ch = exprICode(index), start = index, identifier;

					if(isIdentifierStart(ch)) {
						index++;
					} else {
						throwError('Unexpected ' + exprI(index), index);
					}

					while(index < length) {
						ch = exprICode(index);
						if(isIdentifierPart(ch)) {
							index++;
						} else {
							break;
						}
					}
					identifier = expr.slice(start, index);

					if(literals.hasOwnProperty(identifier)) {
						return {
							type: LITERAL,
							value: literals[identifier],
							raw: identifier
						};
					} else if(identifier === this_str) {
						return { type: THIS_EXP };
					} else {
						return {
							type: IDENTIFIER,
							name: identifier
						};
					}
				},

				// Gobbles a list of arguments within the context of a function call
				// or array literal. This function also assumes that the opening character
				// `(` or `[` has already been gobbled, and gobbles expressions and commas
				// until the terminator character `)` or `]` is encountered.
				// e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
				gobbleArguments = function(termination) {
					var ch_i, args = [], node, closed = false;
					while(index < length) {
						gobbleSpaces();
						ch_i = exprICode(index);
						if(ch_i === termination) { // done parsing
							closed = true;
							index++;
							break;
						} else if (ch_i === COMMA_CODE) { // between expressions
							index++;
						} else {
							node = gobbleExpression();
							if(!node || node.type === COMPOUND) {
								throwError('Expected comma', index);
							}
							args.push(node);
						}
					}
					if (!closed) {
						throwError('Expected ' + String.fromCharCode(termination), index);
					}
					return args;
				},

				// Gobble a non-literal variable name. This variable name may include properties
				// e.g. `foo`, `bar.baz`, `foo['bar'].baz`
				// It also gobbles function calls:
				// e.g. `Math.acos(obj.angle)`
				gobbleVariable = function() {
					var ch_i, node;
					ch_i = exprICode(index);

					if(ch_i === OPAREN_CODE) {
						node = gobbleGroup();
					} else {
						node = gobbleIdentifier();
					}
					gobbleSpaces();
					ch_i = exprICode(index);
					while(ch_i === PERIOD_CODE || ch_i === OBRACK_CODE || ch_i === OPAREN_CODE) {
						index++;
						if(ch_i === PERIOD_CODE) {
							gobbleSpaces();
							node = {
								type: MEMBER_EXP,
								computed: false,
								object: node,
								property: gobbleIdentifier()
							};
						} else if(ch_i === OBRACK_CODE) {
							node = {
								type: MEMBER_EXP,
								computed: true,
								object: node,
								property: gobbleExpression()
							};
							gobbleSpaces();
							ch_i = exprICode(index);
							if(ch_i !== CBRACK_CODE) {
								throwError('Unclosed [', index);
							}
							index++;
						} else if(ch_i === OPAREN_CODE) {
							// A function call is being made; gobble all the arguments
							node = {
								type: CALL_EXP,
								'arguments': gobbleArguments(CPAREN_CODE),
								callee: node
							};
						}
						gobbleSpaces();
						ch_i = exprICode(index);
					}
					return node;
				},

				// Responsible for parsing a group of things within parentheses `()`
				// This function assumes that it needs to gobble the opening parenthesis
				// and then tries to gobble everything within that parenthesis, assuming
				// that the next thing it should see is the close parenthesis. If not,
				// then the expression probably doesn't have a `)`
				gobbleGroup = function() {
					index++;
					var node = gobbleExpression();
					gobbleSpaces();
					if(exprICode(index) === CPAREN_CODE) {
						index++;
						return node;
					} else {
						throwError('Unclosed (', index);
					}
				},

				// Responsible for parsing Array literals `[1, 2, 3]`
				// This function assumes that it needs to gobble the opening bracket
				// and then tries to gobble the expressions as arguments.
				gobbleArray = function() {
					index++;
					return {
						type: ARRAY_EXP,
						elements: gobbleArguments(CBRACK_CODE)
					};
				},

				nodes = [], ch_i, node;

			while(index < length) {
				ch_i = exprICode(index);

				// Expressions can be separated by semicolons, commas, or just inferred without any
				// separators
				if(ch_i === SEMCOL_CODE || ch_i === COMMA_CODE) {
					index++; // ignore separators
				} else {
					// Try to gobble each expression individually
					if((node = gobbleExpression())) {
						nodes.push(node);
					// If we weren't able to find a binary expression and are out of room, then
					// the expression passed in probably has too much
					} else if(index < length) {
						throwError('Unexpected "' + exprI(index) + '"', index);
					}
				}
			}

			// If there's only one expression just try returning the expression
			if(nodes.length === 1) {
				return nodes[0];
			} else {
				return {
					type: COMPOUND,
					body: nodes
				};
			}
		};

	// To be filled in by the template
	jsep.version = '0.3.2';
	jsep.toString = function() { return 'JavaScript Expression Parser (JSEP) v' + jsep.version; };

	/**
	 * @method jsep.addUnaryOp
	 * @param {string} op_name The name of the unary op to add
	 * @return jsep
	 */
	jsep.addUnaryOp = function(op_name) {
		max_unop_len = Math.max(op_name.length, max_unop_len);
		unary_ops[op_name] = t; return this;
	};

	/**
	 * @method jsep.addBinaryOp
	 * @param {string} op_name The name of the binary op to add
	 * @param {number} precedence The precedence of the binary op (can be a float)
	 * @return jsep
	 */
	jsep.addBinaryOp = function(op_name, precedence) {
		max_binop_len = Math.max(op_name.length, max_binop_len);
		binary_ops[op_name] = precedence;
		return this;
	};

	/**
	 * @method jsep.addLiteral
	 * @param {string} literal_name The name of the literal to add
	 * @param {*} literal_value The value of the literal
	 * @return jsep
	 */
	jsep.addLiteral = function(literal_name, literal_value) {
		literals[literal_name] = literal_value;
		return this;
	};

	/**
	 * @method jsep.removeUnaryOp
	 * @param {string} op_name The name of the unary op to remove
	 * @return jsep
	 */
	jsep.removeUnaryOp = function(op_name) {
		delete unary_ops[op_name];
		if(op_name.length === max_unop_len) {
			max_unop_len = getMaxKeyLen(unary_ops);
		}
		return this;
	};

	/**
	 * @method jsep.removeAllUnaryOps
	 * @return jsep
	 */
	jsep.removeAllUnaryOps = function() {
		unary_ops = {};
		max_unop_len = 0;
		
		return this;
	};

	/**
	 * @method jsep.removeBinaryOp
	 * @param {string} op_name The name of the binary op to remove
	 * @return jsep
	 */
	jsep.removeBinaryOp = function(op_name) {
		delete binary_ops[op_name];
		if(op_name.length === max_binop_len) {
			max_binop_len = getMaxKeyLen(binary_ops);
		}
		return this;
	};

	/**
	 * @method jsep.removeAllBinaryOps
	 * @return jsep
	 */
	jsep.removeAllBinaryOps = function() {
		binary_ops = {};
		max_binop_len = 0;
		
		return this;
	};

	/**
	 * @method jsep.removeLiteral
	 * @param {string} literal_name The name of the literal to remove
	 * @return jsep
	 */
	jsep.removeLiteral = function(literal_name) {
		delete literals[literal_name];
		return this;
	};

	/**
	 * @method jsep.removeAllLiterals
	 * @return jsep
	 */
	jsep.removeAllLiterals = function() {
		literals = {};
		
		return this;
	};

	// In desktop environments, have a way to restore the old value for `jsep`
	if (false) {
		var old_jsep = root.jsep;
		// The star of the show! It's a function!
		root.jsep = jsep;
		// And a courteous function willing to move out of the way for other similarly-named objects!
		jsep.noConflict = function() {
			if(root.jsep === jsep) {
				root.jsep = old_jsep;
			}
			return jsep;
		};
	} else {
		// In Node.JS environments
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = jsep;
		} else {
			exports.parse = jsep;
		}
	}
}(this));


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return Now; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return Near; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Color; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Float; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return RampColor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return setGL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return FloatMul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return FloatDiv; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return FloatAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return FloatSub; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return FloatPow; });

function implicitCast(value) {
    if (Number.isFinite(value)) {
        return Float(value);
    }
    return value;
}
var gl = null;
function setGL(_gl) {
    gl = _gl;
}


function Now() {
    return new _Now();
}
function _Now() {
    this.float = Float(100);
}
_Now.prototype._applyToShaderSource = function (uniformIDMaker) {
    return this.float._applyToShaderSource(uniformIDMaker);
}
_Now.prototype._postShaderCompile = function (program) {
    return this.float._postShaderCompile(program);
}
_Now.prototype._preDraw = function () {
    this.float.expr = Date.now() * 0.1 % 400;
    this.float._preDraw();
}
_Now.prototype.isAnimated = function () {
    return true;
}

const FloatMul = genFloatBinaryOperation((x, y) => x * y, (x, y) => `(${x} * ${y})`);
const FloatDiv = genFloatBinaryOperation((x, y) => x / y, (x, y) => `(${x} / ${y})`);
const FloatAdd = genFloatBinaryOperation((x, y) => x + y, (x, y) => `(${x} + ${y})`);
const FloatSub = genFloatBinaryOperation((x, y) => x - y, (x, y) => `(${x} - ${y})`);
const FloatPow = genFloatBinaryOperation((x, y) => Math.pow(x, y), (x, y) => `pow(${x}, ${y})`);

function genFloatBinaryOperation(jsFn, glsl) {
    function Op(a, b) {
        if (Number.isFinite(a) && Number.isFinite(b)) {
            return Float(jsFn(a, b));
        }
        if (Number.isFinite(b)) {
            b = Float(b);
        }
        return new _Op(a, b);
    }
    function _Op(a, b) {
        this.a = a;
        this.b = b;
        a.parent = this;
        b.parent = this;
    }
    _Op.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
        const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: a.preface + b.preface,
            inline: glsl(a.inline, b.inline)
        };
    }
    _Op.prototype._postShaderCompile = function (program) {
        this.a._postShaderCompile(program);
        this.b._postShaderCompile(program);
    }
    _Op.prototype._preDraw = function (l) {
        this.a._preDraw(l);
        this.b._preDraw(l);
    }
    _Op.prototype.isAnimated = function () {
        return this.a.isAnimated() || this.b.isAnimated();
    }
    _Op.prototype.replaceChild = function (toReplace, replacer) {
        if (this.a = toReplace) {
            this.a = replacer;
        } else {
            this.b = replacer;
        }
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }
    return Op;
}



function FloatBlend(a, b, mix) {
    this.a = a;
    this.b = b;
    a.parent = this;
    b.parent = this;
    if (mix.indexOf('ms') >= 0) {
        const duration = Number(mix.replace('ms', ''));
        this.aTime = Date.now();
        this.bTime = this.aTime + duration;
        mix = 'anim';
    }
    this.mix = mix;
}
FloatBlend.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._uniformID = uniformIDMaker();
    const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface: `uniform float mix${this._uniformID};\n${a.preface}${b.preface}`,
        inline: `mix(${a.inline}, ${b.inline}, mix${this._uniformID})`
    };
}
FloatBlend.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `mix${this._uniformID}`);
    this.a._postShaderCompile(program);
    this.b._postShaderCompile(program);
}
FloatBlend.prototype._preDraw = function (l) {
    var mix = this.mix;
    if (mix == 'anim') {
        const time = Date.now();
        mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (mix >= 1.) {
            mix = 1.;
            this.mix = 1.;
            //TODO free A, free blend
            this.parent.replaceChild(this, this.b);
        }
    }
    gl.uniform1f(this._uniformLocation, mix);
    this.a._preDraw(l);
    this.b._preDraw(l);
}
FloatBlend.prototype.isAnimated = function () {
    return this.mix === 'anim';
}
FloatBlend.prototype.replaceChild = function (toReplace, replacer) {
    if (this.a = toReplace) {
        this.a = replacer;
    } else {
        this.b = replacer;
    }
    replacer.parent = this;
    replacer.notify = toReplace.notify;
}
function genericFloatBlend(initial, final, duration, blendFunc) {
    const parent = initial.parent;
    const blend = new FloatBlend(initial, final, `${duration}ms`);
    parent.replaceChild(initial, blend);
    blend.notify();
}


function Color(color) {
    if (Array.isArray(color)) {
        color = color.filter(x => true);
        if (color.length != 4 || !color.every(Number.isFinite)) {
            return null;
        }
        return new UniformColor(color);
    }
    return null;
}
function UniformColor(color) {
    this.color = color;
}
UniformColor.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform vec4 color${this._uniformID};\n`,
        inline: `color${this._uniformID}`
    };
}
UniformColor.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `color${this._uniformID}`);
}
function evalColor(color, time) {
    if (Array.isArray(color)) {
        return color;
    }
    var a = evalColor(color.a, time);
    var b = evalColor(color.b, time);
    var m = (time - color.aTime) / (color.bTime - color.aTime);
    return a.map((va, index) => {
        return (1 - m) * va + m * b[index];//TODO non linear functions
    });
}
function simplifyColorExpr(color, time) {
    if (Array.isArray(color)) {
        return color;
    }
    var m = (time - color.aTime) / (color.bTime - color.aTime);
    if (m >= 1) {
        return color.b;
    }
    return color;
}
UniformColor.prototype._preDraw = function () {
    const t = Date.now();
    this.color = simplifyColorExpr(this.color, t);
    const color = evalColor(this.color, t);
    gl.uniform4f(this._uniformLocation, color[0], color[1], color[2], color[3]);
}
UniformColor.prototype.isAnimated = function () {
    return false;
}


function ColorBlend(a, b, mix) {
    this.a = a;
    this.b = b;
    a.parent = this;
    b.parent = this;
    if (mix.indexOf('ms') >= 0) {
        const duration = Number(mix.replace('ms', ''));
        this.aTime = Date.now();
        this.bTime = this.aTime + duration;
        mix = 'anim';
    }
    this.mix = mix;
}
ColorBlend.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._uniformID = uniformIDMaker();
    const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface: `uniform float mix${this._uniformID};\n${a.preface}${b.preface}`,
        inline: `mix(${a.inline}, ${b.inline}, mix${this._uniformID})`
    };
}
ColorBlend.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `mix${this._uniformID}`);
    this.a._postShaderCompile(program);
    this.b._postShaderCompile(program);
}
ColorBlend.prototype._preDraw = function (l) {
    var mix = this.mix;
    if (mix == 'anim') {
        const time = Date.now();
        mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (mix >= 1.) {
            mix = 1.;
            this.mix = 1.;
            //TODO free A, free blend
            this.parent.replaceChild(this, this.b);
        }
    }
    gl.uniform1f(this._uniformLocation, mix);
    this.a._preDraw(l);
    this.b._preDraw(l);
}
ColorBlend.prototype.isAnimated = function () {
    return this.mix === 'anim';
}
ColorBlend.prototype.replaceChild = function (toReplace, replacer) {
    if (this.a = toReplace) {
        this.a = replacer;
    } else {
        this.b = replacer;
    }
    replacer.parent = this;
    replacer.notify = toReplace.notify;
}

function genericColorBlend(initial, final, duration, blendFunc) {
    const parent = initial.parent;
    const blend = new ColorBlend(initial, final, `${duration}ms`);
    parent.replaceChild(initial, blend);
    blend.notify();
}

UniformColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}
ColorBlend.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}
_RampColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}


_Near.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericFloatBlend(this, finalValue, duration, blendFunc);
}
UniformFloat.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericFloatBlend(this, finalValue, duration, blendFunc);
}
FloatBlend.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericFloatBlend(this, finalValue, duration, blendFunc);
}

function Float(x) {
    if (!Number.isFinite(x)) {
        return null;
    }
    return new UniformFloat(x);
}

function UniformFloat(size) {
    this.expr = size;
}
UniformFloat.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform float float${this._uniformID};\n`,
        inline: `float${this._uniformID}`
    };
}
UniformFloat.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `float${this._uniformID}`);
}
function evalFloatExpr(expr, time) {
    if (Number.isFinite(expr)) {
        return expr;
    }
    var a = evalFloatExpr(expr.a, time);
    var b = evalFloatExpr(expr.b, time);
    var m = (time - expr.aTime) / (expr.bTime - expr.aTime);
    return (1 - m) * a + m * b; //TODO non linear functions
}
function simplifyFloatExpr(expr, time) {
    if (Number.isFinite(expr)) {
        return expr;
    }
    var m = (time - expr.aTime) / (expr.bTime - expr.aTime);
    if (m >= 1) {
        return expr.b;
    }
    return expr;
}
UniformFloat.prototype._preDraw = function () {
    const t = Date.now();
    this.expr = simplifyFloatExpr(this.expr, t);
    const v = evalFloatExpr(this.expr, t);
    gl.uniform1f(this._uniformLocation, v);
}
UniformFloat.prototype.isAnimated = function () {
    return !Number.isFinite(this.expr);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}



/*
    color: ramp(temp, 0º, 30º, carto-color)
    width: exprNear(date, SIM_TIME, fullRegion, blendRegion, 0, 4)
*/

function Near(property, center, threshold, falloff, outputOnNegative, outputOnPositive) {
    const args = [property, center, threshold, falloff, outputOnNegative, outputOnPositive].map(implicitCast);
    if (args.some(x => x === undefined || x === null)) {
        return null;
    }
    return new _Near(...args);
}

function _Near(property, center, threshold, falloff, outputOnNegative, outputOnPositive) {
    this.property = property;
    this.center = center;
    this.outputOnNegative = outputOnNegative;
    this.outputOnPositive = outputOnPositive;
    this.threshold = threshold;
    this.falloff = falloff;
}

_Near.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._UID = uniformIDMaker();
    const tid = propertyTIDMaker(this.property);
    const center = this.center._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const positive = this.outputOnPositive._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const threshold = this.threshold._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const falloff = this.falloff._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const negative = this.outputOnNegative._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface:
            center.preface + positive.preface + threshold.preface + falloff.preface + negative.preface,
        inline: `mix(${positive.inline},${negative.inline},
                        clamp((abs(p${tid}-${center.inline})-${threshold.inline})/${falloff.inline},
                            0., 1.))/25.`
    };
}
_Near.prototype._postShaderCompile = function (program) {
    this.center._postShaderCompile(program);
    this.outputOnNegative._postShaderCompile(program);
    this.outputOnPositive._postShaderCompile(program);
    this.threshold._postShaderCompile(program);
    this.falloff._postShaderCompile(program);
}
function evalFloatUniform(x) {
    if (typeof x === "function") {
        x = x();
    }
    if (Number.isFinite(x)) {
        return x;
    }
    return 0;
}

_Near.prototype._preDraw = function () {
    this.center._preDraw();
    this.outputOnNegative._preDraw();
    this.outputOnPositive._preDraw();
    this.threshold._preDraw();
    this.falloff._preDraw();
}
_Near.prototype.isAnimated = function () {
    return this.center.isAnimated();
}

function RampColor(property, minKey, maxKey, values) {
    //TODO contiunuos vs discrete should be decided based on property type => cartegory vs float
    const args = [property, minKey, maxKey, values].map(implicitCast);
    if (args.some(x => x === undefined || x === null)) {
        return null;
    }
    return new _RampColor(...args);
}

function _RampColor(property, minKey, maxKey, values) {
    this.property = property;
    this.minKey = minKey.expr;
    this.maxKey = maxKey.expr;
    this.values = values;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 256;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array(4 * width);
    for (var i = 0; i < width; i++) {
        const vlowRaw = values[Math.floor(i / width * (values.length - 1))];
        const vhighRaw = values[Math.ceil(i / width * (values.length - 1))];
        const vlow = [hexToRgb(vlowRaw).r, hexToRgb(vlowRaw).g, hexToRgb(vlowRaw).b, 255];
        const vhigh = [hexToRgb(vhighRaw).r, hexToRgb(vhighRaw).g, hexToRgb(vhighRaw).b, 255];
        const m = i / width * (values.length - 1) - Math.floor(i / width * (values.length - 1));
        const v = vlow.map((low, index) => low * (1. - m) + vhigh[index] * m);
        pixel[4 * i + 0] = v[0];
        pixel[4 * i + 1] = v[1];
        pixel[4 * i + 2] = v[2];
        pixel[4 * i + 3] = v[3];
    }


    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

_RampColor.prototype._free = function () {
    gl.deleteTexture(this.texture);
}
_RampColor.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    const tid = propertyTIDMaker(this.property);
    this._UID = uniformIDMaker();
    return {
        preface: `
        uniform sampler2D texRamp${this._UID};
        uniform float keyMin${this._UID};
        uniform float keyWidth${this._UID};
        `,
        inline: `texture2D(texRamp${this._UID}, vec2((p${tid}-keyMin${this._UID})/keyWidth${this._UID}, 0.5)).rgba`
    };
}
_RampColor.prototype._postShaderCompile = function (program) {
    this._texLoc = gl.getUniformLocation(program, `texRamp${this._UID}`);
    this._keyMinLoc = gl.getUniformLocation(program, `keyMin${this._UID}`);
    this._keyWidthLoc = gl.getUniformLocation(program, `keyWidth${this._UID}`);
}
_RampColor.prototype._preDraw = function () {
    gl.activeTexture(gl.TEXTURE12);//TODO remove hardcode
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this._texLoc, 12);
    gl.uniform1f(this._keyMinLoc, evalFloatUniform(this.minKey));
    gl.uniform1f(this._keyWidthLoc, evalFloatUniform(this.maxKey) - evalFloatUniform(this.minKey));
}
_RampColor.prototype.isAnimated = function () {
    return false;
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VectorTileFeature = __webpack_require__(3);

module.exports = VectorTileLayer;

function VectorTileLayer(pbf, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._pbf = pbf;
    this._keys = [];
    this._values = [];
    this._features = [];

    pbf.readFields(readLayer, this, end);

    this.length = this._features.length;
}

function readLayer(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 5) layer.extent = pbf.readVarint();
    else if (tag === 2) layer._features.push(pbf.pos);
    else if (tag === 3) layer._keys.push(pbf.readString());
    else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

function readValueMessage(pbf) {
    var value = null,
        end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var tag = pbf.readVarint() >> 3;

        value = tag === 1 ? pbf.readString() :
            tag === 2 ? pbf.readFloat() :
            tag === 3 ? pbf.readDouble() :
            tag === 4 ? pbf.readVarint64() :
            tag === 5 ? pbf.readVarint() :
            tag === 6 ? pbf.readSVarint() :
            tag === 7 ? pbf.readBoolean() : null;
    }

    return value;
}

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._pbf.pos = this._features[i];

    var end = this._pbf.readVarint() + this._pbf.pos;
    return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Point = __webpack_require__(15);

module.exports = VectorTileFeature;

function VectorTileFeature(pbf, end, extent, keys, values) {
    // Public
    this.properties = {};
    this.extent = extent;
    this.type = 0;

    // Private
    this._pbf = pbf;
    this._geometry = -1;
    this._keys = keys;
    this._values = values;

    pbf.readFields(readFeature, this, end);
}

function readFeature(tag, feature, pbf) {
    if (tag == 1) feature.id = pbf.readVarint();
    else if (tag == 2) readTag(pbf, feature);
    else if (tag == 3) feature.type = pbf.readVarint();
    else if (tag == 4) feature._geometry = pbf.pos;
}

function readTag(pbf, feature) {
    var end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var key = feature._keys[pbf.readVarint()],
            value = feature._values[pbf.readVarint()];
        feature.properties[key] = value;
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();

            if (cmd === 1) { // moveTo
                if (line) lines.push(line);
                line = [];
            }

            line.push(new Point(x, y));

        } else if (cmd === 7) {

            // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
            if (line) {
                line.push(line[0].clone()); // closePolygon
            }

        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

VectorTileFeature.prototype.toGeoJSON = function(x, y, z) {
    var size = this.extent * Math.pow(2, z),
        x0 = this.extent * x,
        y0 = this.extent * y,
        coords = this.loadGeometry(),
        type = VectorTileFeature.types[this.type],
        i, j;

    function project(line) {
        for (var j = 0; j < line.length; j++) {
            var p = line[j], y2 = 180 - (p.y + y0) * 360 / size;
            line[j] = [
                (p.x + x0) * 360 / size - 180,
                360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
            ];
        }
    }

    switch (this.type) {
    case 1:
        var points = [];
        for (i = 0; i < coords.length; i++) {
            points[i] = coords[i][0];
        }
        coords = points;
        project(coords);
        break;

    case 2:
        for (i = 0; i < coords.length; i++) {
            project(coords[i]);
        }
        break;

    case 3:
        coords = classifyRings(coords);
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                project(coords[i][j]);
            }
        }
        break;
    }

    if (coords.length === 1) {
        coords = coords[0];
    } else {
        type = 'Multi' + type;
    }

    var result = {
        type: "Feature",
        geometry: {
            type: type,
            coordinates: coords
        },
        properties: this.properties
    };

    if ('id' in this) {
        result.id = this.id;
    }

    return result;
};

// classifies an array of rings into polygons with outer rings and holes

function classifyRings(rings) {
    var len = rings.length;

    if (len <= 1) return [rings];

    var polygons = [],
        polygon,
        ccw;

    for (var i = 0; i < len; i++) {
        var area = signedArea(rings[i]);
        if (area === 0) continue;

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];

        } else {
            polygon.push(rings[i]);
        }
    }
    if (polygon) polygons.push(polygon);

    return polygons;
}

function signedArea(ring) {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Renderer; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shaders__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__style__ = __webpack_require__(11);
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__style__; });
var gl;

const RTT_WIDTH = 1024;




Renderer.prototype._initShaders = function () {
    this.finalRendererProgram = __WEBPACK_IMPORTED_MODULE_0__shaders__["a" /* renderer */].createPointShader(gl);
}
function compileShader( sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    return shader;
}
Layer.prototype._compileColorShader = function () {
    var uniformIDcounter = 0;
    var tid = {};
    const colorModifier = this.style._color._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    //TODO check tid table size
    this.propertyColorTID = tid;
    this.colorShader = __WEBPACK_IMPORTED_MODULE_0__shaders__["b" /* styler */].createColorShader(gl, colorModifier.preface, colorModifier.inline);
    this.style._color._postShaderCompile(this.colorShader.program);
}
Layer.prototype._compileWidthShader = function () {
    var uniformIDcounter = 0;
    var tid = {};
    const widthModifier = this.style._width._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    //TODO check tid table size
    this.propertyWidthTID = tid;
    this.widthShader = __WEBPACK_IMPORTED_MODULE_0__shaders__["b" /* styler */].createWidthShader(gl, widthModifier.preface, widthModifier.inline);
    this.style._width._postShaderCompile(this.widthShader.program);
}

Renderer.prototype.refresh = refresh;
function refresh(timestamp) {
    // Don't re-render more than once per animation frame
    if (this.lastFrame == timestamp) {
        return;
    }
    this.lastFrame = timestamp;

    var canvas = this.canvas;
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    if (gl.canvas.width != width ||
        gl.canvas.height != height) {
        gl.canvas.width = width;
        gl.canvas.height = height;
    }
    var aspect = canvas.clientWidth / canvas.clientHeight;
    gl.clearColor(0., 0., 0., 0.);//TODO this should be a renderer property
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);

    this.layers.forEach(layer => {
        if ((layer.style._color.isAnimated() || layer.style._width.isAnimated() || layer.style.updated)) {
            //TODO refactor condition
            gl.disable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);

            if (!this.auxFB) {
                this.auxFB = gl.createFramebuffer();
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);
            //console.log("Restyle", timestamp)
            // Render To Texture
            // COLOR
            layer.tiles.forEach(tile => {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texColor, 0);
                gl.viewport(0, 0, RTT_WIDTH, tile.height);
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.useProgram(layer.colorShader.program);

                layer.style._color._preDraw(layer);

                Object.keys(layer.propertyColorTID).forEach((name, i) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[layer.propertyID[name]]);
                    gl.uniform1i(layer.colorShader.textureLocations[i], i);
                });

                gl.enableVertexAttribArray(this.colorShaderVertex);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
                gl.vertexAttribPointer(layer.colorShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 3);
            });

            //WIDTH
            layer.tiles.forEach(tile => {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texWidth, 0);
                gl.useProgram(layer.widthShader.program);
                gl.viewport(0, 0, RTT_WIDTH, tile.height);
                gl.clear(gl.COLOR_BUFFER_BIT);

                layer.style._width._preDraw(layer);
                Object.keys(layer.propertyWidthTID).forEach((name, i) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[layer.propertyID[name]]);
                    gl.uniform1i(layer.widthShader.textureLocations[i], i);
                });

                gl.enableVertexAttribArray(layer.widthShader.vertexAttribute);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
                gl.vertexAttribPointer(layer.widthShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 3);

                layer.style.updated = false;
                tile.initialized = true;
            });

        }

        gl.enable(gl.DEPTH_TEST);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        gl.useProgram(this.finalRendererProgram.program);
        var s = 1. / this._zoom;


        layer.tiles.forEach(tile => {
            gl.uniform2f(this.finalRendererProgram.vertexScaleUniformLocation, s / aspect * tile.scale, s * tile.scale);
            gl.uniform2f(this.finalRendererProgram.vertexOffsetUniformLocation, s / aspect * this._center.x + tile.center.x, s * this._center.y + tile.center.y);

            gl.enableVertexAttribArray(this.finalRendererProgram.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
            gl.vertexAttribPointer(this.finalRendererProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


            gl.enableVertexAttribArray(this.finalRendererProgram.featureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
            gl.vertexAttribPointer(this.finalRendererProgram.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
            gl.uniform1i(this.finalRendererProgram.colorTexture, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
            gl.uniform1i(this.finalRendererProgram.widthTexture, 1);

            gl.drawArrays(gl.POINTS, 0, tile.numVertex);

        });

        if (layer.style._color.isAnimated() || layer.style._width.isAnimated()) {
            window.requestAnimationFrame(refresh.bind(this));
        }
    });
}



function Layer(renderer, geometryType) {
    this.renderer = renderer;
    this.geometryType = geometryType;
    this.style = new __WEBPACK_IMPORTED_MODULE_1__style__["Style"](this);
    this.tiles = [];
    this._compileColorShader();
    this._compileWidthShader();
    this.propertyCount = 0;
    this.propertyID = {}; //Name => PID
    this.propertyWidthTID = {}; //Name => Texture image unit ID
    this.propertyColorTID = {}; //Name => Texture image unit ID
    this.categoryMap = {};
}


Layer.prototype.removeTile = function (tile) {
    this.tiles = this.tiles.filter(t => t !== tile);
    tile.propertyTex.map(tex => gl.deleteTexture(tex));
    gl.deleteTexture(tile.texColor);
    gl.deleteTexture(tile.texWidth);
    gl.deleteBuffer(tile.vertexBuffer);
    gl.deleteBuffer(tile.featureIDBuffer);
}

//TODO => setTileProperty (or geom)

Layer.prototype.addTile = function (tile) {
    this.tiles.push(tile);
    tile.propertyTex = [];

    var points = tile.geom;
    const level = 0;
    const width = RTT_WIDTH;
    tile.numVertex = points.length / 2;
    const height = Math.ceil(tile.numVertex / width);
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.FLOAT;
    tile.height = height;


    for (var k in tile.properties) {
        if (tile.properties.hasOwnProperty(k) && tile.properties[k].length > 0) {
            const isCategory = !Number.isFinite(tile.properties[k][0]);
            const property = tile.properties[k];
            var propertyID = this.propertyID[k];
            if (propertyID === undefined) {
                propertyID = this.propertyCount;
                this.propertyCount++;
                this.propertyID[k] = propertyID;
            }
            tile.propertyTex[propertyID] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[propertyID]);
            const pixel = new Float32Array(width * height);
            for (var i = 0; i < property.length; i++) {
                pixel[i] = property[i];
            }
            if (isCategory) {
                var map = this.categoryMap[k];
                if (!map) {
                    map = {};
                    this.categoryMap[k] = map;
                }
                for (var i = 0; i < property.length; i++) {
                    var catID = map[property[i]];
                    if (catID === undefined) {
                        map[property[i]] = Object.keys(map).length;
                        catID = map[property[i]];
                    }
                    pixel[i] = catID / 256.;
                }
            }
            gl.texImage2D(gl.TEXTURE_2D, level, gl.ALPHA,
                width, height, 0, gl.ALPHA, srcType,
                pixel);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }

    tile.vertexBuffer = gl.createBuffer();
    tile.featureIDBuffer = gl.createBuffer();


    tile.texColor = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA,
        width, height, border, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4 * width * height).fill(255));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    tile.texWidth = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA,
        width, height, border, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4 * width * height).fill(100));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);



    var ids = new Float32Array(points.length);
    for (var i = 0; i < points.length; i += 2) {
        ids[i + 0] = ((i / 2) % width) / width;
        ids[i + 1] = Math.floor((i / 2) / width) / height;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    window.requestAnimationFrame(refresh.bind(this.renderer));

    return tile;
}

function Renderer(canvas) {
    this.canvas = canvas;
    if (!gl) {
        gl = canvas.getContext('webgl');
        __WEBPACK_IMPORTED_MODULE_1__style__["setGL"](gl);
        var ext = gl.getExtension("OES_texture_float");
        if (!ext) {
            console.error("this machine or browser does not support OES_texture_float");
        }
        if (!gl) {
            console.warn('Unable to initialize WebGL2. Your browser may not support it.');
            return null
        }
        this._initShaders();
        this._center = { x: 0, y: 0 };
        this._zoom = 1;
    }
    this.layers = [];
    this.squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
    var vertices = [
        10.0, -10.0,
        0.0, 10.0,
        -10.0, -10.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

Renderer.prototype.addLayer = function () {
    var layer = new Layer(this, 'points');
    this.layers.push(layer);
    return layer;
}

Renderer.prototype.getCenter = function () {
    return { x: this._center.x, y: this._center.y };
}
Renderer.prototype.setCenter = function (x, y) {
    this._center.x = x;
    this._center.y = y;
    window.requestAnimationFrame(refresh.bind(this));
}

Renderer.prototype.getZoom = function () {
    return this._zoom;
}
Renderer.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
    window.requestAnimationFrame(refresh.bind(this));
}



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return renderer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return styler; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__renderer__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__styler__ = __webpack_require__(8);



const NUM_TEXTURE_LOCATIONS = 4;

function compileShader(gl, sourceCode, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    return shader;
}

function compileProgram(gl, glslVS, glslFS) {
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();
    gl.attachShader(this.program, VS);
    gl.attachShader(this.program, FS);
    gl.linkProgram(this.program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(this.program));
    }
}

function Point(gl) {
    compileProgram.call(this, gl, __WEBPACK_IMPORTED_MODULE_0__renderer__["a" /* point */].VS, __WEBPACK_IMPORTED_MODULE_0__renderer__["a" /* point */].FS);
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
    this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
    this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
    this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
    this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
}
function GenericStyler(gl, glsl, preface, inline) {
    const VS = glsl.VS;
    let FS = glsl.FS;
    FS = FS.replace('$PREFACE', preface);
    FS = FS.replace('$INLINE', inline);
    compileProgram.call(this, gl, VS, FS);
    this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
    this.textureLocations = [];
    for (let i = 0; i < NUM_TEXTURE_LOCATIONS; i++) {
        this.textureLocations[i] = gl.getUniformLocation(this.program, `property${i}`);
    }
}
function Color(gl, preface, inline) {
    GenericStyler.call(this, gl, __WEBPACK_IMPORTED_MODULE_1__styler__["a" /* color */], preface, inline);
}
function Width(gl, preface, inline) {
    GenericStyler.call(this, gl, __WEBPACK_IMPORTED_MODULE_1__styler__["b" /* width */], preface, inline);
}

const renderer = {
    createPointShader: function (gl) {
        return new Point(gl);
    }
};

const styler = {
    createColorShader: function (gl, preface, inline) {
        return new Color(gl, preface, inline);
    },
    createWidthShader: function (gl, preface, inline) {
        return new Width(gl, preface, inline);
    }
};




/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__point__ = __webpack_require__(7);
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__point__; });



/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//TODO fix AA (use point size)
//TODO change size scaling constant to better value
//TODO profile discard performance impact
const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D widthTex;

varying lowp vec4 color;

void main(void) {
    float size = texture2D(widthTex, featureID).a;
    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 1.-(size*0.9+0.05), 1.);
    gl_Position  = p;
    gl_PointSize = size*25.;
    color = texture2D(colorTex, featureID);
}`;
/* harmony export (immutable) */ __webpack_exports__["VS"] = VS;


const FS = `
precision lowp float;

varying lowp vec4 color;

void main(void) {
    vec2 p = 2.*gl_PointCoord-vec2(1.);
    vec4 c = color;
    float l = length(p);
    c.a *=  1. - smoothstep(0.9, 1.1, l);
    if (c.a==0.){
        discard;
    }
    gl_FragColor = c;
}`;
/* harmony export (immutable) */ __webpack_exports__["FS"] = FS;


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__color__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__width__ = __webpack_require__(10);
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__color__; });
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__width__; });




/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
const VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position = vec4(vertex, 0.5, 1.);
}
`;
/* harmony export (immutable) */ __webpack_exports__["VS"] = VS;


const FS = `

precision highp float;

varying  vec2 uv;

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    float p2=texture2D(property2, uv).a;
    float p3=texture2D(property3, uv).a;
    gl_FragColor = $INLINE;
}
`;
/* harmony export (immutable) */ __webpack_exports__["FS"] = FS;



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
const VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position  = vec4(vertex, 0.5, 1.);
}
`;
/* harmony export (immutable) */ __webpack_exports__["VS"] = VS;


const FS = `

precision highp float;

varying  vec2 uv;

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    float p2=texture2D(property2, uv).a;
    float p3=texture2D(property3, uv).a;
    gl_FragColor = vec4($INLINE);
}
`;
/* harmony export (immutable) */ __webpack_exports__["FS"] = FS;


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Style", function() { return Style; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setGL", function() { return setGL; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsep__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsep___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jsep__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__parser__ = __webpack_require__(12);
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Now", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["i"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Near", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["h"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Color", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["a"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "Float", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["b"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "RampColor", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["j"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "FloatMul", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["e"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "FloatDiv", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["d"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "FloatAdd", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["c"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "FloatSub", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["g"]; });
/* harmony namespace reexport (by provided) */ __webpack_require__.d(__webpack_exports__, "FloatPow", function() { return __WEBPACK_IMPORTED_MODULE_1__functions__["f"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "parseStyle", function() { return __WEBPACK_IMPORTED_MODULE_2__parser__["a"]; });
var gl = null;









function setGL(_gl) {
    gl = _gl;
    __WEBPACK_IMPORTED_MODULE_1__functions__["k" /* setGL */](gl);
}

function Style(layer) {
    this.layer = layer;
    this.updated = true;

    this._width = __WEBPACK_IMPORTED_MODULE_1__functions__["b" /* Float */](3);
    this._width.parent = this;
    this._width.notify = () => {
        this.layer._compileWidthShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    this._color = __WEBPACK_IMPORTED_MODULE_1__functions__["a" /* Color */]([0, 1, 0, 1]);
    this._color.parent = this;
    this._color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
}
Style.prototype.setWidth = function (float) {
    this._width = float;
    this.updated = true;
    float.parent = this;
    float.notify = () => {
        this.layer._compileWidthShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    float.notify();
}
Style.prototype.replaceChild = function (toReplace, replacer) {
    if (toReplace == this._color) {
        this._color = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else if (toReplace == this._width) {
        this._width = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else {
        console.warn('No child found');
    }
}

Style.prototype.setColor = function (color) {
    this._color = color;
    this.updated = true;
    color.parent = this;
    color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    color.notify();
}
Style.prototype.getWidth = function () {
    return this._width;
}
Style.prototype.getColor = function () {
    return this._color;
}

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parseStyle;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsep__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsep___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jsep__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);




function parseStyle(str) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addBinaryOp("^", 10);
    const r = parseNode(__WEBPACK_IMPORTED_MODULE_0_jsep___default()(str));
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeBinaryOp("^");
    return r;
}

function parseNode(node) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNode(arg));
        switch (node.callee.name) {
            case 'RampColor':
                return __WEBPACK_IMPORTED_MODULE_1__functions__["j" /* RampColor */](...args);
            case 'Near':
                return __WEBPACK_IMPORTED_MODULE_1__functions__["h" /* Near */](...args);
            case 'Now':
                return __WEBPACK_IMPORTED_MODULE_1__functions__["i" /* Now */](...args);
            default:
                break;
        }
    } else if (node.type == 'Literal') {
        return node.value;
    } else if (node.type == 'ArrayExpression') {
        return node.elements.map(e => parseNode(e));
    } else if (node.type == 'BinaryExpression') {
        const left = parseNode(node.left);
        const right = parseNode(node.right);
        switch (node.operator) {
            case "*":
                //TODO check left & right types => float
                return __WEBPACK_IMPORTED_MODULE_1__functions__["e" /* FloatMul */](left, right);
            case "/":
                return __WEBPACK_IMPORTED_MODULE_1__functions__["d" /* FloatDiv */](left, right);
            case "+":
                return __WEBPACK_IMPORTED_MODULE_1__functions__["c" /* FloatAdd */](left, right);
            case "-":
                return __WEBPACK_IMPORTED_MODULE_1__functions__["g" /* FloatSub */](left, right);
            case "^":
                return __WEBPACK_IMPORTED_MODULE_1__functions__["f" /* FloatPow */](left, right);
            default:
                break;
        }
    }
    console.warn(node);
    return null;
}




/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports.VectorTile = __webpack_require__(14);
module.exports.VectorTileFeature = __webpack_require__(3);
module.exports.VectorTileLayer = __webpack_require__(2);


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VectorTileLayer = __webpack_require__(2);

module.exports = VectorTile;

function VectorTile(pbf, end) {
    this.layers = pbf.readFields(readTile, {}, end);
}

function readTile(tag, layers, pbf) {
    if (tag === 3) {
        var layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
        if (layer.length) layers[layer.name] = layer;
    }
}



/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Point;

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class Point
 * @param {Number} x the x-coordinate. this could be longitude or screen
 * pixels, or any other sort of unit.
 * @param {Number} y the y-coordinate. this could be latitude or screen
 * pixels, or any other sort of unit.
 * @example
 * var point = new Point(-77, 38);
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {

    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() { return new Point(this.x, this.y); },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add:     function(p) { return this.clone()._add(p); },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub:     function(p) { return this.clone()._sub(p); },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint:    function(p) { return this.clone()._multByPoint(p); },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint:     function(p) { return this.clone()._divByPoint(p); },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult:    function(k) { return this.clone()._mult(k); },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div:     function(k) { return this.clone()._div(k); },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate:  function(a) { return this.clone()._rotate(a); },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround:  function(a,p) { return this.clone()._rotateAround(a,p); },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(m) { return this.clone()._matMult(m); },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit:    function() { return this.clone()._unit(); },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp:    function() { return this.clone()._perp(); },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round:   function() { return this.clone()._round(); },

    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function(other) {
        return this.x === other.x &&
               this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _multByPoint: function(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    _divByPoint: function(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _rotateAround: function(angle, p) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

/**
 * Construct a point from an array if necessary, otherwise if the input
 * is already a Point, or an unknown type, return it unchanged
 * @param {Array<Number>|Point|*} a any kind of input value
 * @return {Point} constructed point, or passed-through value.
 * @example
 * // this
 * var point = Point.convert([0, 1]);
 * // is equivalent to
 * var point = new Point(0, 1);
 */
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Pbf;

var ieee754 = __webpack_require__(17);

function Pbf(buf) {
    this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
}

Pbf.Varint  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
Pbf.Bytes   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
    SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

Pbf.prototype = {

    destroy: function() {
        this.buf = null;
    },

    // === READING =================================================================

    readFields: function(readField, result, end) {
        end = end || this.length;

        while (this.pos < end) {
            var val = this.readVarint(),
                tag = val >> 3,
                startPos = this.pos;

            this.type = val & 0x7;
            readField(tag, result, this);

            if (this.pos === startPos) this.skip(val);
        }
        return result;
    },

    readMessage: function(readField, result) {
        return this.readFields(readField, result, this.readVarint() + this.pos);
    },

    readFixed32: function() {
        var val = readUInt32(this.buf, this.pos);
        this.pos += 4;
        return val;
    },

    readSFixed32: function() {
        var val = readInt32(this.buf, this.pos);
        this.pos += 4;
        return val;
    },

    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

    readFixed64: function() {
        var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readSFixed64: function() {
        var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readFloat: function() {
        var val = ieee754.read(this.buf, this.pos, true, 23, 4);
        this.pos += 4;
        return val;
    },

    readDouble: function() {
        var val = ieee754.read(this.buf, this.pos, true, 52, 8);
        this.pos += 8;
        return val;
    },

    readVarint: function(isSigned) {
        var buf = this.buf,
            val, b;

        b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;
        b = buf[this.pos];   val |= (b & 0x0f) << 28;

        return readVarintRemainder(val, isSigned, this);
    },

    readVarint64: function() { // for compatibility with v2.0.1
        return this.readVarint(true);
    },

    readSVarint: function() {
        var num = this.readVarint();
        return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
    },

    readBoolean: function() {
        return Boolean(this.readVarint());
    },

    readString: function() {
        var end = this.readVarint() + this.pos,
            str = readUtf8(this.buf, this.pos, end);
        this.pos = end;
        return str;
    },

    readBytes: function() {
        var end = this.readVarint() + this.pos,
            buffer = this.buf.subarray(this.pos, end);
        this.pos = end;
        return buffer;
    },

    // verbose for performance reasons; doesn't affect gzipped size

    readPackedVarint: function(arr, isSigned) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readVarint(isSigned));
        return arr;
    },
    readPackedSVarint: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSVarint());
        return arr;
    },
    readPackedBoolean: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readBoolean());
        return arr;
    },
    readPackedFloat: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFloat());
        return arr;
    },
    readPackedDouble: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readDouble());
        return arr;
    },
    readPackedFixed32: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFixed32());
        return arr;
    },
    readPackedSFixed32: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSFixed32());
        return arr;
    },
    readPackedFixed64: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFixed64());
        return arr;
    },
    readPackedSFixed64: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSFixed64());
        return arr;
    },

    skip: function(val) {
        var type = val & 0x7;
        if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {}
        else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
        else if (type === Pbf.Fixed32) this.pos += 4;
        else if (type === Pbf.Fixed64) this.pos += 8;
        else throw new Error('Unimplemented type: ' + type);
    },

    // === WRITING =================================================================

    writeTag: function(tag, type) {
        this.writeVarint((tag << 3) | type);
    },

    realloc: function(min) {
        var length = this.length || 16;

        while (length < this.pos + min) length *= 2;

        if (length !== this.length) {
            var buf = new Uint8Array(length);
            buf.set(this.buf);
            this.buf = buf;
            this.length = length;
        }
    },

    finish: function() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.subarray(0, this.length);
    },

    writeFixed32: function(val) {
        this.realloc(4);
        writeInt32(this.buf, val, this.pos);
        this.pos += 4;
    },

    writeSFixed32: function(val) {
        this.realloc(4);
        writeInt32(this.buf, val, this.pos);
        this.pos += 4;
    },

    writeFixed64: function(val) {
        this.realloc(8);
        writeInt32(this.buf, val & -1, this.pos);
        writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeSFixed64: function(val) {
        this.realloc(8);
        writeInt32(this.buf, val & -1, this.pos);
        writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeVarint: function(val) {
        val = +val || 0;

        if (val > 0xfffffff || val < 0) {
            writeBigVarint(val, this);
            return;
        }

        this.realloc(4);

        this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] =   (val >>> 7) & 0x7f;
    },

    writeSVarint: function(val) {
        this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
    },

    writeBoolean: function(val) {
        this.writeVarint(Boolean(val));
    },

    writeString: function(str) {
        str = String(str);
        this.realloc(str.length * 4);

        this.pos++; // reserve 1 byte for short string length

        var startPos = this.pos;
        // write the string directly to the buffer and see how much was written
        this.pos = writeUtf8(this.buf, str, this.pos);
        var len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeFloat: function(val) {
        this.realloc(4);
        ieee754.write(this.buf, val, this.pos, true, 23, 4);
        this.pos += 4;
    },

    writeDouble: function(val) {
        this.realloc(8);
        ieee754.write(this.buf, val, this.pos, true, 52, 8);
        this.pos += 8;
    },

    writeBytes: function(buffer) {
        var len = buffer.length;
        this.writeVarint(len);
        this.realloc(len);
        for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
    },

    writeRawMessage: function(fn, obj) {
        this.pos++; // reserve 1 byte for short message length

        // write the message directly to the buffer and see how much was written
        var startPos = this.pos;
        fn(obj, this);
        var len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeMessage: function(tag, fn, obj) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeRawMessage(fn, obj);
    },

    writePackedVarint:   function(tag, arr) { this.writeMessage(tag, writePackedVarint, arr);   },
    writePackedSVarint:  function(tag, arr) { this.writeMessage(tag, writePackedSVarint, arr);  },
    writePackedBoolean:  function(tag, arr) { this.writeMessage(tag, writePackedBoolean, arr);  },
    writePackedFloat:    function(tag, arr) { this.writeMessage(tag, writePackedFloat, arr);    },
    writePackedDouble:   function(tag, arr) { this.writeMessage(tag, writePackedDouble, arr);   },
    writePackedFixed32:  function(tag, arr) { this.writeMessage(tag, writePackedFixed32, arr);  },
    writePackedSFixed32: function(tag, arr) { this.writeMessage(tag, writePackedSFixed32, arr); },
    writePackedFixed64:  function(tag, arr) { this.writeMessage(tag, writePackedFixed64, arr);  },
    writePackedSFixed64: function(tag, arr) { this.writeMessage(tag, writePackedSFixed64, arr); },

    writeBytesField: function(tag, buffer) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeBytes(buffer);
    },
    writeFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFixed32(val);
    },
    writeSFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeSFixed32(val);
    },
    writeFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeFixed64(val);
    },
    writeSFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeSFixed64(val);
    },
    writeVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeVarint(val);
    },
    writeSVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeSVarint(val);
    },
    writeStringField: function(tag, str) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeString(str);
    },
    writeFloatField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFloat(val);
    },
    writeDoubleField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeDouble(val);
    },
    writeBooleanField: function(tag, val) {
        this.writeVarintField(tag, Boolean(val));
    }
};

function readVarintRemainder(l, s, p) {
    var buf = p.buf,
        h, b;

    b = buf[p.pos++]; h  = (b & 0x70) >> 4;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 3;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 10; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 17; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 24; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x01) << 31; if (b < 0x80) return toNum(l, h, s);

    throw new Error('Expected varint not more than 10 bytes');
}

function readPackedEnd(pbf) {
    return pbf.type === Pbf.Bytes ?
        pbf.readVarint() + pbf.pos : pbf.pos + 1;
}

function toNum(low, high, isSigned) {
    if (isSigned) {
        return high * 0x100000000 + (low >>> 0);
    }

    return ((high >>> 0) * 0x100000000) + (low >>> 0);
}

function writeBigVarint(val, pbf) {
    var low, high;

    if (val >= 0) {
        low  = (val % 0x100000000) | 0;
        high = (val / 0x100000000) | 0;
    } else {
        low  = ~(-val % 0x100000000);
        high = ~(-val / 0x100000000);

        if (low ^ 0xffffffff) {
            low = (low + 1) | 0;
        } else {
            low = 0;
            high = (high + 1) | 0;
        }
    }

    if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
        throw new Error('Given varint doesn\'t fit into 10 bytes');
    }

    pbf.realloc(10);

    writeBigVarintLow(low, high, pbf);
    writeBigVarintHigh(high, pbf);
}

function writeBigVarintLow(low, high, pbf) {
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos]   = low & 0x7f;
}

function writeBigVarintHigh(high, pbf) {
    var lsb = (high & 0x07) << 4;

    pbf.buf[pbf.pos++] |= lsb         | ((high >>>= 3) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f;
}

function makeRoomForExtraLength(startPos, len, pbf) {
    var extraLen =
        len <= 0x3fff ? 1 :
        len <= 0x1fffff ? 2 :
        len <= 0xfffffff ? 3 : Math.ceil(Math.log(len) / (Math.LN2 * 7));

    // if 1 byte isn't enough for encoding message length, shift the data to the right
    pbf.realloc(extraLen);
    for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}

function writePackedVarint(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);   }
function writePackedSVarint(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);  }
function writePackedFloat(arr, pbf)    { for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);    }
function writePackedDouble(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);   }
function writePackedBoolean(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);  }
function writePackedFixed32(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);  }
function writePackedSFixed32(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]); }
function writePackedFixed64(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);  }
function writePackedSFixed64(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]); }

// Buffer code below from https://github.com/feross/buffer, MIT-licensed

function readUInt32(buf, pos) {
    return ((buf[pos]) |
        (buf[pos + 1] << 8) |
        (buf[pos + 2] << 16)) +
        (buf[pos + 3] * 0x1000000);
}

function writeInt32(buf, val, pos) {
    buf[pos] = val;
    buf[pos + 1] = (val >>> 8);
    buf[pos + 2] = (val >>> 16);
    buf[pos + 3] = (val >>> 24);
}

function readInt32(buf, pos) {
    return ((buf[pos]) |
        (buf[pos + 1] << 8) |
        (buf[pos + 2] << 16)) +
        (buf[pos + 3] << 24);
}

function readUtf8(buf, pos, end) {
    var str = '';
    var i = pos;

    while (i < end) {
        var b0 = buf[i];
        var c = null; // codepoint
        var bytesPerSequence =
            b0 > 0xEF ? 4 :
            b0 > 0xDF ? 3 :
            b0 > 0xBF ? 2 : 1;

        if (i + bytesPerSequence > end) break;

        var b1, b2, b3;

        if (bytesPerSequence === 1) {
            if (b0 < 0x80) {
                c = b0;
            }
        } else if (bytesPerSequence === 2) {
            b1 = buf[i + 1];
            if ((b1 & 0xC0) === 0x80) {
                c = (b0 & 0x1F) << 0x6 | (b1 & 0x3F);
                if (c <= 0x7F) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 3) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | (b2 & 0x3F);
                if (c <= 0x7FF || (c >= 0xD800 && c <= 0xDFFF)) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 4) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            b3 = buf[i + 3];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | (b3 & 0x3F);
                if (c <= 0xFFFF || c >= 0x110000) {
                    c = null;
                }
            }
        }

        if (c === null) {
            c = 0xFFFD;
            bytesPerSequence = 1;

        } else if (c > 0xFFFF) {
            c -= 0x10000;
            str += String.fromCharCode(c >>> 10 & 0x3FF | 0xD800);
            c = 0xDC00 | c & 0x3FF;
        }

        str += String.fromCharCode(c);
        i += bytesPerSequence;
    }

    return str;
}

function writeUtf8(buf, str, pos) {
    for (var i = 0, c, lead; i < str.length; i++) {
        c = str.charCodeAt(i); // code point

        if (c > 0xD7FF && c < 0xE000) {
            if (lead) {
                if (c < 0xDC00) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                    lead = c;
                    continue;
                } else {
                    c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                    lead = null;
                }
            } else {
                if (c > 0xDBFF || (i + 1 === str.length)) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                } else {
                    lead = c;
                }
                continue;
            }
        } else if (lead) {
            buf[pos++] = 0xEF;
            buf[pos++] = 0xBF;
            buf[pos++] = 0xBD;
            lead = null;
        }

        if (c < 0x80) {
            buf[pos++] = c;
        } else {
            if (c < 0x800) {
                buf[pos++] = c >> 0x6 | 0xC0;
            } else {
                if (c < 0x10000) {
                    buf[pos++] = c >> 0xC | 0xE0;
                } else {
                    buf[pos++] = c >> 0x12 | 0xF0;
                    buf[pos++] = c >> 0xC & 0x3F | 0x80;
                }
                buf[pos++] = c >> 0x6 & 0x3F | 0x80;
            }
            buf[pos++] = c & 0x3F | 0x80;
        }
    }
    return pos;
}


/***/ }),
/* 17 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_index__ = __webpack_require__(4);



var VectorTile = __webpack_require__(13).VectorTile;
var Protobuf = __webpack_require__(16);

var renderer;
var layer;
var oldtile;
var ajax;

function styleWidth(e) {
    const v = document.getElementById("widthStyleEntry").value;
    const Near = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].Near;
    const Float = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].Float;
    const Color = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].Color;
    const RampColor = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].RampColor;
    const width = eval(v);
    if (width) {
        layer.style.getWidth().blendTo(width, 1000);
    }
}
function styleColor(e) {
    const v = document.getElementById("colorStyleEntry").value;
    const Near = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].Near;
    const Float = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].Float;
    const Color = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].Color;
    const RampColor = __WEBPACK_IMPORTED_MODULE_0__src_index__["b" /* Style */].RampColor;
    const color = eval(v);
    if (color) {
        layer.style.getColor().blendTo(color, 1000);
    }
}

function getData() {
    if (ajax) {
        ajax.abort();
    }

    var oReq = new XMLHttpRequest();
    oReq.open("GET", "https://dmanzanares.carto.com/api/v1/map/dmanzanares@789cad67@92456f0655aac0322b2572f4e05088e7:1509358508954/mapnik/0/0/0.mvt", true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response;
        console.log("MVT1", arrayBuffer, oEvent, oReq);
        if (arrayBuffer) {
            var tile = new VectorTile(new Protobuf(arrayBuffer));
            console.log("MVT", tile);
            const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];

            var fieldMap = {
                temp: 0,
                daten: 1
            };
            var properties = [[new Float32Array(mvtLayer.length)], [new Float32Array(mvtLayer.length)]];
            var points = new Float32Array(mvtLayer.length * 2);
            for (var i = 0; i < mvtLayer.length; i++) {
                const f = mvtLayer.feature(i);
                const geom = f.loadGeometry();
                //console.log(mvtLayer.feature(i).toGeoJSON(0,0,0))
                points[2 * i + 0] = (geom[0][0].x) / 4096.0;
                points[2 * i + 1] = 1. - (geom[0][0].y) / 4096.0;

                properties[0][i] = Number(f.properties.temp);
                properties[1][i] = Number(f.properties.daten);

                /*Object.keys(f.properties).map(name => {
                    if (fieldMap[name] === undefined) {
                        fieldMap[name] = Object.keys(fieldMap).length;
                    }
                    var pid = fieldMap[name];
                    if (properties[pid] === undefined) {
                        properties[pid] = new Float32Array(mvtLayer.length);
                    }
                    properties[pid][i] = Number(f.properties[name]);
                });*/
            }
            var tile = {
                center: { x: 0, y: 0 },
                scale: 1 / 1.,
                count: mvtLayer.length,
                geom: points,
                properties: {}
            };
            Object.keys(fieldMap).map((name, pid) => {
                tile.properties[name] = properties[pid];
            })
            console.log("Tile", tile);
            oldtile = layer.addTile(tile);
            styleWidth();
            styleColor();
        }
    };

    oReq.send(null);
    /*
        ajax = $.getJSON("https://dmanzanares.carto.com/api/v2/sql?q=" + encodeURIComponent(document.getElementById("sqlEntry").value) + "&api_key=d9d686df65842a8fddbd186711255ce5d19aa9b8", function (data) {
            if (oldtile) {
                layer.removeTile(oldtile);
            }
            console.log("Downloaded", data);
            const fields = Object.keys(data.fields).filter(name => name != 'st_asgeojson');
            var properties = fields.map(_ => new Float32Array(data.rows.length));
            var points = new Float32Array(data.rows.length * 2);
            data.rows.forEach((e, index) => {
                var point = $.parseJSON(e.st_asgeojson).coordinates;
                points[2 * index + 0] = (point[0]) + Math.random() * 1000;
                points[2 * index + 1] = (point[1]) + Math.random() * 1000;
                fields.map((name, pid) => {
                    properties[pid][index] = Number(e[name]);
                });
            });
            var tile = {
                center: { x: 0, y: 0 },
                scale: 1 / 10000000.,
                count: data.rows.length,
                geom: points,
                properties: {}
            };
            fields.map((name, pid) => {
                tile.properties[name] = properties[pid];
            })
            console.log("Tile", tile);
            oldtile = layer.addTile(tile);
            styleWidth();
            styleColor();
        });*/
}
function start() {
    renderer = new __WEBPACK_IMPORTED_MODULE_0__src_index__["a" /* Renderer */](document.getElementById('glCanvas'));
    layer = renderer.addLayer();

    getData();
    $('#widthStyleEntry').on('input', styleWidth);
    $('#colorStyleEntry').on('input', styleColor);
    $('#sqlEntry').on('input', getData);

    // Pan and zoom
    window.onresize = function () { renderer.refresh(); };
    $(window).bind('mousewheel DOMMouseScroll', function (event) {
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            renderer.setZoom(renderer.getZoom() * 0.8);
        } else {
            renderer.setZoom(renderer.getZoom() / 0.8);
        }
    });
    var isDragging = false;
    var draggOffset = {
        x: 0.,
        y: 0.
    };
    document.onmousedown = function (event) {
        isDragging = true;
        draggOffset = {
            x: event.clientX,
            y: event.clientY
        };
    };
    document.onmousemove = function (event) {
        if (isDragging) {
            var c = renderer.getCenter();
            var k = renderer.getZoom() / document.body.clientHeight * 2.;
            c.x += (draggOffset.x - event.clientX) * k;
            c.y += -(draggOffset.y - event.clientY) * k;
            renderer.setCenter(c.x, c.y);
            draggOffset = {
                x: event.clientX,
                y: event.clientY
            };
        }
    };
    document.onmouseup = function () {
        isDragging = false;
    };
}

start();

/***/ })
/******/ ]);