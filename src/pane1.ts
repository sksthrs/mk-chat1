import { UtilDom } from "./utilDom"

class Pane1 {
  private pane = document.getElementById('pane1') as HTMLDivElement

  show() {
    UtilDom.displayOn(this.pane, 'flex')
  }

  hide() {
    UtilDom.displayOff(this.pane)
  }
}

export default Pane1
