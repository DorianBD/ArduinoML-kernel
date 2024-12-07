"use strict";
/******************************************************************************
 * This file was generated by langium-cli 1.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflection = exports.ArduinoMlAstReflection = exports.isUnaryOperator = exports.UnaryOperator = exports.isUnaryCondition = exports.UnaryCondition = exports.isTransition = exports.Transition = exports.isTemporalCondition = exports.TemporalCondition = exports.isState = exports.State = exports.isSignal = exports.Signal = exports.isSensorCondition = exports.SensorCondition = exports.isSensor = exports.Sensor = exports.isException = exports.Exception = exports.isBinaryOperator = exports.BinaryOperator = exports.isBinaryCondition = exports.BinaryCondition = exports.isApp = exports.App = exports.isActuator = exports.Actuator = exports.isAction = exports.Action = exports.isCondition = exports.Condition = exports.isBrick = exports.Brick = void 0;
/* eslint-disable */
const langium_1 = require("langium");
exports.Brick = 'Brick';
function isBrick(item) {
    return exports.reflection.isInstance(item, exports.Brick);
}
exports.isBrick = isBrick;
exports.Condition = 'Condition';
function isCondition(item) {
    return exports.reflection.isInstance(item, exports.Condition);
}
exports.isCondition = isCondition;
exports.Action = 'Action';
function isAction(item) {
    return exports.reflection.isInstance(item, exports.Action);
}
exports.isAction = isAction;
exports.Actuator = 'Actuator';
function isActuator(item) {
    return exports.reflection.isInstance(item, exports.Actuator);
}
exports.isActuator = isActuator;
exports.App = 'App';
function isApp(item) {
    return exports.reflection.isInstance(item, exports.App);
}
exports.isApp = isApp;
exports.BinaryCondition = 'BinaryCondition';
function isBinaryCondition(item) {
    return exports.reflection.isInstance(item, exports.BinaryCondition);
}
exports.isBinaryCondition = isBinaryCondition;
exports.BinaryOperator = 'BinaryOperator';
function isBinaryOperator(item) {
    return exports.reflection.isInstance(item, exports.BinaryOperator);
}
exports.isBinaryOperator = isBinaryOperator;
exports.Exception = 'Exception';
function isException(item) {
    return exports.reflection.isInstance(item, exports.Exception);
}
exports.isException = isException;
exports.Sensor = 'Sensor';
function isSensor(item) {
    return exports.reflection.isInstance(item, exports.Sensor);
}
exports.isSensor = isSensor;
exports.SensorCondition = 'SensorCondition';
function isSensorCondition(item) {
    return exports.reflection.isInstance(item, exports.SensorCondition);
}
exports.isSensorCondition = isSensorCondition;
exports.Signal = 'Signal';
function isSignal(item) {
    return exports.reflection.isInstance(item, exports.Signal);
}
exports.isSignal = isSignal;
exports.State = 'State';
function isState(item) {
    return exports.reflection.isInstance(item, exports.State);
}
exports.isState = isState;
exports.TemporalCondition = 'TemporalCondition';
function isTemporalCondition(item) {
    return exports.reflection.isInstance(item, exports.TemporalCondition);
}
exports.isTemporalCondition = isTemporalCondition;
exports.Transition = 'Transition';
function isTransition(item) {
    return exports.reflection.isInstance(item, exports.Transition);
}
exports.isTransition = isTransition;
exports.UnaryCondition = 'UnaryCondition';
function isUnaryCondition(item) {
    return exports.reflection.isInstance(item, exports.UnaryCondition);
}
exports.isUnaryCondition = isUnaryCondition;
exports.UnaryOperator = 'UnaryOperator';
function isUnaryOperator(item) {
    return exports.reflection.isInstance(item, exports.UnaryOperator);
}
exports.isUnaryOperator = isUnaryOperator;
class ArduinoMlAstReflection extends langium_1.AbstractAstReflection {
    getAllTypes() {
        return ['Action', 'Actuator', 'App', 'BinaryCondition', 'BinaryOperator', 'Brick', 'Condition', 'Exception', 'Sensor', 'SensorCondition', 'Signal', 'State', 'TemporalCondition', 'Transition', 'UnaryCondition', 'UnaryOperator'];
    }
    computeIsSubtype(subtype, supertype) {
        switch (subtype) {
            case exports.Actuator:
            case exports.Sensor: {
                return this.isSubtype(exports.Brick, supertype);
            }
            case exports.BinaryCondition:
            case exports.SensorCondition:
            case exports.TemporalCondition:
            case exports.UnaryCondition: {
                return this.isSubtype(exports.Condition, supertype);
            }
            default: {
                return false;
            }
        }
    }
    getReferenceType(refInfo) {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Action:actuator': {
                return exports.Actuator;
            }
            case 'App:initial':
            case 'Transition:next': {
                return exports.State;
            }
            case 'SensorCondition:sensor': {
                return exports.Sensor;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }
    getTypeMetaData(type) {
        switch (type) {
            case 'App': {
                return {
                    name: 'App',
                    mandatory: [
                        { name: 'bricks', type: 'array' },
                        { name: 'exceptions', type: 'array' },
                        { name: 'states', type: 'array' }
                    ]
                };
            }
            case 'State': {
                return {
                    name: 'State',
                    mandatory: [
                        { name: 'actions', type: 'array' },
                        { name: 'transitions', type: 'array' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    mandatory: []
                };
            }
        }
    }
}
exports.ArduinoMlAstReflection = ArduinoMlAstReflection;
exports.reflection = new ArduinoMlAstReflection();
//# sourceMappingURL=ast.js.map