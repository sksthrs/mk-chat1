class PaneControl {
  private control = document.getElementById('app_control') as HTMLDivElement
  private config = document.getElementById('appConfig') as HTMLButtonElement
  private logout = document.getElementById('appLogout') as HTMLButtonElement
  onConfig: () => void = () => {}
  onLogout: () => void = () => {}

  constructor() {
    this.config.addEventListener('click', (ev) => {
      this.onConfig()
    })
    this.logout.addEventListener('click', (ev) => {
      this.onLogout()
    })
  }
}

export default PaneControl
