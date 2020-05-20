import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  export(items, fileTitle, type = 'CSV') {
    switch (type) {
      case 'CSV': {
        this.exportCSV(items, fileTitle); break;
      }
      default: {
        console.warn("Unsupported export file format", type)
        break;
      }
    }

  }


  exportCSV(items, fileTitle) {
    if (this.canContinueWith(items)) {

      //add headers to front of list
      items.unshift(Object.keys(items[0]))

      // Convert Object to JSON
      var jsonObject = JSON.stringify(items);

      var csv = this.convertToCSV(jsonObject);

      var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
      } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilenmae);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
  }

  canContinueWith(items): boolean {
    if (items) {
      if (items.length) {
        return true
      } else {
        // no records to export
        console.warn("0 records to export")
      }
    } else {
      // no data made avaible
      console.warn("Data hasn't loaded")
    }
    return false
  }

  convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') {
          line += ','
        }
        line += "\"" + array[i][index] + "\"";
      }

      str += line + '\r\n';
    }

    return str;
  }
}
