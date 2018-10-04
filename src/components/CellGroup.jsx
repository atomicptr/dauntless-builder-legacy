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
            let index = assignedCells.findIndex(cellHandle => cellHandle[1] && cellHandle[1].slot === slot);

            if(index > -1) {
                cells.push(
                    <Cell
                        parent={this.props.parent}
                        parentType={this.props.defaultType}
                        slotPosition={slotIndex}
                        onCellClicked={this.props.onCellClicked}
                        key={"cell_" + (cellCounter++)}
                        type={assignedCells[index][1].slot}
                        variant={assignedCells[index][0]}
                        cell={assignedCells[index][1]} />
                );

                assignedCells.splice(index, 1);
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
