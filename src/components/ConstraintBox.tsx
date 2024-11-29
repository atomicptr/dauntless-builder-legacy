import useWindowSize from "@src/hooks/window-size";
import React from "react";

export interface Constraint {
    matchesConstraint(windowWidth: number, windowHeight: number): boolean;
}

export class WithinBoundsConstraint implements Constraint {
    maxWidth: number;
    maxHeight: number;

    constructor(maxWidth: number, maxHeight: number) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    }

    matchesConstraint(windowWidth: number, windowHeight: number): boolean {
        return windowWidth <= this.maxWidth && windowHeight <= this.maxHeight;
    }
}

export class OutsideBoundsConstraint implements Constraint {
    minWidth: number;
    minHeight: number;

    constructor(minWidth: number, minHeight: number) {
        this.minWidth = minWidth;
        this.minHeight = minHeight;
    }

    matchesConstraint(windowWidth: number, windowHeight: number): boolean {
        return windowWidth >= this.minWidth && windowHeight >= this.minHeight;
    }
}

interface ConstraintBoxProps {
    constraints: Constraint[];
    children: React.ReactElement;
    renderOnFail?: React.ReactElement | null;
}

const ConstraintBox: React.FC<ConstraintBoxProps> = ({ constraints, children, renderOnFail }) => {
    const { width, height } = useWindowSize();

    for (const constraint of constraints) {
        if (!constraint.matchesConstraint(width, height)) {
            return renderOnFail;
        }
    }

    return children;
};

export default React.memo(ConstraintBox);
