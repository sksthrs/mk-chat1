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

  onUpdate : (text:string) => void = (t) => {}

  constructor() {
    this.setEvent()
    this.localize()
    this.configToScreen()
    this.updateState()
  }

  private setEvent() {
    this.noteText.addEventListener('input', ev => {
      this.onUpdate(this.noteText.value ?? '')
      this.updateState(T.t('(yourself)', 'Note'))
    })
  }

  update(data:ContentToSend) {
    const selBegin = this.noteText.selectionStart
    const selEnd = this.noteText.selectionEnd
    this.noteText.value = data.messageBody
    this.updateState(data.senderName)
    this.noteText.selectionStart = selBegin
    this.noteText.selectionEnd = selEnd
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