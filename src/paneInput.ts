import { AppConfig } from "./appConfig"
import { Pane } from "./pane"
import { UtilDom } from "./utilDom"
import { T } from "./t"
import { Util } from "./util"

export class PaneInput implements Pane {
  getName() { return "PaneInput" }

  private readonly pane = document.getElementById('input') as HTMLDivElement
  private readonly input1Vjs = document.getElementById("input1") as HTMLInputElement

  private getFkey: (ix:number) => string = (ix) => { return "" }
  setGetFkey(callback: (ix:number) => string) { this.getFkey = (ix) => callback(ix) }

  private doOnInput: (text:string) => void = (t) => {}
  setDoOnInput(callback: (text:string) => void) { this.doOnInput = (t) => callback(t) }
  private lastSendInput: string = ''
  private onInput(text:string) {
    if (text === this.lastSendInput) return
    this.lastSendInput = text
    this.doOnInput(text)
  }

  private doOnEnter: (text:string) => void = (t) => {}
  setDoOnEnter(callback: (text:string) => void) { this.doOnEnter = (t) => callback(t) }
  private onEnter(text:string) { this.doOnEnter(text) }

  constructor() {
    this.localize()

    this.input1Vjs.addEventListener("input", (ev) => {
      this.onInput(this.input1Vjs.value)
    })

    this.input1Vjs.addEventListener("keydown", (ev) => {
      this.onType(this.input1Vjs, ev)
    })

    this.configToScreen()

  } // end of constructor

  private onType(el:HTMLInputElement, ev:KeyboardEvent) {
    // Only on macOS, when some key is typed while IME input, ev.key is same as when not IME inputing.
    // https://qiita.com/ledsun/items/31e43a97413dd3c8e38e
    if (ev.keyCode === UtilDom.KEY_CTRL) { return }
    if (ev.keyCode === UtilDom.KEY_ENTER) {
      // if (UtilDom.isCommandOrControlPressed(ev) === true) {
      //   this.replacePart(el, "\n")
      // } else {
        this.onEnter(el.value)
        el.value = ""
      // }
      ev.preventDefault()
      ev.stopImmediatePropagation()
    } else if (ev.keyCode === UtilDom.KEY_ESC) {
      el.value = ""
      ev.preventDefault()
      ev.stopImmediatePropagation()
    } else {
      const iFkey = UtilDom.getCtrlOrFKeyNumber(ev) - 1
      if (iFkey >= 0 && iFkey < 7) {
        const sFkey = this.getFkey(iFkey)
        if (sFkey.length > 0) { this.replacePart(el, sFkey) }
        ev.preventDefault()
        ev.stopImmediatePropagation()
      } else if (iFkey === 7) {
        if (ev.shiftKey !== true) {
          this.enclose(el, 
            AppConfig.data.getParentheses1(), 
            AppConfig.data.getParentheses2())
        } else {
          this.enclose(el, 
            AppConfig.data.getParenthesesShift1(), 
            AppConfig.data.getParenthesesShift2())
        }
        ev.preventDefault()
        ev.stopImmediatePropagation()
      }
    }
    this.onInput(el.value)
  }

  private configToScreen() {
    this.input1Vjs.style.fontSize = AppConfig.data.input_font_size + "pt"
  }

  setPaneToConfig() {
  }

  private replacePart(el:HTMLInputElement, replaced:string) {
    // HTMLInputElement.selectionStart/End must exist in types text/password/search/tel/url/week/month
    const index0 = el.selectionStart || 0
    const index1 = el.selectionEnd || 0
    const text0 = el.value.substring(0, index0)
    const text1 = el.value.substring(index1)
    el.value = text0 + replaced + text1
    const newIndex = index0 + replaced.length
    el.blur() // workaround for Chromium (setSelectionRange doesn't textarea's scrollTop)
    el.setSelectionRange(newIndex, newIndex)
    el.focus()
  }

  private enclose(el:HTMLInputElement, strPre:string, strPost:string) {
    // HTMLInputElement.selectionStart/End must exist in types text/password/search/tel/url/week/month
    const index0 = el.selectionStart || 0
    const index1 = el.selectionEnd || 0
    const len = el.value.length
    el.value = strPre + el.value + strPost
    var newIndex0 = index0 + strPre.length
    var newIndex1 = index1 + strPre.length
    if (index0 === index1 && index1 === len) {
      newIndex0 += strPost.length
      newIndex1 += strPost.length
    }
    el.blur() // workaround for Chromium (setSelectionRange doesn't textarea's scrollTop)
    el.setSelectionRange(newIndex0, newIndex1)
    el.focus()
  }

  updateConfig() {
    this.configToScreen()
  }

  focus(): void {
    this.input1Vjs.focus()
  }

  localize() {
    this.input1Vjs.placeholder = T.t('Type your message here, then hit enter.', 'Input')
  }
}
