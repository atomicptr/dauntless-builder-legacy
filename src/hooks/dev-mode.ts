import { configurationAtom } from "@src/state/configuration";
import { useAtomValue } from "jotai";

const useDevMode = () => {
    const configuration = useAtomValue(configurationAtom);
    return configuration.devMode;
};

export default useDevMode;
