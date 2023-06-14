#include <RNSkLog.h>

#include "SkiaContext.h"

namespace RNSkia {

SkiaContext::SkiaContext() {
  eglDisplay = eglGetDisplay(EGL_DEFAULT_DISPLAY);
  if (eglDisplay == EGL_NO_DISPLAY) {
      RNSkLogger::logToConsole("eglGetdisplay failed : %i", glGetError());
      return;
  }

  EGLint major;
  EGLint minor;
  if (!eglInitialize(eglDisplay, &major, &minor)) {
      RNSkLogger::logToConsole("eglInitialize failed : %i", glGetError());
      return;
  }
    
  fBackendContext = GrGLMakeNativeInterface();
  if (fBackendContext) {
    fGrContext = GrDirectContext::MakeGL(fBackendContext);
  }
}

SkiaContext::~SkiaContext() {
  if (fGrContext) {
    fGrContext->releaseResourcesAndAbandonContext();
    fGrContext.reset();
  }
  fBackendContext.reset();
}

SkiaContext &SkiaContext::getInstance() {
  static SkiaContext instance;
  return instance;
}

sk_sp<GrDirectContext> SkiaContext::getGrContext() const { return fGrContext; }

}