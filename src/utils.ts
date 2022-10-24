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