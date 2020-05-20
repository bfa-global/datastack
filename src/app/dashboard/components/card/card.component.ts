import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input() title: string = undefined;
  @Input() toolbar
  @Output() actions = new EventEmitter()

  constructor() { }

  ngOnInit() { }

  selectedToolbarAction(index) {
    let tool = this.toolbar[index]
    if ('actions' in tool) {
      this.actions.emit(tool['actions'])
    }
  }

}
