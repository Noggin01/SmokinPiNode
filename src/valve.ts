import { Logger } from './common/logger'

export class Valve {
    private _min: number
    private _max: number
    private currentPosition: number
    private desiredPosition: number
    private log: Logger

    constructor(   log: Logger,
                {  min = 550,
                   max = 1100 } = {}){
        this._min = min
        this._max = max 
        this.currentPosition = undefined
        this.log = log.child('valve')

        this.log.fatal(`Need to enable the servo`)
    }

    public get min(){ return this._min }
    public get max(){ return this._max }

    public setPosition(position: number) {
        this.desiredPosition = position
    }

    public get getPercentOpen() {
        return (this.desiredPosition - this._min) / (this.max - this.min)
    }
}