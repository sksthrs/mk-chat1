import { Content } from "./content";
import Log from "./log";
import { Tuple2 } from "./util";
import { ColorManager } from "./utilColor";

export interface MemberInfo {
  id: string
  name?: string
  inputContent?: string
  lastReceived: number
  lastSequence: number
  color?: string
}

export class MemberInfoClass implements MemberInfo {
  id: string
  name?: string
  inputContent?: string
  lastReceived: number
  lastSequence: number
  color?: string

  private constructor(id:string) {
    this.id = id;
    this.lastReceived = Date.now();
    this.lastSequence = 0
  }

  static fromContent(data:Content) : MemberInfoClass {
    const d = new MemberInfoClass(data.senderID)
    d.name = data.senderName
    d.lastReceived = data.sendTimeCount
    d.lastSequence = data.seqCount
    return d
  }
}

export class MemberManager {
  private members:MemberInfo[] = []
  private colorManager:ColorManager = new ColorManager()

  getCount() : number { return this.members.length }

  /**
   * 
   * @param id member id
   * @returns color string (for CSS color) or empty string (when id not exist)
   */
  getColor(id:string) : string | undefined {
    const hsl = this.colorManager.color(id)
    if (hsl == undefined) return undefined
    return ColorManager.toString(hsl)
  }

  /**
   * @param id member id
   * @returns clone of member-info, or undefined (when id not exist)
   */
  getMember(id:string) : MemberInfo | undefined {
    const found = this.members.find(m => m.id === id)
    if (found == undefined) return undefined
    return {...found}
  }

  /**
   * Update members information with new data
   * @param member incoming data
   * @returns tuple of index and updated member-info (index<0 when member is new)
   */
  update(member:MemberInfo) : Tuple2<number,MemberInfo> {
    const foundIndex = this.members.findIndex(m => m.id === member.id)
    if (foundIndex < 0) {
      this.colorManager.regist(member.id)
      this.members.push(member)
      return {v1:-1, v2:member}
    } else {
      const found = this.members[foundIndex]
      if (member.lastSequence !== (found.lastSequence + 1)) {
        Log.w('Warning', `Member [${member.id}](${member.name}) seq jump from ${found.lastSequence} to ${member.lastSequence}`)
      }
      const lastInput = member.inputContent ?? found.inputContent ?? ""
      const updatedMember:MemberInfo = { ...member, inputContent:lastInput }
      this.members = this.members.map(m => m.id === member.id ? updatedMember : m)
      return {v1:foundIndex, v2:updatedMember}
    }
  }

  /**
   * Unregister a member
   * @param id member id to unregist
   * @returns index and info of unregistered member ({-1,null} when id is not found)
   */
  unregist(id:string) : Tuple2<number,MemberInfo> | Tuple2<number,null> {
    this.colorManager.unregist(id)
    const foundIndex = this.members.findIndex(m => m.id === id)
    if (foundIndex < 0) { return { v1:foundIndex, v2:null } }
    const found = this.members[foundIndex]
    this.members = this.members.filter(m => m.id !== id)
    return { v1:foundIndex, v2:found }
  }

  clear() : void {
    this.colorManager.clear()
    this.members = []
  }

  // singleton
  private constructor() { }
  private static instance : MemberManager | undefined = undefined
  public static get data() : MemberManager {
    if (MemberManager.instance === undefined) { MemberManager.instance = new MemberManager() }
    return MemberManager.instance
  }
}
