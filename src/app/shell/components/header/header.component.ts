import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { SidenavService } from '../../services/sidenav.service';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from '../../../services/menu.service';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  title: string = ""
  private destroy$ = new Subject();

  constructor(
    public auth: AuthService,
    public sidenavService: SidenavService,
    public router: Router,
    public menuService: MenuService,
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).takeUntil(this.destroy$).subscribe((event: NavigationEnd) => {
      this.updateTitle()
    });
  }


  ngOnInit() {
    this.menuService.availableMenus.takeUntil(this.destroy$).subscribe(pages => {
      this.updateTitle()
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  updateTitle() {
    let page = this.menuService.currentMenu()
    let pageName = this.menuService.pageName()
    if (page && "pageTitle" in page) {
      this.title = page["pageTitle"]
    } else if (pageName === "account") {
      this.title = "Account"
    } else if (pageName === "settings") {
      this.title = "Settings"
    } else {
      this.title = "Home"
    }
  }



}
