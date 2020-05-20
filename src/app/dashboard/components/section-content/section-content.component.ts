import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-section-content',
  templateUrl: './section-content.component.html',
  styleUrls: ['./section-content.component.css']
})
export class SectionContentComponent implements OnInit {

  @Input() section

  constructor(
    private dragulaService: DragulaService,
  ) {
    if (this.dragulaService.find('dashboardWigets') === undefined) {
      this.dragulaService.createGroup("dashboardWigets", {
        moves: function (el, container, target) {
          return !target.classList.contains('nav-link');
        }
      })
    }
  }

  ngOnInit() {
  }
}
