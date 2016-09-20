var inflate = require('pako/lib/inflate').inflate
var decode = require('urlsafe-base64').decode

var userhtml = document.getElementById('userhtml')

// Load all external before evaluating inline
var loadingScripts = []
var inlineScripts = []
var loadedCount = 0

function unb64ify (b64) {
  var ascii = decode(b64)
  var text = inflate(ascii, {to: 'string'})
  return text
}

function evalInline (script) {
  try {
    window.eval(script)
  } catch (error) {
    console.warn('UserHTML error!', error, script)
  }
}

function onload (event) {
  loadedCount++
  if (loadedCount === loadingScripts.length) {
    inlineScripts.forEach(evalInline)
  }
}

function loadExternal (src) {
   var head = document.querySelector('head')
   var script = document.createElement('script')
   script.type = 'text/javascript'
   script.onload = onload
   script.src = src
   head.appendChild(script)
}

function setHtml (html) {
  userhtml.innerHTML = html
  var scripts = userhtml.querySelectorAll('script')
  for (var i = 0, len = scripts.length; i < len; i++) {
    var script = scripts[i]
    if (script.src) {
      loadingScripts.push(script.src)
    }
    else if (script.textContent) {
      inlineScripts.push(script.textContent)
    }
  }
  if (loadingScripts.length > 0) {
    loadingScripts.forEach(loadExternal)
  }
  else if (loadingScripts.length === 0) {
    inlineScripts.forEach(evalInline)
  }
}

var b64 = window.location.href.split('?g=')[1]
if (b64) {
  var html = unb64ify(b64)
  setHtml(html)
} else {
  setHtml('This page intentionally (?) left blank.')
}
