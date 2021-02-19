class LoginInfo {
  room: string = ""
  name: string = ""
  pass: string = ""

  static clone(src:LoginInfo) : LoginInfo {
    const i = new LoginInfo()
    i.room = src.room
    i.name = src.name
    i.pass = src.pass
    return i
  }
}

export default LoginInfo
