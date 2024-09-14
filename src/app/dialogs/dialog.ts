import {IDialog} from "./i-dialog";

export class Dialog implements IDialog{
  public visible: boolean = false;
  public onReset: Function | undefined;

  hideDialog(): void {
    if (this.onReset){
      this.onReset();
    }
    this.visible = false;
  }

  showDialog(): void {
    this.visible = true;
  }
}
