import { Directive, HostBinding, HostListener, NgZone, OnDestroy, Input, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective implements OnDestroy {

  @Input()
  menu: ElementRef

  @Input()
  toggle: ElementRef

  @HostBinding('class.open') isOpen = false

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen
    this.enableScrollListener(this.isOpen)
  }

  eventOptions = true

  constructor(
    private ngZone: NgZone,
    private renderer: Renderer
  ) { }

  enableScrollListener(enabled: boolean) {
    this.updateMenuPosition()
    enabled ? this.addScrollListener() : this.removeScrollListener()
  }

  addScrollListener() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scroll, <any>this.eventOptions);
    });
  }

  removeScrollListener() {
    //unfortunately the compiler doesn't know yet about this object, so cast to any
    window.removeEventListener('scroll', this.scroll, <any>this.eventOptions);
  }

  ngOnDestroy() {
    this.removeScrollListener()
  }

  scroll = (): void => {
    this.ngZone.run(() => {
      this.updateMenuPosition()
    });
  };

  updateMenuPosition() {
    let rect = this.toggle.nativeElement.getBoundingClientRect();
    this.renderer.setElementStyle(this.menu.nativeElement, 'top', rect.top + rect.height + 'px');
    this.renderer.setElementStyle(this.menu.nativeElement, 'left', rect.left + 'px');
  }
}
