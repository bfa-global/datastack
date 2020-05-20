import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BigqueryParserService {

  constructor() { }

  arrify (value) {
    if (value === null || value === undefined) {
      return [];
    }
  
    if (Array.isArray(value)) {
      return value;
    }
  
    if (typeof value === 'string') {
      return [value];
    }
  
    if (typeof value[Symbol.iterator] === 'function') {
      return [...value];
    }
  
    return [value];
  };

  mergeSchemaWithRows(
    schema,
    rows
  ) {
    return this.arrify(rows)
      .map(mergeSchema)
      .map(flattenRows);
    function mergeSchema(row) {
      return row.f!.map((field, index: number) => {
        const schemaField = schema.fields![index];
        let value = field.v;
        if (schemaField.mode === 'REPEATED') {
          value = (value).map(val => {
            return convert(schemaField, val.v);
          });
        } else {
          value = convert(schemaField, value);
        }
        // tslint:disable-next-line no-any
        const fieldObject: any = {};
        fieldObject[schemaField.name!] = value;
        return fieldObject;
      });
    }

    // tslint:disable-next-line no-any
    function convert(schemaField, value: any) {
      if (value === "") {
        return value;
      }

      switch (schemaField.type) {
        case 'BOOLEAN':
        case 'BOOL': {
          value = value.toLowerCase() === 'true';
          break;
        }
        case 'BYTES': {
          // value = Buffer.from(value, 'base64');
          break;
        }
        case 'FLOAT':
        case 'FLOAT64': {
          value = Number(value);
          break;
        }
        case 'INTEGER':
        case 'INT64': {
          value = Number(value);
          break;
        }
        case 'NUMERIC': {
          // value = new Big(value);
          break;
        }
        case 'RECORD': {
          // value = BigQuery.mergeSchemaWithRows_(schemaField, value).pop();
          break;
        }
        case 'DATE': {
          // value = BigQuery.date(value);
          break;
        }
        case 'DATETIME': {
          // value = BigQuery.datetime(value);
          break;
        }
        case 'TIME': {
          // value = BigQuery.time(value);
          break;
        }
        case 'TIMESTAMP': {
          // value = BigQuery.timestamp(new Date(value * 1000));
          break;
        }
        case 'GEOGRAPHY': {
          // value = BigQuery.geography(value);
          break;
        }
        default:
          break;
      }

      return value;
    }

    // tslint:disable-next-line no-any
    function flattenRows(rows: any[]) {
      return rows.reduce((acc, row) => {
        const key = Object.keys(row)[0];
        acc[key] = row[key];
        return acc;
      }, {});
    }
  }
}
