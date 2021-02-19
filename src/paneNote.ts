import { AppConfig } from "./appConfig";
import { T } from "./t";
import { Pane } from "./pane";
import { UtilDom } from "./utilDom";
import { Content, ContentToSend } from "./content";
import Log from "./log";

export class PaneNote implements Pane {
  getName() { return "PaneNote"; }
  
  private readonly pane = document.getElementById("note") as HTMLDivElement;
  private readonly titlebar = document.getElementById('note-title') as HTMLDivElement
  private readonly noteText = document.getElementById("note-text") as HTMLTextAreaElement;
  private readonly noteStateText = document.getElementById("note-state-text") as HTMLSpanElement;
  private lastSenderName:string = ""

  onUpdate : (text:string) => void = (t) => {}

  constructor() {
    this.setEvent()
    this.localize()
    this.configToScreen()
    this.updateState()
  }

  hasNote() : boolean {
    return this.noteText.value.length > 0
  }

  getNote() : string {
    return this.noteText.value
  }

  getLastSender() : string {
    return this.lastSenderName
  }

  private setEvent() {
    this.noteText.addEventListener('input', ev => {
      this.onUpdate(this.noteText.value ?? '')
      this.updateState(T.t('(yourself)', 'Note'))
    })
  }

  private updateNote(text:string, name:string) {
    const selBegin = this.noteText.selectionStart
    const selEnd = this.noteText.selectionEnd
    this.noteText.value = text
    this.updateState(name)
    this.lastSenderName = name
    this.noteText.selectionStart = selBegin
    this.noteText.selectionEnd = selEnd
  }

  update(data:ContentToSend) {
    this.updateNote(data.messageBody, data.senderName)
  }

  updateByResponse(data:ContentToSend) {
    const text = data.messageBody
    const ix = text.indexOf('\n')
    if (ix<0 || ix>=(text.length-1)) return
    this.updateNote(text.substring(ix+1), text.substring(0,ix))
  }

  private updateState(str?:string) {
    if (str) {
      this.noteStateText.textContent = `${T.t("Last update", "Note")} : ${str}`
    } else {
      this.noteStateText.textContent = T.t("Last update", "Note") + ' : '
    }
  }

  private applyStyle(el:HTMLElement) {
    el.style.fontSize = AppConfig.data.note_font_size + "pt"
  }

  private configToScreen() {
    this.applyStyle(this.noteText)
  }

  updateConfig() {
    this.configToScreen()
  }

  localize() {
    this.setTitle(T.t("Shared Note","Note"))
  }

  private setTitle(title:string) {
    this.titlebar.textContent = title
  }

  setPaneToConfig() {
  }

  focus() {
    this.noteText.focus()
  }
}