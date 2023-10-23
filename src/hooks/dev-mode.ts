import { createSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "@src/hooks/redux";
import { selectConfiguration } from "@src/reducers/configuration/configuration-slice";

const selectDevMode = createSelector([selectConfiguration], config => config.devMode);

const useDevMode = () => {
    return useAppSelector(selectDevMode);
};

export default useDevMode;
