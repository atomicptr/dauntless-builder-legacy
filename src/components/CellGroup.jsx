import React from "react";
import PropTypes from "prop-types";

import Cell from "./Cell";

import PropTypeUtility from "../utility/PropTypeUtility";

export default class CellGroup extends React.Component {

    render() {
        let cells = [];
        let cellCounter = 0;

        let cellSlots = this.props.item.cells;

        if(!this.props.item.cells) {
            return [];
        }

        if(!Array.isArray(cellSlots)) {
            cellSlots = [cellSlots];
        }

        let assignedCells = this.props.cells.slice();

        let slotIndex = 0;

        for(let slot of cellSlots) {
            let isInSlot = false;
            const cell = assignedCells[slotIndex];

            if(cell && cell[1]) {
                isInSlot = cell[1].slot === slot || slot === "Prismatic";
            }

            if(isInSlot) {
                cells.push(
                    <Cell
                        parent={this.props.parent}
                        parentType={this.props.defaultType}
                        slotPosition={slotIndex}
                        onCellClicked={this.props.onCellClicked}
                        key={"cell_" + (cellCounter++)}
                        type={assignedCells[slotIndex][1].slot}
                        variant={assignedCells[slotIndex][0]}
                        cell={assignedCells[slotIndex][1]}
                        isPrismaticSlot={slot === "Prismatic"} />
                );
            } else {
                cells.push(
                    <Cell
                        parent={this.props.parent}
                        parentType={this.props.defaultType}
                        slotPosition={slotIndex}
                        onCellClicked={this.props.onCellClicked}
                        key={"cell_" + (cellCounter++)}
                        type={slot} />
                );
            }

            slotIndex++;
        }

        return <div className="cells">
            {cells}
        </div>;
    }
}

CellGroup.propTypes = {
    item: PropTypeUtility.item(),
    cells: PropTypes.array,
    defaultType: PropTypes.string,
    onCellClicked: PropTypes.func,
    parent: PropTypes.object
};
