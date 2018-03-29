---
title: Do not forget to codesign your Mac App
date: 2017-10-29 23:45:26
tags: [codesign,mac,certificate]
---

Don't want an alert when someone wants to install your app?

# Import Certificates

To codesign your Mac App, you need `developerID_application.cer` and `developerID_installer.cer`. Both can be downloaded from "Apple Developer Panel".

When you request the certificates above, you should have received the **private key**, which can be exported to `Certificates.p12` in "Keychain Access".

![asset_img](/QQ20171030-113715.png)

# Codesign

Now we have a Mac App "XXTStudio.app".
Assume that we have all certificates and private keys in keychain "Login".

``` bash
sudo codesign --keychain ~/Library/Keychains/login.keychain-db -f -s "Developer ID Application: Zheng Wu (GXZ23M5TP2)" -v "XXTStudio.app" --deep
```

# Packaging

``` bash
productbuild --component "XXTStudio.app" "/Applications" --sign "Developer ID Installer: Zheng Wu (GXZ23M5TP2)" --product "XXTStudio.app/Contents/Info.plist" "XXTStudio_Mac.pkg"
```

