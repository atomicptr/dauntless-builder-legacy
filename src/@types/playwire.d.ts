interface PlaywireUnit {
    type: string;
    selectorId?: string;
}

interface Window {
    ramp: {
        que: unknown[];
        passiveMode: boolean;
        addUnits: (units: PlaywireUnit[]) => Promise<void>;
        displayUnits: () => void;
        destroyUnits: (what: string) => Promise<void>;
        processPage: (path: string) => void;
    };

    _pwGA4PageviewId: string;
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
}
