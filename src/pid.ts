import { Logger } from './common/logger'

export class Pid {
    kp: number
    kd: number
    ki: number
    klimit: number
    kwindup: number
    pidOutput: number
    pidSetpoint: number
    lastInput: number
    minOutput: number
    maxOutput: number
    private log: Logger
    
    constructor( log: Logger,
                 {  kp = 1000,
                    ki = 1000,
                    kd = 0,
                    klimit = 1000000,
                    pidSetpoint = 225,
                    minOutput = 550,
                    maxOutput = 1100, } = {} ) {
        this.kp = kp
        this.kd = kd
        this.ki = ki
        this.klimit = klimit
        this.pidOutput = 0
        this.kwindup = 0
        this.pidSetpoint = pidSetpoint
        this.minOutput = minOutput
        this.maxOutput = maxOutput
        this.log = log.child('pid')
        
        this.log.info(`New PID: kp:${kp} ki:${ki} kd:${kd} klimit:${klimit} setpoint:${pidSetpoint}`)
    }

    public get output() { return this.pidOutput }
    public get windup() { return this.kwindup }

    public set setpoint(theSetpoint: number) { this.pidSetpoint = theSetpoint }

    public update( input: number ) {
        let error = this.pidSetpoint - input
        if (!this.lastInput) {
            this.lastInput = input
        }
        let dInput = input - this.lastInput
        this.kwindup += error
        
        if (this.kwindup > this.klimit) {
            this.kwindup = this.klimit
        } else if (-this.kwindup < -this.klimit) {
            this.kwindup = -this.klimit
        }
        
        this.pidOutput = this.kp * error + this.ki * this.kwindup - this.kd * dInput

        if (this.pidOutput < this.minOutput) {
            this.pidOutput = this.minOutput
        } else if (this.pidOutput > this.maxOutput) {
            this.pidOutput = this.maxOutput
        }

        this.lastInput = input
        return this.pidOutput
    }
}