<template>
  <view class="content">
    <!-- <image class="logo" src="/static/logo.png"></image> -->
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <view class="mian">
      <!-- 信息 -->
      <view class="form-group">
        <label for="userId" class="bmd-label-floating">用户ID</label>
        <input
          type="text"
          class="form-control"
          name="userId"
          id="userId"
          :value="user_id"
        />
      </view>
      <view class="form-group bmd-form-group">
        <label for="roomId" class="bmd-label-floating">房间号</label>
        <input
          type="text"
          class="form-control"
          name="roomId"
          id="roomId"
          :value="room"
        />
      </view>
      <button type="primary" @click="joinFn">加入房间</button>
      <br />
      <button type="primary" @click="leaveFn">离开房间</button>
      <br />
      <!-- <button type="primary" @click="startFn">开始录制</button>
      <br />
      <button type="primary" @click="stopFn">停止录制</button> -->
      <br />
      <!-- <button type="primary" @click="endFn">下载</button> -->
    </view>
    <!-- 视频展示 -->
    <view class="video-grid" id="video_grid">
      <!-- 本地流视频 -->
      <view id="local_stream" class="video-placeholder">
        <view id="local_video_info" class="video-info"></view>
      </view>
    </view>
  </view>
</template>
<script>
import genTestUserSig from '../../utils/GenerateTestUserSig'
import { RtcClient, TRTC } from '../../utils/rtc-client'
const user_id = 'user_' + parseInt(Math.random() * 100000000) //随机用户ID
const room_id = 889988 //随机房间号

const { sdkAppId, userSig } = genTestUserSig(user_id)
let rtc = null
export default {
  data() {
    return {
      user_id,
      room: room_id,
      title: '视频直播'
    }
  },
  onLoad() {},
  methods: {
    joinFn() {
      //加入房间
      rtc = new RtcClient({
        userId: user_id,
        roomId: room_id,
        sdkAppId,
        userSig
      })
      rtc.join()
      // this.getCamerasFn();
      // this.getMicrophonesFn();
      // console.log(rtc);
    },

    //离开房间
    leaveFn() {
      if (!rtc) {
        alert('请先加入房间')
        return
      }
      rtc.leave()
      rtc = null
    }

    // 获取摄像头信息
    // getCamerasFn() {
    //   TRTC.getCameras()
    //     .then(devices => {
    //       console.log(devices, '摄像头信息')
    //     })
    //     .catch(err => {
    //       console.log(err)
    //     })
    // },
    // // 获取话筒设备
    // getMicrophonesFn() {
    //   TRTC.getMicrophones()
    //     .then(devices => {
    //       console.log(devices, '话筒信息')
    //     })
    //     .catch(err => {
    //       console.log(err)
    //     })
    // }
  }
}
</script>

<style>
.content {
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.video-grid {
  width: 100vw;
  display: grid;
  grid-template-columns: repeat(1, 100vw);
  grid-template-rows: 160px 160px;
  /* margin-left: 25px;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: auto; */
}

#local_stream {
  position: relative;
}

#local_video_info {
  position: absolute;
}

.video-view,
#local_stream,
#local_video_info {
  width: 240px;
  height: 160px;
  /* width: 480px;
  height: 320px; */
}

/* .video-grid:nth-child(2) {
  background: yellow;
} */
</style>
