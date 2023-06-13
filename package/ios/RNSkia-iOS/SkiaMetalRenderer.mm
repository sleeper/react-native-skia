#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "SkCanvas.h"
#import "SkColorSpace.h"
#import "SkSurface.h"

#import <include/gpu/GrDirectContext.h>

#pragma clang diagnostic pop

#import <MetalKit/MetalKit.h>
#import "SkiaContext.h"

struct OffscreenRenderContext {
  id<MTLTexture> texture;

  OffscreenRenderContext(int width, int height) {
    SkiaContext* skiaContext = [SkiaContext sharedContext];
    // Create a Metal texture descriptor
    MTLTextureDescriptor *textureDescriptor = [MTLTextureDescriptor
        texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm
                                     width:width
                                    height:height
                                 mipmapped:NO];
    textureDescriptor.usage =
        MTLTextureUsageRenderTarget | MTLTextureUsageShaderRead;
    texture = [skiaContext.mtlDevice newTextureWithDescriptor:textureDescriptor];
  }
};

sk_sp<SkSurface> MakeOffscreenMetalSurface(int width, int height) {
  auto ctx = new OffscreenRenderContext(width, height);

  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void *)ctx->texture);
  GrBackendTexture backendTexture(width, height, GrMipMapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  SkiaContext* skiaContext = [SkiaContext sharedContext];
  auto surface = SkSurface::MakeFromBackendTexture(
      skiaContext.grContext.get(), backendTexture, kTopLeft_GrSurfaceOrigin, 0,
      kBGRA_8888_SkColorType, nullptr, nullptr,
      [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);

  return surface;
}
