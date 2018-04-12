---
title: difference-between-UTF8String-and-fileSystemRepresentation
date: 2018-04-12 22:31:41
tags: [Cocoa, iOS]
---


转载自 [https://objccn.io/issue-9-2/](https://objccn.io/issue-9-2/)
翻译者 [朱宏旭](https://twitter.com/nixzhu)

原文 [https://www.objc.io/issues/9-strings/working-with-strings/](https://www.objc.io/issues/9-strings/working-with-strings/)
作者 [Daniel Eggert](http://twitter.com/danielboedewadt)

## 传递路径到 UNIX API

Unicode 非常复杂，同一个字母有多种表示方式，所以我们在传递路径给 UNIX API 时需要非常小心。在这些情况里，一定不能使用 `-UTF8String`，正确的做法是使用 `-fileSystemRepresentation` 这个方法，如下：

```objectivec
NSURL *documentURL = [[NSFileManager defaultManager] URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:NO error:NULL];
documentURL = [documentURL URLByAppendingPathComponent:name];
int fd = open(documentURL.fileSystemRepresentation, O_RDONLY);
```

与 `NSURL` 类似，同样的情况也发生在 `NSString` 上。如果我们不这么做，在打开一个文件名或路径名包含合成字符的文件时我们将看到随机错误。在 macOS 上，当用户的短名刚好包含合成字符时就会显得特别糟糕，比如 `tómas`。

有时我们可能需要路径是一个不可变的常量，即 `char const *`，一个常见的例子就是 UNIX 的 `open()` 和 `close()` 指令。但这种需求也可能发生在使用 GCD / libdispatch 的 I/O API 上。

```objectivec
dispatch_io_t
dispatch_io_create_with_path(dispatch_io_type_t type,
    const char *path, int oflag, mode_t mode,
    dispatch_queue_t queue,
    void (^cleanup_handler)(int error));
```

如果我们要使用 `NSString` 来做这件事，那我们要保证像下面这样做：

```objectivec
NSString *path = ... // 假设这个字符串已经存在
io = dispatch_io_create_with_path(DISPATCH_IO_STREAM,
    path.fileSystemRepresentation,
    O_RDONLY, 0, queue, cleanupHandler);
```

`-fileSystemRepresentation` 所做的是它首先将这个字符串转换成文件系统的规范形式然后用 UTF-8 编码。
