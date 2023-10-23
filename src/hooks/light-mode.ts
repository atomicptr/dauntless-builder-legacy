import { createSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "@src/hooks/redux";
import { selectConfiguration } from "@src/reducers/configuration/configuration-slice";

const selectLightMode = createSelector([selectConfiguration], config => config.lightModeEnabled);

const useIsLightMode = () => {
    return useAppSelector(selectLightMode);
};

export default useIsLightMode;
