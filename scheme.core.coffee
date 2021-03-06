class Log
    @printResult: (list) ->

        if Token.isNil list
            return if list == Token.false then list else Token.nil
        return "builtin function" if typeof(list) == 'function'
        return list if !(list instanceof Array)

        ret = "("
        for v in list
            if( v instanceof Array )
                ret += " "+ Log.printResult v
            else
                ret += " "+ v
        
        ret += " )"
        return ret

DEBUG = false
debug = (obj) ->
    DEBUG && console.log "[scheme debug]" + obj
LOG = true
log = (obj) ->
    LOG && console.log "[scheme log]" + obj

class SchemeError extends Error
    constructor: (@message)->
        @name = @constructor.name
    @:: = new Error()
    @::constructor = @

class ArgumentNaNError extends SchemeError
    constructor:(arg) ->
        super "#{arg} is NaN."

class SymbolNotFoundError extends SchemeError
    constructor:(name) ->
        super "symbol #{name} is not found."

class ArgumentError extends SchemeError
    constructor:(subject, length) ->
        super "#{subject} requires #{length} arguments."

class ArgumentInvaildError extends SchemeError
    constructor:(subject, obj) ->
        super "#{subject} invalid arguments : #{obj}"

class TypeError extends SchemeError
    constructor:(subject, type) ->
        super "the type of #{subject} is not #{type}"

class ParserError extends SchemeError
    constructor:() ->
        super "parser error occurred"

class Tokenizer
    constructor: (@code) ->
        @point = 0
        @current = null
        @next()

    value: () ->
        @current

    next: () ->
        inQuote = false
        token = ""
        esc = false

        @point++ while @code[@point] in ["\n", " "]

        i = @point
        while i < @code.length and !esc
            c = @code[i]
            switch c
                when "\""
                    inQuote = !inQuote
                    token += c
                when "(", ")", "'"
                    if token.length > 0
                        esc = true
                        break
                    i++
                    if inQuote
                        token += c
                    else
                        token = c
                        esc = true
                when " ", "\n"
                    while !inQuote and @code[i++] in ["\n", " "]
                        esc = true
                        break
                else
                    token += c
            i++ if esc == false
        @point = i
        @current = token
        token

class Symbols
    @PREFIX = "."
    constructor: () ->

    register: (name, body) ->
        @[Symbols.PREFIX + name] = body

    @register: (name, body) ->
        member = Symbols.PREFIX + name
        Symbols.prototype[member] = body
    
    find: (name) ->
        ret = @[Symbols.PREFIX + name]

        if ret == undefined
            throw new SymbolNotFoundError name
        else
            ret

    @find: (name) ->
        member = Symbols.PREFIX + name
        ret = Symbols.prototype[member]

        if ret == undefined
            throw new SymbolNotFoundError name
        else
            ret

    @::register "+", () ->
        ret = 0
        for i in arguments
            if Token.isNumber i
                ret += (+i)
            else
                throw new ArgumentNaNError arguments[i]
        ret

    @::register "*", () ->
        ret = 1
        for i in arguments
            if Token.isNumber i
                ret *= (+i)
            else
                throw new ArgumentNaNError arguments[i]
        ret

    @::register "-", () ->
        unless Token.isNumber arguments[0]
            throw new ArgumentNaNError arguments[i]
        ret = arguments[0]
        for i in [1..arguments.length-1]
            if Token.isNumber arguments[i]
                ret -= (+arguments[i])
            else
                throw ArgumentNaNError arguments[i]
        ret

    @::register "/", () ->
        unless Token.isNumber arguments[0]
            throw new ArgumentNaNError arguments[i]
        ret = arguments[0]
        for i in [1..arguments.length-1]
            if Token.isNumber arguments[i]
                ret /= (+arguments[i])
            else
                throw ArgumentNaNError arguments[i]
        ret

    @::register "and", () ->
        ret = false
        for i in arguments
            if !Token.isNil(i) and (+i) != 0
                ret = i
            else
                ret = false
                break
        if ret then ret else Token.false
 
    @::register "or", () ->
        ret = false
        for i in arguments
            if !Token.isNil(i) and (+i) != 0
                return i
        if ret then ret else Token.false

    @::register "%", () ->
        unless arguments.length == 2
            throw new ArgumentError '%', 2
        arguments[0] % arguments[1]

    @::register "string-append", () ->
        ret = ""
        for i in arguments
            ret += (i+"")
        ret

    @::register "=", () ->
        unless arguments.length == 2
            throw new ArgumentError '=', 2
        for v in arguments
            unless Token.isNumber v
                throw new TypeError v,"number"
        if arguments[0] == arguments[1] then Token.true else Token.false

    @::register ">", () ->
        unless arguments.length == 2
            throw new ArgumentError '>', 2
        for v in arguments
            unless Token.isNumber v
                throw new TypeError v,"number"
        if arguments[0] > arguments[1] then Token.true else Token.false
        
    @::register ">=", () ->
        unless arguments.length == 2
            throw new ArgumentError '>=', 2
        for v in arguments
            unless Token.isNumber v
                throw new TypeError v,"number"
        if arguments[0] >= arguments[1] then Token.true else Token.false

    @::register "<", () ->
        unless arguments.length == 2
            throw new ArgumentError '<', 2
        for v in arguments
            unless Token.isNumber v
                throw new TypeError v,"number"
        if arguments[0] < arguments[1] then Token.true else Token.false
        
    @::register "<=", () ->
        unless arguments.length == 2
            throw new ArgumentError '<=', 2
        for v in arguments
            unless Token.isNumber v
                throw new TypeError v,"number"
        if arguments[0] <= arguments[1] then Token.true else Token.false

    @::register "car", (list) ->
        unless arguments.length == 1
            throw new ArgumentError 'car', 1
        return Token.nil if Token.isNil list
        throw new ArgumentInvaildError "car", list unless list instanceof Array

        return list[0]

    @::register "cdr", (list) ->
        unless arguments.length == 1
            throw new ArgumentError 'cdr', 1
        return Token.nil if Token.isNil list
        throw new ArgumentInvaildError "cdr", list unless list instanceof Array

        return list[1..]

    @::register "atom", (value) ->
        unless arguments.length == 1
            throw new ArgumentError 'atom', 1

        return if value instanceof Array then Token.nil else Token.true

    @::register "cons", (v1, v2) ->
        unless arguments.length == 2
            throw new ArgumentError 'cons', 2

        ret = []
        ret.push v1
        return ret if Token.isNil v2

        if Symbols.find('atom')(v2) is Token.true
            ret.push v2
        else
            v2.map (e) -> ret.push e
        ret

    @::register "eq", (v1, v2) ->
        unless arguments.length == 2
            throw new ArgumentError 'eq', 2
        v1 = v1+""
        v2 = v2+""
        return if v1 == v2 then Token.true else Token.false

    @::register "print", () ->
        ret = ""
        for i in arguments
            ret += i
        console.log ret
        ret

    @::register "eval", () ->
        if arguments.length >= 1
            throw new ArgumentError 'eval', 1
        arguments[0]

class Special
    @else = "else"
    constructor:(@scheme) ->

    execute: (tree, symbols) ->
        @scheme.execute tree, symbols

    quote: (tree, symbols) ->
        if Token.isNil tree[1] then Token.nil else tree[1]
    if: (tree, symbols) ->
        ret = @execute tree[1], symbols
        @execute( tree[if Token.isNil ret then 3 else 2], symbols )
    define: (tree, symbols) ->
        def = tree[1..]
        if def[0] instanceof Array
            name = def[0][0]
            lambda = [ def[0][1..], def[1] ]
            Symbols.register name, lambda
        else
            name = def[0]
            Symbols.register name, @execute def[1]
        debug "register symbol : "+name
        return name
    cond: (tree, symbols) ->
        tree[1..].map (v) ->
            if v.length != 2
                throw "invalid cond expression"
        for i in [1..tree.length]
            if tree[i][0] == Special.else
                ret = Token.true
            else
                ret = @execute tree[i][0], symbols
            unless Token.isNil ret
                return @execute tree[i][1], symbols
        return Token.nil
    lambda: (tree, symbols) ->
        tree[1..]
    let: (tree, symbols) ->
        # translate (let ((i 1) (j 2)) (body)) to ((lambda (i j) (body)) 1 2)
        binds = tree[1]
        body = tree[2]
        args = []
        values = []

        args.push v[0] for v in binds
        lambda = [Token.lambda, args, body]
        ret = [lambda]
        binds.map (v) -> ret.push v[1]
        @execute ret, symbols
    apply: (tree, symbols) ->
        args = []
        tree[2..].map (v) -> args.push(@execute(v))

        if args[ args.length-1 ] instanceof Array
            last = args.pop()
            last.map (v) -> args.push v
        
        lambda = [tree[1]]
        args.map (v) -> lambda.push v
        @execute lambda, symbols

class Token
    @lambda = "lambda"
    @nil = "nil"
    @true = "#t"
    @false = "#f"

    # decide the kind of token
    @isNil: (value) ->
        value == null or value == undefined or value == Token.nil or value == Token.false or ( value instanceof Array && value.length == 0)

    @isString: (value) ->
        if typeof value == 'string' and value[0] == "\"" and value[value.length-1] == "\"" then true else false

    @isValue: (value) ->
        if value == Token.true or Token.isNil value
            return true
        if Token.isString value
            return true
        if Token.isNumber value
            return true
        return false

    @isNumber: (value) ->
        if typeof value != 'number' and typeof value != 'string'
            return false
        else
            return NaN != parseFloat(value) and isFinite(value)

    @isLambda: (value) ->
        Token.isList(value) and value.length == 2

    @isSymbol: (value) ->
        !Token.isSpecial(value) and !Token.isValue(value) and !Token.isList(value)

    @isList: (value) ->
        value instanceof Array

    @isSpecial: (value) ->
        if !Token.isList(value) or (()->).hasOwnProperty value[0]
            return false

        if Special.prototype[value[0]]
            return true
        else
            return false

    @isBuiltinFunc: (tree, symbols, scheme) ->
        unless Token.isList tree
            return false

        func = scheme.execute tree[0], symbols
        typeof func  == 'function'

    @isUserDefinedFunc: (tree, symbols, scheme) ->
        unless Token.isList tree
            return false

        func = scheme.execute tree[0], symbols
        Token.isLambda func

class Scheme
    constructor: () ->
        @special = new Special @

    interpret: (code) ->
        @depth = 0
        tokenizer = new Tokenizer code
        tree = @_parse tokenizer
        result = null
        result = @execute tree
        ret = "result -> " + Log.printResult result
        @depth = 0
        return ret

    _parse: (tokenizer) ->
        ret = null
        if tokenizer.value() == "("
            if tokenizer.next() == ")"
                tokenizer.next()
                ret = null
            else
                ret = []
                while tokenizer.value() != ""and tokenizer.value() != ")"
                    ret[ret.length] = @_parse tokenizer
                if tokenizer.value() == ")"
                    tokenizer.next()
                else
                    throw new ParserError

        else if tokenizer.value() == "\'"
            tokenizer.next()
            ret = ["quote", @_parse tokenizer]
        else
            ret = tokenizer.value()
            tokenizer.next()

        return ret

    _bindArguments: (params, tree, symbols) ->
        newSym = new Symbols
        newSym.prototype = symbols
        for v,i in params
            if v == '.'
                ends = []
                for t in tree
                    ret = @execute t, symbols
                    ret = if Token.isNil ret then Token.nil else ret
                    ends.push ret
                newSym.register params[param.length - 1], ends
                break
            ret = @execute tree[i+1], symbols
            ret = if Token.isNil ret then Token.nil else ret
            newSym.register params[i], ret
        newSym
    
    execute: (tree, symbols = new Symbols) ->
        @depth++

        if @depth > 10000
            throw "maybe infinity loop. aborted."
            DEBUG && console.log printResult tree

        if Token.isNil tree
            return if tree == Token.false then tree else Token.nil

        if Token.isString tree
            return tree.substring 1, tree.length - 1

        if Token.isValue tree
            return tree

        if Token.isSymbol tree
            return symbols.find tree

        if Token.isSpecial tree
            return (@special[tree[0]]).call(@special, tree, symbols)

        if Token.isBuiltinFunc tree, symbols, @
            lambda = @execute tree[0], symbols
            args = tree[1..].map (v) => @execute v, symbols
            return lambda.apply symbols, args

        if Token.isUserDefinedFunc tree, symbols, @
            lambda = @execute tree[0], symbols
            newSym = @_bindArguments lambda[0], tree, symbols
            return @execute lambda[1], newSym

        throw "unknown object : " + tree


