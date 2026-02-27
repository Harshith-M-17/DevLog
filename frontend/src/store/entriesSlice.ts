import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DailyEntry } from '../types';

interface EntriesState {
  entries: DailyEntry[];
}

const initialState: EntriesState = {
  entries: [],
};

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    setEntries(state, action: PayloadAction<DailyEntry[]>) {
      state.entries = action.payload;
    },
    addEntry(state, action: PayloadAction<DailyEntry>) {
      state.entries.push(action.payload);
    },
    removeEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);
    },
  },
});

export const { setEntries, addEntry, removeEntry } = entriesSlice.actions;
export default entriesSlice.reducer;
