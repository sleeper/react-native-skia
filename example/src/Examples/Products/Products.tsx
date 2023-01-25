/* eslint-disable max-len */
import React from "react";
import { useWindowDimensions, View } from "react-native";

import { Product } from "./Product";

export const Products = () => {
  const { width: wWidth } = useWindowDimensions();
  const width = (wWidth - 48) / 2;
  const height = 1.65 * width;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        padding: 16,
      }}
    >
      <Product
        width={width}
        height={height}
        url="https://firebasestorage.googleapis.com/v0/b/start-react-native.appspot.com/o/miscs%2Fsneakers.jpg?alt=media&token=cf00be7c-f280-47bb-8315-d968f70e69ea"
      />
      <Product
        width={width}
        height={height}
        url="https://firebasestorage.googleapis.com/v0/b/start-react-native.appspot.com/o/miscs%2Fsneakers-removebg.png?alt=media&token=f1d9fee0-b62c-4f87-a924-93c3c1ea8c33"
      />
      <Product
        width={width}
        height={height}
        url="https://firebasestorage.googleapis.com/v0/b/start-react-native.appspot.com/o/miscs%2Fsneakers-removebg.png?alt=media&token=f1d9fee0-b62c-4f87-a924-93c3c1ea8c33"
      />
      <Product
        width={width}
        height={height}
        url="https://firebasestorage.googleapis.com/v0/b/start-react-native.appspot.com/o/miscs%2Fsneakers-removebg.png?alt=media&token=f1d9fee0-b62c-4f87-a924-93c3c1ea8c33"
      />
    </View>
  );
};
