// 提示弹窗
function toast(obj = {}) {
  let {
    title = '标题',
    icon = 'none', // success  loading none
    image = '', // 自定义图标的本地路径
    mask = true, // 是否显示透明蒙层，防止触摸穿透 默认:是
    duration = obj.time || 1500, // 提示的延迟时间 单位毫秒
    position = 'center', // 提示文本位置 top center bottom
    success = () => {},
    fail = () => {},
    complete = () => {}
  } = obj
  uni.showToast({
    title,
    icon,
    image,
    mask,
    duration,
    position,
    success,
    fail,
    complete
  })
}
function hideToast() {
  uni.hideToast()
}
module.exports = {
  toast,
  hideToast,
  showToast: toast
}
