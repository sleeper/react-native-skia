#pragma once

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "android/native_window.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLAssembleInterface.h"

#include "RNSKLog.h"
#include "SkSurface.h"

namespace RNSkia {

class OpenGLSkiaContext {
public:
  static OpenGLSkiaContext &getInstance() {
    static OpenGLSkiaContext instance;
    return instance;
  }

  OpenGLSkiaContext(const OpenGLSkiaContext &) = delete;
  OpenGLSkiaContext &operator=(const OpenGLSkiaContext &) = delete;

  sk_sp<SkSurface> MakeOffscreenSurface(int width, int height);
  //   sk_sp<SkSurface> MakeOnscreenSurface(int width, int height,
  //                                        ANativeWindow *window);

private:
  OpenGLSkiaContext();
  ~OpenGLSkiaContext() {}

  EGLDisplay _display;
  EGLConfig _config;
  EGLContext _context;
  EGLContext _resource_context;
  sk_sp<GrDirectContext> _grContext = nullptr;
};

} // namespace RNSkia