import React from "react";
import { StyleSheet, View } from "react-native";

export interface OverlayHost {
  setContent: (content: React.ReactNode) => void;
  clearContent: () => void;
}

const OverlayHostContext = React.createContext<OverlayHost | null>(null);

export function useOverlayHost(): OverlayHost | null {
  return React.useContext(OverlayHostContext);
}

export function OverlayHostProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = React.useState<React.ReactNode>(null);

  const host = React.useMemo<OverlayHost>(
    () => ({
      setContent: (node) => setContent(node),
      clearContent: () => setContent(null),
    }),
    [],
  );

  return (
    <OverlayHostContext.Provider value={host}>
      {children}
      <View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, styles.layer]}
      >
        {content}
      </View>
    </OverlayHostContext.Provider>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 1000,
  },
});
