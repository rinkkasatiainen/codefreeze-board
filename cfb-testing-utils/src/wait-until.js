export const waitUntil = async (predicate, timeout = 100) => {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    if (await predicate()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`Timeout of ${timeout}ms exceeded waiting for predicate to become true`)
}
