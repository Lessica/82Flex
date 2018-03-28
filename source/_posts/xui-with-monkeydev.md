---
title: XUI：为 MonkeyDev 插件添加配置界面
date: 2018-03-27 21:50:49
tags: [MonkeyDev, XUI]
---


## 前言

在越狱环境下，如果我们需要为插件添加配置项，第一个想到的就是大名鼎鼎的 PreferencesLoader，这个插件可以在 iOS 设置中添加一个 Section，在里面加上我们插件的配置。但是如果我们想在目标应用中直接添加配置界面，或者想在未越狱设备上添加配置界面，这个时候就面临着要编写一整套配置 UI 的窘境。如果配置项比较多，这个配置界面的编写也算是挺麻烦的。

![asset_img](index/6738e1531b239ce0ea12045099ddf9f3f1c54b2c.png)

为了在这种情况下依旧能够享受类似 PreferencesLoader 功能的便利，我编写了 XUI，这是一个能够依据配置文件，创建出基于 UITableView 的配置界面。XUI 的使用相比 PreferencesLoader 而言更加简便，而且更加强大。

- 支持创建子界面
- 支持数十种配置组件
- 支持自定义主题颜色
- 支持 Bundle 与资源引用、多语言等特性

XUI 开源于 Github: https://github.com/Lessica/XUI
XUI 配置文档：https://kb.xxtouch.com/XUI/

**注：因为 XUI 是为我的另一款产品 XXTouch 设计的，所以配置文档中要求使用 Lua 创建配置，但是实际使用中你需要使用 json 或 plist 字典创建配置，语法上大同小异。**


## 开始

首先我们在已越狱的测试机上安装最新版本的QQ（本文使用的版本是 v7.5.0.407）。

安装 MonkeyDev，安装及配置步骤参见：https://github.com/AloneMonkey/MonkeyDev
注意，这里我们配置了测试机 SSH 的免密登录，并在设备上安装了 frida。

配置完成后，我们创建一个新的 MonkeyApp，取名为 QQRecallPatch，注意 Target App 填写 "QQ"，这样 MonkeyDev 会自动使用 frida 砸壳并导出 ipa。

![asset_img](index/6176bca2e1b309b321500b078dca34bd5c7b6efa.png)

第一次运行需要耐心等待砸壳过程，这时应用会启动，如果构建成功，接下来我们为插件添加 XUI 配置界面。在工程目录下创建 Podfile，然后运行 `pod install`：

```ruby
use_frameworks!

target 'QQRecallPatchDylib' do
     pod 'XUI', :git => "https://github.com/Lessica/XUI.git"
end
```

![asset_img](index/e6f374f4e6b76a8c9b744172cf86ef3fc9dec215.png)

关闭 xcodeproj，打开工程目录中出现的 xcworkspace，可以看到 XUI 库已经被引入。接下来我们创建一个 XUI 界面配置 Bundle 目录 QQRecallPatch.bundle，内含一个 XUI 界面文件 interface.json，将其添加到 QQRecallPatch 项目的资源中：

```json
{
    "title":"插件配置",
    "theme":{
        "navigationTitleColor": "#000000",
        "navigationBarColor": "#FFFFFF"
    },
    "items":[
        {
            "label":"功能",
            "cell":"Group",
            "footerText":"Author: i_82 <i.82@me.com>"
        },
        {
            "cell":"Switch",
            "label":"开启防撤回",
            "key":"RecallPatchEnabled",
            "default":true
        }
    ]
}
```

注意图中红框部分，组件 Switch 代表一个开关，其 key 我们设置为 `RecallPatchEnabled`，之后我们获取配置的时候要用到。

![asset_img](index/15b3a066950aeb862d6742ebf06afaa24a094f40.png)

确保这个 Bundle 资源被正确引入到工程中：

![asset_img](index/26337e1d48bc9da5458b04e26198dc69c4f9121a.png)

在目标应用中，为插件的 XUI 配置界面添加入口按钮，这里我们在 QQ 设置界面的导航栏右上角添加一个按钮入口：

```objectivec
%hook QQSettingsViewController

- (void)viewDidLoad {
    %orig;
    UIBarButtonItem *tweakItem = [[UIBarButtonItem alloc] initWithTitle:@"插件" style:UIBarButtonItemStylePlain target:self action:@selector(tweakItemTapped:)];
    [tweakItem setTitleTextAttributes:@{NSForegroundColorAttributeName:[UIColor blackColor]} forState:UIControlStateNormal];
    self.navigationItem.rightBarButtonItem = tweakItem; // 在 QQ 设置界面导航栏右上角添加按钮
}

%new
- (void)tweakItemTapped:(id)sender {
    NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"QQRecallPatch" ofType:@"bundle"];
    NSString *xuiPath = [[NSBundle bundleWithPath:bundlePath] pathForResource:@"interface" ofType:@"json"];
    [XUIListViewController presentFromTopViewControllerWithPath:xuiPath withBundlePath:bundlePath]; // 从顶层 UIViewController 将 XUI 配置界面 present 出来
}

%end
```

最后一歩，实现防撤回插件的主要功能，这里我就不多说了，各位按照自己插件的功能自由发挥。需要获取配置的时候，只需要从 `[NSUserDefaults standardUserDefaults]` 中读取即可，这里我们就可以读取刚刚的配置项 `RecallPatchEnabled`，例如：

```objectivec
id enabledVal = [[NSUserDefaults standardUserDefaults] objectForKey:@"RecallPatchEnabled"];
if (!enabledVal) {
    enabledVal = @(YES); // default value
}
```

![asset_img](index/faee7d7779767680a8a39f5f8e67adee362aa42d.png)

接下来我们看看效果：

![asset_img](index/26f9c25ba9c87c4206e572d201dea4365c0099d9.png)

![asset_img](index/ca4a5c0c6e36143fdff24dfa722c9d317e3ab2f6.png)

对于 XUI 的介绍大致就是这样，更多丰富的组件大家可以在 XUI 文档中找到：https://kb.xxtouch.com/XUI/

强烈安利庆哥的 MonkeyDev，用它做越狱插件开发简直不能再赞。

示例工程（不包含 Target App）：
[https://github.com/Lessica/QQRecallPatch](https://github.com/Lessica/QQRecallPatch)
