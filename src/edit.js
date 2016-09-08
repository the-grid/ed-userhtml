var deflate = require('pako/lib/deflate').deflate
var encode = require('urlsafe-base64').encode

var RUNNER = 'https://the-grid.github.io/ed-userhtml/?g='
var MAX_URL_LENGTH = 2000

var cachedBlock = null
var textarea = document.getElementById('textarea')
var status = document.getElementById('status')
var heightInput = document.getElementById('height')
var cachedHeight = 0
var hideStatusTimeout = null
var height = 240

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
  if (block.text || block.metadata.text) {
    textarea.value = block.text || block.metadata.text
  }
  if (block.height || block.metadata.height) {
    heightInput.value = block.height || block.metadata.height
  }
  resize()
}

function fromEdit (event) {
  if (!cachedBlock || !cachedBlock.metadata) return

  showStatus('saving...')

  var text = textarea.value
  var height = parseInt(heightInput.value, 10)
  height = Math.min(5000, Math.max(1, height))
  var b64 = b64ify(text)

  cachedBlock.text = text
  cachedBlock.metadata.text = text
  cachedBlock.height = height
  cachedBlock.metadata.height = height

  var url = RUNNER + b64
  if (url.length > MAX_URL_LENGTH) {
    showStatus('error: input too long')
    return
  }
  cachedBlock.metadata.isBasedOnUrl = url
  cachedBlock.html = '<iframe src="'+url+'" height="'+height+'"></iframe>'

  hideStatusTimeout = setTimeout(hideStatus, 1000)

  send('changed', cachedBlock)
  resize()
}
textarea.addEventListener('input', fromEdit)
heightInput.addEventListener('input', fromEdit)

function resize () {
  textarea.style.height = 'auto'
  var height = textarea.scrollHeight
  textarea.style.height = height + 'px'
  height += 30
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

