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

  // user member-type
  private static memberType:string = '';
  static getMemberType() : string {
    return this.memberType
  }
  static setMemberType(memberType:string) {
    this.memberType = memberType
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
