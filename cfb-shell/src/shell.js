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
      await module.configure()
      this.#configuredModules.push(module)
    }))
  }

  async activate() {
    const modulesToActivate = [...this.#configuredModules]
    this.#configuredModules = []
    
    await Promise.all(modulesToActivate.map(async module => {
      await module.activate()
      this.#activatedModules.push(module)
    }))
  }

  async run() {
    const modulesToRun = [...this.#activatedModules]
    this.#activatedModules = []
    
    await Promise.all(modulesToRun.map(async module => {
      await module.run()
      this.#startedModules.push(module)
    }))
  }
}
