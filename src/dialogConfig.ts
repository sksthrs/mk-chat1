import { T } from "./t";
import { AppConfig } from "./appConfig";
import { UtilDom } from "./utilDom";
import Log from "./log";

export class DialogConfig {
  private readonly container = document.getElementById('config-container') as HTMLDivElement
  private readonly pane = document.getElementById("config") as HTMLDivElement;
  private readonly buttonReset = document.getElementById('config-reset') as HTMLButtonElement
  private readonly buttonOK = document.getElementById('config-button-ok') as HTMLButtonElement
  private readonly buttonCancel = document.getElementById('config-button-cancel') as HTMLButtonElement

  onSetClicked: () => void = () => {};
  onResetClicked:() => void = () => {}

  constructor() {
    this.setTitle(T.t("Config", "Config"))
    
    this.buttonReset.addEventListener('click', ev => {
      this.onResetClicked()
    })
    this.buttonOK.addEventListener('click', ev => {
      this.dialogToConfig()
      this.hideDialog()
      this.onSetClicked()
    })
    this.buttonCancel.addEventListener('click', ev => {
      this.hideDialog()
    })
  } // end of constructor

  private setTitle(title:string) {
    // nop
  }

  showDialog() {
    this.configToDialog();
    UtilDom.show(this.container)
  }

  hideDialog() {
    UtilDom.hide(this.container)
  }

  configToDialog() {
    // search input elements which id starts "config_", then apply config value for text/color/checkbox
    const elms = this.pane.getElementsByTagName("input");
    const len = elms.length;
    for (var i=0 ; i<len ; i++) {
      const elm = elms[i];
      if (!elm.id.startsWith("config_")) continue;
      const key = elm.id.substr(7);
      if (AppConfig.data[key] != undefined) {
        if (elm.type === "text" || elm.type === "number") {
          elms[i].value = AppConfig.data[key].toString();
        } else if (elm.type === "color") {
          elms[i].value = AppConfig.data[key].toString();
        } else if (elm.type === "checkbox") {
          if (AppConfig.data[key] === true) {
            elms[i].checked = true;
          } else if (AppConfig.data[key] === false) {
            elms[i].checked = false;
          } else {
            Log.w('Warning',`configToDialog checkbox item --- not boolean [${elm.id}]`)
          }
        } else {
          Log.w('Warning',`configToDialog type not found id:${key}`);
        }
      }
      else if (AppConfig.data[elm.name] != undefined) {
        const c = AppConfig.data[elm.name];
        if (elm.type === "radio") {
          var isMatch = false;
          switch (typeof c) {
            case "string":
              isMatch = c === elm.value;
              break;
            case "number":
              isMatch = c === Number(elm.value);
              break;
            case "boolean":
              isMatch = c === (elm.value.toLowerCase() === "true");
              break;
          }
          if (isMatch) {
            elms[i].checked = true;
          }
        } else {
          Log.w('Warning',`configToDialog type not found name:${elm.name} (id:${elm.id})`);
        }
      } else {
        Log.w('Warning',`configToDialog assign failed id:${elm.id} name:${elm.name}`);
      }
    }
  }

  dialogToConfig() {
    const elms = this.pane.getElementsByTagName("input");
    const len = elms.length;

    for (var i=0 ; i<len ; i++) {
      if (!elms[i].id.startsWith("config_")) continue;
      var key = "";
      if (elms[i].type === "radio") {
        if (elms[i].checked) {
          key = elms[i].name; // For radio, there're many ids for single config item. Instead, name matches the item's key.
        } else {
          continue; // ignore non-checked radiobox
        }
      } else {
        key = elms[i].id.substr(7);
      }
      if (key !== "" && AppConfig.data[key] === undefined) {
        Log.w('Warning',`dialogToConfig not found : key=${key} element:${elms[i].id}`);
        continue;
      }

      if (typeof AppConfig.data[key] === "string" || AppConfig.data[key] instanceof String) {
        if (AppConfig.data[key] !== elms[i].value) {
          AppConfig.data[key] = elms[i].value;
        }
      } else if (typeof AppConfig.data[key] === "number" || AppConfig.data[key] instanceof Number) {
        const n = Number(elms[i].value);
        if (n === undefined || n === null) continue;
        if (AppConfig.data[key] !== n) {
          AppConfig.data[key] = n;
        }
      } else if (typeof AppConfig.data[key] === "boolean" || AppConfig.data[key] instanceof Boolean) {
        if (elms[i].type === "checkbox") {
          if (AppConfig.data[key] !== elms[i].checked) {
            AppConfig.data[key] = elms[i].checked;
          }
        } else {
          Log.w('Warning',`config [${key}] matched non-checkbox input (id=${elms[i].id})`);
        }
      } else {
        Log.w('Warning',`configToDialog assign failed : [${elms[i].id}]`);
      }
    }
  }
}
