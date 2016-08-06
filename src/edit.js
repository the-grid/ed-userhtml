var deflate = require('pako/lib/deflate').deflate
var encode = require('urlsafe-base64').encode
var RUNNER = 'https://the-grid.github.io/ed-userhtml/?g='

var cachedBlock = null
var textarea = document.getElementById('textarea')
var status = document.getElementById('status')

var cachedHeight = 0

function b64ify (text) {
  var zipped = deflate(text, {to: 'string'})
  var ascii = window.btoa(zipped)
  var b64 = encode(ascii)
  return b64
}

function send (topic, payload) {
  if (!cachedBlock || !cachedBlock.id) return
  window.parent.postMessage(
    { topic: topic
    , id: cachedBlock.id
    , payload: payload
    }
  , '*'
  )
}

function toEdit (block) {
  cachedBlock = block
  if (block && block.hasOwnProperty('metadata') && block.metadata.hasOwnProperty('text')) {
    textarea.value = block.metadata.text
  }
  resize()
}

function fromEdit (event) {
  if (!cachedBlock || !cachedBlock.metadata) return

  var text = event.target.value
  var b64 = b64ify(text)

  cachedBlock.metadata.text = text
  cachedBlock.html = RUNNER + b64

  send('changed', cachedBlock)
  resize()
}
textarea.addEventListener('input', fromEdit)

function resize () {
  textarea.style.height = 'auto'
  var height = textarea.scrollHeight
  textarea.style.height = (height - 4) + 'px'
  console.log(height, cachedHeight)
  if (height !== cachedHeight) {
    cachedHeight = height
    send('height', height)
  }
}

window.addEventListener('message', function (message) {
  switch (message.data.topic) {
    case 'setblock':
      var block = message.data.payload
      toEdit(block)
      break
    case 'focus':
      textarea.focus()
      break
  }
})

