export const redirectTo = (path, timeout) => {
  if (timeout) {
    setTimeout(() => {
      window.location.href = path
    }, 1500)
    return
  }
  window.location.href = path
}
