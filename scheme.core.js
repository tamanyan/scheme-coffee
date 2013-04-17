var ArgumentError, ArgumentNaNError, DEBUG, Log, Scheme, SchemeError, Special, SymbolNotFoundError, Symbols, Token, Tokenizer, code, debug, scheme;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Log = (function() {
  function Log() {}
  Log.printResult = function(list) {
    var ret, v, _i, _len, _ref;
    if (Token.isNil(list)) {
      return 'nil';
    }
    if (typeof list === 'function') {
      return "builtin function";
    }
    if (!(list instanceof Array)) {
      return list;
    }
    ret = "(";
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      v = list[_i];
      if (v instanceof Array) {
        ret += " " + Log.printResult(v);
      } else {
        ret += " " + ((_ref = Token.isNil(v)) != null ? _ref : {
          'nil': v
        });
      }
    }
    ret += " )";
    return ret;
  };
  return Log;
})();
DEBUG = true;
debug = function(obj) {
  return DEBUG && console.log(obj);
};
SchemeError = (function() {
  __extends(SchemeError, Error);
  function SchemeError(message) {
    this.message = message;
    this.name = this.constructor.name;
  }
  SchemeError.prototype = new Error();
  SchemeError.prototype.constructor = SchemeError;
  return SchemeError;
})();
ArgumentNaNError = (function() {
  __extends(ArgumentNaNError, SchemeError);
  function ArgumentNaNError(arg) {
    ArgumentNaNError.__super__.constructor.call(this, "" + arg + " is NaN.");
  }
  return ArgumentNaNError;
})();
SymbolNotFoundError = (function() {
  __extends(SymbolNotFoundError, SchemeError);
  function SymbolNotFoundError(name) {
    SymbolNotFoundError.__super__.constructor.call(this, "symbol " + name + " is not found.");
  }
  return SymbolNotFoundError;
})();
ArgumentError = (function() {
  __extends(ArgumentError, SchemeError);
  function ArgumentError(subject, length) {
    ArgumentError.__super__.constructor.call(this, "" + subject + " requires " + length + " arguments.");
  }
  return ArgumentError;
})();
Tokenizer = (function() {
  function Tokenizer(code) {
    this.code = code;
    this.point = 0;
    this.current = null;
    this.next();
  }
  Tokenizer.prototype.value = function() {
    return this.current;
  };
  Tokenizer.prototype.next = function() {
    var c, esc, i, inQuote, token, _ref, _ref2;
    inQuote = false;
    token = "";
    esc = false;
    while ((_ref = this.code[this.point]) === "\n" || _ref === " ") {
      this.point++;
    }
    i = this.point;
    while (i < this.code.length && !esc) {
      c = this.code[i];
      switch (c) {
        case "\"":
          inQuote = !inQuote;
          token += c;
          break;
        case "(":
        case ")":
        case "'":
          if (token.length > 0) {
            esc = true;
            break;
          }
          i++;
          if (inQuote) {
            token += c;
          } else {
            token = c;
            esc = true;
          }
          break;
        case " ":
        case "\n":
          while (!inQuote && ((_ref2 = this.code[i++]) === "\n" || _ref2 === " ")) {
            esc = true;
            break;
          }
          break;
        default:
          token += c;
      }
      if (esc === false) {
        i++;
      }
    }
    this.point = i;
    this.current = token;
    return token;
  };
  return Tokenizer;
})();
Symbols = (function() {
  Symbols.PREFIX = ".";
  function Symbols() {}
  Symbols.prototype.register = function(name, body) {
    return this[Symbols.PREFIX + name] = body;
  };
  Symbols.register = function(name, body) {
    var member;
    member = Symbols.PREFIX + name;
    return Symbols.prototype[member] = body;
  };
  Symbols.prototype.find = function(name) {
    var ret;
    ret = this[Symbols.PREFIX + name];
    if (ret === void 0) {
      throw new SymbolNotFoundError(name);
    } else {
      return ret;
    }
  };
  Symbols.find = function(name) {
    var member, ret;
    member = Symbols.PREFIX + name;
    ret = Symbols.prototype[member];
    if (ret === void 0) {
      throw new SymbolNotFoundError(name);
    } else {
      return ret;
    }
  };
  Symbols.prototype.register("+", function() {
    var i, ret, _i, _len;
    ret = 0;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      i = arguments[_i];
      if (Token.isNumber(i)) {
        ret += +i;
      } else {
        throw new ArgumentNaNError(arguments[i]);
      }
    }
    return ret;
  });
  Symbols.prototype.register("*", function() {
    var i, ret, _i, _len;
    ret = 1;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      i = arguments[_i];
      if (Token.isNumber(i)) {
        ret *= +i;
      } else {
        throw new ArgumentNaNError(arguments[i]);
      }
    }
    return ret;
  });
  Symbols.prototype.register("-", function() {
    var i, ret, _ref;
    if (!Token.isNumber(arguments[0])) {
      throw new ArgumentNaNError(arguments[i]);
    }
    ret = arguments[0];
    for (i = 1, _ref = arguments.length - 1; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
      if (Token.isNumber(arguments[i])) {
        ret -= +arguments[i];
      } else {
        throw ArgumentNaNError(arguments[i]);
      }
    }
    return ret;
  });
  Symbols.prototype.register("/", function() {
    var i, ret, _ref;
    if (!Token.isNumber(arguments[0])) {
      throw new ArgumentNaNError(arguments[i]);
    }
    ret = arguments[0];
    for (i = 1, _ref = arguments.length - 1; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
      if (Token.isNumber(arguments[i])) {
        ret /= +arguments[i];
      } else {
        throw ArgumentNaNError(arguments[i]);
      }
    }
    return ret;
  });
  Symbols.prototype.register("%", function() {
    if (arguments.length !== 2) {
      throw new ArgumentError('%', 2);
    }
    return arguments[0] % arguments[1];
  });
  Symbols.prototype.register("string-append", function() {
    var i, ret, _i, _len;
    ret = "";
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      i = arguments[_i];
      ret += i + "";
    }
    return ret;
  });
  return Symbols;
})();
Special = (function() {
  function Special(scheme) {
    this.scheme = scheme;
  }
  Special.prototype.execute = function(tree, symbols) {
    return scheme.execute(tree(symbols));
  };
  Special.prototype.quote = function(tree, symbols) {
    if (Token.isNil(tree[1])) {
      return Token.nil;
    } else {
      return tree[1];
    }
  };
  Special.prototype["if"] = function(tree, symbols) {
    var ret, val;
    ret = this.execute(tree[1], symbols);
    val = tree.value();
    return this.execute(val[Token.isNil(ret) ? 3 : 2], symbols);
  };
  Special.prototype.define = function(tree, symbols) {
    var def, lambda, name;
    def = tree.slice(1);
    if (def[0] instanceof Array) {
      name = def[0][0].value();
      lambda = [def[0].slice(1), def[1]];
      Symbols.register(name, lambda);
    } else {
      name = def[0].value();
      Symbols.register(name, this.execute(def[1]));
    }
    debug("register symbol : " + name);
    return name;
  };
  Special.prototype.cond = function(tree, symbols) {
    var i, ret, _ref;
    tree.slice(1).map(function(v) {
      if (v.length !== 2) {
        throw "invalid cond expression";
      }
    });
    for (i = 1, _ref = tree.length; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
      ret = this.execute(tree[i][0], symbols);
      if (!Token.isNil(ret)) {
        return this.execute(tree[i][1], symbols);
      }
    }
    return Token.nil;
  };
  Special.prototype.lambda = function(tree, symbols) {
    return tree.slice(1);
  };
  Special.prototype["let"] = function(tree, symbols) {
    var args, binds, body, lambda, ret, v, values, _i, _len;
    binds = tree[1];
    body = tree[2];
    args = [];
    values = [];
    for (_i = 0, _len = binds.length; _i < _len; _i++) {
      v = binds[_i];
      args.push(v[0]);
    }
    lambda = [Token.lambda, args, body];
    ret = [lambda];
    binds.map(function(v) {
      return ret.push(v[1]);
    });
    return this.execute(ret, symbols);
  };
  Special.prototype.apply = function(tree, symbols) {
    var args, lambda, last;
    args = [];
    tree.slice(2).map(function(v) {
      return args.push(this.execute(v));
    });
    if (args[args.length - 1] instanceof Array) {
      last = args.pop();
      last.map(function(v) {
        return args.push(v);
      });
    }
    lambda = [tree[1]];
    args.map(function(v) {
      return lambda.push(v);
    });
    return this.execute(lambda, symbols);
  };
  return Special;
})();
Token = (function() {
  function Token() {}
  Token.lambda = "lambda";
  Token.nil = "nil";
  Token.isNil = function(value) {
    return value === null || value === void 0 || value === 'nil' || (value instanceof Array && value.length === 0);
  };
  Token.isString = function(value) {
    if (typeof value === 'string' && value[0] === "\"" && value[value.length - 1] === "\"") {
      return true;
    } else {
      return false;
    }
  };
  Token.isValue = function(value) {
    if (value === "#t" || value === "nil" || Token.isNil(value)) {
      return true;
    }
    if (Token.isString(value)) {
      return true;
    }
    if (Token.isNumber(value)) {
      return true;
    }
    return false;
  };
  Token.isNumber = function(value) {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return false;
    } else {
      return NaN !== parseFloat(value) && isFinite(value);
    }
  };
  Token.isLambda = function(value) {
    return Token.isList(value) && value.length === 2;
  };
  Token.isSymbol = function(value) {
    return !Token.isSpecial(value) && !Token.isValue(value) && !Token.isList(value);
  };
  Token.isList = function(value) {
    return value instanceof Array;
  };
  Token.isSpecial = function(value) {
    var _ref;
    if (!Token.isList(value) || (function() {}).hasOwnProperty(value[0])) {
      return false;
    }
    return _ref = value[0], __indexOf.call(Special.prototype, _ref) >= 0;
  };
  Token.isBuiltinFunc = function(tree, symbols, scheme) {
    var func;
    if (!Token.isList(tree)) {
      return false;
    }
    func = scheme.execute(tree[0], symbols);
    return typeof func === 'function';
  };
  return Token;
})();
Scheme = (function() {
  function Scheme() {
    this.special = new Special(this);
  }
  Scheme.prototype.interpret = function(code) {
    var result, tokenizer, tree;
    this.depth = 0;
    tokenizer = new Tokenizer(code);
    tree = this._parse(tokenizer);
    result = null;
    result = this.execute(tree);
    console.log(result);
    this.depth = 0;
  };
  Scheme.prototype._parse = function(tokenizer) {
    var ret;
    ret = null;
    if (tokenizer.value() === "(") {
      if (tokenizer.next() === ")") {
        tokenizer.next();
        ret = null;
      } else {
        ret = [];
        while (tokenizer.value() !== "" && tokenizer.value() !== ")") {
          ret[ret.length] = this._parse(tokenizer);
        }
        if (tokenizer.value() === ")") {
          tokenizer.next();
        }
      }
    } else if (tokenizer.value() === ")") {
      tokenizer.next();
      ret = ["quote", parse(tokenizer)];
    } else {
      ret = tokenizer.value();
      tokenizer.next();
    }
    return ret;
  };
  Scheme.prototype.execute = function(tree, symbols) {
    var args, lambda;
    if (symbols == null) {
      symbols = new Symbols;
    }
    this.depth++;
    if (this.depth > 10000) {
      throw "maybe infinity loop. aborted.";
      DEBUG && console.log(printResult(tree));
    }
    if (Token.isNil(tree)) {
      return Token.nil;
    }
    if (Token.isString(tree)) {
      return tree.substring(1, tree.length - 1);
    }
    if (Token.isValue(tree)) {
      return tree;
    }
    if (Token.isSymbol(tree)) {
      return symbols.find(tree);
    }
    if (Token.isSpecial(tree)) {
      return this.special.prototype[tree[0]](tree, symbols);
    }
    if (Token.isBuiltinFunc(tree, symbols, this)) {
      lambda = this.execute(tree[0], symbols);
      args = tree.slice(1).map(__bind(function(v) {
        return this.execute(v, symbols);
      }, this));
      return lambda.apply(symbols, args);
    }
    throw "unknown object : " + tree;
  };
  return Scheme;
})();
scheme = new Scheme;
code = "(define (my-map func ls)\n    (if (null? ls)\n        '()\n        (cons (func (car ls)) (my-map func (cdr ls)))))";
code = "(+ (+ 1 1 2) 3)";
scheme.interpret(code);