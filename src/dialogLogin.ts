import { UtilDom } from "./utilDom"
import Log from "./log"
import LoginInfo from "./loginInfo"

class DialogLogin {
  private dialogLogin = document.getElementById('login') as HTMLDivElement
  private roomRow = document.getElementById('loginTable_roomRow') as HTMLTableRowElement
  private nameRow = document.getElementById('loginTable_nameRow') as HTMLTableRowElement
  private passRow = document.getElementById('loginTable_passRow') as HTMLTableRowElement
  private roomInput = document.getElementById('login-input-room') as HTMLInputElement
  private nameInput = document.getElementById('login-input-name') as HTMLInputElement
  private passInput = document.getElementById('login-input-pass') as HTMLInputElement
  private buttonLogin = document.getElementById('login-button') as HTMLButtonElement
  private downloadPane = document.getElementById('loginDialog_log_download_pane') as HTMLDivElement
  private buttonDownload = document.getElementById('loginDialog_log_download') as HTMLButtonElement
  private buttonDownloadNote = document.getElementById('loginDialog_note_download') as HTMLButtonElement

  /** Condition for login (set from outside) */
  private loginCondition: number = 0
  /** Set value for login (set from outside) */
  setLoginCondition(cond:number) {
    this.loginCondition = cond
    this.updateState()
  }

  onLoginClick: (info:LoginInfo) => void = i => {}
  onDownloadMain: () => void = () => {}
  onDownloadNote: () => void = () => {}

  constructor() {
    this.setEvents()
    this.updateState()
  }

  private setEvents() {
    this.buttonLogin.addEventListener('click', (ev) => {
      const info = new LoginInfo()
      info.room = this.roomInput.value
      info.name = this.nameInput.value
      info.pass = this.passInput.value
      this.hideDialog()
      this.onLoginClick(info)
    })

    this.buttonDownload.addEventListener('click', ev => {this.onDownloadMain()})
    this.buttonDownloadNote.addEventListener('click', ev => {this.onDownloadNote()})

    this.dialogLogin.addEventListener('change', ev => { this.updateState() })
    this.dialogLogin.addEventListener('input', ev => { this.updateState() })
    this.dialogLogin.addEventListener('paste', ev => { this.updateState() })
  }

  private updateState() {
    // if all inputs are hidden, always login-able.
    if (UtilDom.isDisplayed(this.roomRow) === false 
      && UtilDom.isDisplayed(this.nameRow) === false 
      && UtilDom.isDisplayed(this.passRow) === false) 
    {
      this.buttonLogin.disabled = false
    }

    var canLogin = true

    if (UtilDom.isDisplayed(this.roomRow)) {
      if (this.roomInput.value.length < 1) {
        canLogin = false
      }
      if (this.roomInput.validationMessage.length > 0) {
        canLogin = false
      }
    }
    if (UtilDom.isDisplayed(this.nameRow)) {
      if (this.nameInput.value.length < 1) {
        canLogin = false
      }
    }

    if (this.loginCondition < 1) {
      canLogin = false
    }

    this.buttonLogin.disabled = ! canLogin
  }

  setRoom(room:string) {
    this.roomInput.value = room
  }

  setName(name:string) {
    this.nameInput.value = name
  }

  showDialog(canGetMain:boolean=false, canGetNote:boolean=false) {
    if (canGetMain === true) {
      UtilDom.displayOn(this.buttonDownload)
    } else {
      UtilDom.displayOff(this.buttonDownload)
    }
    if (canGetNote === true) {
      UtilDom.displayOn(this.buttonDownloadNote)
    } else {
      UtilDom.displayOff(this.buttonDownloadNote)
    }

    UtilDom.show(this.dialogLogin)
    this.updateState()
    this.focusMe()
  }

  isShown() : boolean {
    return UtilDom.isShown(this.dialogLogin)
  }

  private focusMe() {
    const showRoom = UtilDom.isDisplayed(this.roomRow)
    const showName = UtilDom.isDisplayed(this.nameRow)
    if (showRoom) {
      this.roomInput.focus()
    } else if (showName) {
      this.nameInput.focus()
    } else {
      this.buttonLogin.focus()
    }
  }

  hideDialog() {
    UtilDom.hide(this.dialogLogin)
  }

  showRoom() {
    this.roomInput.required = true
    UtilDom.displayOn(this.roomRow, "table-row")
  }

  hideRoom() {
    this.roomInput.required = false
    UtilDom.displayOff(this.roomRow)
  }

  showName() {
    this.nameInput.required = true
    UtilDom.displayOn(this.nameRow, "table-row")
  }

  hideName() {
    this.nameInput.required = false
    UtilDom.displayOff(this.nameRow)
  }

  showPass() {
    this.passInput.required = true
    UtilDom.displayOn(this.passRow, "table-row")
  }

  hidePass() {
    this.passInput.required = false
    UtilDom.displayOff(this.passRow)
  }

}

export default DialogLogin
