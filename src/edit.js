var deflate = require('pako/lib/deflate').deflate
var encode = require('urlsafe-base64').encode

var RUNNER = 'https://the-grid.github.io/ed-userhtml/?g='
var MAX_URL_LENGTH = 2000

var cachedBlock = null
var textarea = document.getElementById('textarea')
var status = document.getElementById('status')
var cachedHeight = 0
var hideStatusTimeout = null

function showStatus (text) {
  if (hideStatusTimeout) {
    window.clearTimeout(hideStatusTimeout)
    hideStatusTimeout = null
  }
  status.textContent = text
}

function hideStatus () {
  status.textContent = ''
}

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
  if (!block) return
  if (!block.metadata) {
    block.metadata = {}
  }
  block.metadata.widget = 'userhtml'
  cachedBlock = block
  if (block.hasOwnProperty('text')) {
    textarea.value = block.text
  }
  resize()
}

function fromEdit (event) {
  if (!cachedBlock || !cachedBlock.metadata) return

  showStatus('saving...')

  var text = event.target.value
  var b64 = b64ify(text)

  cachedBlock.text = text
  var url = RUNNER + b64
  if (url.length > MAX_URL_LENGTH) {
    showStatus('error: input too long')
    return
  }
  cachedBlock.metadata.isBasedOnUrl = url
  cachedBlock.html = '<iframe src="'+url+'"></iframe>'

  hideStatusTimeout = setTimeout(hideStatus, 1000)

  send('changed', cachedBlock)
  resize()
}
textarea.addEventListener('input', fromEdit)

function resize () {
  textarea.style.height = 'auto'
  var height = textarea.scrollHeight
  // Padding is 2px, so minus 4
  textarea.style.height = (height - 4) + 'px'
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

