import React, { createContext, useContext, useMemo } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { SkPicture } from "@shopify/react-native-skia";
import { Skia, useSVG } from "@shopify/react-native-skia";

import { SkiaPictureView2 } from "./SkiaPictureView2";

const useSVGPicture = (module: number) => {
  const svg = useSVG(module);
  return useMemo(() => {
    if (!svg) {
      return null;
    }
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, 48, 48));
    canvas.drawSvg(svg);
    console.log("finishRecordingAsPicture");
    return recorder.finishRecordingAsPicture();
  }, [svg]);
};

const useLoadSVGs = () => {
  const github = useSVGPicture(require("./assets/icons8-github.svg"));
  const octocat = useSVGPicture(require("./assets/icons8-octocat.svg"));
  const stackExchange = useSVGPicture(
    require("./assets/icons8-stack-exchange.svg")
  );
  const overflow = useSVGPicture(require("./assets/icons8-stack-overflow.svg"));
  if (github && octocat && stackExchange && overflow) {
    return {
      github,
      octocat,
      stackExchange,
      overflow,
    };
  } else {
    return null;
  }
};

interface SVGAssets {
  github: SkPicture;
  octocat: SkPicture;
  stackExchange: SkPicture;
  overflow: SkPicture;
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
  icon: SkPicture;
  size?: number;
}

const Icon = ({ icon, size = 48 }: IconProps) => {
  return (
    <SkiaPictureView2
      picture={icon}
      style={{ width: size, height: size, backgroundColor: "red" }}
    />
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
  const assets = useLoadSVGs();
  if (!assets) {
    return null;
  }
  return (
    <SVGContext.Provider value={assets}>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SVGContext.Provider>
  );
};
