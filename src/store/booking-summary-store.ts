import { create } from "zustand";

interface BookingSummary {
  bookingSummary?: CalculatePriceResponse;
  setBookingSummary: (summary: CalculatePriceResponse) => void;
}

export const useBookingSummaryStore = create<BookingSummary>((set) => ({
  bookingSummary: undefined,
  setBookingSummary: (summary) => set({ bookingSummary: summary }),
}));
