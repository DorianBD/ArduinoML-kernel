import fs from 'fs';
import {CompositeGeneratorNode, NL, toString} from 'langium';
import path from 'path';
import {
    Action,
    Actuator,
    App,
    BinaryCondition,
    Condition,
    LDC,
    Sensor,
    SensorCondition,
    State,
    TemporalCondition,
    Transition,
    UnaryCondition
} from '../language-server/generated/ast';
import {extractDestinationAndName} from './cli-util';

export function generateInoFile(app: App, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`;

    const fileNode = new CompositeGeneratorNode();
    compile(app, fileNode)


    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, {recursive: true});
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}


function compile(app: App, fileNode: CompositeGeneratorNode) {
    fileNode.append(
        `
//Wiring code generated from an ArduinoML model
// Application name: ` + app.name, NL);

    if (app.ldcs.length > 0) {
        fileNode.append(`#include <LiquidCrystal.h>`, NL);
    }
    fileNode.append(`
long debounce = 200;
enum STATE {` + app.states.map(s => s.name).join(', ') + `};

STATE currentState = ` + app.initial.ref?.name + `;`
        , NL);
    newLine(fileNode);

    if (app.ldcs.length > 0) {
        fileNode.append(`long ldcDebounce = 1000;`, NL);
        for (const ldc of app.ldcs) {
            compileLDC(ldc, fileNode);
            //create ldc last set time
            fileNode.append(`long ` + ldc.name + `LastSetTime = 0;`, NL);
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
long ` + brick.name + `LastDebounceTime = 0;`, NL);
            newLine(fileNode);

        }
    }
    fileNode.append(`int exceptionNumber = 0;`, NL);
    fileNode.append(`long startTime = millis();`, NL);
    fileNode.append(`\nvoid setup() {`, NL);
    if (app.exceptions.length > 0) {
        fileNode.append(`   pinMode( ${EXCEPTION_LED_PIN}, OUTPUT); // Exception LED`, NL);
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
    
void loop() {`, NL);
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
    }`, NL);

        const exceptionsSensorsSet: Set<Sensor> = new Set(
            app.exceptions
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
    }`, NL);
        }

    }
    fileNode.append(`\n   switch(currentState){`, NL);
    for (const state of app.states) {
        compileState(state, fileNode, 2);
    }
    fileNode.append(getTabString(1) + `}
}`, NL);

}

function compileLDC(ldc: LDC, fileNode: CompositeGeneratorNode) {
    fileNode.append(`LiquidCrystal ` + ldc.name + `(` + ldc.rs + `, ` + ldc.en + `, ` + ldc.d4 + `, ` + ldc.d5 + `, ` + ldc.d6 + `, ` + ldc.d7 + `, ` + ldc.backlight + `);`, NL)
}

function compileLDCWrite(ldc: LDC, fileNode: CompositeGeneratorNode) {
    fileNode.append(`   if(millis() - ` + ldc.name + `LastSetTime > ldcDebounce){
       ` + ldc.name + `.clear();`, NL);
    const sensor = ldc.sensor.ref;
    fileNode.append(`       ` + ldc.name + `.print(String("` + sensor?.name + ` := ") + (digitalRead(` + sensor?.inputPin + `) == HIGH ? "HIGH" : "LOW"));`,
        NL
    );
    fileNode.append(`       ` + ldc.name + `LastSetTime = millis();
    }`, NL);


}

function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode) {
    fileNode.append(`   pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`, NL)
}

function compileSensor(sensor: Sensor, fileNode: CompositeGeneratorNode) {
    fileNode.append(`   pinMode(` + sensor.inputPin + `, INPUT); // ` + sensor.name + ` [Sensor]`, NL)
}

function compileState(state: State, fileNode: CompositeGeneratorNode, tabNumber: number = 0) {
    fileNode.append(getTabString(tabNumber) + `case ` + state.name + `:`, NL)
    for (const action of state.actions) {
        compileAction(action, fileNode, tabNumber + 1)
    }
    for (const transition of state.transitions) {
        newLine(fileNode);
        compileTransition(transition, fileNode, tabNumber + 1)
    }
    fileNode.append(getTabString(tabNumber + 1) + `break;`, NL)
    newLine(fileNode);
}

function newLine(fileNode: CompositeGeneratorNode) {
    fileNode.append("", NL);
}

function compileAction(action: Action, fileNode: CompositeGeneratorNode, tabNumber: number = 0) {
    fileNode.append(getTabString(tabNumber) + `digitalWrite(` + action.actuator.ref?.outputPin + `,` + action.value.value + `);`, NL)
}

function compileTransition(transition: Transition, fileNode: CompositeGeneratorNode, tabNumber: number = 0) {
    const sensors: Sensor[] = getSensors(transition.condition);
    for (const sensor of sensors) {
        compileDebounce(sensor, fileNode, tabNumber);
    }
    newLine(fileNode);
    fileNode.append(getTabString(tabNumber) + `if (`);
    compileCondition(transition.condition, fileNode, tabNumber);
    fileNode.append(`)  {`, NL);
    fileNode.append(getTabString(tabNumber + 1) + `currentState = ` + transition.next.ref?.name + `;`, NL);
    fileNode.append(getTabString(tabNumber + 1) + `startTime = millis();`, NL);
    for (const sensor of sensors) {
        fileNode.append(getTabString(tabNumber + 1) + sensor.name + `LastDebounceTime = millis();`, NL);
    }
    fileNode.append(getTabString(tabNumber) + `}`, NL);

}

function getSensors(condition: Condition): Sensor[] {
    switch (condition.$type) {
        case "SensorCondition":
            if (condition.sensor.ref === undefined) return []
            return [condition.sensor.ref];
        case "UnaryCondition":
            return [...getSensors(condition.condition)];
        case "BinaryCondition" :
            return [...getSensors(condition.left), ...getSensors(condition.right)];
        case "TemporalCondition":
            return [];
    }
}

function compileCondition(condition: Condition, fileNode: CompositeGeneratorNode, tabNumber: number = 0) {
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

function getTabString(taNumber: number): string {
    return "    ".repeat(taNumber);
}

function compileDebounce(sensor: Sensor, fileNode: CompositeGeneratorNode, tabNumber: number = 0) {
    fileNode.append(getTabString(tabNumber) + sensor.name + `BounceGuard = millis() - ` + sensor.name + `LastDebounceTime > debounce;`, NL
    )
}

function compileSensorCondition(sensorCondition: SensorCondition, fileNode: CompositeGeneratorNode) {
    fileNode.append(`( digitalRead(` + sensorCondition.sensor.ref?.inputPin + `) == ` + sensorCondition.value.value + `  && ` + sensorCondition.sensor.ref?.name + `BounceGuard)`);
}

function compileTemporalCondition(temporalCondition: TemporalCondition, fileNode: CompositeGeneratorNode) {
    fileNode.append(`(millis() - startTime >= ` + temporalCondition.duration + `)`);
}

function compileUnaryCondition(unaryCondition: UnaryCondition, fileNode: CompositeGeneratorNode) {
    fileNode.append(`(` + getOperator(unaryCondition.operator.value) + ` `);
    compileCondition(unaryCondition.condition, fileNode);
    fileNode.append(`)`);
}

function getOperator(operator: string): string {
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

function compileBinaryCondition(binaryCondition: BinaryCondition, fileNode: CompositeGeneratorNode) {
    fileNode.append(`(`);
    compileCondition(binaryCondition.left, fileNode);
    fileNode.append(` ` + getOperator(binaryCondition.operator.value) + ` `);
    compileCondition(binaryCondition.right, fileNode);
    fileNode.append(`)`);
}

