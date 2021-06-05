import { AppDisplayStyle } from "./appDisplay"

class TmpConfig {
  // user name
  private static username?:string // cache
  private static KEY_STORAGE = 'tmp-mkchat1-config-name'
  static getName() : string {
    if (this.username == null) {
      this.username = localStorage.getItem(this.KEY_STORAGE) || ''
    }
    return this.username
  }
  static setName(name:string) {
    if (name !== this.username) {
      this.username = name
      localStorage.setItem(this.KEY_STORAGE, name)
    }
  }

  // chat type
  static readonly SET_NAME_AUTOMATICALLY = 'a'
  private static chatType:string = '';
  static getChatType() : string {
    return this.chatType
  }
  static setChatType(chatType:string) {
    this.chatType = chatType
  }
  static useAutoNameOnSend() : boolean {
    return this.chatType.indexOf(this.SET_NAME_AUTOMATICALLY) >= 0
  }

  // display style
  private static displayStyle: AppDisplayStyle = 'Full'
  static getDisplayStyle(): AppDisplayStyle {
    return this.displayStyle
  }
  static setDisplayStyle(style:AppDisplayStyle) {
    this.displayStyle = style
  }
  static getIfNarrow() : boolean {
    return this.displayStyle !== 'Full'
  }

  // API key
  private static apiKey:string = ''
  static getApiKey() : string {
    return this.apiKey
  }
  static setApiKey(key:string) {
    this.apiKey = key
  }

  private static debugLevel:number = 1
  static getDebugLevel() : number {
    return this.debugLevel
  }
  static setDebugLevel(level:number) {
    this.debugLevel = level
  }

  private static roomConnectionType:string = "sfu"
  static getRoomConnectionType() : string {
    return this.roomConnectionType
  }
  static setRoomConnectionType(connectionType:string) {
    if (connectionType !== 'sfu' && connectionType !== 'mesh') return
    this.roomConnectionType = connectionType
  }
}

export default TmpConfig
