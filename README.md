# 82Flex

The repository of my Hexo blog: https://82flex.com


## 部署

这是阿里云 CDN + OSS + ECS 部署 https 静态博客的最佳实践。这得益于 Hexo 博客是纯静态的。首先本地部署 Hexo，生成 Markdown 文章仓库，接下来的大致步骤如下：

1. 创建阿里云 OSS Bucket，并将权限设为公有读，启用静态网站托管
2. 创建同一地域的阿里云 Linux ECS，将 OSS Bucket 使用阿里云 ossfs 挂载上去
3. 申请域名，**实名认证，ICP 备案，网监备案**，在阿里云顺便申请免费的 https 证书
4. 部署阿里云 ECS 上的 rsync 服务，不需要另外监听端口
5. 通过 `rsync` 将 Hexo `public` 目录同步到阿里云 ECS 的 ossfs 上，此时博客结构已经同步到阿里云 OSS 上
6. 测试直接访问 OSS 域名正常后，创建阿里云 CDN 图片加速服务，设置为 OSS 回源，并配置 https 证书
7. 将申请的域名 CNAME 解析至阿里云 CDN
8. 配置阿里云 OSS，与阿里云 CDN 解析进行绑定
9. 测试访问正常后，创建阿里云 ECS 安全组，使阿里云 ECS 的公网入方向仅保留远程管理端口，其它端口均禁止公网入连接

享受你的高速博客吧，只是有几个细节需要注意：

- 阿里云 OSS 不能完美支持 Hexo 的伪静态路由，因为不能找到子目录的 `index.html`，即 `/2018/04/` 不能找到 `/2018/04/index.html`，因此需要修改 `_config.yml` 使 Hexo 生成的链接中包含 `index.html`

- Hexo 有一些小问题，导致生成的链接中包含 `index.html` 的情况下，引用的图片资源路径会发生一定的错误，需要修改文章中的图片路径，一般来说用一个正则替换即可搞定

- 挂载 ossfs 可以参见 [阿里云 ossfs 说明文档](https://help.aliyun.com/document_detail/32196.html)

- `rsync` 同步可以走 SSH 隧道，所以不需要另外开放端口

- 挂载的 ossfs 默认情况下是 `root` 权限，如果直接用 `rsync -a` 进行同步，`rsync` 会尝试将本地文件所有者和组同步到远程，因此会产生权限不足的错误。建议参考这条命令进行同步

```shell
rsync -rlDvz -e "ssh -p ${SERVER_PORT}" --delete public/ root@${SERVER_IP}:/home/ossfs
```


## 优势

这样部署有几个好处：

- 速度快，比单纯的 ECS 小水管快得多，而 ECS 大水管也就 **土豪** 开得起
- 如果直接上传部署到 OSS 上，不经过跳板机 ECS，则无法使用 `rsync` 的差异同步功能，`rsync` 能将目录中发生差异的部分进行同步，从而节省大量同步时间
- 如果直接将域名 CNAME 绑定到 OSS 上，不经过阿里云 CDN 回源加速，**阿里云 OSS 外网流量包** 可是相当贵的，相比之下 **CDN 流量包** 和 **CDN 回源流量包** 加在一起都便宜许多 (好几倍的价格差距)
- 跳板机 ECS 只需要开最便宜的机型就行，但是请 **务必与 OSS Bucket 开在同一个地域**，并且挂载 ossfs 的时候使用 OSS Bucket 的内网地址进行挂载，因为 OSS Bucket 的内网流量是 **免费** 的


## 适用场景

- 博客访问量较高。如果你的博客访问量非常少，用 ECS 小水管就够了
- 域名备案。不要整天为境外主机费心了，备案一下绝对省事 (这也得看地区)
- 纯静态。如果你的博客是动态的，你可能需要将动静态分离进行部署
- 有点儿闲钱。域名 + CDN + OSS + ECS 综合下来一年的费用至少也需要 600 RMB 左右，但是 ECS 作为跳板机，负载相当低，是可以复用的


就回忆这么多了，当然你也可以继续用着境外主机或者薅 github.io 的羊毛。

