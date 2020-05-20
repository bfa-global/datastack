import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {
  @ViewChild('toggleEl') toggle: ElementRef;
  @ViewChild('menuEl') menu: ElementRef;
  @Input() options: string[];
  @Input() index: number = 0
  @Output() selectedIndex = new EventEmitter()
  _icon: string
  @Input()
  get icon(): string {
    return this._icon ? this._icon : "fas fa-angle-down"
  }
  set icon(icon: string) {
    this._icon = icon
  }

  constructor() { }

  ngOnInit() { }

  selectIndex(index: number) {
    this.index = index
    this.selectedIndex.emit(this.index)
  }

}
