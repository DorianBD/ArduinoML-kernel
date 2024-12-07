package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitor;

public class UnaryCondition implements Condition {
    Condition condition;

    UnaryOperator operator;

    public UnaryCondition(Condition condition, UnaryOperator operator) {
        this.condition = condition;
        this.operator = operator;
    }

    public Condition getCondition() {
        return condition;
    }

    public void setCondition(Condition condition) {
        this.condition = condition;
    }

    public UnaryOperator getOperator() {
        return operator;
    }

    public void setOperator(UnaryOperator operator) {
        this.operator = operator;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    @Override
    public String toString() {
        return operator.toString() + "(" + condition.toString()+")";
    }
}
