import React, { createContext, useContext } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { SkSVG } from "@shopify/react-native-skia";
import { Canvas, ImageSVG, useSVG } from "@shopify/react-native-skia";

interface SVGAssets {
  github: SkSVG;
  octocat: SkSVG;
  stackExchange: SkSVG;
  overflow: SkSVG;
}

const SVGContext = createContext<SVGAssets | null>(null);

const useSVGs = () => {
  const svgs = useContext(SVGContext);
  if (!svgs) {
    throw new Error("No SVGs available");
  }
  return svgs;
};

interface IconProps {
  icon: SkSVG;
  size?: number;
}

const Icon = ({ icon, size = 50 }: IconProps) => {
  return (
    <Canvas style={{ width: size, height: size }}>
      <ImageSVG svg={icon} />
    </Canvas>
  );
};

const HomeScreen = () => {
  const { github, octocat, stackExchange, overflow } = useSVGs();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Icon icon={github} />
      <Icon icon={octocat} />
      <Icon icon={stackExchange} />
      <Icon icon={overflow} />
    </View>
  );
};

const SettingsScreen = () => {
  const { github, octocat, stackExchange, overflow } = useSVGs();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Icon icon={github} />
      <Icon icon={octocat} />
      <Icon icon={stackExchange} />
      <Icon icon={overflow} />
    </View>
  );
};

const Tab = createBottomTabNavigator();

export const SVG = () => {
  const github = useSVG(require("./assets/icons8-github.svg"));
  const octocat = useSVG(require("./assets/icons8-octocat.svg"));
  const stackExchange = useSVG(require("./assets/icons8-stack-exchange.svg"));
  const overflow = useSVG(require("./assets/icons8-stack-overflow.svg"));
  if (!github || !octocat || !stackExchange || !overflow) {
    return null;
  }
  return (
    <SVGContext.Provider value={{ github, octocat, stackExchange, overflow }}>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SVGContext.Provider>
  );
};
