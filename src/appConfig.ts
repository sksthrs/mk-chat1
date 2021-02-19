import { T } from './t';

export class AppConfig {
  // for "config[key]" style
  [key: string]: string | number | boolean | object;

  // miscellaneous
  _misc_locale: string = ""; // access through getLocale/setLocale.
  // empty string : use OS default locale
  getLocale() : string {
    return (this._misc_locale === "") ? T.getBrowserLocale() : this._misc_locale;
  }
  setLocale(locale:string) {
    if (locale === T.getBrowserLocale()) {
      this._misc_locale = "";
    } else {
      this._misc_locale = locale;
    }
  }

  misc_pane1_width: number = 70
  misc_pane2_width: number = 30
  misc_display_input_height: number = 65
  misc_monitor_height: number = 35

  // display pane
  main_font_size: number = 24;

  // input pane
  input_font_size: number = 20;
  input_parentheses_1: string = "";
  input_parentheses_2: string = "";
  input_parenthesesShift_1: string = "";
  input_parenthesesShift_2: string = "";

  private getParentheses1_Default() : string { return T.t("“", "Config|Input"); }
  private getParentheses2_Default() : string { return T.t("”", "Config|Input"); }
  private getParenthesesShift1_Default() : string { return T.t("(", "Config|Input"); }
  private getParenthesesShift2_Default() : string { return T.t(")", "Config|Input"); }

  getParentheses1() :string {
    if (this.input_parentheses_1 === "") return this.getParentheses1_Default();
    return this.input_parentheses_1;
  }
  setParentheses1(p:string) :boolean {
    if (p === this.getParentheses1_Default()) {
      if (this.input_parentheses_1 === "") return false;
      this.input_parentheses_1 = "";
    } else {
      if (this.input_parentheses_1 === p) return false;
      this.input_parentheses_1 = p;
    }
    return true;
  }

  getParentheses2() :string {
    if (this.input_parentheses_2 === "") return this.getParentheses2_Default();
    return this.input_parentheses_2;
  }
  setParentheses2(p:string) :boolean {
    if (p === this.getParentheses2_Default()) {
      if (this.input_parentheses_2 === "") return false;
      this.input_parentheses_2 = "";
    } else {
      if (this.input_parentheses_2 === p) return false;
      this.input_parentheses_2 = p;
    }
    return true;
  }

  getParenthesesShift1() :string {
    if (this.input_parenthesesShift_1 === "") return this.getParenthesesShift1_Default();
    return this.input_parenthesesShift_1;
  }
  setParenthesesShift1(p:string) :boolean {
    if (p === this.getParenthesesShift1_Default()) {
      if (this.input_parenthesesShift_1 === "") return false;
      this.input_parenthesesShift_1 = "";
    } else {
      if (this.input_parenthesesShift_1 === p) return false;
      this.input_parenthesesShift_1 = p;
    }
    return true;
  }

  getParenthesesShift2() :string {
    if (this.input_parenthesesShift_2 === "") return this.getParenthesesShift2_Default();
    return this.input_parenthesesShift_2;
  }
  setParenthesesShift2(p:string) :boolean {
    if (p === this.getParenthesesShift2_Default()) {
      if (this.input_parenthesesShift_2 === "") return false;
      this.input_parenthesesShift_2 = "";
    } else {
      if (this.input_parenthesesShift_2 === p) return false;
      this.input_parenthesesShift_2 = p;
    }
    return true;
  }

  // monitor pane
  monitor_font_size: number = 10;

  // note pane
  note_font_size: number = 14;

  // f-keys pane
  fkey_font_size: number = 12;

  // singleton

  private constructor() {
  }

  private static configNow: AppConfig|undefined = undefined;
  public static get data():AppConfig {
    if (AppConfig.configNow === undefined) { AppConfig.configNow = new AppConfig(); }
    return AppConfig.configNow;
  }

  // utilities

  // set values

  static tryApplyNewData(loaded: {[key:string]: any}): boolean {
    this.configNow = new AppConfig();
    for (var key of Object.keys(loaded)) {
      if (key in this.configNow) {
        if (typeof this.configNow[key] === typeof loaded[key]) {
          this.configNow[key] = loaded[key];
        }
      }
    }
    return true;
  }

  static trySetJSON(json:string) : boolean {
    const obj = JSON.parse(json);
    return this.tryApplyNewData(obj);
  }

  static getJSON() : string {
    return JSON.stringify(AppConfig.data);
  }

  static resetAll() {
    AppConfig.configNow = new AppConfig()
  }

}
