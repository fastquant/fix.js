//import { Message } from './message'
import {EventEmitter2 as EventEmitter } from 'eventemitter2'

export class Session extends EventEmitter {
    constructor(private version: string, private senderCompID: string, private targetCompID: string, private options: any) {
        super()
    }

 //   public send(message: Message) {
  //  }
}