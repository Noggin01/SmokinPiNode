import { Valve } from "./valve"
import { Pid } from "./pid"
import { Cabinet } from "./cabinet"
import { Logger } from "../common/logger"
import * as state from "../state"

export class Smoker {
    private _valve: Valve
    private _pid: Pid
    private _cabinet: Cabinet
    private _log: Logger

    constructor ( log: Logger, 
                    {
                        minValvePosition = 550 as number,
                        maxValvePosition = 1100 as number,
                        kp = 200 as number,
                        kd = 0 as number,
                        ki = 1 as number,
                        klimit = 1100 as number
                    } = {} ) {
        this._log = log.child('smoker')

        this._log.warn('Simulating cabinet temperature instead of reading it from state')

        this._cabinet = new Cabinet( this._log )
        this._valve = new Valve( this._log, { min: minValvePosition, max: maxValvePosition })
        this._pid = new Pid( this._log, { kp: kp, ki: ki, kd: kd, klimit: klimit, minOutput: minValvePosition, maxOutput: maxValvePosition })

        setInterval(() => this.cabinetTask(), 1000)
    }

    public get cabinet () { return this._cabinet }

    private cabinetTask () {
        this._pid.update( this._cabinet.temperature )     // Tell the PID the current temperature
        this._valve.setPosition( this._pid.output )       // Move the valve to the PID controlled position
        this._pid.setpoint = state.getSetpoint()         // Update the PID to use the new setpoint, in case it changed
    
        this._cabinet.simulate( this._valve.getPercentOpen )      // Test code, to simulate cabinet temperature
                                                                // This is to be replaced with code that reads temperature sensors
    
        this._log.trace({ output: Number(this._pid.output).toFixed(0),
            windup: Number(this._pid.windup).toFixed(2),
            temperature: Number(this._cabinet.temperature).toFixed(2)}, 'Control stats')
    }
}