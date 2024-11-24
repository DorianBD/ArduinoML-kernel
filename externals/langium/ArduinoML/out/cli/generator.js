"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInoFile = void 0;
const fs_1 = __importDefault(require("fs"));
const langium_1 = require("langium");
const path_1 = __importDefault(require("path"));
const cli_util_1 = require("./cli-util");
function generateInoFile(app, filePath, destination) {
    const data = (0, cli_util_1.extractDestinationAndName)(filePath, destination);
    const generatedFilePath = `${path_1.default.join(data.destination, data.name)}.ino`;
    const fileNode = new langium_1.CompositeGeneratorNode();
    compile(app, fileNode);
    if (!fs_1.default.existsSync(data.destination)) {
        fs_1.default.mkdirSync(data.destination, { recursive: true });
    }
    fs_1.default.writeFileSync(generatedFilePath, (0, langium_1.toString)(fileNode));
    return generatedFilePath;
}
exports.generateInoFile = generateInoFile;
function compile(app, fileNode) {
    var _a;
    fileNode.append(`
//Wiring code generated from an ArduinoML model
// Application name: ` + app.name + `

long debounce = 200;
enum STATE {` + app.states.map(s => s.name).join(', ') + `};

STATE currentState = ` + ((_a = app.initial.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`, langium_1.NL);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            fileNode.append(`
bool ` + brick.name + `BounceGuard = false;
long ` + brick.name + `LastDebounceTime = 0;

            `, langium_1.NL);
        }
    }
    fileNode.append(`
	void setup(){`);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            compileSensor(brick, fileNode);
        }
        else {
            compileActuator(brick, fileNode);
        }
    }
    fileNode.append(`
	}
	void loop() {
			switch(currentState){`, langium_1.NL);
    for (const state of app.states) {
        compileState(state, fileNode);
    }
    fileNode.append(`
		}
	}
	`, langium_1.NL);
}
function compileActuator(actuator, fileNode) {
    fileNode.append(`
		pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`);
}
function compileSensor(sensor, fileNode) {
    fileNode.append(`
		pinMode(` + sensor.inputPin + `, INPUT); // ` + sensor.name + ` [Sensor]`);
}
function compileState(state, fileNode) {
    fileNode.append(`
				case ` + state.name + `:`);
    for (const action of state.actions) {
        compileAction(action, fileNode);
    }
    if (state.transition !== null) {
        compileTransition(state.transition, fileNode);
    }
    fileNode.append(`
				break;`);
}
function compileAction(action, fileNode) {
    var _a;
    fileNode.append(`
					digitalWrite(` + ((_a = action.actuator.ref) === null || _a === void 0 ? void 0 : _a.outputPin) + `,` + action.value.value + `);`);
}
function compileTransition(transition, fileNode) {
    var _a, _b, _c, _d, _e, _f;
    // fileNode.append(`
    //  			`+transition.sensor.ref?.name+`BounceGuard = millis() - `+transition.sensor.ref?.name+`LastDebounceTime > debounce;
    // 			if( digitalRead(`+transition.sensor.ref?.inputPin+`) == `+transition.value.value+` && `+transition.sensor.ref?.name+`BounceGuard) {
    // 				`+transition.sensor.ref?.name+`LastDebounceTime = millis();
    // 				currentState = `+transition.next.ref?.name+`;
    // 			}
    // `)
    fileNode.append(`
                    ` + ((_a = transition.condition.mandatoryCondition.sensor.ref) === null || _a === void 0 ? void 0 : _a.name) + `BounceGuard = millis() - ` + ((_b = transition.condition.mandatoryCondition.sensor.ref) === null || _b === void 0 ? void 0 : _b.name) + `LastDebounceTime > debounce;
                    `);
    compileOptionalConditionsBounceGuard(transition.condition.optionalConditions, fileNode);
    fileNode.append(`
                    if (digitalRead(` + ((_c = transition.condition.mandatoryCondition.sensor.ref) === null || _c === void 0 ? void 0 : _c.inputPin) + `) == ` + transition.condition.mandatoryCondition.value.value + ` && ` + ((_d = transition.condition.mandatoryCondition.sensor.ref) === null || _d === void 0 ? void 0 : _d.name) + `BounceGuard`);
    compileOptionalConditions(transition.condition.optionalConditions, fileNode);
    fileNode.append(`)  {
                        currentState = ` + ((_e = transition.next.ref) === null || _e === void 0 ? void 0 : _e.name) + `;
                        ` + ((_f = transition.condition.mandatoryCondition.sensor.ref) === null || _f === void 0 ? void 0 : _f.name) + `LastDebounceTime = millis();
                        ` + transition.condition.optionalConditions.map(optionalCondition => { var _a; return ((_a = optionalCondition.condition.sensor.ref) === null || _a === void 0 ? void 0 : _a.name) + `LastDebounceTime = millis(); `; }).join('\n') + `
                    }`);
}
function compileOptionalConditionsBounceGuard(optionalConditions, fileNode) {
    var _a, _b;
    for (const optionalCondition of optionalConditions) {
        fileNode.append(((_a = optionalCondition.condition.sensor.ref) === null || _a === void 0 ? void 0 : _a.name) + `BounceGuard = millis() - ` + ((_b = optionalCondition.condition.sensor.ref) === null || _b === void 0 ? void 0 : _b.name) + `LastDebounceTime > debounce;
            `);
    }
}
function compileOptionalConditions(optionalConditions, fileNode) {
    var _a, _b;
    for (const optionalCondition of optionalConditions) {
        fileNode.append(`
                        ` + (optionalCondition.operator.value == "AND" ? "&&" : "||") + ` ` + `( digitalRead(` + ((_a = optionalCondition.condition.sensor.ref) === null || _a === void 0 ? void 0 : _a.inputPin) + `) == ` + optionalCondition.condition.value.value + ` && ` + ((_b = optionalCondition.condition.sensor.ref) === null || _b === void 0 ? void 0 : _b.name) + `BounceGuard)`);
    }
}
//# sourceMappingURL=generator.js.map