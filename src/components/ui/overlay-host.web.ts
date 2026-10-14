import { createElement, Fragment, type ReactNode } from "react";

export interface OverlayHost {
  setContent: (content: ReactNode) => void;
  clearContent: () => void;
}

export function useOverlayHost(): OverlayHost | null {
  return null;
}

export function OverlayHostProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return createElement(Fragment, null, children);
}
