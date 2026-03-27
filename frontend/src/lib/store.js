import { create } from "zustand";

export const useStore = create((set) => ({
  // 📂 Uploaded file
  files: null,

  // 🧠 AI result from backend
  result: null,

  // 👤 selected patient (future use)
  patient: null,

  // 🔧 setters
  setFiles: (files) => set({ files }),
  setResult: (result) => set({ result }),
  setPatient: (patient) => set({ patient }),

  // 🔄 reset (useful)
  reset: () => set({
    files: null,
    result: null,
    patient: null,
  }),
}));