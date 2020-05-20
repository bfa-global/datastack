import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(
    public sidenavService: SidenavService,
  ) { }

  ngOnInit() {
  }

  year() {
    return (new Date()).getFullYear()
  }

}
