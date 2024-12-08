package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitor;
import io.github.mosser.arduinoml.kernel.structural.BinaryOperator;

public class BinaryCondition implements Condition {
    Condition left;
    Condition right;
    BinaryOperator operator;

    public BinaryCondition(Condition left, Condition right, BinaryOperator operator) {
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    public Condition getLeft() {
        return left;
    }

    public Condition getRight() {
        return right;
    }

    public BinaryOperator getOperator() {
        return operator;
    }

    public void setLeft(Condition left) {
        this.left = left;
    }

    public void setRight(Condition right) {
        this.right = right;
    }

    public void setOperator(BinaryOperator operator) {
        this.operator = operator;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    @Override
    public String toString() {
        return left.toString() + " " + operator.toString() + " " + right.toString();
    }
}
