import { Util } from "./util"

export interface ContentToSend {
  /** sequence counter */
  seqCount: number
  /** [set-by-sender] send-time (milliseconds elapsed since 1970-01-01T00:00:00.000Z) */
  sendTimeCount: number
  /** [set-by-sender] */
  senderName: string
  /** [set-by-sender] */
  messageType: string
  /** [set-by-sender] */
  messageBody: string
}

export class ContentToSendClass implements ContentToSend {
  seqCount: number
  sendTimeCount: number
  senderName: string
  messageType: string
  messageBody: string

  constructor(name:string, type:string, message:string) {
    this.seqCount = ++ContentToSendClass.counter
    this.sendTimeCount = Date.now()
    this.senderName = name
    this.messageType = type
    this.messageBody = message
  }

  private static counter:number = 0
}

/**
 * interface defines incoming packet
 */
export interface Content extends ContentToSend {
  /** [set-by-receiver] receive-time (milliseconds elapsed since 1970-01-01T00:00:00.000Z) */
  receiveTimeCount: number
  /** [set-by-receiver] */
  senderID: string
}

/**
 * Data-storage class (similar to UdpContent of mekiku-web)
 */
export class ContentClass implements Content {
  seqCount: number = 0
  sendTimeCount: number = 0
  senderName: string = ""
  messageType: string = ""
  messageBody: string = ""
  readonly receiveTimeCount: number
  senderID: string = ""

  constructor() {
    this.receiveTimeCount = Date.now()
  }

  /**
   * Creating "Content" class object from received data
   * @param id id of the sender
   * @param val data received
   */
  static fromAny(id:string, val:any) : Content | null {
    if (val == null) return null
    if (!Util.isNumber(val.seqCount)) return null
    if (!Util.isNumber(val.sendTimeCount)) return null
    if (!Util.isString(val.senderName)) return null
    if (!Util.isString(val.messageType)) return null
    if (!Util.isString(val.messageBody)) return null
    val.receiveTimeCount = Date.now()
    val.senderID = id
    const d = val as Content
    return d
  }

  static fromSendData(id:string, d:ContentToSend) : Content {
    const r = d as Content
    r.senderID = id
    r.receiveTimeCount = d.sendTimeCount
    return r
  }
}

export const ContentType = {
  LOGIN : "L",
  RESPONSE : "R",
  DISPLAY : "D",
  MONITOR : "M",
  NOTE : "N",
  LOGOFF : "F",
} as const
