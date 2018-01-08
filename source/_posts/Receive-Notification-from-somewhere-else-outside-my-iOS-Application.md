---
title: Receive Notification from somewhere else outside my iOS Application
date: 2017-12-21 23:08:21
tags: [iOS]
---

分享一个自己在开发 App 过程中遇到的细节，虽然老司机们可能遇到过。

监听键盘事件，获取键盘弹出高度，这个是很常见的操作。但是在通知里有一个键 **UIKeyboardIsLocalUserInfoKey** 似乎经常被忽略。

> https://developer.apple.com/documentation/uikit/uikeyboardislocaluserinfokey

这个键的作用是，区分键盘是在自己应用中弹出还是在其它应用中弹出。我们知道，键盘是系统全局共享的资源，因此如果在其它应用当中弹出了键盘，我们的应用一样会收到这种通知。所以今后如果有类似需求，需要注意一下这个值。如果它为 _false_ 则需要忽略。

有一次从自己的 App 调试切换到了 QQ 聊天界面，发现应用收到了键盘弹出的通知，做了一些多余的事情，所以检查了一下这个问题。
