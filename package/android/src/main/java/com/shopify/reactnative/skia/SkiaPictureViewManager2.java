package com.shopify.reactnative.skia;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class SkiaPictureViewManager2 extends ReactViewManager {

    @NonNull
    @Override
    public String getName() {
        return "SkiaPictureView2";
    }

    @NonNull
    @Override
    public SkiaPictureView2 createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new SkiaPictureView2(reactContext);
    }

    @Override
    public void setNativeId(@NonNull ReactViewGroup view, @Nullable String nativeId) {
        super.setNativeId(view, nativeId);
        int nativeIdResolved = Integer.parseInt(nativeId);
        //((SkiaBaseView)view).registerView(nativeIdResolved);
    }
}