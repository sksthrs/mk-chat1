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

  // narrow screen or not
  private static ifNarrow:boolean = false
  static getIfNarrow() : boolean {
    return this.ifNarrow
  }
  static setIfNarrow(ifNarrow:boolean) {
    this.ifNarrow = ifNarrow
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
}

export default TmpConfig
