import fs from "fs";
import jassParse, { Comment, EmptyLine, Globals, Native, Type, Variable } from "jass-to-ast";

const commonUjData = fs.readFileSync("./jass/common-uj.j").toString().replaceAll("\r\n", "\n");
const blizzardData = fs.readFileSync("./jass/blizzard.j").toString().replaceAll("\r\n", "\n");
const commonJassDocData = fs.readFileSync("./jass/common-jassDoc.j").toString().replaceAll("\r\n", "\n");

let docMode = false;
let constatntMode = false;

const natives: Record<string, unknown> = {};
const globals: Record<string, unknown> = {};

const docKeys: Record<string, unknown> = {};

docMode = false;
let lastDocComment: string = null;

jassParse(commonUjData).forEach(processAstNode);

constatntMode = true;
jassParse(blizzardData).forEach(processAstNode);

docMode = true;
jassParse(commonJassDocData).forEach(processAstNode);

function processAstNode(node: unknown) {
    if (node instanceof Comment) {
        if (node.startsWith("*")) {
            lastDocComment = node.toString().substring(1);
        }
    } else if (docMode && node instanceof Type) {
        lastDocComment && (docKeys[node.base.toString()] = lastDocComment);
    } else if (node instanceof Globals) {
        node.globals.forEach(processAstNode);
    } else if (node instanceof Variable) {
        if (docMode) {
            lastDocComment && (docKeys[node.name.toString()] = lastDocComment);
        } else {
            if (!constatntMode || node.constant) {
                globals[node.name.toString()] = node.type;
            }
        }
    } else if (node instanceof Native) {
        if (docMode) {
            lastDocComment && (docKeys[node.name.toString()] = lastDocComment);
        } else {
            natives[node.name] = {
                returnType: node.returns || "nothing",
                args: !node.params
                    ? []
                    : Array.from(node.params).map((i) => {
                          return {
                              name: i.name,
                              type: i.type,
                          };
                      }),
            };
        }
    }

    if (!(node instanceof EmptyLine) && !(node instanceof Comment)) {
        lastDocComment = null;
    }
}

fs.writeFileSync(
    "./src/database/natives.ts",
    "export default " +
        JSON.stringify(natives) +
        " as Record<string, { returnType: string; args: Array<{ name: string; type: string }> }>",
);
fs.writeFileSync("./src/database/globals.ts", "export default " + JSON.stringify(globals));
fs.writeFileSync("./src/database/docKeys.ts", "export default " + JSON.stringify(docKeys));
