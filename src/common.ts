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

/**
 * A utility function for userscripts that detects and handles AJAXed content.
 *
 * @author CoeJoder
 * @link https://github.com/CoeJoder/waitForKeyElements.js
 * @example
 * waitForKeyElements("div.comments", (element) => {
 *   element.innerHTML = "This text inserted by waitForKeyElements().";
 * });
 *
 * waitForKeyElements(() => {
 *   const iframe = document.querySelector('iframe');
 *   if (iframe) {
 *     const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
 *     return iframeDoc.querySelectorAll("div.comments");
 *   }
 *   return null;
 * }, callbackFunc);
 *
 * @param {(string|function)} selectorOrFunction - The selector string or function.
 * @param {function}          callback           - The callback function; takes a single DOM element as parameter.
 *                                                 If returns true, element will be processed again on subsequent iterations.
 * @param {boolean}           [waitOnce=true]    - Whether to stop after the first elements are found.
 * @param {number}            [interval=300]     - The time (ms) to wait between iterations.
 * @param {number}            [maxIntervals=-1]  - The max number of intervals to run (negative number for unlimited).
 */
export function waitForKeyElements<T extends Element>(selectorOrFunction: string | (() => ArrayLike<T>), callback: (elem: T) => any, waitOnce: boolean = true, interval: number = 300, maxIntervals: number = -1) {
    if (typeof waitOnce === "undefined") {
        waitOnce = true
    }
    if (typeof interval === "undefined") {
        interval = 300
    }
    if (typeof maxIntervals === "undefined") {
        maxIntervals = -1
    }
    var targetNodes = (typeof selectorOrFunction === "function")
            ? selectorOrFunction()
            : document.querySelectorAll<T>(selectorOrFunction)

    var targetsFound = targetNodes && targetNodes.length > 0
    if (targetsFound) {
        Array.from(targetNodes).forEach(function(targetNode) {
            var attrAlreadyFound = "data-userscript-alreadyFound"
            var alreadyFound = targetNode.getAttribute(attrAlreadyFound) || false
            if (!alreadyFound) {
                var cancelFound = callback(targetNode)
                if (cancelFound) {
                    targetsFound = false
                }
                else {
                    targetNode.setAttribute(attrAlreadyFound, 'true')
                }
            }
        })
    }

    if (maxIntervals !== 0 && !(targetsFound && waitOnce)) {
        maxIntervals -= 1
        setTimeout(function() {
            waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals)
        }, interval)
    }
}