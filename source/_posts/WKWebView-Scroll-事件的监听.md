---
title: WKWebView Scroll 事件的监听
date: 2018-03-14 12:26:50
tags: [WKWebView, UIScrollView]
---

近期在扇贝阅读中遇到了一些 Crash，其中有一个次数较多的 Crash 崩在了 `-[WKScrollView _updateDelegate]` 上。Google 了一下发现了这篇文章：[逆向及修复最新iOS版少数派客户端的闪退bug](https://www.jianshu.com/p/862a32604a08)。

前人栽树后人乘凉，总结一下：

- `scrollView` 其实是 `WKScrollView`，但是在声明的时候声明成了 `UIScrollView`
- `scrollView.delegate` 原本是有值的，指向的是 WebView 自身，不能复写它

文中提到了可以给 `WKWebView` 添加 Category，但是原作者的实现是有问题的：

```objectivec
@interface WKWebView (ScrollViewDelegate)<UIScrollViewDelegate>

@property (nonatomic, weak) id<UIScrollViewDelegate> scrollViewDelegate;

@end

@implementation WKWebView (ScrollViewDelegate)

- (NSObject *)scrollViewDelegate {
  return objc_getAssociatedObject(self, @selector(scrollViewDelegate));
}

- (void)setScrollViewDelegate:(NSObject *)delegate {
  objc_setAssociatedObject(self, @selector(scrollViewDelegate), delegate, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
  NSLog(@"%s", __func__);
  [self.scrollViewDelegate scrollViewWillBeginDragging:scrollView];
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
  NSLog(@"%s", __func__);
  [self.scrollViewDelegate scrollViewDidEndScrollingAnimation:scrollView];
}

@end
```

`OBJC_ASSOCIATION_RETAIN_NONATOMIC` 基本等同于强引用，这样做想必会引发循环引用。因此需要稍作修改，并将 `UIScrollViewDelegate` 协议的方法进行中间人转发，转发到 `scrollViewDelegate` 上。

新增一个 `wks_WeakObjectContainer` 来对 associated object 进行弱引用：

```objectivec
@interface wks_WeakObjectContainer : NSObject
@property (nonatomic, readonly, weak) id object;
@end

@implementation wks_WeakObjectContainer
- (instancetype)initWithObject:(id)object
{
    if (!(self = [super init]))
        return nil;
    _object = object;
    return self;
}
@end
```

```objectivec
- (NSObject *)scrollViewDelegate {
    return [objc_getAssociatedObject(self, @selector(scrollViewDelegate)) object];
}

- (void)setScrollViewDelegate:(NSObject *)delegate {
    objc_setAssociatedObject(self, @selector(scrollViewDelegate), [[wks_WeakObjectContainer alloc] initWithObject:delegate], OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}
```

将 `UIScrollViewDelegate` 中所有的委托方法都进行转发代理，补充完毕：[WKWebView-ScrollViewDelegate](https://github.com/Lessica/WKWebView-ScrollViewDelegate)

最近怎么都干一些脏活累活……
不过就算这样也比整天吹逼、有技术的干不了、脏活累活不愿意干、高不成低不就的某些名校废物好吧。
