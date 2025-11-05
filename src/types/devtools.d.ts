/// <reference types="@tanstack/react-query-devtools" />

declare global {
  interface Window {
    toggleQueryDevtools?: () => void;
  }
}

export {};
