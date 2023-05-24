#pragma once

#include <memory>
#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include <RNSkAndroidView.h>
#include <RNSkPictureView.h>

#include <android/native_window_jni.h>
#include <EGL/egl.h>
#include <GLES/gl.h>
#include <SkSurface.h>

namespace RNSkia {
namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

class JniSkiaPictureView2 : public jni::HybridClass<JniSkiaPictureView2> {
public:
  static auto constexpr kJavaDescriptor =
      "Lcom/shopify/reactnative/skia/SkiaPictureView2;";


    static jni::local_ref<jhybriddata>
  initHybrid(jni::alias_ref<jhybridobject> jThis) {
    return makeCxxInstance(jThis);
  }

  static void registerNatives() {
    registerHybrid(
        {
        //makeNativeMethod("initHybrid", JniSkiaPictureView2::initHybrid),
         makeNativeMethod("surfaceAvailable",
                          JniSkiaPictureView2::surfaceAvailable)});
  }

protected:
  void surfaceAvailable(jobject surface, int width, int height) {
      auto window = ANativeWindow_fromSurface(facebook::jni::Environment::current(), surface);

  }
private:
  friend HybridBase;


  explicit JniSkiaPictureView2(jni::alias_ref<jhybridobject> jThis) {
      // Initialize your object here.
  }

  jni::global_ref<javaobject> javaPart_;
};

} // namespace RNSkia
