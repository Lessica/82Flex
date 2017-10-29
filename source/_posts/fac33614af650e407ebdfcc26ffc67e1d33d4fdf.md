---
title: 「黑科技」 DNS隧道 - 绕过公共 Wifi 热点登陆免费上网
categories: 安全
tags: [anemone,免费上网,dns隧道,网络安全]
date: 2015-10-02 23:42:00
---

## DNS隧道实现原理

常见的热点都需要登录才能够上网, 而提供热点的ISP对热点的DNS查询服务并不作限制, 这样我们就可以在利用DNS查询机制传递信息.

也就是说, 如果我们的请求数据包中的数据, 不含过滤规则时, 有限制的ISP或者防火墙则不会进行丢包处理.

所以, 我们在发起请求时, 将请求数据包内容通过标准的DNS协议进行加密, 标记解析请求的DNS地址, 则有限制的ISP在解析客户端发起的域名请求时, 无法识别地址, 而去指定的DNS服务器上进行请求查询. 此时, 我们在指定的DNS服务器上进行数据包解密. 

再将查询内容返回. 此时, 有限制的ISP或者防火墙会再次检测内容是否为非认证状态, 如果是非认证状态, 则将查询结果内容进行丢包处理.

所以, 在特定的DNS服务器上, 我们需要将结果进行标准DNS协议加密返回客户端. 此时ISP无法识别结果, 而直接返回客户端进行解密处理. 这样我们就完成了一次DNS隧道请求, 而完全绕过的ISP服务商的认证.

## 建立DNS隧道的环境需求

1. 可以连接有限制的ISP服务商, 比如连接CMCC的无线热点
2. 需要一台拥有公网IP的服务器
3. DNS隧道工具, 用来提供客户端, 服务器通信加解密操作, 以下总结几个流行的工具: 
    * tcp-over-dns http://analogbit.com/software/tcp-over-dns/
    * dns2tcp http://www.hsc.fr/ressources/outils/dns2tcp/
    * iodine http://code.kryo.se/iodine/
4. 客户端代理工具

## 实战操作

本次配置的服务器环境为 CentOS: 

``` bash
[root@iZ28hcmbsi9Z ~]# cat /etc/issue
CentOS release 6.3 (Final)
Kernel \r on an \m
```

### 为服务器添加A记录和NS记录

> a.abc.xyz NS b.abc.xyz  
> b.abc.xyz A 1.2.3.4 (填你的服务器IP, 这里用 1.2.3.4 为例)

### 配置DNS工具服务端

这里我们选用 DNS2TCP 为例
在服务器上安装 DNS2TCP

``` bash
wget http://www.hsc.fr/ressources/outils/dns2tcp/download/dns2tcp-0.5.2.tar.gz
tar zxf dns2tcp-0.5.2.tar.gz
cd dns2tcp-0.5.2
./configure
make
make install
```

在 /etc 建立一个名为 dns2tcpd.conf 的文件, 然后输入以下配置: 

> listen = 1.2.3.4（Linux服务器的IP）  
> port = 53  
> user = nobody  
> chroot = /tmp  
> domain = a.abc.xyz（上面配置NS记录的域名）  
> resources = ssh:127.0.0.1:22,socks:127.0.0.1:1082,http:127.0.0.1:3128 

最后的 resources 里面配置的是 dns2tcp 供客户端使用的资源. 作用是: 客户端在本地监听一个端口, 并指定使用的资源, 当有数据往端口传送后，dns2tcp 客户端将数据用DNS协议传动到服务器，然后服务器将数据转发到对应的资源配置的端口中。

服务端执行如下命令启动 dns2tcp:

``` bash
dns2tcpd -f /etc/dns2tcpd.conf -F -d 2
```

> -f 读取配置文件  
> -F 强制前台运行  
> -d 2 开启debug, 等级为2  

**到此为止,服务端配置完成**

### 配置DNS工具客户端

dns2tcp 的客户端配置较为简单, 一条命令就行: 

``` bash
dns2tcpc -r ssh -z a.abc.xyz 1.2.3.4 -l 8888 -d 2
```

> -r 后接服务名称, 这里我们用ssh  
> -z 后接NS记录的网址, ip, **注意IP地址最好写上, 可以不写**  
> -l 后接本地端口  
> -d 开启 Debug

注意本地需要安装 dns2tcp 工具.

**到此为止, 服务端配置完成**  

可以用SSH测试一下: 

``` bash
ssh root@127.0.0.1:8888
```

连通的话就说明 dns2tcp 成功了, 可以直接用SSH通道建立代理上网, 客户端 Chrome 再用 SwitchOmega 接入,也可以在客户端那写 http 或 Socks 服务, 前提是服务器那要有对应服务 (可以找 _Kingate 架设 http 和 Socks5 代理_ 的文章)

