export class Randomizer {
  /**
   * Gets a random entry from a list.
   * @param {T[]} list The list to get a random entry from.
   * @returns {T | undefined} A random entry from the list, or undefined if the list is empty.
   * @template T
   */
  static randomFromList(list) {
    if (!list || list.length === 0) {
      return undefined;
    }
    return list[Math.floor(Math.random() * list.length)];
  }
}