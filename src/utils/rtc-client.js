/*
 * @Descripttion:
 * @version:
 * @Author: wecy-chen
 * @Date: 2020-03-13 17:57:16
 * @LastEditors: wecy-chen
 * @LastEditTime: 2020-03-16 16:55:35
 */
/* eslint-disable */
import TRTC from '../js/trtc'

import { toast } from './utils'

import { pushVideoView, removeView } from './jq-dom'

/** trtc视频封装 */
class RtcClient {
  constructor(options) {
    this.sdkAppId_ = options.sdkAppId //  腾讯云申请的 sdkAppId
    this.userId_ = options.userId // 用户 ID  (user_45109068)
    this.userSig_ = options.userSig // 用户签名
    this.roomId_ = options.roomId // 房间号

    this.isJoined_ = false // 加入房间状态
    this.isPublished_ = false // 推流状态
    this.localStream_ = null // 本地音视频流对象
    this.remoteStreams_ = [] // 远端音视频流对象

    this.mediaRecorder_ = null //远程录制音视频对象

    // 浏览器版本支持状态
    TRTC.checkSystemRequirements().then(result => {
      if (!result) {
        toast({
          title: '您的浏览器与TRTC不兼容！请下载Chrome M72+'
        })
      }
    })
  }
  //加入房间
  async join() {
    if (this.isJoined_) {
      toast({
        title: '您已加入了房间了'
      })
      return
    }
    //1.创建客户端对象
    this.client_ = TRTC.createClient({
      mode: 'videoCall', // 实时通话模式
      sdkAppId: this.sdkAppId_,
      userId: this.userId_,
      userSig: this.userSig_
    })
    // 2.处理 监听 client客户端事件
    this.handleEvents()

    //3 采集摄像头和麦克风视频流 (创建本地流)
    await this.createLocalStream()

    //4.建立角色,加入房间
    try {
      //  roomId：房间 ID   role：用户角色  anchor主播   audience观众(只能接收)
      await this.client_.join({ roomId: this.roomId_ })
      toast({
        title: '进房成功'
      })
      console.log('进房成功！')
      this.isJoined_ = true
    } catch (error) {
      console.error('failed to join room because: ' + error)
      alert(
        '进房失败原因：' +
        error +
        '\r\n\r\n请确保您的网络连接是正常的，您可以先体验一下我们的Demo以确保网络连接是正常的：' +
        '\r\n https://trtc-1252463788.file.myqcloud.com/web/demo/official-demo/index.html ' + //官网demo
          '\r\n\r\n另外，请确保您的账号信息是正确的。' +
          '\r\n请打开链接：https://cloud.tencent.com/document/product/647/34342 查询详细错误信息！' //错误码
      )
      toast({
        title: '进房失败'
      })
      return
    }
    // 5.视频播放器状态
    this.localStream_.on('player-state-changed', event => {
      console.log(
        `视频播放器local stream ${event.type} player is ${event.state}`
      )
      // 正在播放中状态
      if (event.type === 'video' && event.state === 'PLAYING') {
        // dismiss the remote user UI placeholder
        // 停止播放状态
      } else if (event.type === 'video' && event.state === 'STOPPPED') {
        // show the remote user UI placeholder
      }
    })
    // 在id为 ‘local_stream’ 的 div 容器上播放本地音视频
    this.localStream_.play('local_stream')
    // publish local stream by default after join the room
    await this.publish()
    // Toast.notify("发布本地流成功！");
  }

  // 离开
  async leave() {
    if (!this.isJoined_) {
      console.warn('leave() - leave without join()d observed')
      alert('请先加入房间！')
      return
    }
    if (this.isPublished_) {
      // ensure the local stream has been unpublished before leaving.
      await this.unpublish(true)
    }

    try {
      // leave the room
      await this.client_.leave()
      // Toast.notify("退房成功！");
      this.isJoined_ = false
    } catch (error) {
      console.error('failed to leave the room because ' + error)
      location.reload()
    } finally {
      // 停止本地流，关闭本地流内部的音视频播放器
      this.localStream_.stop()
      // 关闭本地流，释放摄像头和麦克风访问权限
      this.localStream_.close()
      this.localStream_ = null
    }
  }

  // 推送,发布本地流
  async publish() {
    if (!this.isJoined_) {
      alert('请先加入房间再点击开始推流！')
      console.warn('publish() - please join() firstly')
      return
    }
    if (this.isPublished_) {
      console.warn('duplicate RtcClient.publish() observed')
      alert('当前正在推流！')
      return
    }
    try {
      // 发布本地流
      await this.client_.publish(this.localStream_)
      // Toast.info("发布本地流成功！");
      this.isPublished_ = true
    } catch (error) {
      console.error('failed to publish local stream ' + error)
      //alert('发布本地流失败！')
      alert('本地视频解析错误')
      this.isPublished_ = false
    }
  }

  // 停止推流
  async unpublish(isLeaving) {
    if (!this.isJoined_) {
      console.warn('unpublish() - please join() firstly')
      alert('请先加入房间再停止推流！')
      return
    }
    if (!this.isPublished_) {
      console.warn('RtcClient.unpublish() called but not published yet')
      alert('当前尚未发布本地流！')
      return
    }
    try {
      // 停止发布本地流
      await this.client_.unpublish(this.localStream_)
      this.isPublished_ = false
      // Toast.info("停止发布本地流成功！");
    } catch (error) {
      console.error('failed to unpublish local stream because ' + error)
      alert('停止发布本地流失败！')
      if (!isLeaving) {
        console.warn('leaving the room because unpublish failure observed')
        alert('停止发布本地流失败，退出房间！')
        this.leave()
      }
    }
  }

  // 创建本地流音视频
  async createLocalStream(options = {}) {
    let { audio = true, video = true } = options
    this.localStream_ = TRTC.createStream({
      audio, // 采集麦克风
      video, // 采集摄像头
      userId: this.userId_
      // cameraId: getCameraId(),
      // microphoneId: getMicrophoneId()
    })

    // navigator.mediaDevices
    //   .getUserMedia({ audio: true, video: true })
    //   .then(stream => {
    //     console.log(stream, '设备')
    //   })

    // 设置视频分辨率帧率和码率
    // https://trtc-1252463788.file.myqcloud.com/web/docs/LocalStream.html#setVideoProfile
    /** 120p  160 x 120  15 200
    /** 180p 	320 x 180  15 350
    /** 240p 	320 x 240  15 400
    /** 360p	640 x 360  15 800
    /** 480p 	640 x 480  15 900
     * .....
     * {
        width: 360, // 视频宽度
        height: 360, // 视频高度
        frameRate: 10, // 帧率
        bitrate: 400 // 比特率 kbps
      }
     *
     */
    this.localStream_.setVideoProfile('240p')
    await this.localStream_
      .initialize()
      .catch(err => {
        let title = ''
        console.log(err, '设备错误')
        switch (err.name) {
          case 'NotFoundError':
            title = '没有找到可访问摄像头,麦克风'
            break
          case 'NotAllowedError':
            title = '浏览器访问摄像头/麦克风的请求已拒绝'
            break
          case 'NotReadableError':
            title = '浏览器或页面发生错误,设备无法被访问'
            break
          case 'OverConstrainedError':
            title = 'cameraId/microphoneId 参数的值无效'
            break
          case 'AbortError':
            title = '未知原因导致设备无法被使用'
            break
          default:
            break
        }
        if (title) {
          toast({
            title
          })
        }
      })
      .then(_ => {
        console.log('采集麦克风,摄像头成功')
        // toast({
        //   title: '采集麦克风,摄像头成功'
        // })
      })
  }
  //事件处理
  handleEvents() {
    // 处理 client 错误事件，错误均为不可恢复错误，建议提示用户后刷新页面
    this.client_.on('error', err => {
      console.error(err)
      alert(err)
      // location.reload();
    })
    // 处理用户被踢事件，通常是因为房间内有同名用户引起，这种问题一般是应用层逻辑错误引起的
    // 应用层请尽量使用不同用户ID进房
    this.client_.on('client-banned', err => {
      console.error('client has been banned for ' + err)
      alert('用户被踢出房间！')
      // location.reload();
    })
    // 远端用户进房通知 - 仅限主动推流用户
    this.client_.on('peer-join', evt => {
      const userId = evt.userId
      console.log('peer-join ' + userId)
      toast({
        title: `远端用户进房-${userId}`
      })
    })
    // 远端用户退房通知 - 仅限主动推流用户
    this.client_.on('peer-leave', evt => {
      const userId = evt.userId
      console.log('peer-leave ' + userId)
      toast({
        title: `远端用户退房-${userId}`
      })
    })

    // 处理远端流增加事件  (加入屏幕)
    this.client_.on('stream-added', evt => {
      const remoteStream = evt.stream
      const id = remoteStream.getId()
      const userId = remoteStream.getUserId()
      console.log(
        `remote stream added: [${userId}] ID: ${id} type: ${remoteStream.getType()}`
      )
      toast({
        title: `远端流增加-${userId}`
      })
      console.log('subscribe to this remote stream')
      // 远端流默认已订阅所有音视频，此处可指定只订阅音频或者音视频，不能仅订阅视频。
      // 如果不想观看该路远端流，可调用 this.client_.unsubscribe(remoteStream) 取消订阅
      this.client_.subscribe(remoteStream)
    })

    // 远端流订阅成功事件 (屏幕共享)
    this.client_.on('stream-subscribed', evt => {
      const remoteStream = evt.stream
      const id = remoteStream.getId()
      //加入视频
      this.remoteStreams_.push(remoteStream)
      // 加入并在指定的 div 容器上播放音视频
      pushVideoView(id) //添加Dom
      remoteStream.play(id) // 播放
      console.log('stream-subscribed ID: ', id)
      toast({
        title: `远端流订阅成功-${remoteStream.getUserId()}`
      })
    })

    // 处理远端流被删除事件  (退出屏幕)
    this.client_.on('stream-removed', evt => {
      const remoteStream = evt.stream
      const id = remoteStream.getId()
      // 关闭远端流内部的音视频播放器
      remoteStream.stop()
      this.remoteStreams_ = this.remoteStreams_.filter(stream => {
        return stream.getId() !== id
      })
      // 移除视频显示
      removeView(id)
      console.log(`stream-removed ID: ${id}  type: ${remoteStream.getType()}`)
      toast({
        title: `远端流删除-${remoteStream.getUserId()}`
      })
    })

    // 处理远端流更新事件，在音视频通话过程中，远端流音频或视频可能会有更新
    this.client_.on('stream-updated', evt => {
      const remoteStream = evt.stream
      console.log(
        'type: ' +
          remoteStream.getType() +
          ' stream-updated hasAudio: ' +
          remoteStream.hasAudio() +
          ' hasVideo: ' +
          remoteStream.hasVideo()
      )
      toast({
        title: '远端流更新!'
      })
    })
    // 远端流音频或视频mute状态通知
    //禁麦
    this.client_.on('mute-audio', evt => {
      console.log(evt.userId + ' mute audio')
    })
    //取消禁麦 (正常)
    this.client_.on('unmute-audio', evt => {
      console.log(evt.userId + ' unmute audio')
    })
    //禁播
    this.client_.on('mute-video', evt => {
      console.log(evt.userId + ' mute video')
    })
    // 取消禁播(正常)
    this.client_.on('unmute-video', evt => {
      console.log(evt.userId + ' unmute video')
    })
    // 信令通道连接状态通知 (音视频状态更新)
    this.client_.on('connection-state-changed', evt => {
      console.log(
        `RtcClient state changed to ${evt.state} from ${evt.prevState}`
      )
    })
  }
  // 远端流视频录制
  // async videoStartRecord() {
  //   /**测试录制 */
  //   const stream = this.remoteStreams_[0].mediaStream_
  //   console.log(stream, '1')
  //   const mediaRecorder = new MediaRecorder(stream, {
  //     audioBitsPerSecond: 128000, // 音频码率
  //     videoBitsPerSecond: 100000, // 视频码率
  //     mimeType: 'video/webm;codecs=h264' // 编码格式
  //   })
  //   console.log(mediaRecorder, '2')
  //   return
  //   console.log(this.remoteStreams_[0], this.mediaRecorder_, '视频录制')
  //   /**测试 */
  //   this.mediaRecorder_.start()
  //   this.videoDownload()
  //   console.log('开始采集录制')
  // }
  // // 远端流停止录制,结束
  // videoStopRecord() {
  //   this.mediaRecorder_.stop()
  //   console.log('停止采集录制')
  // }
  // // 下载远端流视频
  // videoDownload() {
  //   this.mediaRecorder_.ondataavailable = e => {
  //     const blob = new Blob([e.data], { type: 'video/mp4' })
  //     const a = document.createElement('a')
  //     a.href = URL.createObjectURL(blob)
  //     a.download = `test.mp4`
  //     a.click()
  //   }
  // }
}
module.exports = {
  RtcClient,
  TRTC
}
