---
title: 使用 hyphenationFactor 渲染别国语言
date: 2017-11-09 17:49:36
tags: [ios,objective-c]
---

# 自动断字

什么是 [自动断字][1]？
为什么我的应用中应该使用它？

# hyphenationFactor 的短板

在 Apple 开发者参考文档中，我们能找到 TextKit 有关自动断字 [hyphenationFactor][2] 属性的描述：

> Hyphenation is attempted when the ratio of the text width (as broken without hyphenation) to the width of the line fragment is less than the hyphenation factor. When the paragraph’s hyphenation factor is 0.0, the layout manager’s hyphenation factor is used instead. When both are 0.0, hyphenation is disabled. This property detects the user-selected language by examining the first item in preferredLanguages.

重点是最后一句话：

> 该属性通过检查 preferredLanguages 的第一个元素以检测用户偏好语言。

意思是说，自动断字是根据用户设定的系统全局偏好语言来进行的，如果用户的系统语言是简体中文，而我们的应用中希望展示含有自动断字的英文内容，是不可能的。


# 解决方案

要使用 `hyphenationFactor` 渲染别国语言，并且正确进行自动断字，我们可以使用 [Method Swizzing][3]，替换 `preferredLanguages` 的实现，使系统语言始终被检测为英文。

```objectivec
//
//  NSLocale+ForceHyphenation.h
//  Demo
//
//  Created by Zheng on 2017/11/9.
//

#import <Foundation/Foundation.h>

@interface NSLocale (ForceHyphenation)

@end

#import "NSLocale+ForceHyphenation.h"

@implementation NSLocale (ForceHyphenation)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        
        SEL originalSelector = @selector(preferredLanguages);
        SEL swizzledSelector = @selector(xxx_preferredLanguages);
        
        Class class = object_getClass((id)self);
        Method originalMethod = class_getClassMethod(class, originalSelector);
        Method swizzledMethod = class_getClassMethod(class, swizzledSelector);
        
        BOOL didAddMethod =
        class_addMethod(class,
                        originalSelector,
                        method_getImplementation(swizzledMethod),
                        method_getTypeEncoding(swizzledMethod));
        
        if (didAddMethod) {
            class_replaceMethod(class,
                                swizzledSelector,
                                method_getImplementation(originalMethod),
                                method_getTypeEncoding(originalMethod));
        } else {
            method_exchangeImplementations(originalMethod, swizzledMethod);
        }
    });
}

+ (NSArray <NSString *> *)xxx_preferredLanguages {
    [self xxx_preferredLanguages];
    return @[ @"en" ];
}

@end
```


  [1]: https://zhuanlan.zhihu.com/p/20741259
  [2]: https://developer.apple.com/documentation/uikit/nsparagraphstyle/1529275-hyphenationfactor
  [3]: http://nshipster.cn/method-swizzling/
