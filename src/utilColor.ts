import Log from "./log"

export interface HSL {
  h:number
  s:number
  l:number
}

export interface UserColor {
  id: string
  hsl: HSL
}

export class ColorManager {
  private userColors : Array<UserColor> = []

  color(id:string) : HSL | undefined {
    const col = this.userColors.find(uc => uc.id === id)
    const colIndex = this.userColors.findIndex(uc => uc.id === id)
    return this.userColors.find(uc => uc.id === id)?.hsl
  }

  regist(id:string) : HSL {
    const user = this.userColors.find((uc) => {uc.id === id})
    if (user !== undefined) {
      return user.hsl
    }
    let color:HSL = {h:0, s:0, l:25} // dark gray when too many members
    for(let i=0 ; i<48 ; i++) {
      let c = this.selectColor(i)
      if (this.userColors.findIndex((uc) => ColorManager.areSameHSLs(uc.hsl,c)) < 0) {
        color = c
        break;
      }
    }
    const newUser = {id:id, hsl:color}
    this.userColors.push(newUser)
    return color
  }

  unregist(id:string) : void {
    this.userColors = this.userColors.filter(uc => uc.id !== id)
  }

  clear() : void {
    this.userColors = []
  }

  static toString(c:HSL) : string {
    return `hsl(${c.h} , ${c.s}%, ${c.l}%)`
  }

  static white(): HSL {
    return {h:0, s:100, l:100}
  }

  static areSameHSLs(c1:HSL, c2:HSL) : boolean {
    return c1.h === c2.h && c1.s === c2.s && c1.l === c2.l
  }

  private selectColor(i:number) : HSL {
    // handle negative value as positive
    if (i<0) { i = -i }

    // 0-11
    if (i<12) {
      return { h:(i*5*30+120) % 360, s:100, l:75 }
    }

    // 12-23
    if (i<24) {
      return { h:((i-12)*5*30+120) % 360, s:100, l:50 }
    }

    if (i<36) {
      return { h:((i-24)*5*30+15+120) % 360, s:100, l:75 }
    }

    if (i<48) {
      return { h:((i-36)*5*30+15+120) % 360, s:100, l:50 }
    }

    return { h:(i-48)*113+120, s:100, l:62 }
  }
}
