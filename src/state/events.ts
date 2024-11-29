import { atom } from "jotai";

export interface EventsState {
    playwireSetupHasFinished: boolean;
    playwireInitializedUnits: string[];
}

export const eventsAtom = atom<EventsState>({
    playwireInitializedUnits: [],
    playwireSetupHasFinished: false,
});

export const playwireSetupHasFinished = () => (state: EventsState) => ({ ...state, playwireSetupHasFinished: true });
export const playwireClearInitializedUnits = () => (state: EventsState) => ({ ...state, playwireInitializedUnits: [] });
export const playwireAddInitializedUnit = (unitName: string) => (state: EventsState) => ({
    ...state,
    playwireInitializedUnits: [...state.playwireInitializedUnits, unitName],
});
export const playwireIsUnitInitialized = (state: EventsState, unitName: string): boolean =>
    state.playwireInitializedUnits.indexOf(unitName) > -1;
