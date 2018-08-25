import * as spi from 'spi-device'
import { Logger } from '../logger'

const tlc1543_channel_count = 14

export class Tlc1543 {
    private device
    private log: Logger
    private conversions: number[] = []

    constructor ( busNumber: number, deviceNumber: number, log: Logger, options?: {} ) {
        this.log = log.child('tlc1543')
        this.log.info({ busNumber: busNumber, deviceNumber: deviceNumber }, 'initializing tlc1543 SPI device')
        
        this.device = spi.open( busNumber, deviceNumber, options || {}, (err) => {
            if (err) throw err

            this.log.info({ busNumber: busNumber, deviceNumber: deviceNumber }, 'tlc1543 SPI device open')
            this.initialize()
            this.service()
        })
    }

    public get results () { return this.conversions }

    private initialize () {
        const message = [{
            sendBuffer: Buffer.from([0x00, 0x00]),
            receiveBuffer: Buffer.alloc(2),
            byteLength: 2,
            speedHz: 2000000,
            microSecondDelay: 200,
        }]
        
        this.device.transfer(message, (err) => {
            if (err) throw err
            // do nothing with the response, we'ere only kicking off the initial conversion
        })
    }

    private service () {
        const messages = [] as any
        
        for (let i = 0; i < tlc1543_channel_count; i++) {
            messages.push({
                /**
                 * The tlc1543 recieves command in the form of 4 bits of data.  All remaining
                 * intput data is ignored.  We've already sent 0x00 to start the conversion of
                 * channel 0.  The next time we send a command, we'll get the result of channel
                 * 0 conversion.  So, now we need to send 0x1000, 0x2000, 0x3000, ... 0xD000,
                 * and finally 0x0000.  This will let us read the results of each channel and
                 * then start the conversion of channel 0 again.
                 */
                sendBuffer: Buffer.from([((i + 1) % tlc1543_channel_count) << 4, 0x00]),
                receiveBuffer: Buffer.alloc(2),
                byteLength: 2,
                speedHz: 2000000,
                microSecondDelay: 200,
            })
        }

        this.device.transfer(messages, (err, message) => {
            if (err) throw err

            for (let i = 0; i < tlc1543_channel_count; i++) {
                this.conversions[i] = (message[i].receiveBuffer[0] << 8 + message[i].receiveBuffer[1]) >> 6
            }

            // Far too much data to print to trace
            // this.log.trace(JSON.stringify(this.conversions))
        })
        
        setTimeout(() => this.service(), 10)
    }
}
