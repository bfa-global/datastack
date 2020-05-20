import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as d3 from "d3";
import { PageSection } from '../models/dashboard-section.model';

@Injectable({
  providedIn: 'root'
})
export class PageService {

  pages = new BehaviorSubject<Record<string, PageSection[]>>({});

  constructor() { }

  loadPageWithURL(pageURL) {
    return d3.json(pageURL).then((response) => {
      let pageSections: PageSection[] = response.map(d => PageSection.fromJSON(d))
      let allCurrentSections = this.pages.getValue()
      allCurrentSections[pageURL] = pageSections
      this.pages.next(allCurrentSections)
    })

  }
}
