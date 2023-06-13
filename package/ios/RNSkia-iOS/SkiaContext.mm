#import "SkiaContext.h"

@implementation SkiaContext

+ (instancetype)sharedContext {
  static SkiaContext *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[SkiaContext alloc] init];
  });
  return sharedInstance;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _mtlDevice = MTLCreateSystemDefaultDevice();
    _mtlCommandQueue = (__bridge id<MTLCommandQueue>)CFRetain(
        (GrMTLHandle)[_mtlDevice newCommandQueue]);
    _grContext = GrDirectContext::MakeMetal((__bridge void *)_mtlDevice,
                                            (__bridge void *)_mtlCommandQueue);
  }
  return self;
}

@end
