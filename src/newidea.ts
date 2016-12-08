namespace Idea {
    namespace Fields {
        export class Account {
        }
        export class AdvId {
        }
        export class AdvRefID {
        }
        export class AdvSide {
            public static BUY = "B"
            public static SELL = "S"
            public static TRADE = "T"
            public static CROSS = "X"
        }
    }
    namespace Groups {
        export class DerivativeSecurityXML {
        }
        export class InstrumentLeg {
        }
        export class InstrmtLegExecGrp {
        }
        export class TrdCapRptSideGrp {
        }
        export class PositionAmountData {
        }
    }
    namespace FIX55 {
        export class IOI {
            public static MsgType: string = "6"
            constructor() { }
            public get IOIid(): string { return "" }
            public set IOIid(value: string) { }
            public get IOITransType(): string { return "" }
            public set IOITransType(value: string) { }
            public get IOIRefID(): string { return "" }
            public set IOIRefID(value: string) { }
            public get Symbol(): string { return "" }
            public set Symbol(value: string) { }
        }
    }

    function haha():void {
        let msg = new FIX55.IOI()
        msg.IOIid = "1000"
    }
}
