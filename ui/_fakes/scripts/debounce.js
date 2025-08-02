export const debounce = (timeout) => {
  let sent = false
  return (cb) => {

    if (!sent) {
      console.log('on title', sent)
      cb()
      sent = true
      setTimeout(() => {
        sent = false
      }, timeout)
    }
  }
}