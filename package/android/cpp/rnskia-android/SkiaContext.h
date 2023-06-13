#pragma once

#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"

class SkiaContext {
public:
  static SkiaContext &getInstance();
  GrDirectContext *getGrContext() const;

private:
  SkiaContext();
  ~SkiaContext();

  SkiaContext(const SkiaContext &) = delete;
  SkiaContext &operator=(const SkiaContext &) = delete;

  sk_sp<const GrGLInterface> fBackendContext;
  sk_sp<GrDirectContext> fGrContext;
};
