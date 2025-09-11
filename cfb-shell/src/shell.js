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

  async configure() {
    const modulesToConfigure = [...this.#features]
    this.#features = []
    
    await Promise.all(modulesToConfigure.map(async module => {
      const promise = module.configure()
      this.#configuredModules.push(module)
      return promise
    }))
  }

  async activate() {
    const modulesToActivate = [...this.#configuredModules]
    this.#configuredModules = []
    
    await Promise.all(modulesToActivate.map(async module => {
      const promise = module.activate()
      this.#activatedModules.push(module)
      return promise
    }))
  }

  async run() {
    const modulesToRun = [...this.#activatedModules]
    this.#activatedModules = []
    
    await Promise.all(modulesToRun.map(async module => {
      const promise = module.run()
      this.#startedModules.push(module)
      return promise
    }))
  }
}
