import { Component, OnInit } from '@angular/core';
import { GlobalSettingsService } from './global-settings.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-global-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.css']
})
export class GlobalSettingsComponent implements OnInit {

  timeoutSetting
  guestSetting
  newSettingError

  constructor(
    public globalSettingsService: GlobalSettingsService
  ) { }

  ngOnInit() {
    this.globalSettingsService.loadAllGlobalSettings()
    this.globalSettingsService.settings.pipe(
      filter(settings => settings !== undefined)
    ).subscribe((settings) => {
      for (let setting of settings) {
        if (setting.slug === 'idle_timeout') {
          this.timeoutSetting = setting
        } else if (setting.slug === 'guest-data-record-limit') {
          this.guestSetting = setting
        }
      }
    })
  }

  submitNewSetting(key, value) {
    const setting = {
      key: key,
      value: JSON.stringify(value)
    }
    this.globalSettingsService.saveNewSetting(key, setting)
      .then(() => {
      }).catch((error) => {
        this.newSettingError = error
        console.warn("Error")
      })
  }


}
