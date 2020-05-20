import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  public shown: boolean = true

  constructor() { }

  toggleShown(){
    this.shown = !this.shown;
  }
}
