/* eslint-disable */
/* eslint-disable require-jsdoc */
import $ from '../js/jquery-3.2.1.min'
import TRTC from '../js/trtc'

window.jQuery = $

// 向#video_grid push元素
function pushVideoView(id) {
  if (!$('#' + id)[0]) {
    $('<div/>', {
      id,
      class: 'video-view'
    }).appendTo('#video_grid')
  }
  console.log(`建立视频id${id}`, '-------------------------')
}

function removeView(id) {
  if ($('#' + id)[0]) {
    $('#' + id).remove()
  }
}

// populate camera options
TRTC.getCameras().then(devices => {
  devices.forEach(device => {
    $('<option/>', {
      value: device.deviceId,
      text: device.label
    }).appendTo('#cameraId')
  })
})

// populate microphone options
TRTC.getMicrophones().then(devices => {
  devices.forEach(device => {
    $('<option/>', {
      value: device.deviceId,
      text: device.label
    }).appendTo('#microphoneId')
  })
})

function getCameraId() {
  const selector = document.getElementById('cameraId')
  const cameraId = selector[selector.selectedIndex].value
  console.log('selected cameraId: ' + cameraId)
  return cameraId
}

function getMicrophoneId() {
  const selector = document.getElementById('microphoneId')
  const microphoneId = selector[selector.selectedIndex].value
  console.log('selected microphoneId: ' + microphoneId)
  return microphoneId
}

// fix jquery touchstart event warn in chrome M76
jQuery.event.special.touchstart = {
  setup: function(_, ns, handle) {
    if (ns.includes('noPreventDefault')) {
      this.addEventListener('touchstart', handle, { passive: false })
    } else {
      this.addEventListener('touchstart', handle, { passive: true })
    }
  }
}
jQuery.event.special.touchmove = {
  setup: function(_, ns, handle) {
    if (ns.includes('noPreventDefault')) {
      this.addEventListener('touchmove', handle, { passive: false })
    } else {
      this.addEventListener('touchmove', handle, { passive: true })
    }
  }
}

module.exports = {
  pushVideoView,
  removeView,
  getCameraId,
  getMicrophoneId
}
