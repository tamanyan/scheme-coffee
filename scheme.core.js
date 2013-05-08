var ArgumentError, ArgumentInvaildError, ArgumentNaNError, DEBUG, LOG, Log, ParserError, Scheme, SchemeError, Special, SymbolNotFoundError, Symbols, Token, Tokenizer, TypeError, debug, log;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Log = (function() {
  function Log() {}
  Log.printResult = function(list) {
    var ret, v, _i, _len;
    if (Token.isNil(list)) {
      if (list === Token["false"]) {
        return list;
      } else {
        return Token.nil;
      }
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
        ret += " " + v;
      }
    }
    ret += " )";
    return ret;
  };
  return Log;
})();
DEBUG = false;
debug = function(obj) {
  return DEBUG && console.log("[scheme debug]" + obj);
};
LOG = true;
log = function(obj) {
  return LOG && console.log("[scheme log]" + obj);
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
ArgumentInvaildError = (function() {
  __extends(ArgumentInvaildError, SchemeError);
  function ArgumentInvaildError(subject, obj) {
    ArgumentInvaildError.__super__.constructor.call(this, "" + subject + " invalid arguments : " + obj);
  }
  return ArgumentInvaildError;
})();
TypeError = (function() {
  __extends(TypeError, SchemeError);
  function TypeError(subject, type) {
    TypeError.__super__.constructor.call(this, "the type of " + subject + " is not " + type);
  }
  return TypeError;
})();
ParserError = (function() {
  __extends(ParserError, SchemeError);
  function ParserError() {
    ParserError.__super__.constructor.call(this, "parser error occurred");
  }
  return ParserError;
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
  Symbols.prototype.register("and", function() {
    var i, ret, _i, _len;
    ret = false;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      i = arguments[_i];
      if (!Token.isNil(i) && (+i) !== 0) {
        ret = i;
      } else {
        ret = false;
        break;
      }
    }
    if (ret) {
      return ret;
    } else {
      return Token["false"];
    }
  });
  Symbols.prototype.register("or", function() {
    var i, ret, _i, _len;
    ret = false;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      i = arguments[_i];
      if (!Token.isNil(i) && (+i) !== 0) {
        return i;
      }
    }
    if (ret) {
      return ret;
    } else {
      return Token["false"];
    }
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
  Symbols.prototype.register("=", function() {
    var v, _i, _len;
    if (arguments.length !== 2) {
      throw new ArgumentError('=', 2);
    }
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      v = arguments[_i];
      if (!Token.isNumber(v)) {
        throw new TypeError(v, "number");
      }
    }
    if (arguments[0] === arguments[1]) {
      return Token["true"];
    } else {
      return Token["false"];
    }
  });
  Symbols.prototype.register(">", function() {
    var v, _i, _len;
    if (arguments.length !== 2) {
      throw new ArgumentError('>', 2);
    }
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      v = arguments[_i];
      if (!Token.isNumber(v)) {
        throw new TypeError(v, "number");
      }
    }
    if (arguments[0] > arguments[1]) {
      return Token["true"];
    } else {
      return Token["false"];
    }
  });
  Symbols.prototype.register(">=", function() {
    var v, _i, _len;
    if (arguments.length !== 2) {
      throw new ArgumentError('>=', 2);
    }
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      v = arguments[_i];
      if (!Token.isNumber(v)) {
        throw new TypeError(v, "number");
      }
    }
    if (arguments[0] >= arguments[1]) {
      return Token["true"];
    } else {
      return Token["false"];
    }
  });
  Symbols.prototype.register("<", function() {
    var v, _i, _len;
    if (arguments.length !== 2) {
      throw new ArgumentError('<', 2);
    }
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      v = arguments[_i];
      if (!Token.isNumber(v)) {
        throw new TypeError(v, "number");
      }
    }
    if (arguments[0] < arguments[1]) {
      return Token["true"];
    } else {
      return Token["false"];
    }
  });
  Symbols.prototype.register("<=", function() {
    var v, _i, _len;
    if (arguments.length !== 2) {
      throw new ArgumentError('<=', 2);
    }
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      v = arguments[_i];
      if (!Token.isNumber(v)) {
        throw new TypeError(v, "number");
      }
    }
    if (arguments[0] <= arguments[1]) {
      return Token["true"];
    } else {
      return Token["false"];
    }
  });
  Symbols.prototype.register("car", function(list) {
    if (arguments.length !== 1) {
      throw new ArgumentError('car', 1);
    }
    if (Token.isNil(list)) {
      return Token.nil;
    }
    if (!(list instanceof Array)) {
      throw new ArgumentInvaildError("car", list);
    }
    return list[0];
  });
  Symbols.prototype.register("cdr", function(list) {
    if (arguments.length !== 1) {
      throw new ArgumentError('cdr', 1);
    }
    if (Token.isNil(list)) {
      return Token.nil;
    }
    if (!(list instanceof Array)) {
      throw new ArgumentInvaildError("cdr", list);
    }
    return list.slice(1);
  });
  Symbols.prototype.register("atom", function(value) {
    if (arguments.length !== 1) {
      throw new ArgumentError('atom', 1);
    }
    if (value instanceof Array) {
      return Token.nil;
    } else {
      return Token["true"];
    }
  });
  Symbols.prototype.register("cons", function(v1, v2) {
    var ret;
    if (arguments.length !== 2) {
      throw new ArgumentError('cons', 2);
    }
    ret = [];
    ret.push(v1);
    if (Token.isNil(v2)) {
      return ret;
    }
    if (Symbols.find('atom')(v2) === Token["true"]) {
      ret.push(v2);
    } else {
      v2.map(function(e) {
        return ret.push(e);
      });
    }
    return ret;
  });
  Symbols.prototype.register("eq", function(v1, v2) {
    if (arguments.length !== 2) {
      throw new ArgumentError('eq', 2);
    }
    v1 = v1 + "";
    v2 = v2 + "";
    if (v1 === v2) {
      return Token["true"];
    } else {
      return Token["false"];
    }
  });
  Symbols.prototype.register("print", function() {
    var i, ret, _i, _len;
    ret = "";
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      i = arguments[_i];
      ret += i;
    }
    console.log(ret);
    return ret;
  });
  Symbols.prototype.register("eval", function() {
    if (arguments.length >= 1) {
      throw new ArgumentError('eval', 1);
    }
    return arguments[0];
  });
  return Symbols;
})();
Special = (function() {
  Special["else"] = "else";
  function Special(scheme) {
    this.scheme = scheme;
  }
  Special.prototype.execute = function(tree, symbols) {
    return this.scheme.execute(tree, symbols);
  };
  Special.prototype.quote = function(tree, symbols) {
    if (Token.isNil(tree[1])) {
      return Token.nil;
    } else {
      return tree[1];
    }
  };
  Special.prototype["if"] = function(tree, symbols) {
    var ret;
    ret = this.execute(tree[1], symbols);
    return this.execute(tree[Token.isNil(ret) ? 3 : 2], symbols);
  };
  Special.prototype.define = function(tree, symbols) {
    var def, lambda, name;
    def = tree.slice(1);
    if (def[0] instanceof Array) {
      name = def[0][0];
      lambda = [def[0].slice(1), def[1]];
      Symbols.register(name, lambda);
    } else {
      name = def[0];
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
      if (tree[i][0] === Special["else"]) {
        ret = Token["true"];
      } else {
        ret = this.execute(tree[i][0], symbols);
      }
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
  Token["true"] = "#t";
  Token["false"] = "#f";
  Token.isNil = function(value) {
    return value === null || value === void 0 || value === Token.nil || value === Token["false"] || (value instanceof Array && value.length === 0);
  };
  Token.isString = function(value) {
    if (typeof value === 'string' && value[0] === "\"" && value[value.length - 1] === "\"") {
      return true;
    } else {
      return false;
    }
  };
  Token.isValue = function(value) {
    if (value === Token["true"] || Token.isNil(value)) {
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
    if (!Token.isList(value) || (function() {}).hasOwnProperty(value[0])) {
      return false;
    }
    if (Special.prototype[value[0]]) {
      return true;
    } else {
      return false;
    }
  };
  Token.isBuiltinFunc = function(tree, symbols, scheme) {
    var func;
    if (!Token.isList(tree)) {
      return false;
    }
    func = scheme.execute(tree[0], symbols);
    return typeof func === 'function';
  };
  Token.isUserDefinedFunc = function(tree, symbols, scheme) {
    var func;
    if (!Token.isList(tree)) {
      return false;
    }
    func = scheme.execute(tree[0], symbols);
    return Token.isLambda(func);
  };
  return Token;
})();
Scheme = (function() {
  function Scheme() {
    this.special = new Special(this);
  }
  Scheme.prototype.interpret = function(code) {
    var result, ret, tokenizer, tree;
    this.depth = 0;
    tokenizer = new Tokenizer(code);
    tree = this._parse(tokenizer);
    result = null;
    result = this.execute(tree);
    ret = "result -> " + Log.printResult(result);
    this.depth = 0;
    return ret;
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
        } else {
          throw new ParserError;
        }
      }
    } else if (tokenizer.value() === "\'") {
      tokenizer.next();
      ret = ["quote", this._parse(tokenizer)];
    } else {
      ret = tokenizer.value();
      tokenizer.next();
    }
    return ret;
  };
  Scheme.prototype._bindArguments = function(params, tree, symbols) {
    var ends, i, newSym, ret, t, v, _i, _len, _len2;
    newSym = new Symbols;
    newSym.prototype = symbols;
    for (i = 0, _len = params.length; i < _len; i++) {
      v = params[i];
      if (v === '.') {
        ends = [];
        for (_i = 0, _len2 = tree.length; _i < _len2; _i++) {
          t = tree[_i];
          ret = this.execute(t, symbols);
          ret = Token.isNil(ret) ? Token.nil : ret;
          ends.push(ret);
        }
        newSym.register(params[param.length - 1], ends);
        break;
      }
      ret = this.execute(tree[i + 1], symbols);
      ret = Token.isNil(ret) ? Token.nil : ret;
      newSym.register(params[i], ret);
    }
    return newSym;
  };
  Scheme.prototype.execute = function(tree, symbols) {
    var args, lambda, newSym;
    if (symbols == null) {
      symbols = new Symbols;
    }
    this.depth++;
    if (this.depth > 10000) {
      throw "maybe infinity loop. aborted.";
      DEBUG && console.log(printResult(tree));
    }
    if (Token.isNil(tree)) {
      if (tree === Token["false"]) {
        return tree;
      } else {
        return Token.nil;
      }
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
      return this.special[tree[0]].call(this.special, tree, symbols);
    }
    if (Token.isBuiltinFunc(tree, symbols, this)) {
      lambda = this.execute(tree[0], symbols);
      args = tree.slice(1).map(__bind(function(v) {
        return this.execute(v, symbols);
      }, this));
      return lambda.apply(symbols, args);
    }
    if (Token.isUserDefinedFunc(tree, symbols, this)) {
      lambda = this.execute(tree[0], symbols);
      newSym = this._bindArguments(lambda[0], tree, symbols);
      return this.execute(lambda[1], newSym);
    }
    throw "unknown object : " + tree;
  };
  return Scheme;
})();