import * as _ from 'lodash'

let tempData = {} as any
let setpoint: number
const history = { series: [[],[],[],[],[],[],[],[],[],[]] as any, labels: [] as any }

export function setTempData( data ) { tempData = _.cloneDeep(data) }
export function getTempData(){ return tempData }

export function setSetpoint( newSetpoint ){ setpoint = newSetpoint }
export function getSetpoint(){ return (setpoint) ? setpoint : 225 }

export function addHistory( cabinetTemp, channelTemps ){
    history.series[0].push(cabinetTemp)
    for (let i = 0; i < channelTemps.length; i++) {
        history.series[i+1].push(channelTemps[i])
    }
    history.labels.push(history.labels.length + 1)
}
export function getHistory(){ return history }