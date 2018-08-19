import express from 'express'
import socketIo, { Socket } from 'socket.io'
import * as http from 'http'
import * as state from '../state'
import { Logger } from '../common/logger'

const app = express();  
const server = http.createServer(app);  
const io = socketIo(server);
let log: Logger
let monitors = [] as any

export function init(_log: Logger, _port: number) {
    log = _log.child('web')

    log.info({ port: _port }, 'Initializing web')
    
    app.use(express.static(__dirname + '/../node_modules'));  
    app.get('/', function(req, res,next) {
        log.trace('Serving web page')  
        res.sendFile(__dirname + '/public/index.html');
    });
    server.listen(_port);
    
    io.on('connection', function(socket) {
        monitors.push(new Monitor(log, socket))
        // log.info({ connection: socket.handshake.address }, 'Client connected...')
        // log.debug({ setpoint: state.getSetpoint() }, 'Sending setpoint')
        // socket.emit('message', { setpoint: state.getSetpoint() })
        
        // // Change the setpoint upon command from the client
        // socket.on('targetTempMsg', function(msg){
        //     log.debug({ connection: socket.handshake.address, setpoint: msg.setpoint }, 'Received new setpoint')
        //     state.setSetpoint(msg.setpoint)
        // })       

        // // Send temperature data periodically
        // setInterval(() => {
        //     log.trace({ cabinet: state.getTempData().cabinet.toFixed(2), fire: 450.3 }, `emit to ${socket.handshake.address}`)
        //     socket.emit('message', { cabinet: state.getTempData().cabinet.toFixed(2), fire: 450.3 })
        // }, 1000) 
        
        // setInterval(() => {
        //     log.trace({ chartData: state.getHistory() }, `emit to ${socket.handshake.address}`)
        //     socket.emit('message', { chartData: state.getHistory() })
        // }, 15000)
    })
}

class Monitor {
    private socket: Socket
    private intervals = [] as any
    private log: Logger

    constructor (_log: Logger, _socket: Socket) {
        this.socket = _socket
        this.log = _log.child(this.socket.handshake.address)

        this.log.info('Client connected')
        this.log.debug({ setpoint: state.getSetpoint() }, 'Sending setpoint')
        this.socket.emit('message', { setpoint: state.getSetpoint() })

        this.intervals.push(this.startDataEmitter())
        this.intervals.push(this.startHistoryEmitter())

        this.socket.on('disconnect', () => {
            this.log.trace('Clearing timeouts')
            this.intervals.forEach(timeout => clearTimeout(timeout))
        })
    }

    private startDataEmitter() { return setInterval(() => this.dataEmitter(), 1000) }
    private startHistoryEmitter() { return setInterval(() => this.historyEmitter(), 15000)}

    private dataEmitter() {
        this.log.trace({ cabinet: state.getTempData().cabinet.toFixed(2), fire: 450.3 }, `emit to ${this.socket.handshake.address}`)
        this.socket.emit('message', { cabinet: state.getTempData().cabinet.toFixed(2), fire: 450.3 })
    }

    private historyEmitter() {
        this.log.trace({ chartData: state.getHistory() }, `emit to ${this.socket.handshake.address}`)
        this.socket.emit('message', { chartData: state.getHistory() })
    }
}