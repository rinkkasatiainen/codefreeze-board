export function randomId() {
  const requestId = crypto.randomUUID()
  return requestId.replace(/-/g, '')
}

export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomString(length = 10) {
  return Array(length)
    .fill(0)
    .map(() => Math.random().toString(36).charAt(2))
    .join('')
}

export function randomFromList(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export function withSection(mockWith = {}) {
  const example = {id: randomId(), name: randomString(10) , order: 0}
  return {...example, ...mockWith}
}
