import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Dialog} from "../dialog";

export type ConfirmationDialogState = 'info' | 'warning' | 'critical';
export type ConfirmationDialogDefaultButton = 'ok' | 'cancel';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css', '../dialog.css']
})
export class ConfirmationDialogComponent extends Dialog {
  @Input() title: string = 'Confirm action';
  @Input() message: string = 'Are you sure you want to continue?';
  @Input() okText: string = 'OK';
  @Input() cancelText: string = 'Cancel';
  @Input() state: ConfirmationDialogState = 'info';
  @Input() defaultButton: ConfirmationDialogDefaultButton = 'ok';
  @Output() ok = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  activeButton: ConfirmationDialogDefaultButton = this.defaultButton;

  override showDialog(): void {
    this.activeButton = this.defaultButton;
    super.showDialog();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.visible) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelDialog();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      this.switchActiveButton();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.activeButton === 'cancel' ? this.cancelDialog() : this.okDialog();
    }
  }

  setActiveButton(button: ConfirmationDialogDefaultButton): void {
    this.activeButton = button;
  }

  private switchActiveButton(): void {
    this.activeButton = this.activeButton === 'ok' ? 'cancel' : 'ok';
  }

  okDialog(): void {
    this.ok.emit();
    this.confirmed.emit();
    this.hideDialog();
  }

  cancelDialog(): void {
    this.cancel.emit();
    this.cancelled.emit();
    this.hideDialog();
  }
}
