---
title: Failed to set up Time Machine because of Keychain error
date: 2018-01-26 22:58:04
tags: [Time Machine, Keychain]
---

Certain files have a property incorrectly set that will prevent them from being changed or deleted while the system is running. That property can only be removed in Recovery mode.

如果你在设置 Time Machine 的时候出现了如下讯息, 请尝试如下步骤:

If you get the following message when setup Time Machine:

> Keychain error 100001 occurred while creating a System Keychain entry for the username “Steven Chambers 2” and URL “afp://Steven%20Chambers%202@Chambers%20Apple.\_afpovertcp.\_tcp.local./AirPort%20Disk”.

1. Back up all data. There are ways to back up a computer that isn't fully functional. Ask if you need guidance. Don't skip this step. 备份所有数据.

2. Disconnect all external storage devices. 断开所有外设.

3. Start up in Recovery mode. Select a language, if prompted. The OS X Utilities screen will appear. One of the options is to install OS X. That's not what you're going to do. 重启系统, 在下次启动前按住 Command-R, 以进入恢复模式.

4. This step is only necessary if you use FileVault 2. If you don't know what FileVault is, you're not using it. Go to the next step. Otherwise, launch Disk Utility, then select the icon of the FileVault volume ("Macintosh HD," unless you gave it a different name.) It will be nested below another drive icon. Select Unlock from the File menu and enter your login password when prompted. Then quit Disk Utility to be returned to the main screen. 如果你的磁盘开启了 FileVault, 进入磁盘工具关闭它.

5. Select Get Help Online. Safari will launch. While in Recovery, you'll have no access to your bookmarks, but you won't need them. Load this web page. 在恢复模式点击 "获取在线帮助", 在打开的 Safari 中进入此页面.

6. Triple-Click anywhere in the line below to select it: Command-C 复制下面的命令:

```
chflags norestricted /V*/*/L*/Keyc*/*
```

Copy the selected text to the Clipboard by pressing the key combination Command-C.

7. Quit Safari. You'll be returned to the OS X Utilities screen. 退出 Safari, 返回实用工具界面.

From the menu bar, select: 在菜单栏, 选择:

> Utilities ▹ Terminal

The Terminal application will launch. Paste into the Terminal window by pressing the key combination Command-V. 终端将会启动, 将刚才复制的命令键入终端, 回车执行.

Wait for a new line ending in a hash sign (#) to appear. Quit Terminal to be returned to the main screen.

8. Select

>  ▹ Restart

from the menu bar. 重启系统到正常模式.

9. This step must be carried out after the restart and while you're logged in as an administrator—not in Recovery mode. If you have only one user account, you are the administrator. 在正常模式的终端中, 复制并执行下面的命令:

Select and copy this line as in Step 6:

```
sudo xattr -c /L*/Keyc*/*
```

Launch the built-in Terminal application in any one of the following ways:

- Enter the first few letters of its name into a Spotlight search. Select it in the results (it should be at the top.)

- In the Finder, select Go ▹ Utilities from the menu bar, or press the key combination shift-command-U. The application is in the folder that opens.

- Open LaunchPad and start typing the name.

Paste into the Terminal window as before. You'll be prompted for your login password. Nothing will be displayed when you type it. Type carefully and then press return. If you don’t have a login password, you’ll need to set one before you can run the command. You may get a one-time warning to be careful. Confirm. You don't need to post the warning.

If you see a message that your username "is not in the sudoers file," then you're not logged in as an administrator. Log in as one and start over.

Wait for a new line ending in a dollar sign ($) to appear below what you entered. You can then quit Terminal. Test.
