import MekikuComm, { MekikuCommEvents } from "./mekikuComm"
import Log from "./log";
import PaneControl from "./paneControl";
import DialogLogin from "./dialogLogin";
import LoginInfo from "./loginInfo";
import { PaneInput } from "./paneInput";
import { PaneFkey } from "./paneFkey";
import { PaneMonitor } from "./paneMonitor";
import { ContentType, Content, ContentClass, ContentToSendClass } from "./content";
import { MemberInfoClass } from "./memberManager";
import { Util } from "./util";
import { T } from "./t";
import { PaneMain } from "./paneMain";
import { UtilDom } from "./utilDom";
import { Pane } from "./pane";
import FileController, { Downloader } from "./fileController";
import { AppConfig } from "./appConfig";
import TmpConfig from "./TmpConfig";
import Split from "split.js"
import DialogNotify from "./dialogNotify";
import { DialogConfig } from "./dialogConfig";
import { PaneNote } from "./paneNote";

class App {
  private comm: MekikuComm
  private appControl: PaneControl
  private dialogLogin: DialogLogin
  private paneInput: PaneInput
  private paneFkey: PaneFkey
  private paneMonitor: PaneMonitor
  private paneMain: PaneMain
  private paneNote: PaneNote
  private dialogNotify: DialogNotify
  private dialogConfig: DialogConfig
  private loginInfo?: LoginInfo
  private id: string = ""
  private roomName: string = ""
  private panes: { [ch:string] : Pane; };
  private pageTitle:string = ""
  private splitContainer?: Split.Instance
  private splitDisplayMonitor?: Split.Instance
  private splitPft?: Split.Instance
  private isErrorHandling: boolean = false
  private readonly IS_BROWSER_AUTH = 'browser'
  private audioNotify = document.getElementById("audio-notify") as HTMLAudioElement
  private isActive: boolean = true
  private readonly KEY_STORAGE = 'config-mkchat1'

  constructor() {
    const localConfig = localStorage.getItem(this.KEY_STORAGE)
    if (localConfig != null) {
      Log.w('Info', 'config found in localStorage')
      AppConfig.trySetJSON(localConfig)
    }
    const locale = AppConfig.data.getLocale()
    Log.w("Info",`locale:${locale}`)
    T.setLocale(locale)

    window.addEventListener('beforeunload', (ev) => { this.onBeforeUnload(ev) })
    window.addEventListener('unload', (ev) => { this.onUnload(ev) })
    window.addEventListener('focus', ev => { this.isActive = true })
    window.addEventListener('blue', ev => { this.isActive = false })

    UtilDom.makeDialogsRespondToKey()

    this.dialogNotify = new DialogNotify()

    const handlers = this.makeCommEventHandlers()
    this.comm = new MekikuComm(handlers)

    this.appControl = new PaneControl()
    this.setAppControlEvents()

    this.dialogConfig = new DialogConfig()
    this.setDialogConfigEvents()

    this.dialogLogin = new DialogLogin()
    this.setLoginDialogEvents()
    this.dialogLogin.hidePass() // no password
    this.dialogLogin.setName(TmpConfig.getName())
    const roomNameRaw = Util.beforeOf(UtilDom.getQuery() , '/')
    if (Util.isRoomNameLegit(roomNameRaw)) {
      this.dialogLogin.setRoom(roomNameRaw)
      this.dialogLogin.hideRoom()
    }
    this.updatePageTitle(T.t("Login","Login"))
    // Cannot support old browsers (MSIE=IE(<11), Trident=IE11, Edge=EdgeHTML). Chromium Edge('Edg') is okay.
    if (Util.contains(navigator.userAgent, 'MSIE', 'Trident', 'Edge')) {
      // do nothing for no-support browser, so shutter remains topmost.
    } else {
      // seems running on not no-support browser. hide shutter and show login dialog.
      const shutter = document.getElementById('shutter') as HTMLDivElement;
      shutter.style.display = 'none'
      this.dialogLogin.showDialog()
    }

    // fetch config.json
    fetch("config.json")
    .then(response => {
      return response.json()
    })
    .then(json => {
      if ("api_key" in json) {
        const apikey = json.api_key as string
        TmpConfig.setApiKey(apikey)
        this.dialogLogin.setLoginCondition(1)
      }
      if ("debug_level" in json) {
        const debuglevel = json.debug_level as number
        TmpConfig.setDebugLevel(debuglevel)
      }
    })

    this.paneMain = new PaneMain()

    this.paneFkey = new PaneFkey()
    this.paneInput = new PaneInput()
    this.setInputEvents()

    this.paneMonitor = new PaneMonitor()
    this.setMonitorEvents()

    this.paneNote = new PaneNote()
    this.setNoteEvents()

    this.panes = {
      "i" : this.paneInput,
      "f" : this.paneFkey,
    };

    this.localizeAll()
    this.setEvents()
  } // end of constructor

  // ==================== Sending ====================

  private sendMain(text:string) {
    const d = new ContentToSendClass(TmpConfig.getName(), ContentType.DISPLAY, text)
    this.comm.send_room(d)
    const dR = ContentClass.fromSendData(this.id, d)
    this.paneMain.addNewItem(dR)
  }

  private sendNote(text:string) {
    Log.w('info',`send note : ${text}`)
    const d = new ContentToSendClass(TmpConfig.getName(), ContentType.NOTE, text)
    this.comm.send_room(d)
  }

  // ==================== Misc ====================

  private updateRoomName(room:string) {
    this.roomName = room
    UtilDom.setQuery(room)
    if (room.length > 0) {
      this.updatePageTitle(T.t("Room","General") + " " + room)
    } else {
      this.updatePageTitle(T.t("Login","Login"))
    }
  }

  private updatePageTitle(title:string, atStart:boolean = true) {
    if (this.pageTitle.length < 1) {
      this.pageTitle = document.title
    }
    if (atStart) {
      document.title = title + " - " + this.pageTitle
    } else {
      document.title = this.pageTitle + " - " + title
    }
  }

  private setDialogConfigEvents() {
    this.dialogConfig.onSetClicked = () => {
      this.updateAllConfig()
    };
    this.dialogConfig.onResetClicked = () => {
      AppConfig.resetAll()
      this.updateAllConfig()
      this.dialogConfig.configToDialog() // apply initial config into config dialog
    }
  }

  private setAppControlEvents() {
    this.appControl.onConfig = () => {
      this.dialogConfig.showDialog()
    }
    this.appControl.onLogout = () => {
      const d = new ContentToSendClass(TmpConfig.getName(), ContentType.LOGOFF, "")
      this.comm.send_room(d)
      this.comm.leaveRoom()
    }
  }
  
  private setLoginDialogEvents() {
    this.dialogLogin.onDownloadMain = () => {
      const name = Util.getIsoModifiedDateTimeString() + ".log"
      const log = this.paneMain.getMainLog().join(Util.getNewLineCode())
      Downloader.start(name, log)
    }

    this.dialogLogin.onLoginClick = info => {
      this.loginInfo = info
      if (info.room.length < 1) {
        info.room = location.hash
      }
      TmpConfig.setName(info.name)
      let login_info = info
      this.comm.open(
        TmpConfig.getApiKey(),
        {
          handleOpen: id => {
            this.comm.joinRoom(login_info)
            .then(() => {})
            .catch(error => {})
          },
          debugLevel: TmpConfig.getDebugLevel()
        }
      )
      this.updateRoomName(info.room)
      this.paneMonitor.clearMembers()
      this.setSubtitlerStyle()
    }
  }

  private setInputEvents() {
    this.paneInput.setGetFkey((ix) => {
      return this.paneFkey.getFKey(ix)
    })
    this.paneInput.setDoOnInput((text) => {
      const d = new ContentToSendClass(TmpConfig.getName(), ContentType.MONITOR, text)
      this.comm.send_room(d)
    })
    this.paneInput.setDoOnEnter((text) => {
      this.sendMain(text)
    })
  }

  private setMonitorEvents() {
    this.paneMonitor.setOnNewJoined(member => {
      this.paneMain.addMessageMemberAttended(member.name ?? '???')
    })

    this.paneMonitor.setOnLeft(member => {
      this.paneMain.addMessageMemberExited(member.name ?? '???')
    })
  }

  private setNoteEvents() {
    this.paneNote.onUpdate = (text) => {
      this.sendNote(text)
    }
  }

  // ==================== Configurations ====================

  private setSubtitlerStyle() {
    this.setSplits()
    this.paneInput.focus()
  }

  private updateAllConfig() {
    this.paneMain.updateConfig()
    this.paneInput.updateConfig()
    this.paneMonitor.updateConfig()
    this.paneNote.updateConfig()
    this.paneFkey.updateConfig()
  }

  private setSplits() {
    const gutterWidth = 6
    if (this.splitContainer == null) {
      this.splitContainer = Split(['#pane1','#pane2'],{
        sizes: [
          AppConfig.data.misc_pane1_width, 
          AppConfig.data.misc_pane2_width, 
        ],
        direction: 'horizontal',
        gutterSize: gutterWidth,
        onDragEnd: sizes => {
          AppConfig.data.misc_pane1_width = sizes[0]
          AppConfig.data.misc_pane2_width = sizes[1]
        },
      })
    } else {
      this.splitContainer.setSizes([
        AppConfig.data.misc_pane1_width, 
        AppConfig.data.misc_pane2_width, 
      ])
    }

    if (this.splitDisplayMonitor == null) {
      this.splitDisplayMonitor = Split(['#display-input', '#monitor'],{
        sizes: [
          AppConfig.data.misc_display_input_height,
          AppConfig.data.misc_monitor_height,
        ],
        direction: 'vertical',
        gutterSize: gutterWidth,
        onDragEnd: sizes => {
          AppConfig.data.misc_display_input_height = sizes[0]
          AppConfig.data.misc_monitor_height = sizes[1]
        },
      })
    } else {
      this.splitDisplayMonitor.setSizes([
        AppConfig.data.misc_display_input_height,
        AppConfig.data.misc_monitor_height,
      ])
    }
  }

  private localizeAll() {
    this.localize()
    this.paneInput.localize()
    this.paneMonitor.localize()
    this.paneFkey.localize()
  }

  private onPeerIdAcquired(id:string) {
    this.id = id
  }

  private onJoined() {
    const d = new ContentToSendClass(TmpConfig.getName(), ContentType.LOGIN, "")
    this.comm.send_room(d)
  }

  private onLeft() {
    if (this.dialogLogin == null) return
    if (this.isErrorHandling) return // avoid during communication-error dialog appearing (after close it, this method is called)
    if (this.dialogLogin.isShown()) return // already shown
    this.dialogLogin.setRoom(this.roomName)
    this.dialogLogin.setName(TmpConfig.getName())
    this.updateRoomName('')
    this.paneMonitor.clearMembers()
    const hasMain = this.paneMain.hasMainLog()
    this.dialogLogin.showDialog(hasMain)
  }

  private onSomeoneJoined(id:string) {
    // nop
  }

  private onSomeoneLeft(id:string) {
    // you can catch leaving like operation (reload,etc.)
    this.paneMonitor.deleteMember(id)
  }

  private onReceived(data:Content) {
    const member = MemberInfoClass.fromContent(data)
    let ifUpdate = true

    if (data.messageType === ContentType.LOGIN) {
      const d = new ContentToSendClass(TmpConfig.getName(), ContentType.RESPONSE, "")
      this.comm.send_room(d)
    }

    if (data.messageType === ContentType.RESPONSE) {
      // nop
    }

    if (data.messageType === ContentType.DISPLAY) {
      member.inputContent = ""
      this.paneMonitor.updateMember(member, data)
      this.paneMain.addNewItem(data)
      ifUpdate = false
    }

    if (data.messageType === ContentType.MONITOR) {
      member.inputContent = data.messageBody
    }

    if (data.messageType === ContentType.NOTE) {
      Log.w('info',`received note : ${data.messageBody}`)
      this.paneNote.update(data)
    }

    if (ContentType.LOGOFF in data) {
      this.paneMonitor.deleteMember(data.senderID)
    } else if (ifUpdate) {
      this.paneMonitor.updateMember(member, data)
    }

    if (!this.isActive) {
      this.audioNotify.play()
    }
  }

  private onAuthError() {
    // Show auth-error on login dialog
    this.dialogNotify.onOkClick = () => {
      this.onLeft()
    }
    this.dialogNotify.showDialog(
      T.t("Error","General"), 
      T.t("Login failed.","Login")
    )
  }

  private onCommunicationError(err:any) {
    // Logout (if not done) and show notification dialog
    this.isErrorHandling = true
    this.comm.leaveRoom()
    this.dialogNotify.onOkClick = () => {
      this.isErrorHandling = false
      this.onLeft()
    }
    const detail = (err.message != null) 
      ? "\n" + T.t("Detail","General") + " : " + err.message 
      : ""
    this.dialogNotify.showDialog(
      T.t("Error","General"), 
      T.t("Communication error.","General") + detail
    )
  }

  private onSomeError(err:any) {
    // Logout (if not done) and show notification dialog
    this.isErrorHandling = true
    this.comm.leaveRoom()
    this.dialogNotify.onOkClick = () => {
      this.isErrorHandling = false
      this.onLeft()
    }
    const detail = (err.message != null) 
      ? "\n" + T.t("Detail","General") + " : " + err.message 
      : ""
    this.dialogNotify.showDialog(
      T.t("Error","General"), 
      T.t("Communication error.","General") + detail
    )
  }

  private onPeerError(err:any) {
    if (err.type === "authentication") {
      this.onAuthError()
    } else if (err.type === "socket-error") {
      this.onCommunicationError(err)
    } else {
      this.onSomeError(err)
    }
  }

  private makeCommEventHandlers() : MekikuCommEvents {
    const r = new MekikuCommEvents()
    r.onPeerIdAcquired = (id) => { this.onPeerIdAcquired(id) }
    r.onPeerError = (err) => { this.onPeerError(err) }
    r.onJoinedRoom = () => { this.onJoined() }
    r.onLeftRoom = () => { this.onLeft() }
    r.onReceived = (data) => { this.onReceived(data) }
    r.onSomeoneJoined = (id) => { this.onSomeoneJoined(id) }
    r.onSomeoneLeft = (id) => { this.onSomeoneLeft(id) }
    r.logger = (msg) => { Log.w("Comm", msg) }
    return r
  }

  private onBeforeUnload(ev:BeforeUnloadEvent) : string | undefined {
    if (this.comm?.isInRoom() === true) {
      // if in room, confirm if unload is of intention
      ev.preventDefault()
      ev.returnValue = "Truly exit?" // these literals are not used by browsers
      return "Truly exit?"
    }
  }

  private onUnload(ev:Event) {
    if (this.comm?.isInRoom() === true) {
      const d = new ContentToSendClass(TmpConfig.getName(), ContentType.LOGOFF, "")
      this.comm.send_room(d)
      this.comm.leaveRoom()
    }
    const config = AppConfig.getJSON()
    localStorage.setItem(this.KEY_STORAGE, config)
  }

  private setEvents() {
    document.addEventListener('visibilitychange', ev => {
      if (document.hidden) {
      }
    })
    document.addEventListener('keydown', ev => {
      // no F5 reload when logged in
      if (ev.key === "F5" && this.comm.isInRoom()) {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        ev.stopPropagation()
      }

      // no F1 reload when logged in
      if (ev.key === "F1" && this.comm.isInRoom()) {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        ev.stopPropagation()
      }

      // shortcuts
      const ifCmdOrCtrlOnly = UtilDom.isCommandOrControlPressed(ev) && (!ev.shiftKey)
      if (ifCmdOrCtrlOnly) {
        const key = ev.key.toLowerCase()
        if (key in this.panes) {
          this.panes[key].focus()
          ev.preventDefault()
          ev.stopImmediatePropagation()
          ev.stopPropagation()
        }
      }

      if (ev.key === "o" && ifCmdOrCtrlOnly) {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        ev.stopPropagation()
        // open config open dialog
      }
      if (ev.key === "s" && ifCmdOrCtrlOnly) {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        ev.stopPropagation()
        // download config open dialog
      }
    })
  }

  private localize() {
    const targets = document.getElementsByClassName("l10n");
    for (const target of targets) {
      const id = target.id;
      const el = document.getElementById(id);
      if (el === null) continue;

      // l10n-items should have textContent in base language (English).
      // First time, text(English) is copied to "data-key" attribute (not written in HTML)
      // Later, "data-key" is used as key for l10n.
      const key1 = el.dataset["key"]
      const key2 = el.textContent
      var base:string
      if (key1 != null) {
        base = key1
      } else if (key2 != null) {
        base = key2
        el.dataset["key"] = base
      } else {
        Log.w('Warning',`app.localize element[${id}] no textContent.`)
        continue
      }

      const context = el.dataset["context"];
      if (context === undefined) {
        Log.w('Warning',`app.localize element[${id}] data-context not exists.`)
        continue
      }

      const phrase = T.t(base, context);
      el.textContent = phrase;
    }

    const targetsTitle = document.getElementsByClassName("title-l10n");
    for (const target of targetsTitle) {
      const id = target.id;
      const el = document.getElementById(id);
      if (el === null) continue;
      const base = el.title;
      if (base === null) continue;
      const context = el.dataset["context"];
      if (context === undefined) continue;
      const phrase = T.t(base, context);
      el.title = phrase;
    }
  }

}

export default App