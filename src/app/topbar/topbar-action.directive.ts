import {Directive, HostBinding, Input} from '@angular/core';

export type TopbarActionVariant = '' | 'primary' | 'secondary';

@Directive({
  selector: 'button[topbarAction]'
})
export class TopbarActionDirective {
  @Input() topbarAction: TopbarActionVariant = '';

  @HostBinding('class.topbar-action')
  readonly actionClass = true;

  @HostBinding('class.topbar-action-primary')
  get primaryClass(): boolean {
    return this.topbarAction === 'primary';
  }
}
