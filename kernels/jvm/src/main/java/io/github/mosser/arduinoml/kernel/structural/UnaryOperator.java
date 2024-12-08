package io.github.mosser.arduinoml.kernel.structural;

import io.github.mosser.arduinoml.kernel.generator.Visitable;
import io.github.mosser.arduinoml.kernel.generator.Visitor;

public enum UnaryOperator implements Visitable {
    NOT;

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}
