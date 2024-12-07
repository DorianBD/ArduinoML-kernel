import { ValidationAcceptor, ValidationChecks } from 'langium';
import { 
    ArduinoMlAstType, 
    App, 
    UnaryCondition, 
    BinaryCondition,
    Condition
} from './generated/ast';
import type { ArduinoMlServices } from './arduino-ml-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlValidator;
    const checks: ValidationChecks<ArduinoMlAstType> = {
        App: [
            validator.checkAppNameCapitalization
        ],
        UnaryCondition: [
            validator.checkUnaryConditionNotTemporalCondition
        ],
        BinaryCondition: [
            validator.checkBinaryConditionComplexity
        ]
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ArduinoMlValidator {

    checkAppNameCapitalization(app: App, accept: ValidationAcceptor): void {
        if (app.name) {
            const firstChar = app.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'App name should start with a capital.', { node: app, property: 'name' });
            }
        }
    }
    
    // An UnaryCondition can't be directly composed of a TemporalCondition
    checkUnaryConditionNotTemporalCondition(condition: UnaryCondition, accept: ValidationAcceptor): void {
        if (condition.condition.$type === 'TemporalCondition') {
            accept('error', 'UnaryCondition cannot be directly composed of a TemporalCondition.', { node: condition });
        }
    }

    // Validate complex conditions to prevent combining multiple temporal conditions incorrectly
    checkBinaryConditionComplexity(condition: BinaryCondition, accept: ValidationAcceptor): void {
        // Helper function to check if a condition contains a temporal condition
        const containsTemporalCondition = (cond: Condition): boolean => {
            switch (cond.$type) {
                case 'TemporalCondition':
                    return true;
                case 'UnaryCondition':
                    return containsTemporalCondition(cond.condition);
                case 'BinaryCondition':
                    return containsTemporalCondition(cond.left) || containsTemporalCondition(cond.right);
                default:
                    return false;
            }
        };

        // Count temporal conditions in a complex condition
        const countTemporalConditions = (cond: Condition): number => {
            switch (cond.$type) {
                case 'TemporalCondition':
                    return 1;
                case 'UnaryCondition':
                    return countTemporalConditions(cond.condition);
                case 'BinaryCondition':
                    return countTemporalConditions(cond.left) + countTemporalConditions(cond.right);
                default:
                    return 0;
            }
        };

        // If the binary condition uses AND and contains multiple temporal conditions
        if (condition.operator.value === 'AND') {
            const leftTemporalCount = countTemporalConditions(condition.left);
            const rightTemporalCount = countTemporalConditions(condition.right);

            // Prevent direct combination of temporal conditions
            if (leftTemporalCount > 0 && rightTemporalCount > 0) {
                accept('error', 'Cannot combine multiple temporal conditions with AND.', { node: condition });
            }

            // Prevent nested temporal conditions
            if (containsTemporalCondition(condition.left) && containsTemporalCondition(condition.right)) {
                accept('error', 'Cannot nest temporal conditions with AND.', { node: condition });
            }
        }
    }
}
