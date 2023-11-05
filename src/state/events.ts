import { atom } from "jotai";

export interface EventsState {
    playwireSetupHasFinished: boolean;
}

export const eventsAtom = atom<EventsState>({
    playwireSetupHasFinished: false,
});

export const playwireSetupHasFinished = () => (state: EventsState) => ({ ...state, playwireSetupHasFinished: true });
