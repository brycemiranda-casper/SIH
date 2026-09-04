import { create } from 'zustand';

const useStore = create((set) => ({
  activeLayers: {
    landslide: true,
    flood: true,
    blocked: true,
    monsoon: false,
  },
  toggleLayer: (key) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [key]: !state.activeLayers[key],
      },
    })),
}));

export default useStore;
