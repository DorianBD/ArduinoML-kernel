package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitable;
import io.github.mosser.arduinoml.kernel.generator.Visitor;

public class Error implements Visitable {

    private Condition condition;

    private int numberError;


    public Condition getCondition() {
        return condition;
    }

    public int getNumberError() {
        return numberError;
    }

    public void setCondition(Condition condition) {
        this.condition = condition;
    }

    public void setNumberError(int numberError) {
        this.numberError = numberError;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}
