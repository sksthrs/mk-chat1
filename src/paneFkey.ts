import { AppConfig } from "./appConfig";
import { Pane } from "./pane";
import { Util } from "./util";
import { T } from "./t";
import { UtilDom } from "./utilDom";

export class PaneFkey implements Pane {
  getName() { return "PaneFkey"; }

  private readonly pane = document.getElementById('fkey') as HTMLDivElement
  private readonly titlebar = document.getElementById('fkey-title') as HTMLDivElement
  private outerTable = document.getElementById("fkey-table") as HTMLTableElement;
  private fkeys: Array<HTMLInputElement|null>;

  constructor() {
    this.localize()

    this.fkeys = [
      document.getElementById("fkey01") as HTMLInputElement,
      document.getElementById("fkey02") as HTMLInputElement,
      document.getElementById("fkey03") as HTMLInputElement,
      document.getElementById("fkey04") as HTMLInputElement,
      null, null, null,
      null, null, 
    ];

    this.configToScreen();
  }

  private applyFont(el:HTMLElement) {
    el.style.fontSize = AppConfig.data.fkey_font_size + "pt";
  }

  private configToScreen() {
    const labels = this.outerTable.getElementsByClassName("fkey-label");
    for (var label of labels) {
      const el = document.getElementById(label.id);
      if (el === null) continue;
      this.applyFont(el);
    }

    const inputs = this.outerTable.getElementsByClassName("fkey-input");
    for (var input of inputs) {
      const el = document.getElementById(input.id);
      if (el === null) continue;
      this.applyFont(el);
    }

    const texts = this.outerTable.getElementsByClassName("fkey-text-readonly");
    for (var text of texts) {
      const el = document.getElementById(text.id);
      if (el === null) continue;
      this.applyFont(el);
    }
  }

  getFKey(index:number) : string {
    if (index >= 0 && index < this.fkeys.length) {
      const fkey = this.fkeys[index];
      if (fkey != null) {
        return fkey.value;
      }
    }
    return "";
  }

  localize() {
    this.setTitle(T.t("Shortcut","Fkey") + Util.getShortcutParenthesized("F"))
  }

  private setTitle(title:string) {
    this.titlebar.textContent = title
  }

  updateConfig() {
    this.configToScreen();
  }

  setPaneToConfig() {
  }

  focus() {
    this.fkeys[0]?.focus()
  }
}
