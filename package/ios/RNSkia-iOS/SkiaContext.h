#pragma once

#import <include/gpu/GrDirectContext.h>
#import <MetalKit/MetalKit.h>

@interface SkiaContext : NSObject

@property(nonatomic, readonly) sk_sp<GrDirectContext> grContext;
@property(nonatomic, readonly) id<MTLDevice> mtlDevice;
@property(nonatomic, readonly) id<MTLCommandQueue> mtlCommandQueue;

+ (instancetype)sharedContext;

@end
