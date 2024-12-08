/******************************************************************************
 * This file was generated by langium-cli 1.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable */
import { AstNode, AbstractAstReflection, Reference, ReferenceInfo, TypeMetaData } from 'langium';

export type Brick = Actuator | Sensor;

export const Brick = 'Brick';

export function isBrick(item: unknown): item is Brick {
    return reflection.isInstance(item, Brick);
}

export type Condition = BinaryCondition | SensorCondition | TemporalCondition | UnaryCondition;

export const Condition = 'Condition';

export function isCondition(item: unknown): item is Condition {
    return reflection.isInstance(item, Condition);
}

export interface Action extends AstNode {
    readonly $container: State;
    readonly $type: 'Action';
    actuator: Reference<Actuator>
    value: Signal
}

export const Action = 'Action';

export function isAction(item: unknown): item is Action {
    return reflection.isInstance(item, Action);
}

export interface Actuator extends AstNode {
    readonly $container: App;
    readonly $type: 'Actuator';
    name: string
    outputPin: number
}

export const Actuator = 'Actuator';

export function isActuator(item: unknown): item is Actuator {
    return reflection.isInstance(item, Actuator);
}

export interface App extends AstNode {
    readonly $type: 'App';
    bricks: Array<Brick>
    exceptions: Array<Exception>
    initial: Reference<State>
    ldcs: Array<LDC>
    name: string
    states: Array<State>
}

export const App = 'App';

export function isApp(item: unknown): item is App {
    return reflection.isInstance(item, App);
}

export interface BinaryCondition extends AstNode {
    readonly $container: BinaryCondition | Exception | Transition | UnaryCondition;
    readonly $type: 'BinaryCondition';
    left: Condition
    operator: BinaryOperator
    right: Condition
}

export const BinaryCondition = 'BinaryCondition';

export function isBinaryCondition(item: unknown): item is BinaryCondition {
    return reflection.isInstance(item, BinaryCondition);
}

export interface BinaryOperator extends AstNode {
    readonly $container: BinaryCondition;
    readonly $type: 'BinaryOperator';
    value: string
}

export const BinaryOperator = 'BinaryOperator';

export function isBinaryOperator(item: unknown): item is BinaryOperator {
    return reflection.isInstance(item, BinaryOperator);
}

export interface Exception extends AstNode {
    readonly $container: App;
    readonly $type: 'Exception';
    condition: Condition
    value: number
}

export const Exception = 'Exception';

export function isException(item: unknown): item is Exception {
    return reflection.isInstance(item, Exception);
}

export interface LDC extends AstNode {
    readonly $container: App;
    readonly $type: 'LDC';
    backlight: number
    d4: number
    d5: number
    d6: number
    d7: number
    en: number
    name: string
    rs: number
    sensor: Reference<Sensor>
}

export const LDC = 'LDC';

export function isLDC(item: unknown): item is LDC {
    return reflection.isInstance(item, LDC);
}

export interface Sensor extends AstNode {
    readonly $container: App;
    readonly $type: 'Sensor';
    inputPin: number
    name: string
}

export const Sensor = 'Sensor';

export function isSensor(item: unknown): item is Sensor {
    return reflection.isInstance(item, Sensor);
}

export interface SensorCondition extends AstNode {
    readonly $container: BinaryCondition | Exception | Transition | UnaryCondition;
    readonly $type: 'SensorCondition';
    sensor: Reference<Sensor>
    value: Signal
}

export const SensorCondition = 'SensorCondition';

export function isSensorCondition(item: unknown): item is SensorCondition {
    return reflection.isInstance(item, SensorCondition);
}

export interface Signal extends AstNode {
    readonly $container: Action | SensorCondition;
    readonly $type: 'Signal';
    value: string
}

export const Signal = 'Signal';

export function isSignal(item: unknown): item is Signal {
    return reflection.isInstance(item, Signal);
}

export interface State extends AstNode {
    readonly $container: App;
    readonly $type: 'State';
    actions: Array<Action>
    name: string
    transitions: Array<Transition>
}

export const State = 'State';

export function isState(item: unknown): item is State {
    return reflection.isInstance(item, State);
}

export interface TemporalCondition extends AstNode {
    readonly $container: BinaryCondition | Exception | Transition | UnaryCondition;
    readonly $type: 'TemporalCondition';
    duration: number
}

export const TemporalCondition = 'TemporalCondition';

export function isTemporalCondition(item: unknown): item is TemporalCondition {
    return reflection.isInstance(item, TemporalCondition);
}

export interface Transition extends AstNode {
    readonly $container: State;
    readonly $type: 'Transition';
    condition: Condition
    next: Reference<State>
}

export const Transition = 'Transition';

export function isTransition(item: unknown): item is Transition {
    return reflection.isInstance(item, Transition);
}

export interface UnaryCondition extends AstNode {
    readonly $container: BinaryCondition | Exception | Transition | UnaryCondition;
    readonly $type: 'UnaryCondition';
    condition: Condition
    operator: UnaryOperator
}

export const UnaryCondition = 'UnaryCondition';

export function isUnaryCondition(item: unknown): item is UnaryCondition {
    return reflection.isInstance(item, UnaryCondition);
}

export interface UnaryOperator extends AstNode {
    readonly $container: UnaryCondition;
    readonly $type: 'UnaryOperator';
    value: string
}

export const UnaryOperator = 'UnaryOperator';

export function isUnaryOperator(item: unknown): item is UnaryOperator {
    return reflection.isInstance(item, UnaryOperator);
}

export interface ArduinoMlAstType {
    Action: Action
    Actuator: Actuator
    App: App
    BinaryCondition: BinaryCondition
    BinaryOperator: BinaryOperator
    Brick: Brick
    Condition: Condition
    Exception: Exception
    LDC: LDC
    Sensor: Sensor
    SensorCondition: SensorCondition
    Signal: Signal
    State: State
    TemporalCondition: TemporalCondition
    Transition: Transition
    UnaryCondition: UnaryCondition
    UnaryOperator: UnaryOperator
}

export class ArduinoMlAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return ['Action', 'Actuator', 'App', 'BinaryCondition', 'BinaryOperator', 'Brick', 'Condition', 'Exception', 'LDC', 'Sensor', 'SensorCondition', 'Signal', 'State', 'TemporalCondition', 'Transition', 'UnaryCondition', 'UnaryOperator'];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case Actuator:
            case Sensor: {
                return this.isSubtype(Brick, supertype);
            }
            case BinaryCondition:
            case SensorCondition:
            case TemporalCondition:
            case UnaryCondition: {
                return this.isSubtype(Condition, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Action:actuator': {
                return Actuator;
            }
            case 'App:initial':
            case 'Transition:next': {
                return State;
            }
            case 'LDC:sensor':
            case 'SensorCondition:sensor': {
                return Sensor;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case 'App': {
                return {
                    name: 'App',
                    mandatory: [
                        { name: 'bricks', type: 'array' },
                        { name: 'exceptions', type: 'array' },
                        { name: 'ldcs', type: 'array' },
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

export const reflection = new ArduinoMlAstReflection();