import { UtilDom } from "./utilDom"

class Pane2 {
  private pane = document.getElementById('pane2') as HTMLDivElement

  show() {
    UtilDom.displayOn(this.pane, 'flex')
  }

  hide() {
    UtilDom.displayOff(this.pane)
  }
}

export default Pane2
