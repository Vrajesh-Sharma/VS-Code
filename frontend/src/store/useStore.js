import { create } from 'zustand';

const useStore = create((set) => ({
  user: null, // Supabase Auth user
  patientId: null, // Track inserted patient record
  patientInfo: {
    patientName: '',
    age: '',
    notes: ''
  },
  mriImage: null,
  mriFile: null,
  mriImageUrl: null,
  scanResult: null,
  isScanning: false,
  isMobileMenuOpen: false,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setPatientId: (id) => set({ patientId: id }),
  setPatientInfo: (info) => set({ patientInfo: info }),
  setMriImage: (file) => set({ mriImage: file }),
  setMriFile: (file) => set({ mriFile: file }),
  setMriImageUrl: (url) => set({ mriImageUrl: url }),
  setScanResult: (result) => set({ scanResult: result }),
  setIsScanning: (status) => set({ isScanning: status }),
  toggleMobileMenu: (status) => set((state) => ({ 
    isMobileMenuOpen: status !== undefined ? status : !state.isMobileMenuOpen 
  })),
  resetSession: () => set({ 
    patientId: null,
    patientInfo: { patientName: '', age: '', notes: '' },
    mriImage: null,
    scanResult: null,
    isScanning: false
  })
}));

export default useStore;
