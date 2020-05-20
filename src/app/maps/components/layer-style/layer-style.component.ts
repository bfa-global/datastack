import { Component, OnInit, Input } from '@angular/core';
import { MapLayerService } from '../../services/map-layer.service';
import { MapLayer } from '../../models/layer.model';

@Component({
  selector: 'app-layer-style',
  templateUrl: './layer-style.component.html',
  styleUrls: ['./layer-style.component.css']
})
export class LayerStyleComponent implements OnInit {

  @Input() layer: MapLayer


  constructor(
    public mapLayerService: MapLayerService,
  ) { }

  ngOnInit() {
    if (this.layer.datasource === "carto") {
      if (this.layer['style']['layer']['opacity'] === undefined) {
        this.layer['style']['layer']['opacity'] = 1
      }
    } else {
      if (this.layer['style']['fillOpacity'] === undefined) {
        this.layer['style']['fillOpacity'] = 1
      }
    }
  }

  changed(event) {
    this.layer.styleString = this.layer.layerToStyleString()

  }

  select(event) {
    this.layer.styleString = this.layer.layerToStyleString()
    // this.mapLayerService.refreshLayer(this.layer)
  }

  opacityFormatter(value) {
    return value * 100
  }

  isLight(color): boolean {

    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

      r = color[1];
      g = color[2];
      b = color[3];
    }
    else {

      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +("0x" + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'));

      r = color >> 16;
      g = color >> 8 & 255;
      b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 127.5) {
      return true;
    }
    else {
      return false;
    }
  }
}
