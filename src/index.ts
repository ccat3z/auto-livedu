import { exportGlobal } from './common'
import { findAllChapters, findVideosOfChapter, getPlayingChapter, gotoNextChapter } from './utils'

for (let [name, obj] of Object.entries({
  findAllChapters,
  findVideosOfChapter,
  getPlayingChapter,
  gotoNextChapter
})) {
  exportGlobal(name, obj)
}