import PropTypes from "prop-types";

export default class PropTypeUtility {
    static item() {
        return PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
            type: PropTypes.string,
            strength: PropTypes.string,
            weakness: PropTypes.string,
            elemental: PropTypes.string,
            cells: PropTypes.node,
            power: PropTypes.object,
            resistance: PropTypes.object,
            lantern_ability: PropTypes.shape({
                instant: PropTypes.bool,
                hold: PropTypes.bool
            }),
            unique_effects: PropTypes.array
        });
    }
}
