import { AppConfig } from "./appConfig";
import { Pane } from "./pane";
import Log from "./log";
import { Content, ContentClass, ContentType } from "./content";
import { MemberManager } from "./memberManager";
import { T } from "./t";

export class PaneMain implements Pane {
  getName() { return "PaneMain"; }
  
  private readonly pane = document.getElementById("display") as HTMLDivElement
  private contents:Array<Content> = []

  constructor() {
    this.configToScreen();
  }

  getMainLog() : Array<string> {
    return this.contents.map(content => content.messageBody);
  }
  hasMainLog() : boolean {
    return this.contents.length > 0
  }

  private makeMessageElement(d:Content) : HTMLElement {
    this.contents.push(d)
    const item = document.createElement('p')
    item.classList.add('message')
    item.textContent = d.messageBody
    return item
  }

  private addItemToDisplayPane(item:HTMLElement) {
    // If this is less than zero, display pane floats
    const scrollOffsetBeforeAdd = this.pane.scrollTop + this.pane.clientHeight - this.pane.scrollHeight
    this.pane.appendChild(item)
    // Scroll to bottom if it was bottom before appendChild
    // '-5' is not concrete value, but '0' leads to 'no scroll' bug (maybe because of less-than-one-pixel difference)
    if (scrollOffsetBeforeAdd >= -5) {
      this.pane.scrollTop = this.pane.scrollHeight - this.pane.clientHeight
    }
  }

  addMyNewItem(d:Content) {
    const item = this.makeMessageElement(d)
    this.addItemToDisplayPane(item)
  }

  addMessageMemberAttended(name:string) {
    const d = new ContentClass()
    d.senderName = name
    d.messageType = ContentType.LOGIN
    d.messageBody = `( ${T.t('login','Chat')} : ${name} )`
    const item = this.makeMessageElement(d)
    this.addItemToDisplayPane(item)
  }

  addMessageMemberExited(name:string) {
    const d = new ContentClass()
    d.senderName = name
    d.messageType = ContentType.LOGOFF
    d.messageBody = `( ${T.t('logout','Chat')} : ${name} )`
    const item = this.makeMessageElement(d)
    this.addItemToDisplayPane(item)
  }

  addNewItem(d:Content) {
    const item = this.makeMessageElement(d)
    const color = MemberManager.data.getColor(d.senderID)
    if (color != null && color !== '') { item.style.color = color }
    this.addItemToDisplayPane(item)
  }

  // ========== ========== Configuration ========== ==========

  private configToScreen() {
    this.pane.style.fontSize = AppConfig.data.main_font_size + "pt"
  }

  updateConfig() {
    this.configToScreen();
  }

  setPaneToConfig() {
  }

  focus() {
  }
}
