$ ->
    console = $(".console")
    scheme = new Scheme
    controller = console.console {
        promptLabel: "scheme>"
        commandHandle: (line) ->
            if line
                try
                    ret = scheme.interpret line
                    ret = [{msg:ret,className:"jquery-console-message-value"}]
                catch error
                    ret = [{msg:error.message,className:"jquery-console-message-error"}]
                return ret
            else
                return [{className:"jquery-console-message-value"}]
        keywords: ["define", "let", "cond"]
        cols: 40
        completeHandle: (prefix) ->
            keywords = @keywords
            ret = []
            for keyword in keywords
                if keyword.lastIndexOf(prefix, 0) == 0
                    ret.push keyword.substring(prefix.length)
            return ret
    }
    debugConsole = (code) ->
        log code
        log scheme.interpret code
        
    log "*define test code"
    code = """
    (define (fact x)
        (if (eq x 1)
            1
            (* x (fact (- x 1)))))
    """
    debugConsole code

    code = """(fact 4)"""
    debugConsole code

    log "*lambda test code"
    code = """((lambda (x y) (* x y)) 4 2)"""
    debugConsole code

    log "*cond test code"
    code = """
    (define (cond_sample x y)
        (cond
         ((and (>= x 0) (>= y 0)) #t)
         (else #f)
        )
    )"""
    debugConsole code
    code = "(cond_sample 1 1)"
    debugConsole code
