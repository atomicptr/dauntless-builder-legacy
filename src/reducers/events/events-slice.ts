import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@src/store";

export interface EventsState {
    playwireSetupHasFinished: boolean;
}

const initialState: EventsState = {
    playwireSetupHasFinished: false,
};

export const eventsSlice = createSlice({
    initialState,
    name: "events",
    reducers: {
        playwireSetupFinished: state => {
            state.playwireSetupHasFinished = true;
        },
    },
});

const initState = (state: EventsState) => Object.assign({}, initialState, state);

export const selectEvents = (state: RootState) => initState(state.events);

export const { playwireSetupFinished } = eventsSlice.actions;

export default eventsSlice.reducer;
