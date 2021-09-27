import { exportGlobal, waitForKeyElements } from './common'
import { findAllChapters, findVideosOfChapter, getPlayingChapter, gotoNextChapter } from './utils'

const playVideo = (el: HTMLVideoElement): void => {
  el.muted = true  // See: https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#autoplay_availability
  el.parentElement.querySelector<HTMLAnchorElement>('div.video-img > a').click()
}

for (let [name, obj] of Object.entries({
  findAllChapters,
  findVideosOfChapter,
  getPlayingChapter,
  gotoNextChapter,
  playVideo
})) {
  exportGlobal(name, obj)
}

waitForKeyElements(
  () => document.querySelectorAll<HTMLIFrameElement>('iframe#zwshow'),
  (iframe) => {
    iframe.addEventListener('load', () => {
      let videos = Array.from(iframe.contentDocument.querySelectorAll<HTMLVideoElement>('video.myVideo'))

      // Goto next chapter if no video
      if (videos.length === 0) {
        console.log('No video found, goto next chapter')
        gotoNextChapter()
      }

      for (let [i, video] of videos.entries()) {
        video.addEventListener('ended', () => {
          setTimeout(() => {
            const nextVideo = videos[i + 1]

            if (nextVideo) {
              console.log('Play next video')
              playVideo(nextVideo)
            } else {
              // No video left
              console.log('Goto next chapter')
              gotoNextChapter()
            }
          })
        })
      }

      // Auto plat first video
      playVideo(videos[0])
    })
  }
)