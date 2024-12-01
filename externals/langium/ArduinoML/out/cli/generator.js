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
    var _a;
    const sensors = getSensors(transition.condition);
    for (const sensor of sensors) {
        fileNode.append(`
                    ` + sensor.name + `BounceGuard = millis() - ` + sensor.name + `LastDebounceTime > debounce;`);
    }
    fileNode.append(`
                    if (`);
    compileCondition(transition.condition, fileNode);
    fileNode.append(`)  {`);
    fileNode.append(`
                        currentState = ` + ((_a = transition.next.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`);
    for (const sensor of sensors) {
        fileNode.append(`
                        ` + sensor.name + `LastDebounceTime = millis();`);
    }
}
function getSensors(condition) {
    switch (condition.$type) {
        case "SensorCondition":
            if (condition.sensor.ref === undefined)
                return [];
            return [condition.sensor.ref];
        case "UnaryCondition":
            return [...getSensors(condition.condition)];
        case "BinaryCondition":
            return [...getSensors(condition.left), ...getSensors(condition.right)];
        case "TemporalCondition":
            return [];
    }
}
function compileCondition(condition, fileNode) {
    switch (condition.$type) {
        case "BinaryCondition":
            compileBinaryCondition(condition, fileNode);
            break;
        case "UnaryCondition":
            compileUnaryCondition(condition, fileNode);
            break;
        default:
            compileTerminalCondition(condition, fileNode);
    }
}
function compileTerminalCondition(condition, fileNode) {
    switch (condition.$type) {
        case "SensorCondition":
            compileSensorCondition(condition, fileNode);
            break;
        case "TemporalCondition":
            compileTemporalCondition(condition, fileNode);
            break;
    }
}
function compileSensorCondition(sensorCondition, fileNode) {
    var _a, _b;
    fileNode.append(`( digitalRead(` + ((_a = sensorCondition.sensor.ref) === null || _a === void 0 ? void 0 : _a.inputPin) + `) == ` + sensorCondition.value.value + `  && ` + ((_b = sensorCondition.sensor.ref) === null || _b === void 0 ? void 0 : _b.name) + `BounceGuard)`);
}
function compileTemporalCondition(temporalCondition, fileNode) {
    fileNode.append(`(millis() - startTime >= ` + temporalCondition.duration + `)`);
}
function compileUnaryCondition(unaryCondition, fileNode) {
    fileNode.append(`(` + getOperator(unaryCondition.operator.value) + ` `);
    compileCondition(unaryCondition.condition, fileNode);
    fileNode.append(`)`);
}
function getOperator(operator) {
    switch (operator) {
        case "AND":
            return "&&";
        case "OR":
            return "||";
        case "NOT":
            return "!";
        default:
            return operator;
    }
}
function compileBinaryCondition(binaryCondition, fileNode) {
    fileNode.append(`(`);
    compileCondition(binaryCondition.left, fileNode);
    fileNode.append(` ` + getOperator(binaryCondition.operator.value) + ` `);
    compileCondition(binaryCondition.right, fileNode);
    fileNode.append(`)`);
}
//# sourceMappingURL=generator.js.map