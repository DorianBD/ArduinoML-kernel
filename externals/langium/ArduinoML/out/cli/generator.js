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
// Application name: ` + app.name, langium_1.NL);
    if (app.ldcs.length > 0) {
        fileNode.append(`#include <LiquidCrystal.h>`, langium_1.NL);
    }
    fileNode.append(`
long debounce = 200;
enum STATE {` + app.states.map(s => s.name).join(', ') + `};

STATE currentState = ` + ((_a = app.initial.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`, langium_1.NL);
    newLine(fileNode);
    if (app.ldcs.length > 0) {
        for (const ldc of app.ldcs) {
            compileLDC(ldc, fileNode);
        }
        newLine(fileNode);
    }
    const EXCEPTION_HIGH_DURATION = 400;
    const EXCEPTION_LOW_DURATION = 100;
    const EXCEPTION_IDLE_DURATION = 1200;
    const EXCEPTION_LED_PIN = 12;
    for (const brick of app.bricks) {
        if (brick.$type === "Sensor") {
            fileNode.append(`bool ` + brick.name + `BounceGuard = false;
long ` + brick.name + `LastDebounceTime = 0;`, langium_1.NL);
            newLine(fileNode);
        }
    }
    fileNode.append(`int exceptionNumber = 0;`, langium_1.NL);
    fileNode.append(`long startTime = millis();`, langium_1.NL);
    fileNode.append(`\nvoid setup() {`, langium_1.NL);
    if (app.exceptions.length > 0) {
        fileNode.append(`   pinMode( ${EXCEPTION_LED_PIN}, OUTPUT); // Exception LED`, langium_1.NL);
    }
    for (const brick of app.bricks) {
        switch (brick.$type) {
            case "Sensor":
                compileSensor(brick, fileNode);
                break;
            case "Actuator":
                compileActuator(brick, fileNode);
                break;
        }
    }
    fileNode.append(`}
    
void loop() {`, langium_1.NL);
    //write in the ldcs the values of their sensors
    for (const ldc of app.ldcs) {
        compileLDCWrite(ldc, fileNode);
    }
    if (app.exceptions.length > 0) {
        fileNode.append(`   if(exceptionNumber > 0){
        for(int i = exceptionNumber; i > 0; i--){
            digitalWrite(${EXCEPTION_LED_PIN}, HIGH);
            delay(${EXCEPTION_HIGH_DURATION});
            digitalWrite(${EXCEPTION_LED_PIN}, LOW);
            delay(${EXCEPTION_LOW_DURATION});
        }
        delay(${EXCEPTION_IDLE_DURATION});
        return;
    }`, langium_1.NL);
        const exceptionsSensorsSet = new Set(app.exceptions
            .flatMap(exception => getSensors(exception.condition)) // Get all sensors for all exceptions
        );
        newLine(fileNode);
        for (const sensor of exceptionsSensorsSet) {
            compileDebounce(sensor, fileNode, 1);
        }
        newLine(fileNode);
        for (const exception of app.exceptions) {
            fileNode.append(`   if(`);
            compileCondition(exception.condition, fileNode);
            fileNode.append(`){
        exceptionNumber = ` + exception.value + `;
        return;
    }`, langium_1.NL);
        }
    }
    fileNode.append(`\n   switch(currentState){`, langium_1.NL);
    for (const state of app.states) {
        compileState(state, fileNode, 2);
    }
    fileNode.append(getTabString(1) + `}
}`, langium_1.NL);
}
function compileLDC(ldc, fileNode) {
    fileNode.append(`LiquidCrystal ` + ldc.name + `(` + ldc.rs + `, ` + ldc.en + `, ` + ldc.d4 + `, ` + ldc.d5 + `, ` + ldc.d6 + `, ` + ldc.d7 + `, ` + ldc.backlight + `);`, langium_1.NL);
}
function compileLDCWrite(ldc, fileNode) {
    //  lcd.print the value of their sensor ex : button := HIGH
    fileNode.append(`   ` + ldc.name + `.clear();`, langium_1.NL);
    const sensor = ldc.sensor.ref;
    fileNode.append(`   ` + ldc.name + `.print(String("` + (sensor === null || sensor === void 0 ? void 0 : sensor.name) + ` := ") + (digitalRead(` + (sensor === null || sensor === void 0 ? void 0 : sensor.inputPin) + `) == HIGH ? "HIGH" : "LOW"));`, langium_1.NL);
}
function compileActuator(actuator, fileNode) {
    fileNode.append(`   pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`, langium_1.NL);
}
function compileSensor(sensor, fileNode) {
    fileNode.append(`   pinMode(` + sensor.inputPin + `, INPUT); // ` + sensor.name + ` [Sensor]`, langium_1.NL);
}
function compileState(state, fileNode, tabNumber = 0) {
    fileNode.append(getTabString(tabNumber) + `case ` + state.name + `:`, langium_1.NL);
    for (const action of state.actions) {
        compileAction(action, fileNode, tabNumber + 1);
    }
    if (state.transition !== null) {
        newLine(fileNode);
        compileTransition(state.transition, fileNode, tabNumber + 1);
    }
    fileNode.append(getTabString(tabNumber + 1) + `break;`, langium_1.NL);
    newLine(fileNode);
}
function newLine(fileNode) {
    fileNode.append("", langium_1.NL);
}
function compileAction(action, fileNode, tabNumber = 0) {
    var _a;
    fileNode.append(getTabString(tabNumber) + `digitalWrite(` + ((_a = action.actuator.ref) === null || _a === void 0 ? void 0 : _a.outputPin) + `,` + action.value.value + `);`, langium_1.NL);
}
function compileTransition(transition, fileNode, tabNumber = 0) {
    var _a;
    const sensors = getSensors(transition.condition);
    for (const sensor of sensors) {
        compileDebounce(sensor, fileNode, tabNumber);
    }
    newLine(fileNode);
    fileNode.append(getTabString(tabNumber) + `if (`);
    compileCondition(transition.condition, fileNode, tabNumber);
    fileNode.append(`)  {`, langium_1.NL);
    fileNode.append(getTabString(tabNumber + 1) + `currentState = ` + ((_a = transition.next.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`, langium_1.NL);
    fileNode.append(getTabString(tabNumber + 1) + `startTime = millis();`, langium_1.NL);
    for (const sensor of sensors) {
        fileNode.append(getTabString(tabNumber + 1) + sensor.name + `LastDebounceTime = millis();`, langium_1.NL);
    }
    fileNode.append(getTabString(tabNumber) + `}`, langium_1.NL);
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
function compileCondition(condition, fileNode, tabNumber = 0) {
    switch (condition.$type) {
        case "BinaryCondition":
            compileBinaryCondition(condition, fileNode);
            break;
        case "UnaryCondition":
            compileUnaryCondition(condition, fileNode);
            break;
        case "SensorCondition":
            compileSensorCondition(condition, fileNode);
            break;
        case "TemporalCondition":
            compileTemporalCondition(condition, fileNode);
            break;
    }
}
function getTabString(taNumber) {
    return "    ".repeat(taNumber);
}
function compileDebounce(sensor, fileNode, tabNumber = 0) {
    fileNode.append(getTabString(tabNumber) + sensor.name + `BounceGuard = millis() - ` + sensor.name + `LastDebounceTime > debounce;`, langium_1.NL);
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