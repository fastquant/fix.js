const fs = require('fs');
const glob = require('glob')
const xml2js = require('xml2js');
const path = require('path');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const _ = require('underscore')

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

function isDigit(ch) {
    return ch.match(/\d/) == ch ? 1 : 0;
}

class Generator {
    constructor(output) {
        this.indent = 0;
        this.root = Object.create(null)
        let respath = path.normalize(path.join(__dirname, '..', 'resources/'))
        glob.sync(`${respath}/*.xml`).forEach(file => {
            const fixver = path.basename(file, ".xml");
            this.root[fixver] = new dom().parseFromString(fs.readFileSync(file).toString())
        })

        let componentNodeMap = new Map()
        Object.keys(this.root).forEach(fixver => {
            let compMap = new Map();
            for (const node of xpath.select('fix/components/component|fix/messages/message', this.root[fixver])) {
                compMap.set(node.getAttribute("name"), node)
            }
            componentNodeMap.set(fixver, compMap)
        })
        this.components = Object.create(null)
        for (const [fixver, compMap] of componentNodeMap) {
            this.components[fixver] = Object.create(null)
            for (const [name, compNode] of compMap) {
                this.components[fixver][name] = {
                    name: name,
                    children: this.getCompomentChildrenName(name, componentNodeMap, fixver)
                }
            }
        }
        this.stream = fs.createWriteStream(output, { encoding: "utf8" })
    }

    getCompomentChildrenName(compName, compNodeMap, fixver) {
        const parent = compNodeMap.get(fixver).get(compName)
        let result = []
        const children = xpath.select('field|group|component', parent)
        for (const c of children) {
            const name = c.getAttribute('name')
            if (c.localName === "field") {
                result.push({ type: 'field', name: name })
            } else if (c.localName == "group") {
                result.push({ type: 'group', name: name })
            } else if (c.localName === "component") {
                result.push(this.getCompomentChildrenName(name, compNodeMap, fixver))
            }
        }
        return result
    }

    pushIndent() {
        this.indent++
    }

    popIndent() {
        this.indent--
    }

    generate() {
        this.writeLine("// This file is auto-generated. Don't modify it.");
        this.writeLine("import { Message, Group, MsgCat } from './message'");
        this.writeEmptyLine()
        this.generateFieldClasses(this.root)
        this.generateGroupClass(this.root)
        this.generateMessageClasses(this.root)
        this.stream.end()
    }

    writeLine(text) {
        let str = " ".repeat(Generator.indentLength).repeat(this.indent) + text + "\n"
        this.stream.write(str);
    }

    write(text) {
        this.stream.write(text);
    }

    writeEmptyLine() {
        this.stream.write('\n');
    }

    generateMessageClasses(root) {
        Object.keys(root).forEach(fixver => {
            this.writeLine(`namespace ${fixver} {`)
            this.pushIndent()
            const messageNpdes = xpath.select("fix/messages/message", root[fixver])
            for (const node of messageNpdes) {
                const name = node.getAttribute("name")
                const msgcat = node.getAttribute("msgcat")
                const msgtype = node.getAttribute("msgtype")
                this.writeLine(`export class ${name} extends Message {`)
                this.writeLine(`    public static MsgType: string = "${msgtype}"`)
                if (msgcat === 'admin')
                    this.writeLine(`    public static MsgCat = MsgCat.Admin`)
                else
                    this.writeLine(`    public static MsgCat = MsgCat.App`)
                this.writeLine(`    constructor() { super() }`)

                // Generate message members
                this.pushIndent()
                for (const c of this.components[fixver][name].children) {
                    if (c.type === "field") {
                        this.writeLine(`public get ${c.name}(): string { return "" }`)
                        this.writeLine(`public set ${c.name}(value: string) {}`)
                    } else if(c.type === "group") {
                        this.writeLine(`public ${c.name}: Groups.${c.name}[]`)
                    }
                }
                this.popIndent()
                this.writeLine(`}`)
            }
            this.popIndent()
            this.writeLine(`}`)
        })
    }

    generateFieldClasses(root) {
        const fieldNodes = xpath.select("fix/fields/field", root["FIX50SP2"])
        let fields = Object.create(null)
        for (const n of fieldNodes) {
            const name = n.getAttribute("name")
            const type = n.getAttribute("type")
            const number = n.getAttribute("number")
            const values = xpath.select("value", n)
            fields[name] = {
                name: name,
                type: type,
                number: number,
                values: values.map(v => ({ enum: v.getAttribute("enum"), description: v.getAttribute("description") }))
            }
        }
        this.writeLine(`namespace Fields {`)
        this.pushIndent()
        for (const i in fields) {
            const f = fields[i]
            this.writeLine(`export class ${f.name} {`);
            this.writeLine(`    public static tag(): number { return ${f.number} }`);
            for (const v of f.values) {
                let desc = isDigit(v.description[0]) ? '$' + v.description : v.description
                this.writeLine(`    public static ${desc} = "${v.enum}"`)
            }
            this.writeLine(`    constructor() {} `);
            this.writeLine('}')
        }
        this.popIndent()
        this.writeLine('}')
    }

    generateGroupClass(root) {
        Object.keys(root).forEach(fixver => {
            const groupNodes = xpath.select("fix/messages/message/group|fix/components/component/group", root[fixver])
            let groups = Object.create(null)
            for (const g of groupNodes) {
                const name = g.getAttribute("name")
                const required = g.getAttribute("required")
                const fieldNode = xpath.select("field", g)
                groups[name] = {
                    name: name,
                    required: required,
                    fields: fieldNode.map(f => f.getAttribute("name"))
                }
            }
            this.writeLine(`namespace ${fixver}.Groups {`)
            this.pushIndent()
            for (let i in groups) {
                const g = groups[i]
                this.writeLine(`export class ${g.name} extends Group {`)
                this.writeLine(`    constructor() { super() }`)
                this.writeLine('}')
            }
            this.popIndent()
            this.writeLine('}')
        })
    }
}

Generator.indentLength = 4

module.exports = { Generator: Generator }