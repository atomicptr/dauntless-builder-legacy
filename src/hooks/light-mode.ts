import { selectConfiguration } from "@src/features/configuration/configuration-slice";
import { useAppSelector } from "@src/hooks/redux";

const useIsLightMode = () => {
    const configuration = useAppSelector(selectConfiguration);
    return configuration.lightModeEnabled;
};

export default useIsLightMode;
