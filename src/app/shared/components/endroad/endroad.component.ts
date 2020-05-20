import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-endroad',
  templateUrl: './endroad.component.html',
  styleUrls: ['./endroad.component.css']
})
export class EndroadComponent implements OnInit {

  @Input() set text(text) {
    this._config['text'] = text
  }
  @Input() set textColor(textColor) {
    this._config['textColor'] = textColor
  }
  @Input() set fontSize(fontSize) {
    this._config['fontSize'] = fontSize
  }
  @Input() set mode(mode) {
    this._config['mode'] = mode
  }
  @Input() set layout(layout) {
    this._config['layout'] = layout
  }

  _config:any
  @Input()
  set config(config: any) {
    if (this.preset) {
      this._config = { ...this._config, ...this.presetConfig() }
    }

    if (config) {
      this._config = { ...this._config, ...config }
    }
  }
  get config():any {
    return this._config
  }

  _preset
  @Input()
  set preset(preset) {
    this._preset = preset
    this.config = undefined // updates config
  }
  get preset() {
    return this._preset
  }

  presetConfig() {
    let preset = {}
    if (this.preset === 'loading') {
      preset = this.loadingPreset()
    } else if (this.preset === 'warning') {
      preset = this.warningPreset()
    } else if (this.preset === 'error') {
      preset = this.errorPreset()
    } else if (this.preset === 'empty') {
      preset = this.emptyPreset()
    }
    return preset
  }

  defaultPreset() {
    return {
      icon: "",
      iconSize: "1.3em",
      text: "",
      textColor: "#585858",
      fontSize: "1.3em",
      mode: "overlay",
      layout: "stacked"
    }
  }

  loadingPreset() {
    return {
      text: "loading...",
      icon: "fas fa-circle-notch fa-spin text-primary"
    }
  }

  warningPreset() {
    return {
      icon: "fas fa-exclamation-triangle text-danger m-b-sm",
      iconSize: "2em",
      fontSize: "1em",
      mode: "inline"
    }
  }
  errorPreset() {
    return {
      icon: "fas fa-exclamation-circle text-danger m-b-sm",
      iconSize: "2em",
      fontSize: "1em",
      mode: "inline"
    }
  }
  emptyPreset() {
    return {
      icon: "far fa-times-circle text-danger m-b-sm",
      iconSize: "2em",
      fontSize: "1em",
      mode: "inline"
    }
  }

  constructor() {
    this.config = this.defaultPreset()
  }

  ngOnInit() {
  }

}
