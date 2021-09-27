import { exportGlobal } from './common'
import { findAllChapters, findVideosOfChapter } from './utils'

for (let [name, obj] of Object.entries({
  findAllChapters,
  findVideosOfChapter
})) {
  exportGlobal(name, obj)
}