export async function tick(timeoutInMs = 100) {
  return new Promise(resolve => {
    setTimeout( resolve, timeoutInMs)
  })
}
