#include "OpenGLSkiaContext.h"
#include "Macros.h"

namespace RNSkia {

template <class T>
using EGLResult = std::pair<bool, T>;

static EGLResult<EGLContext> CreateContext(EGLDisplay display,
                                           EGLConfig config,
                                           EGLContext share = EGL_NO_CONTEXT) {
  EGLint attributes[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};

  EGLContext context = eglCreateContext(display, config, share, attributes);

  return {context != EGL_NO_CONTEXT, context};
}

static EGLResult<EGLConfig> ChooseEGLConfiguration(EGLDisplay display,
                                                   uint8_t msaa_samples) {
  EGLint sample_buffers = msaa_samples > 1 ? 1 : 0;
  EGLint attributes[] = {
      // clang-format off
      EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
      EGL_SURFACE_TYPE,    EGL_WINDOW_BIT,
      EGL_RED_SIZE,        8,
      EGL_GREEN_SIZE,      8,
      EGL_BLUE_SIZE,       8,
      EGL_ALPHA_SIZE,      8,
      EGL_DEPTH_SIZE,      0,
      EGL_STENCIL_SIZE,    0,
      EGL_SAMPLES,         static_cast<EGLint>(msaa_samples),
      EGL_SAMPLE_BUFFERS,  sample_buffers,
      EGL_NONE,            // termination sentinel
      // clang-format on
  };

  EGLint config_count = 0;
  EGLConfig egl_config = nullptr;

  if (eglChooseConfig(display, attributes, &egl_config, 1, &config_count) !=
      EGL_TRUE) {
    return {false, nullptr};
  }

  bool success = config_count > 0 && egl_config != nullptr;

  return {success, success ? egl_config : nullptr};
}

static bool TeardownContext(EGLDisplay display, EGLContext context) {
  if (context != EGL_NO_CONTEXT) {
    return eglDestroyContext(display, context) == EGL_TRUE;
  }

  return true;
}

OpenGLSkiaContext::OpenGLSkiaContext(): _display(EGL_NO_DISPLAY) {
        uint8_t msaa_samples = 0;
        _display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
        if (_display == EGL_NO_DISPLAY) {
            LOG_EGL_ERROR;
            return;
        }
        // Initialize the display connection.
        if (eglInitialize(_display, nullptr, nullptr) != EGL_TRUE) {
            LOG_EGL_ERROR;
            return;
        }

        bool success = false;

        // Choose a valid configuration.
        std::tie(success, _config) =
            ChooseEGLConfiguration(_display, msaa_samples);
        if (!success) {
            RNSkLogger::logToConsole("Could not choose an EGL configuration.");
            LOG_EGL_ERROR;
            return;
        }

          // Create a context for the configuration.
        std::tie(success, _context) =
            CreateContext(_display, _config, EGL_NO_CONTEXT);
        if (!success) {
            RNSkLogger::logToConsole("Could not choose an EGL context.");
            LOG_EGL_ERROR;
            return;
        }

        std::tie(success, _resource_context) =
            CreateContext(_display, _config, _context);
        if (!success) {
            RNSkLogger::logToConsole("Could not choose an EGL resource context.");
            LOG_EGL_ERROR;
            return;
        }

        // https://github.com/flutter/engine/blob/main/shell/platform/android/android_surface_gl_skia.cc#L175
        // potential default options: https://github.com/flutter/engine/blob/main/shell/common/context_options.cc#L11
        auto backendInterface = GrGLMakeNativeInterface();
        _grContext = GrDirectContext::MakeGL(backendInterface);
        if (_grContext == nullptr) {
            RNSkLogger::logToConsole("Could not create GrContext!");
        }
    }

} // namespace RNSkia