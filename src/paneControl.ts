class PaneControl {
  private control = document.getElementById('control') as HTMLDivElement
  private back = document.getElementById('appBackToChat') as HTMLButtonElement
  private config = document.getElementById('appConfig') as HTMLButtonElement
  private logout = document.getElementById('appLogout') as HTMLButtonElement
  private controlChat = document.getElementById('controlOnChat') as HTMLDivElement
  private showNoteChat = document.getElementById('appShowNoteOnChat') as HTMLButtonElement
  private configChat = document.getElementById('appConfigOnChat') as HTMLButtonElement
  private logoutChat = document.getElementById('appLogoutOnChat') as HTMLButtonElement

  onConfig: () => void = () => {}
  onLogout: () => void = () => {}
  onShowNote: () => void = () => {}
  onBackToChat: () => void = () => {}

  constructor() {
    this.back.addEventListener('click', (ev) => {
      this.onBackToChat()
    })
    this.config.addEventListener('click', (ev) => {
      this.onConfig()
    })
    this.logout.addEventListener('click', (ev) => {
      this.onLogout()
    })
    this.showNoteChat.addEventListener('click', (ev) => {
      this.onShowNote()
    })
    this.configChat.addEventListener('click', (ev) => {
      this.onConfig()
    })
    this.logoutChat.addEventListener('click', (ev) => {
      this.onLogout()
    })
  }
}

export default PaneControl
