export class RejectWithText extends Error {
    constructor(private text: string, private field: string) {
        super(text)
        this.field = field
    }
}

export interface IInitiator {

}

export abstract class Initiator implements IInitiator {

}
export class Client {

}