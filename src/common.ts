export function ready (callback: () => any) {
  // in case the document is already rendered
  if (document.readyState !== 'loading') callback()
  // modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback)
}

export function delay (interval: number) {
  return new Promise((resolve) => setTimeout(resolve, interval))
}

export const retry = async <TReturn>(fn: () => Promise<TReturn> | TReturn, retry: number = 5, interval = 1000): Promise<TReturn> => {
  while (true) {
    try {
      return await fn()
    } catch (e: any) {
      if (--retry === 0) {
        throw e
      } else {
        console.warn((e.message ?? e) + '. Retring...')
        await delay(interval)
      }
    }
  }
}

export async function getElement<TElement extends Element> (selector: string) {
  const element = document.querySelector<TElement>(selector)
  if (element !== null && element !== undefined) {
    return element
  }
  throw new Error(`Cannot query ${selector}`)
}

export function exportGlobal(name: string, o: any) {
  (unsafeWindow as any)[name] = o
}