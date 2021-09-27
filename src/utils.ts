type Chapter = {
  num: string,
  title: string,
  zjdm: string
}

type Video = {
  url: string
}

export function findAllChapters(): Chapter[] {
  return Array.from(document.querySelectorAll('div.xx-icon-text')).map(s => ({
    num: s.querySelector('em').innerText,
    title: s.querySelector('a').innerText,
    zjdm: s.querySelector('a').getAttribute('onclick').replace(/xsxx\('([0-9A-Z]*)'\);/, '$1')
  }))
}

export function getKcdm() {
  return document.querySelector<HTMLInputElement>('input#kcdm').value
}

export async function findVideosOfChapter(chapter: Chapter): Promise<Video[]> {
  let kcdm = getKcdm()
  let resp = await (await fetch(`https://www.livedu.com.cn/ispace4.0/moocxsxx/queryAllZjByKcdmIfram?kcdm=${kcdm}&bjdm=${kcdm}&zjdm=${chapter.zjdm}`)).text()
  let parser = new DOMParser()
  let doc = parser.parseFromString(resp, 'text/html')

  return Array.from(doc.querySelectorAll('video'))
    .map(video => video.querySelector('source').getAttribute('src'))
    .filter(Boolean)
    .map(url => ({ url }))
}