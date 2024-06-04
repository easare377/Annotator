import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {ScrollDirection} from "../models/enum/ScrollDirection";

@Directive({
  selector: '[customScroll]'
})
export class CustomScrollDirective {
  @Input() threshold = 100; // Adjust sensitivity as needed (in pixels)
  @Output() direction = new EventEmitter<ScrollDirection>();

  private lastScrollTop = 0;

  constructor(private el: ElementRef) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    const currentScrollTop = this.el.nativeElement.scrollTop;
    const scrollDiff = currentScrollTop - this.lastScrollTop;

    if (Math.abs(scrollDiff) > this.threshold) {
      this.lastScrollTop = currentScrollTop;
      this.direction.emit(scrollDiff > 0 ? ScrollDirection.DOWN : ScrollDirection.UP);
    }
  }
}
