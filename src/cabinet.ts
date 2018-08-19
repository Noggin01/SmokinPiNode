import { Logger } from './common/logger'

export class Cabinet {
    _temperature: number
    _probe1: number
    log: Logger

    constructor(log: Logger) {
        this._temperature = 75  // Assume room temperature
        this.log = log.child('cabinet')

        this.log.info('Cabinet initialized')
    }

    public get temperature(){ return this._temperature }

    public simulate( valvePosition: number ) {
        this._temperature += (valvePosition / 10)
        this._temperature -= (this.temperature - 75) / 5000
    }
}