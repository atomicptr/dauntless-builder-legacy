import { useAppSelector } from "@src/hooks/redux";
import { selectConfiguration } from "@src/reducers/configuration/configuration-slice";

const useIsLightMode = () => {
    const configuration = useAppSelector(selectConfiguration);
    return configuration.lightModeEnabled;
};

export default useIsLightMode;
