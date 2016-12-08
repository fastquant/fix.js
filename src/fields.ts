import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

const data = fs.readFileSync(path.join(__dirname, '../resources/FIX44.xml')).toString();
const parser = new xml2js.Parser();
let r = Object.create(null)
parser.parseString(data, (e, result) => {
    result.fields.field.forEach(field => r[field['@'].name] = { tag: field['@'].number });
});