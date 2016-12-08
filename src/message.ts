import * as moment from 'moment';

function getUTCTimeStamp(date): string {
    return moment(date).utc().format('YYYYMMDD-HH:mm:ss.SSS');
}

export type IFieldValue = string | number | null | undefined;

export interface IField {
    tag: number;
    value: IFieldValue
}

export interface IGroup {
    fields: { [tag: number]: IField | IGroup }
}


/*export class Message1 {
    private static SOH: string = String.fromCharCode(1)
    private _fields: { [id: string]: any }

    constructor() {
        this._fields = {};
        this._define_field('49', 'SenderCompID');
        this._define_field('56', 'TargetCompID');
        this._define_field('50', 'SenderSubID');
        this._define_field('35', 'MsgType');
        this._define_field('34', 'MsgSeqNum');
        this._define_field('52', 'SendingTime');
    }

    private _define_field(field_id: string, name: string, opt: any = {}): void {
        var validator = (opt && opt.validator) ? opt.validator : function (v) { return v; };
        Object.defineProperty(this, name, {
            get: function () {
                return this.get(field_id);
            },
            set: function (value) {
                this.set(field_id, validator(value));
            }
        });
    };


    public get(field_id: string): any { return this._fields[field_id]; }
    public set(field_id: string, value: any): any {
        if (value instanceof Date) value = getUTCTimeStamp(value);
        this._fields[field_id] = value;
    }

    public serialize(): string {
        var d = {
            "Header": {
                "BeginString": "FIXT.1.1",
                "MsgType": "W",
                "MsgSeqNum": "4567",
                "SenderCompID": "SENDER",
                "TargetCompID": "TARGET",
                "SendingTime": "20160802-21:14:38.717"
            },
            "Body": {
                "SecurityIDSource": "8",
                "SecurityID": "ESU6",
                "MDReqID": "789",
                "NoMDEntries": [
                    {
                        "MDEntryType": "0",
                        "MDEntryPx": "1.50",
                        "MDEntrySize": "75",
                        "MDEntryTime": "21:14:38.688"
                    },
                    {
                        "MDEntryType": "1",
                        "MDEntryPx": "1.75",
                        "MDEntrySize": "25",
                        "MDEntryTime": "21:14:38.688"
                    }
                ]
            },
            "Trailer": {
            }
        }
        var header_arr = [];
        var body_arr = [];

        var fields = this._fields;

        header_arr.push('35=' + this.MsgType);
        header_arr.push('52=' + this.SendingTime);
        header_arr.push('49=' + this.SenderCompID);
        header_arr.push('56=' + this.TargetCompID);
        header_arr.push('34=' + this.MsgSeqNum);

        // manually inserted
        var ignore = ['8', '9', '35', '10', '52', '49', '56', '34'];

        for (var tag in fields) {
            if (fields.hasOwnProperty(tag) && ignore.indexOf(tag) === -1
                && typeof fields[tag] !== 'undefined' && fields[tag] !== null) {
                body_arr.push(tag + '=' + fields[tag]);
            }
        }

        var headermsg = header_arr.join(Message.SOH);
        var bodymsg = body_arr.join(Message.SOH);

        var out = [];
        out.push('8=' + 'FIX.4.4'); // TODO variable

        // if there is no body, then only one separator will be added
        // if there is a body, then there will be another separator
        var sep_count = 1;
        if (bodymsg.length > 0) {
            sep_count += 1;
        }

        out.push('9=' + (headermsg.length + bodymsg.length + sep_count));
        out.push(headermsg);

        if (bodymsg.length > 0) {
            out.push(bodymsg);
        }

        var outmsg = out.join(Message.SOH);
        outmsg += Message.SOH;
        return outmsg + '10=' + this.checksum(outmsg) + Message.SOH;
    }

    public checksum(str: string): string {
        let chksm = 0;

        for (let i = 0; i < str.length; ++i) {
            chksm += str.charCodeAt(i);
        }

        chksm = chksm % 256;

        let checksumstr = '';
        if (chksm < 10) {
            checksumstr = '00' + (chksm + '');
        } else if (chksm >= 10 && chksm < 100) {
            checksumstr = '0' + (chksm + '');
        } else {
            checksumstr = '' + (chksm + '');
        }

        return checksumstr;
    }
    public parse(raw: string): void {

    }
}
*/
export enum MsgCat {
    App,
    Admin
}

export class Group { }
export class Header { }
export class Trail { }
export class Message {
    private static SOH: string = String.fromCharCode(1)
    private _fields: { [id: string]: any } = {}

    public get Header(): Header { return null }
    public set Header(value: Header) { }

    public get Trail(): Trail { return null }
    public set Trail(value: Trail) { }
}
