const path = require('path')
const fs = require('fs')
/**
 * 将src中的数据copy到dist中，并保留dist的结构
 * @param {String} src
 * @param {String} dist
 */
const copyValue = (src, dist) => {
  if (!src || typeof src !== 'object' || typeof dist !== 'object') {
    return
  }

  let keys = Object.keys(dist)
  if (keys && keys.length > 0 && isNaN(keys[0])) {
    keys.forEach(key => {
      let value = dist[key]
      let srcVal = src[key]

      // 判断是不是对象，如果是则继续遍历，不是则开始赋值或忽略
      if (
        value !== undefined &&
        typeof value === 'object' &&
        srcVal &&
        typeof srcVal === 'object' &&
        srcVal[0] === undefined
      ) {
        copyValue(srcVal, value)
      } else if (
        value !== undefined &&
        srcVal &&
        typeof value === typeof srcVal
      ) {
        // 如果源数据存在，并且类型一致，则开始赋值
        dist[key] = src[key]
      }
    })
  }
}

module.exports = {
  /**
   * 查找(如果没有找到则创建)
   */
  decideFolder: (filename, dirList = []) => {
    let mode = '0775'
    if (dirList.length > 0) {
      dirList.forEach(obj => {
        let PATH = path.join(filename, obj)
        create(PATH)
      })
    } else {
      create(filename)
    }
    function create(PATH) {
      let arr = PATH.split(path.sep)
      if (arr[0] === '.') arr.shift()
      if (arr[0] === '..') arr.splice(0, 2, arr[0] + '/' + arr[1])
      inner(arr.shift(), arr)
    }
    function inner(cur, arr) {
      if (!fs.existsSync(cur)) {
        try {
          if (cur) fs.mkdirSync(cur, mode)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(err)
        }
      }
      if (arr.length) inner(`${cur}/${arr.shift()}`, arr)
    }
  },
  copyValue
}
