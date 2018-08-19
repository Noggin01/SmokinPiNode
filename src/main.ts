import { Pid } from "./pid"
import { Valve } from "./valve"
import { Cabinet } from "./cabinet"
import * as web from "./web"
import * as state from "./state"
import { loggerInit } from './common/logger'

const log = loggerInit({name: 'smokinPi', consoleLevel: 'trace', fileLevel: 'trace'})

const cabinet = new Cabinet( log )
const valve = new Valve( log, {min: 550, max: 1100 } )
const pid = new Pid( log, { kp: 200, kd: 0, ki: 1, klimit: 1100, minOutput: valve.min, maxOutput: valve.max })

state.setSetpoint(250)
web.init(log, 4200)

const simulatedTemps = [ 5, 5, 5, 5, 5, 5, 5, 5, 5 ]

setInterval(function(){
    pid.update( cabinet.temperature )   // Tell the PID the current temperature
    valve.setPosition( pid.output )     // Move the valve to the PID controlled position
    pid.setpoint = state.getSetpoint()  // Update the PID to use the new setpoint, in case it changed

    cabinet.simulate( valve.getPercentOpen )    // Test code, to simulate cabinet temperature
                                                // This is to be replaced with code that reads temperature sensors

    log.trace({ output: Number(pid.output).toFixed(0), windup: Number(pid.windup).toFixed(2), temperature: Number(cabinet.temperature).toFixed(2)}, 'Control stats')
    
    // Update the state module so that the web module can transmit temperature data to the web page
    for (let i = 0; i < simulatedTemps.length; i++) {
        simulatedTemps[i] += ((cabinet.temperature - simulatedTemps[i]) / (100 * (i+1)))
    }
    state.setTempData( {cabinet: cabinet.temperature, channels: simulatedTemps} )
}, 1000)

setInterval(function(){
    state.addHistory(cabinet.temperature, simulatedTemps)
}, 15000)