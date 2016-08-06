var deflate = require('pako/lib/deflate').deflate
var encode = require('urlsafe-base64').encode

function b64ify (text) {
  var zipped = deflate(text, {to: 'string'})
  var ascii = window.btoa(zipped)
  var b64 = encode(ascii)
  return b64
} 

console.log('edit', deflate)

var block = {}
var userhtml = document.getElementById('userhtml')
var status = document.getElementById('status')

function toEdit () {
  if (block && block.hasOwnProperty('metadata') && block.metadata.hasOwnProperty('text')) {
    userhtml.value = block.metadata.text
  }
}

function fromEdit (event) {
  var text = event.target.value
  var b64 = b64ify(text)

  block.metadata.text = text
  block.html = b64

  // status.textContent = 'Changed...'
  console.log(block)
}
userhtml.addEventListener('input', fromEdit)

window.addEventListener('message', function (message) {
  switch (message.data.topic) {
    case 'setblock':
      block = message.data.payload
      toEdit()
      break
    case 'focus':
      userhtml.focus()
      break
  }
})
