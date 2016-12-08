export interface IAcceptor {
    start():void
    stop(force:boolean):void
}

export abstract class Acceptor implements IAcceptor {
    public start():void {}
    public stop(force:boolean):void {}
}