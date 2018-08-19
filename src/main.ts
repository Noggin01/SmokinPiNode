import { Pid } from "./smoker/pid"
import { Valve } from "./smoker/valve"
import { Cabinet } from "./smoker/cabinet"
import { Smoker } from "./smoker"
import * as web from "./web/web"
import * as state from "./state"
import { loggerInit } from './common/logger'

const log = loggerInit({name: 'smokinPi', consoleLevel: 'trace', fileLevel: 'trace'})
const smoker = new Smoker( log )

state.setSetpoint(250)
web.init(log, 4200)

const simulatedTemps = [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ]

setInterval(() => {
    for (let i = 0; i < simulatedTemps.length; i++) {
        simulatedTemps[i] += ((smoker.cabinet.temperature - simulatedTemps[i]) / (100 * (i+1)))
    }
    state.setTempData( {cabinet: smoker.cabinet.temperature, channels: simulatedTemps} )
}, 1000)

setInterval(() => {
    state.addHistory(smoker.cabinet.temperature, simulatedTemps)
}, 15000)