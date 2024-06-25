import {IDialog} from "./i-dialog";

export class Dialog implements IDialog{
  public visible: boolean = false;

  hideDialog(): void {
    this.visible = false;
  }

  showDialog(): void {
    this.visible = true;
  }

}
