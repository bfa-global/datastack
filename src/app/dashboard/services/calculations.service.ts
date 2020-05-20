import { Injectable } from '@angular/core';
import { Calculation } from '../models/calculation.enum';
import * as moment from 'moment';
import { DataReference } from '../models/data-reference.model';

@Injectable({
  providedIn: 'root'
})


export class CalculationsService {

  constructor() { }


  startDateForCalculation(calculation: Calculation, endDate: string, format: string): string {
    let startDate = undefined
    if (calculation === Calculation.vs_prior_day) {
      startDate = moment(endDate, format).startOf('day').subtract(1, 'days').format(format)
    } else if (calculation === Calculation.vs_prior_month) {
      startDate = moment(endDate, format).startOf('month').subtract(1, 'months').format(format)
    } else if (calculation === Calculation.vs_prior_year) {
      startDate = moment(endDate, format).startOf('year').subtract(1, 'years').format(format)
    } else if (calculation === Calculation.percentage_change_vs_prior_day) {
      startDate = moment(endDate, format).startOf('day').subtract(1, 'days').format(format)
    } else if (calculation === Calculation.percentage_change_vs_prior_month) {
      startDate = moment(endDate, format).startOf('month').subtract(1, 'months').format(format)
    } else if (calculation === Calculation.percentage_change_vs_prior_year) {
      startDate = moment(endDate, format).startOf('year').subtract(1, 'years').format(format)
    }
    return startDate
  }

  calculate(dataRef: DataReference, data: object[]): object[] {
    let newData

    if ((Calculation[dataRef.calculation] as Calculation === Calculation.vs_prior_day as Calculation) ||
      (Calculation[dataRef.calculation] as Calculation === Calculation.vs_prior_month as Calculation) ||
      (Calculation[dataRef.calculation] as Calculation === Calculation.vs_prior_year as Calculation)) {
      newData = data.reverse().reduce((acc: any[], value, index, array) => {
        if (index != 0) {
          let displayValue = dataRef.evaluateDataValue(value)
          let previousValue = array[index - 1]
          let previousDisplayValue = dataRef.evaluateDataValue(previousValue)
          let postCalc = displayValue - previousDisplayValue
          value[dataRef.calculation] = postCalc
          acc.push(value)
        }
        return acc
      }, [])
    } else if ((Calculation[dataRef.calculation] as Calculation === Calculation.percentage_change_vs_prior_day as Calculation) ||
      (Calculation[dataRef.calculation] as Calculation === Calculation.percentage_change_vs_prior_month as Calculation) ||
      (Calculation[dataRef.calculation] as Calculation === Calculation.percentage_change_vs_prior_year as Calculation)) {
      newData = data.reverse().reduce((acc: any[], value, index, array) => {
        if (index != 0) {
          let displayValue = dataRef.evaluateDataValue(value)
          let previousDisplayValue = dataRef.evaluateDataValue(array[index - 1])
          let postCalc = ((displayValue - previousDisplayValue) / previousDisplayValue)
          value[dataRef.calculation] = postCalc
          acc.push(value)
        }
        return acc
      }, [])
    } else {
      newData = data
    }

    return newData
  }


}
