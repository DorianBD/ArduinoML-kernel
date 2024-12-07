"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoMlValidator = exports.registerValidationChecks = void 0;
/**
 * Register custom validation checks.
 */
function registerValidationChecks(services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlValidator;
    const checks = {
        App: [
            validator.checkAppNameCapitalization
        ],
        UnaryCondition: [
            validator.checkUnaryConditionNotTemporalCondition
        ],
        BinaryCondition: [
            // validator.checkBinaryConditionTemporalConditions,
            validator.checkBinaryConditionComplexity
        ]
    };
    registry.register(checks, validator);
}
exports.registerValidationChecks = registerValidationChecks;
/**
 * Implementation of custom validations.
 */
class ArduinoMlValidator {
    checkAppNameCapitalization(app, accept) {
        if (app.name) {
            const firstChar = app.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'App name should start with a capital.', { node: app, property: 'name' });
            }
        }
    }
    // An UnaryCondition can't be directly composed of a TemporalCondition
    checkUnaryConditionNotTemporalCondition(condition, accept) {
        if (condition.condition.$type === 'TemporalCondition') {
            accept('error', 'UnaryCondition cannot be directly composed of a TemporalCondition.', { node: condition });
        }
    }
    // A BinaryCondition can't have 2 TemporalConditions with an AND
    checkBinaryConditionTemporalConditions(condition, accept) {
        const isLeftTemporal = condition.left.$type === 'TemporalCondition';
        const isRightTemporal = condition.right.$type === 'TemporalCondition';
        const isAndOperator = condition.operator.value === 'AND';
        if (isLeftTemporal && isRightTemporal && isAndOperator) {
            accept('error', 'BinaryCondition cannot combine two TemporalConditions with AND.', { node: condition });
        }
    }
    // Validate complex conditions to prevent combining multiple temporal conditions incorrectly
    checkBinaryConditionComplexity(condition, accept) {
        // Helper function to check if a condition contains a temporal condition
        const containsTemporalCondition = (cond) => {
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
        const countTemporalConditions = (cond) => {
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
exports.ArduinoMlValidator = ArduinoMlValidator;
//# sourceMappingURL=arduino-ml-validator.js.map