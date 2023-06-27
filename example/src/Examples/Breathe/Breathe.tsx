import {
  Canvas,
  Line,
  Oval,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, Text, useWindowDimensions } from "react-native";
import { useDerivedValue } from "react-native-reanimated";

export const Breathe = () => {
  // state
  const { width } = useWindowDimensions();
  // render
  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.addArc(Skia.XYWHRect(0, 0, 150, 150), 90, 45);
    return p;
  });

  return (
    <Canvas style={{ width: "100%", height: "100%" }}>
      <Path path={path} color="red" />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  leftText: {
    position: "absolute",
    left: 10,
    top: 100,
    color: "black",
  },
  rightText: {
    position: "absolute",
    right: 10,
    top: 100,
    color: "black",
  },
});
