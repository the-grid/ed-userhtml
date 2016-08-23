var inflate = require('pako/lib/inflate').inflate
var decode = require('urlsafe-base64').decode

var userhtml = document.getElementById('userhtml')

function unb64ify (b64) {
  var ascii = decode(b64)
  var text = inflate(ascii, {to: 'string'})
  return text
}

function evil (script) {
  if (script.textContent) {
    try {
      window.eval(script.textContent)
    } catch (error) {
      console.warn('UserHTML error!', error)
    }
    return
  }
  if (script.src) {
    // TODO
  }
}

function setHtml (html) {
  userhtml.innerHTML = html
  var scripts = userhtml.querySelectorAll('script')
  for (var i = 0, len = scripts.length; i < len; i++) {
    var script = scripts[i]
    evil(script)
  }
}

var b64 = window.location.href.split('?g=')[1]
if (b64) {
  var html = unb64ify(b64)
  setHtml(html)
} else {
  setHtml('This page intentionally (?) left blank.')
}
