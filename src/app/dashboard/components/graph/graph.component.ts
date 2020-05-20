import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ResizedEvent } from 'angular-resize-event';
import { filter } from 'rxjs/operators';
import 'rxjs/add/operator/takeUntil';
import { Subject, observable } from 'rxjs';
declare var vega: any;


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements AfterViewInit, OnInit {


  @Input() component
  data

  @Input() observables: any
  @Input() id: any
  view
  width
  shouldRender = false
  private destroy$ = new Subject();

  constructor() {

  }

  public vegaInit() {
    if (this.shouldRender) {
      setTimeout(() => {//TODO: Find a better way to preventing binding before ID is set
        for (let i = 0; i < this.data.length; i++) {
          this.component.options.data[i] = {
            "name": "" + i,
            "values": this.data[i].data
          }
        }

        this.shouldRender = false
        setTimeout(() => {//TODO: Find a better way to preventing graph rendering from triggering resizing
          this.shouldRender = true

        }, 100);

        let options = this.dereferencedOptions()
        this.view = new vega.View(vega.parse(options))
          .renderer('svg')          // set renderer (canvas or svg)
          .initialize('#' + this.id)// initialize view within parent DOM container
          .width(this.width - 150)               // set chart width 
          .height(250)              // set chart height
          .hover()                  // enable hover encode set processing
          .run();
      }, 1);
    }
  }

  onResized(event: ResizedEvent) {
    this.width = event.newWidth
    this.vegaInit()
  }

  ngOnInit() {
    this.id = "graph_" + this.create_UUID()

    this.observables.pipe(
      filter(response => response !== undefined)
    ).takeUntil(this.destroy$).subscribe((response) => {
      this.data = response
      this.vegaInit()
    })

  }

  ngAfterViewInit() {
    this.shouldRender = true
    this.vegaInit()
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  // - Dereference fields

  dereferencedOptions(): object {
    return this.dereference(this.component.options, this.component.options.mapping)
  }

  dereference(object, substitutions): object {
    let options = JSON.parse(JSON.stringify(object)) //deep copy
    Object.keys(substitutions).forEach(substitutionkey => {
      let formattedKey = "{" + substitutionkey + "}"
      this.dereferenceObject(options, formattedKey, substitutions[substitutionkey])
    })
    return options
  }

  dereferenceArray(array: Object[], substitution: string, value: any) {
    for (let object of array) {
      if (object instanceof Object) {
        this.dereferenceObject(object, substitution, value)
      }
    }
  }

  dereferenceObject(object: Object, substitution: string, value: any) {
    Object.keys(object).forEach(key => {
      if (typeof (object[key]) === "string") {
        if (object[key].includes(substitution)) {
          object[key] = object[key].replace(substitution, value)
        }
      } else if (object[key] instanceof Array) {
        this.dereferenceArray(object[key], substitution, value)
      } else if (object[key] instanceof Object) {
        this.dereferenceObject(object[key], substitution, value)
      }
    })
  }

  // - Helper
  create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
}