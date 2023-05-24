import type { SkPicture } from "@shopify/react-native-skia";
import React from "react";
import type { ViewProps } from "react-native";
import { requireNativeComponent } from "react-native";

export const SkiaViewNativeId = { current: 1000 };

interface NativeSkiaPictureView2 {
  style?: ViewProps["style"];
}

interface SkiaPictureView2Props extends NativeSkiaPictureView2 {
  picture: SkPicture;
}

const NativeSkiaPictureView2 =
  requireNativeComponent<NativeSkiaPictureView2>("SkiaPictureView2");

export const SkiaPictureView2 = ({ style }: SkiaPictureView2Props) => {
  return <NativeSkiaPictureView2 style={style} />;
};
