#include "SkiaContext.h"

namespace RNSkia {

SkiaContext::SkiaContext() {
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