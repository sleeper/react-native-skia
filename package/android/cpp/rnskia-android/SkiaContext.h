#pragma once

#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"
#include "EGL/egl.h"
#include "GLES2/gl2.h"

namespace RNSkia {

class SkiaContext {
public:
  static SkiaContext &getInstance();
  sk_sp<GrDirectContext> getGrContext() const;
  EGLDisplay getDisplay() const {
      return eglDisplay;
  }

  EGLSurface getSurface() const {
      return eglSurface;
  }

private:
  SkiaContext();
  ~SkiaContext();

  SkiaContext(const SkiaContext &) = delete;
  SkiaContext &operator=(const SkiaContext &) = delete;

  sk_sp<const GrGLInterface> fBackendContext;
  sk_sp<GrDirectContext> fGrContext;
  EGLDisplay eglDisplay = EGL_NO_DISPLAY;
  EGLSurface eglSurface = EGL_NO_SURFACE;
  EGLContext eglContext = EGL_NO_CONTEXT;
};

}