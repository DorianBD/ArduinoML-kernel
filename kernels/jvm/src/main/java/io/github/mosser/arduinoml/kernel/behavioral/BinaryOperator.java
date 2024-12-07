package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitable;
import io.github.mosser.arduinoml.kernel.generator.Visitor;

public class BinaryOperator implements Visitable {

    public static final BinaryOperator AND = new BinaryOperator("&&");
    public static final BinaryOperator OR = new BinaryOperator("||");

    private String operator;

    public BinaryOperator(String Operator) {
        this.operator = Operator;
    }

    public String getOperator() {
        return this.operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    @Override
    public String toString() {
        return this.operator;
    }
}
