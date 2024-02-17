import { create } from "zustand";

interface ModalStore {
  openModals: string[];
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  isModalOpen: (modalName: string) => boolean;
}

export const useModalStore = create<ModalStore>((set) => ({
  openModals: [],

  openModal: (modalName) => {
    set((state) => ({
      openModals: [...state.openModals, modalName],
    }));
  },

  closeModal: (modalName) => {
    set((state) => ({
      openModals: state.openModals.filter((name) => name !== modalName),
    }));
  },

  isModalOpen: (modalName) => {
    return useModalStore.getState().openModals.includes(modalName);
  },
}));

