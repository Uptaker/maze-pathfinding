import type {Tile} from './types'

export function sleep(ms, signal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve()
      signal.removeEventListener('abort', abort)
    }, ms)
    const abort = () => {
      clearTimeout(timeout)
      reject(new Error('Cancelled'))
    }
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort)
  });
}

export function logTilesToStrings(tiles: Tile[][]) {
  for (let i = 0; i < tiles.length; i++) {
    console.log(tiles[i].map(t => t.type).join(''))
  }
}