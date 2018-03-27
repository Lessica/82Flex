---
title: Gitbook 初探
date: 2018-03-27 11:11:28
tags: [Gitbook]
---


最近把 [XXTouch 知识库](https://github.com/Lessica/XXTouchBook) 用 [Gitbook](https://github.com/GitbookIO/gitbook) 弄出来了。原来的手册系列都是部署在 [作业部落](https://zybuluo.com) 上的，最近服务器一直宕机，他们可能经营不善，所以及时做了迁移。XXT 人手不足，做文档站肯定不能像财大气粗的 **触动精灵** 一样了，乖乖地用上 Gitbook 这个开源的文档方案，最终效果还不错。大致的流程是这样：

* 预处理源作业部落 Markdown 文档 （修正换行符、为章节添加标签）
* 生成源文档章节索引树，分章节建立目录索引并保存章节文件
* 安装并配置 Gitbook 及插件
* 生成静态站点预览，修复一些大的问题
* 将 Gitbook + Nginx (SSL) 部署到服务器上
* 和苏总桃总一起修复一些细节问题

期间用 Python 和 Swift 写了不少分章节、预处理和索引、格式修正的脚本，可以在知识库的 Git 仓库里找到。

在这个过程中，我发现 Gitbook 这个框架在生成多文件 (~200) 书籍的时候，速度格外捉急。就拿 XXTouch 知识库来说，近 400 个 Markdown 文件，处理起来花费了 700 秒左右，在性能较差的机器上居然需要花费 3000 秒。

这跟 Gitbook 的性能设计有很大的关系，首先 Gitbook 是采用 Node.js 单线程链式模型 (+Promise) 工作的，导出 website 的时候对 CPU 的利用率*肥肠*低下；其次 Gitbook 导出 website 的时候，采用了 Firefox 的 [Nunjucks](https://mozilla.github.io/nunjucks/) 模板环境；再者，Gitbook 进行预览的时候，开启了 livereloading 插件进行实时刷新，但是这个实时刷新，是从头将书籍重新构建一遍！


```js
// Mutable objects to contains all blocks requiring post-processing
var blocks = {};

// Create nunjucks environment
var env = engine.toNunjucks(blocks);

// Replace shortcuts from plugin's blocks
content = replaceShortcuts(engine.getBlocks(), filePath, content);

return timing.measure(
    'template.render',
    
    Promise.nfcall(
        env.renderString.bind(env),
        content,
        context,
        {
            path: filePath
        }
    )
    .then(function(content) {
        return TemplateOutput.create(content, blocks);
    })
);
```


这个地方有一个很操蛋的点，Gitbook 无论是**预览**还是**重新构建**，在渲染过程中，对于每一个 Markdown 文件，都使用对应模板创建了一个全新的 Nunjucks 实例，对模板进行渲染。然而在大型书籍编写的过程中，常常我们只修改了若干个文件，并不需要全新从头构建。经过测试，如果注释掉渲染的部分，仅保留预处理、索引等功能，构建过程只需要 30 秒所有。所以这个问题只涉及到了渲染。我认为如果 Gitbook 需要在这方面进行优化，需要做如下几点事情：

* 将构建书籍的单链式调用改成多链式调用，每个 Markdown 文件一条链，派发到多进程或多线程完成，充分利用 CPU 资源以节省构建时间
* 缓存 Markdown 文件的最后修改时间戳或哈希值，对未发生修改的文件只进行索引和预处理，不进行二次渲染
* 缓存同一个主题模板的 Nunjucks 环境对象，渲染时直接使用缓存的模板对象进行渲染（这个最重要）

这也是我接下来一段时间要尝试做的事情。

