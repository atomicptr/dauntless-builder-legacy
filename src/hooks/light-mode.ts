import { configurationAtom } from "@src/state/configuration";
import { useAtomValue } from "jotai";

const useIsLightMode = () => {
    const configuration = useAtomValue(configurationAtom);
    return configuration.lightModeEnabled;
};

export default useIsLightMode;
