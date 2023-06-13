#include "SkiaContext.h"

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

SkiaContext& SkiaContext::getInstance() {
    static SkiaContext instance;
    return instance;
}

GrDirectContext* SkiaContext::getGrContext() const {
    return fGrContext.get();
}
