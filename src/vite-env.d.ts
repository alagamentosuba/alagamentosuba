/// <reference types="vite/client" />

declare global {
  interface Window {
    fbq?: (action: string, eventName: string) => void;
  }
}

export {};
