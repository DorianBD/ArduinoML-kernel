import fs from 'fs';
import {CompositeGeneratorNode, NL, toString} from 'langium';
import path from 'path';
import {
    Action,
    Actuator,
    App,
    BinaryCondition,
    Condition,
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
// Application name: ` + app.name + `

long debounce = 200;
enum STATE {` + app.states.map(s => s.name).join(', ') + `};

STATE currentState = ` + app.initial.ref?.name + `;`
        , NL);

    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            fileNode.append(`
bool ` + brick.name + `BounceGuard = false;
long ` + brick.name + `LastDebounceTime = 0;

            `, NL);
        }
    }
    fileNode.append(`long startTime = millis();`, NL);
    fileNode.append(`
	void setup(){`);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            compileSensor(brick, fileNode);
        } else {
            compileActuator(brick, fileNode);
        }
    }


    fileNode.append(`
	}
	void loop() {
			switch(currentState){`, NL)
    for (const state of app.states) {
        compileState(state, fileNode)
    }
    fileNode.append(`
		}
	}
	`, NL);


}

function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode) {
    fileNode.append(`
		pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`)
}

function compileSensor(sensor: Sensor, fileNode: CompositeGeneratorNode) {
    fileNode.append(`
		pinMode(` + sensor.inputPin + `, INPUT); // ` + sensor.name + ` [Sensor]`)
}

function compileState(state: State, fileNode: CompositeGeneratorNode) {
    fileNode.append(`
				case ` + state.name + `:`)
    for (const action of state.actions) {
        compileAction(action, fileNode)
    }
    
    for (const transition of state.transitions) {
        compileTransition(transition, fileNode)
    }
        
    fileNode.append(`
                    break;`)
}


function compileAction(action: Action, fileNode: CompositeGeneratorNode) {
    fileNode.append(`
					digitalWrite(` + action.actuator.ref?.outputPin + `,` + action.value.value + `);`)
}

function compileTransition(transition: Transition, fileNode: CompositeGeneratorNode) {
    const sensors: Sensor[] = getSensors(transition.condition);
    for (const sensor of sensors) {
        fileNode.append(`
                    ` + sensor.name + `BounceGuard = millis() - ` + sensor.name + `LastDebounceTime > debounce;`
        )
    }
    fileNode.append(`
                    if (`);
    compileCondition(transition.condition, fileNode);
    fileNode.append(`)  {`);
    fileNode.append(`
                        currentState = ` + transition.next.ref?.name + `;`);
    fileNode.append(`
                        startTime = millis();`);
    for (const sensor of sensors) {
        fileNode.append(`
                        ` + sensor.name + `LastDebounceTime = millis();`);
    }
    fileNode.append(`
                    }`);

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

function compileCondition(condition: Condition, fileNode: CompositeGeneratorNode) {
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

