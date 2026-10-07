"use client";

import { create } from "zustand";

interface PortalState {
  active: boolean;
  href: string | null;
  message: string | null;
  trigger: (href: string, message: string) => void;
  reset: () => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  active: false,
  href: null,
  message: null,
  trigger: (href, message) => set({ active: true, href, message }),
  reset: () => set({ active: false, href: null, message: null }),
}));
