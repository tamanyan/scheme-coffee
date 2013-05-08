$ ->
    console = $(".console")
    controller = console.console {
        promptLabel: "scheme>"
        commandHandle: (line) ->
            if line
                return [{msg:"you typed " + line,className:"jquery-console-message-value"}]
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
