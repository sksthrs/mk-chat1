import { AppConfig } from "./appConfig";
import { MemberInfo, MemberManager } from "./memberManager";
import { Pane } from "./pane";
import { T } from "./t";
import { UtilDom } from "./utilDom";
import { Content, ContentType } from "./content";
import Log from "./log";

export class PaneMonitor implements Pane {
  getName() { return "PaneMonitor"; }

  setOnNewJoined(callback: (member:MemberInfo) => void) { this.onMemberNewJoined = m => callback(m) }
  private onMemberNewJoined: (member:MemberInfo) => void = member => {}
  setOnLeft(callback: (member:MemberInfo) => void) { this.onMemberLeft = m => callback(m) }
  private onMemberLeft: (member:MemberInfo) => void = member => {}

  private readonly pane = document.getElementById("monitor") as HTMLDivElement
  private readonly titlebar = document.getElementById('monitor-title') as HTMLDivElement
  private readonly table = document.getElementById("monitorTable") as HTMLTableElement
  private readonly fontChecker = document.getElementById("monitorFontChecker") as HTMLSpanElement
  private readonly header1 = document.getElementById("monitorHeader1") as HTMLTableDataCellElement
  private readonly header2 = document.getElementById("monitorHeader2") as HTMLTableDataCellElement

  private readonly IX_NAME = 0
  private readonly IX_INPUT = 1
  private readonly N_COLUMNS = 2

  /**
   * Make member pane (materialize dialog)
   */
  constructor() {
    this.localize()
    this.configToScreen()
  }

  updateMember(member: MemberInfo, data: Content) {
    const result = MemberManager.data.update(member)
    let ix = result.v1
    if (ix < 0) {
      this.addRow()
      ix = MemberManager.data.getCount() - 1
      if (data.messageType === ContentType.LOGIN) {
        this.onMemberNewJoined(member)
      }
    }
    this.updateRow(ix, member);
  }

  deleteMember(id:string) {
    const result = MemberManager.data.unregist(id)
    if (result.v1 >= 0) {
      this.removeRow(result.v1 + 1)
      if (result.v2 != null) {
        this.onMemberLeft(result.v2)
      }
    }
  }

  clearMembers() {
    MemberManager.data.clear()
    this.clearRows()
  }

  private configToScreen() {
    this.table.style.fontSize = AppConfig.data.monitor_font_size + "pt";
    this.fontChecker.style.fontSize = AppConfig.data.monitor_font_size + "pt";
  }

  private clearRows() {
    while(this.table.rows[1]) {
      this.table.deleteRow(1);
    }
  }

  private addRow() {
    const newRow = this.table.insertRow(-1);
    this.addColumns(newRow, this.N_COLUMNS);
  }

  private addColumns(row: HTMLTableRowElement, n: number) {
    for (var i = 0; i < n; i++) {
      const cell = row.insertCell(-1);
      const text = document.createTextNode("");
      cell.appendChild(text);
    }
  }

  private removeRow(ix: number) {
    this.table.deleteRow(ix);
  }

  private updateRow(ix: number, member: MemberInfo) {
    const row = this.table.rows[ix + 1];

    const nameNode = row.cells[this.IX_NAME].firstChild as Text;
    const nameStr = (member.name != undefined) ? member.name : "noname";
    if (nameNode) { nameNode.data = nameStr; }
    
    const nameCell = row.cells[this.IX_NAME];
    nameCell.title = member.id;

    const inputNode = row.cells[this.IX_INPUT].firstChild as Text;
    const inputStrBase = (member.inputContent === undefined) ? "" : member.inputContent;
    if (inputNode) {
      const len = this.seekTextStartForShowAll(inputStrBase);
      var inputStr = inputStrBase.substr(len);
      inputNode.data = inputStr;
    }

    this.updateStates();
  }

  private seekTextStartForShowAll(src: string): number {
    const lenMax = src.length;
    const wMessage = UtilDom.getWidth(this.header2);
    this.fontChecker.textContent = src;
    var w = UtilDom.getWidth(this.fontChecker);
    if (w <= wMessage) return 0;

    var len = Math.floor(lenMax/2);
    var upper = lenMax;
    var lower = 1;
    for (var i=0 ; i<10 ; i++) {
      this.fontChecker.textContent = src.substr(lenMax-len,len);
      w = UtilDom.getWidth(this.fontChecker);
      if (w > wMessage) {
        if (len < upper) { upper = len; }
      } else {
        if (len > lower) { lower = len; }
      }

      if (upper === (lower+1)) return lenMax-lower;

      len = Math.floor( (upper+lower)/2 );
    }

    return lenMax-lower; // avoid infinite loop
  }

  private updateStates() {
  }

  updateConfig() {
    this.configToScreen();
  }

  localize() {
    this.setTitle(T.t("Input Monitor","Monitor"))
  }

  private setTitle(title:string) {
    this.titlebar.textContent = title
  }

  focus() {
    // no operation
  }
}
