import { create } from 'zustand';

const useStore = create((set) => ({
  patientInfo: {
    patientName: '',
    age: '',
    notes: ''
  },
  mriImage: null,
  scanResult: null,
  isScanning: false,

  setPatientInfo: (info) => set({ patientInfo: info }),
  setMriImage: (file) => set({ mriImage: file }),
  setScanResult: (result) => set({ scanResult: result }),
  setIsScanning: (status) => set({ isScanning: status }),
  resetSession: () => set({ 
    patientInfo: { patientName: '', age: '', notes: '' },
    mriImage: null,
    scanResult: null,
    isScanning: false
  })
}));

export default useStore;
