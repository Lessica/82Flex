---
title: iOS SDK Bug - App crashes if a xib file has almost the same name as a view controller
date: 2017-11-27 16:13:18
tags: [iOS,Bugs]
---

# Summary 简述

Cannot display a view controller if the bundle contains another xib file with the same name minus "Controller". 
Example: "LittleViewController.xib" and "LittleView.xib"

如果 App Bundle 中存在一个与 "LittleViewController" 名称相似的 "LittleView.xib", 则该 "LittleViewController" 将无法载入, 表现为崩溃.

# Crash logs 错误日志

> 2015-03-04 17:49:29.567 Radar Sample[22570:18122050] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: '-[UIViewController _loadViewFromNibNamed:bundle:] loaded the "LittleView" nib but the view outlet was not set.'

# Steps to Reproduce 复现步骤

1. Create a new Cocoa Touch class which is a UIViewController subclass. (APPLViewController for example).
2. Write code to display that view controller on your device.
3. Run your application and observe that you can display the view controller.
4. Stop your application.
5. Create a new Cocoa Touch class which is a UIView subclass (APPLView for instance).
6. Add a new Interface Builder object (type View) to your project with the same name as the previous UIView subclass (APPLView.xib in that case).
7. Run your application and observe that you cannot longer display the view controller (crash).

# Expected Results 期望结果

Display the view controller.

正常显示 view controller.

# Actual Results 实际结果

Crash before the view controller is displayed.

在 view controller 显示之前发生了崩溃.

# Sample project 示例项目

http://cl.ly/3s2c1v1I1J1Q

# Solution 解决方案

Rename your view/xib or view controller to avoid this problem.

重命名 view/xib 或 view controller 就可以避免该问题.
