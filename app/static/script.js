Array.prototype.includes = function(value) {
  return this.indexOf(value) !== -1
}
String.prototype.characterize = function(callback) {
  var characters = this.split('');
  var options = {};

  for (var i = 0; i < this.length; i++) {
    options = callback(characters[i]);
  }
}



var $keywords = ['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
var $functions = ['abs', 'dict', 'help', 'min', 'setattr', 'all', 'dir', 'hex', 'next', 'slice', 'any', 'divmod', 'id', 'object', 'sorted', 'ascii', 'enumerate', 'input', 'oct', 'staticmethod', 'bin', 'eval', 'int', 'open', 'str', 'bool', 'exec', 'isinstance', 'ord', 'sum', 'bytearray', 'filter', 'issubclass', 'pow', 'super', 'bytes', 'float', 'iter', 'print', 'tuple', 'callable', 'format', 'len', 'property', 'type', 'chr', 'frozenset', 'list', 'range', 'vars', 'classmethod', 'getattr', 'locals', 'repr', 'zip', 'compile', 'globals', 'map', 'reversed', '_import_', 'complex', 'hasattr', 'max', 'round', 'delattr', 'hash', 'memoryview', 'set'];

window.addEventListener('load', function() {
  var $textarea;
  var $highlight;
  $textarea = document.getElementById('textarea-input');
  $highlight = document.getElementById('highlight-area');

  var code = `def main:
  columns_long_list = ['repo', 'path', 'url', 'code', 
                       'code_tokens', 'docstring', 'docstring_tokens', 
                       'language', 'partition']

  columns_short_list = ['code_tokens', 'docstring_tokens', 
                        'language', 'partition']

  def jsonl_list_to_dataframe(file_list, columns=columns_long_list):
      
      return pd.concat([pd.read_json(f, 
                                     orient='records', 
                                     compression='gzip',
                                     lines=True)[columns] 
                        for f in file_list], sort=False)

  from pathlib import Path

  python_files = sorted(Path('./python/').glob('**/*.gz'))
  pydf = jsonl_list_to_dataframe(python_files)


  train_df = pd.DataFrame(pydf[pydf['partition']=='train'],columns=['code','docstring'])
  train_df.to_csv('train.csv',index=False)
  valid_df = pd.DataFrame(pydf[pydf['partition']=='valid'],columns=['code','docstring'])
  valid_df.to_csv('valid.csv',index=False)
  test_df = pd.DataFrame(pydf[pydf['partition']=='test'],columns=['code','docstring'])
  test_df.to_csv('test.csv',index=False)
`;

  var triggerHighlight = function() {
    var tokens = tokenize($textarea.value);
    $highlight.innerHTML = '';
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      var span = document.createElement('span');
      span.className = 'highlight-' + token.type;
      span.innerText = token.value;
      $highlight.appendChild(span);
    }
    var lines = $textarea.value.split('\n');
    if (lines[lines.length - 1] === '') {
      var br = document.createElement('br');
      $highlight.appendChild(br);
    }
    $highlight.scrollTop = $textarea.scrollTop;
  };

  $textarea.addEventListener('input', triggerHighlight);
  $textarea.addEventListener('scroll', function(event) {
    $highlight.scrollTop = this.scrollTop;
  });

  var tabCode = 9;
  var leftParenthesisCode = 40;
  $textarea.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
      case tabCode:
        event.preventDefault();
        this.value += '    ';
        break;
    }
  });

  $textarea.textContent = code;
  $highlight.textContent = code;
  triggerHighlight()
});

async function get_content(){
    var $textarea_new = document.getElementById('textarea-input');
    var $highlight_new = document.getElementById('highlight-area');

    var triggerHighlight = function() {
      var $textarea_new = document.getElementById('textarea-input');
      var $highlight_new = document.getElementById('highlight-area');
      var tokens = tokenize($textarea_new.value);
      $highlight_new.innerHTML = '';
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var span = document.createElement('span');
        span.className = 'highlight-' + token.type;
        span.innerText = token.value;
        $highlight_new.appendChild(span);
      }
      var lines = $textarea_new.value.split('\n');
      if (lines[lines.length - 1] === '') {
        var br = document.createElement('br');
        $highlight_new.appendChild(br);
      }
      $highlight_new.scrollTop = $textarea_new.scrollTop;
  };

  var payload = $textarea_new.value;
  var options = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({code:payload})
  }
  $textarea_new.value = "Loading...";
  $highlight_new.value = "Loading...";
  triggerHighlight()

  var response = await fetch("http://localhost:"+process.env.$CDSW_APP_PORT+"/result", options)
  response = await response.json()
  console.log(options.body)
  console.log(response)
  $textarea_new.addEventListener('input', triggerHighlight);
  $textarea_new.addEventListener('scroll', function(event) {
    $highlight_new.scrollTop = this.scrollTop;
  });

  var tabCode = 9;
  var leftParenthesisCode = 40;
  $textarea_new.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
      case tabCode:
        event.preventDefault();
        this.value += '    ';
        break;
    }
  });

  $textarea_new.value = response.res;
  $highlight_new.value = response.res;
  triggerHighlight()
}

function tokenize(inputString) {
  var tokens = [];
  var lexedValue = '';
  var currentToken = null;

  function newSpaceToken() {
    currentToken = { type: 'space', value: ' ' };
    lexedValue = '';
  }

  function parseLexedValueToToken() {
    if (lexedValue) {
      if ($keywords.includes(lexedValue)) {
        tokens.push({ type: 'keyword', value: lexedValue })
      } else if ($functions.includes(lexedValue)) {
        tokens.push({ type: 'function', value: lexedValue })
      } else if (lexedValue !== '') {
        if (isNaN(lexedValue)) {
          tokens.push({ type: 'default', value: lexedValue })
        } else {
          tokens.push({ type: 'number', value: lexedValue })
        }
      }
      lexedValue = '';
    }
  }

  function lex(char) {
    if (char !== ' ' && currentToken && currentToken.type === 'space' ) {
      tokens.push(currentToken);
      lexedValue = '';
      currentToken = null;
    }

    switch(char) {
      case ' ':
        if ($keywords.includes(lexedValue)) {
          tokens.push({ type: 'keyword', value: lexedValue })
          newSpaceToken();
        } else if ($functions.includes(lexedValue)) {
          tokens.push({ type: 'function', value: lexedValue })
          newSpaceToken();
        } else if (lexedValue !== '') {
          if (isNaN(lexedValue)) {
            tokens.push({ type: 'default', value: lexedValue })
          } else {
            tokens.push({ type: 'number', value: lexedValue })
          }
          newSpaceToken();
        } else if (currentToken) {
          currentToken.value += ' '
        } else {
          newSpaceToken();
        }
        break;
      
      case '"':
      case '\'':
        if (currentToken) {
          if (currentToken.type === 'string') {
            if (currentToken.value[0] === char) {
              currentToken.value += char
              tokens.push(currentToken)
              currentToken = null;
            } else {
              currentToken.value += char
            }
          } else if (currentToken.type === 'comment') {
            currentToken.value += char
          }
        } else {
          if (lexedValue) {
            tokens.push({ type: 'default', value: lexedValue });
            lexedValue = '';
          }
          currentToken = { type: 'string', value: char }
        }
        break;

      case '=':
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
      case '&':
      case '|':
      case '>':
      case '<':
      case '!':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'operator', value: char })
        }
        break;

      case '#':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          currentToken = { type: 'comment', value: char }
        }
        break;

      case ':':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'colon', value: char });
        }
        break;
      
      case '(':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'left-parentheses', value: char });
        }
        break;

      case ')':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'right-parentheses', value: char });
        }
        break;

      case '[':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'left-bracket', value: char });
        }
        break;

      case ']':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'right-bracket', value: char });
        }
        break;

      case ',':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'comma', value: char });
        }
        break;

      case '\n':
        if (currentToken) {
          switch(currentToken.type) {
            case 'string':
            case 'comment':
              tokens.push(currentToken)
              currentToken = null;
              break;
            default:
          }
        } else {
          parseLexedValueToToken();
          lexedValue = '';
        }
        tokens.push({ type: 'newline', value: '\n' });
        break;
        
      case ';':
        if (currentToken) {
          currentToken.value += char;
        } else {
          parseLexedValueToToken();
          tokens.push({ type: 'semicolon', value: char });
        }
        break;

      default:
        if (currentToken) {
          currentToken.value += char;
        } else {
          lexedValue += char
        }

        break;
    }
  }

  /* Lexing the input codes */
  inputString.characterize(lex);

  /* Rest of the lexed value or token which is unfinished */
  parseLexedValueToToken();

  if (currentToken) tokens.push(currentToken)

  /* Secondary Parse to Match Some Patterns */
  var isFunctionArgumentScope = false;
  var tokenCount = tokens.length;
  for (var i = 0; i < tokenCount; i++) {
    var token = tokens[i];
    if (token.type === 'keyword' && (token.value === 'def' || token.value === 'class')) {
      var peekToken = tokens[i + 2]
      if (peekToken && peekToken.type === 'default') peekToken.type = 'function-name';
    } else if (token.type === 'default' && isFunctionArgumentScope) {
      token.type = 'argument';
    } else if (token.type === 'left-parentheses') {
      var peekToken = tokens[i - 1]
      if (peekToken && peekToken.type === 'function-name') isFunctionArgumentScope = true;
    } else if (token.type === 'right-parentheses') {
      isFunctionArgumentScope = false;
    }
  }

  return tokens
}
