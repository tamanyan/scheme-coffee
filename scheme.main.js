$(function() {
  var code, console, controller, debugConsole, scheme;
  console = $(".console");
  scheme = new Scheme;
  controller = console.console({
    promptLabel: "scheme>",
    commandHandle: function(line) {
      var ret;
      if (line) {
        try {
          ret = scheme.interpret(line);
          ret = [
            {
              msg: ret,
              className: "jquery-console-message-value"
            }
          ];
        } catch (error) {
          ret = [
            {
              msg: error.message,
              className: "jquery-console-message-error"
            }
          ];
        }
        return ret;
      } else {
        return [
          {
            className: "jquery-console-message-value"
          }
        ];
      }
    },
    keywords: ["define", "let", "cond"],
    cols: 40,
    completeHandle: function(prefix) {
      var keyword, keywords, ret, _i, _len;
      keywords = this.keywords;
      ret = [];
      for (_i = 0, _len = keywords.length; _i < _len; _i++) {
        keyword = keywords[_i];
        if (keyword.lastIndexOf(prefix, 0) === 0) {
          ret.push(keyword.substring(prefix.length));
        }
      }
      return ret;
    }
  });
  debugConsole = function(code) {
    log(code);
    return log(scheme.interpret(code));
  };
  log("*define test code");
  code = "(define (fact x)\n    (if (eq x 1)\n        1\n        (* x (fact (- x 1)))))";
  debugConsole(code);
  code = "(fact 4)";
  debugConsole(code);
  log("*lambda test code");
  code = "((lambda (x y) (* x y)) 4 2)";
  debugConsole(code);
  log("*cond test code");
  code = "(define (cond_sample x y)\n    (cond\n     ((and (>= x 0) (>= y 0)) #t)\n     (else #f)\n    )\n)";
  debugConsole(code);
  code = "(cond_sample 1 1)";
  return debugConsole(code);
});