export default class Shell {
  #features
  #configuredModules
  #activatedModules
  #startedModules

  constructor() {
    this.#features = []
    this.#configuredModules = []
    this.#activatedModules = []
    this.#startedModules = []
  }

  addModule(module) {
    this.#features.push(module)
  }

  configure() {
    this.#features.forEach(module => {
      module.configure()
      this.#configuredModules.push(module)
      const idx = this.#features.findIndex(x => x === module)
      this.#features = [...this.#features.slice(0, idx), ...this.#features.slice(idx + 1)]
    })
  }

  activate() {
    this.#configuredModules.forEach(module => {
      module.activate()
      this.#activatedModules.push(module)
      const idx = this.#configuredModules.findIndex(x => x === module)
      this.#configuredModules = [...this.#configuredModules.slice(0, idx), ...this.#configuredModules.slice(idx + 1)]
    })
  }

  run() {
    this.#activatedModules.forEach(module => {
      module.run()
      this.#startedModules.push(module)
      const idx = this.#activatedModules.findIndex(x => x === module)
      this.#activatedModules = [...this.#activatedModules.slice(0, idx), ...this.#activatedModules.slice(idx + 1)]
    })
  }
}
