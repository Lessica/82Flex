---
title: 基于底层 NAND 映像的 iOS 数据恢复
categories: 安全
tags: [论文,翻译,数字取证]
date: 2016-05-17 17:09:00
---

**译者注：本文有原作者撰写的中文版本。**
**翻译水平有限，如有问题欢迎指出，谢谢。**

<h1>基于底层 NAND 映像的 iOS 数据恢复</h1>

<hr />

<p><strong>上海交通大学 Wei-dong Qiu, Qian Su, 与 Bo-zhong Liu </strong></p>

<p><strong>中华人民共和国司法部 数字取证研究所 Yan Li </strong></p>

<p><strong>翻译 i_82 &lt;i.82@me.com&gt;</strong></p>

<hr />

<blockquote>
<p>为了从 iOS 设备上恢复被移除的数据，专家们需要首先解开密码，然后直接从底层 NAND 映像中解压数据映像，并分析其文件转换层 (FTL) 行为所造成的冗余。</p>
</blockquote>

<h2>引言</h2>

<p>90年代末起，移动设备已经成为数字取证的重要来源，哪怕是在非信息犯罪(1)当中。每当法律纠纷 (legal disputes) 发生时，法庭经常会安排专家代表调查案件所涉及到的智能手机，并且鉴定被揭露 (unveiled) 信息的真实与可靠性 (authenticity)。这些设备上挖掘出的数据文件对于解决法律纠纷、留存可靠证据(2)都是十分重要的。但是，由于 (owing to) 手机平台的多样性差异，移动设备上的数字取证技术还没有传统的计算机取证技术先进(3)。在这篇文章中，我们主要关注 iOS 设备 (包括 iPhone，iPad，iPod Touch) 上的存储组织方式 (storage organization) 和加密方案 (encryption scheme)，并讨论它们在 iOS 数据恢复中的启示 (implications)。</p>

<p>每一台 iOS 设备都采用了一块 NAND 闪存芯片作为它的主要记忆体。NAND/NOR 闪存芯片因其卓越的性能与合理的价格，广泛用于各类移动设备，USB 闪存驱动器和固态硬盘 (SSD) 中。但是，由于 FTL 的差异，iOS 设备上的数字取证分析与 SSD 上的有所不同；这样，两者应该被区别对待。</p>

<p>与传统的硬盘驱动器不同，数据块从闪存驱动器中被抹除后，它留下的物理痕迹 (physical trace) 是非常少的。文件转换层所造成的数据冗余是数字取证恢复 (forensic recovery) 的唯一可信来源 (promising source)，但是不定时的 (untimely) “垃圾回收机制 (garbage collection)” 可能会导致这些证据被破坏。当今，研究者们普遍关注 SSD FTL 的机制，利用 FTL 中这样的冗余进行数据恢复；但是对于移动设备，类似这样的讨论是非常稀少的。特定的 FTL 策略将会影响读写速率，预计寿命，能源消耗与预期数据回复率，而 FTL 策略又依赖于闪存控制器的垃圾回收策略。不幸的是，很少有研究关注于 iOS 设备的垃圾回收策略。</p>

<p>此外，执法人员 (law enforcement officials) 对 iOS 设备加密为数字取证带来的障碍表现出关注，例如，他们没有恢复 iOS 设备中被删除录音的能力。但是，近期的调查表明绝大多数的用户会使用 iOS 默认的简单密码 (4位数字)，从而使数据恢复变得更容易。</p>

<p>在这篇文章中，我们展示了一种采用联机暴力破解的技术来破解 iOS 设备的密码，取回被解密的 NAND 映像，并且尝试通过分析 FTL 的数据冗余来恢复数据。我们也会分析 iOS 的数据回收机制，以及这种机制对于我们数据恢复方法的影响。</p>

<h2>iOS 数据加密</h2>

<p>自从 2009 年 6 月 iOS 3.0 的发布以来，iOS 已经发展出了一套全面的安全机制，包括全磁盘加密和快速磁盘抹除。iOS 4.x 介绍了许多新技术。设置这些安全装置的目的是防范数据截取和非法攻击者，但是同样为合法的数字取证工作带来了麻烦。而数据恢复必须先规避 iOS 的数据加密机制。</p>

<p>由于 iOS 5.x 的安全方案与 4.x 中所采用的十分相近，我们将着重关注 iOS 4.x (译者注：这篇文章发表于 2013 年)。破解了密码以后，我们能够解密 NAND 数据转储 (data dump) 并实施数据恢复。</p>

<h3>暴力破解简单密码</h3>

<p>无论是从用户角度还是从数字取证分析者的角度看，密码在 iOS 安全中扮演了极为重要的角色。有了密码 (passcode)，分析者能够通过密钥推导函数 (key-derivation function) 来计算出密钥 (passcode key)。密钥则能够解密 “类密钥 (class keys)”，它能够用来解锁文件系统以及其它的敏感钥匙串。因此，没有密码，数字取证是不可能的。</p>

<p>这同样反映出，这种暴力破解攻击手段会比它们想象当中更加困难。密钥推导函数中，需要一串与设备关联的密钥，我们把它称之为 UID key，它内建于安全芯片上的 AES (Advanced Encryption Standard) 加密引擎中，并且不会直接暴露给软件层。因此 (Hence)，现有的可行技术并不能解压出设备当中的 UID key，进行脱机的暴力破解攻击是不切实际的 (impractical)。但是，联机的攻击手段却是可行的。通过在设备固件升级 (Device firmware upgrade, DFU) 模式下运行一个特别设计的暴力破解程序，我们能够破解出多达6位的数字密码。请注意，只有这个密钥推导函数需要在设备上运行，一旦包含类密钥的密钥包被解锁，剩余的分析工作便可以离线完成。</p>

<p>表格1显示了在 iPhone 4 上暴力破解一个密码的预估时间。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160514-0.png"/></figure>

<h3>iOS 密钥管理</h3>

<p>iOS 采用了一套复杂的密码管理方案，保证了数据在不需要时是不可访问的。这套方案根据数据在不同时间的需求，区分出 (category into) 了不同的类别，并采用独立的类密钥来保证不同层级的访问控制。举个例子，储存在 <em>NSFileProtectionComplete</em> 类中的文件将会在用户锁屏后不久被锁定，而 <em>NSFileProtectionCompleteUnlessOpen</em> 类则允许被打开的文件在锁屏之后仍然可以访问。由密码推导出的密钥，加密了这些储存在密钥包 systembag.kb 中的类密钥。而这个密钥包文件的内容经过了两次加密，第一次被储存在 <em>AppleEffaceableStroage</em> 中的 BAG1 密钥所加密，第二次被原始文件密钥所加密。 <em>AppleEffaceableStroage</em> 在数据清理的时候会被完全移除，在那之后密钥包将无法被解锁。</p>

<h3>iOS 磁盘加密方案</h3>

<p>出于数据恢复的目的，我们先从 <em>NSFileProtectionComplete</em> 类密钥开始。大多数的第三方应用程序以及内建的邮件应用都归属于这一类。每一个文件数据副本 (file data fork) 都被分配了一串随机文件密钥，而这个密钥被 <em>NSFileProtectionComplete</em> 类密钥加密并存储于一个扩展文件属性 extended file attribute) com.apple.system.cprotect。加密算法为 CBC (Cipher block chaining) 模式的 AES，初始向量 (initialization vector) 是由逻辑块号 (logic block number) 计算出来的。</p>

<h3>基于 NAND 映像的 iOS 数据恢复</h3>

<p>NAND 闪存记忆体芯片是专为块写入 (block-write) 和块擦除 (block-erase) 操作设计的。只有当目标数据块被完全擦除后，新的数据才能被写入进去。从逻辑上来说，数据以页为单位进行分配，但是从物理上来说，数据操作是以块为单位进行操作的。因此，在物理层，完全擦除一个比特的唯一方式，是擦除存储了这个比特的一整个数据块。图1展示了一台 16G iPhone 4 的 NAND 的结构。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160515-0.png"/></figure>

<p>存储了附加元数据 (metadata) 的空闲区域包含了对应着逻辑页号 (logical page number, LPN) 和更新序列号 (update sequence number, USN) 的物理页。USN 全局性 (globally) 的增长表明着一个块的近况 (recency)。</p>

<p>为了隐藏对于特定 NAND 闪存记忆体对上层文件系统的实现细节，写入和读取操作必须通过 FTL 来进行。而 FTL 运用了图2的一些转换方法来定位物理区块。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160515-1.png"/></figure>

<p>需要更新数据时，存储系统会向一个新的闪存记忆块写入一份更新数据的副本，重新调配逻辑地址，指向新的数据块；并且使储存着已过期数据 (outdated data) 的原始数据块 (original block) 保持原状；而 FTL 会在其空闲的时间段擦除这些原始数据块。</p>

<p>这意味着，在绝大多数情况下，数据被逻辑删除时，并不会立即从物理层面抹除这些数据。从数字取证的角度，这为数据恢复提供了一些价值。</p>

<p>YaFTL (yet another flash translation layer) 借助称作 <em>super blocks</em> 的分配单元组织数据。每一个 <em>super block</em> 都包含了 FTL 上下文块，索引块和用户数据块。每一个存满的用户数据块的最后几个字节 (精确的数量在不同的设备模型和块分配方案下会有所不同) 由内容块表 (block table of contents, BTOC) 所构成 (comprise)，BTOC 记录了 <em>super block</em> 中每一页的 LPN，在非正常关机的情况下，它能够帮助存储系统进行数据完整性的检查。BTOC 加快了搜寻被删除数据的速度，但是如果用户数据块没有被写满时，是没有 BTOC 的。</p>

<h3>为 NAND 映像设计的数据恢复算法</h3>

<p>为了定位需要被恢复数据的实际物理页的存储位置，我们需要寻找每一个逻辑页所对应的物理页，并且整理出这种映射关系。一个逻辑页可能有多个对应的物理页，因为有些物理页可能会包含数据的过期版本。为了寻找到这些页，我们需要遍历所有的用户数据块。如果有 BTOC —— 意味着这个块已经被用尽 —— 我们遍历它以获取这个块中每一个物理页的 LPN；如果没有 BTOC，意味着这个块还没有被用尽，我们遍历这个块中的每一个物理页，并读取空闲区域中元数据的 LPN 字段。通过这种方法，我们能够获得物理页和逻辑页之间完整的映射关系。接下来，我们能够运用惯用的 HFS+ 文件系统数据恢复技术进行进一步的分析。</p>

<p>接着，我们先获取目录和属性文件 (catalog and attribute file) 的逻辑地址，然后从编录文件的被删除文件表中取回编录节点ID (catalog node ID, CNID)。通过寻找、对比所有物理页中的对应版本，分析这些物理页中多个版本的数据，寻找在最新的编录文件中缺失的 CNID。与这些 CNID 相符的文件记录就是我们需要寻找的被删除文件记录。</p>

<p>最后，采用之前我们从编录文件中筛选出的文件记录，我们能够恢复文件记录的数据块。这些数据库以链表方式组织，每一个数据块包含着指向下一个数据块的指针。为了恢复所有的数据块，我们只需要寻找到文件记录中第一个数据库的地址，然后迭代遍历链表，直到读出整个文件。</p>

<h3>数据恢复实例</h3>

<p>为了测试我们的数据恢复方法，我们选用了一台 iPhone 4 进行实验，其参数如表2所示。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160515-2.png"/></figure>

<p>我们的方法对于运行着 iOS 4.x 和 iOS 5.x 的 iOS 设备都是有效的；但是更新的 iOS 6.x 还不支持。我们在运行着 iOS 4.x 和 iOS 5.x 的 iPhone 4 上反复进行了测试，但由于缺少测试设备，我们没能在 iPhone 5 上进行此项测试。需要注意的是，越狱在数据恢复中不是必须的。</p>

<h4>在物理和逻辑页之间建立映射关系</h4>

<p>通过读取每个物理页的逻辑页号，我们在物理和逻辑页直接建立了映射关系。图3展现 (demonstrate) 了两个对应着同一个逻辑页的不同的物理页 (页内容已经被解密)。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160515-3.png"/></figure>

<p>两个物理页之间的数据有所不同 —— 老的物理页包含了同一逻辑地址上数据的先前版本，这正是数据恢复所需要的。</p>

<h4>定位被删除的文件</h4>

<p>我们在编录文件中发现了页 164,738。在这页的早期版本中，图片 IMG_0212.JPG 和 IMG_0214.JPG 被删除了。我们从编录文件的早期版本中也同样找到了这些被删除的文件记录。图4展现了 IMG_0214.JPG 的重要属性。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160515-4.png"/></figure>

<p>我们从 HFS 时间戳 (HFS timestamp, 又称作 HFS Time 或 Apple Time) 中推导并计算出了这张图片的创建时间，计算方法如下：</p>

<pre><code>CB 73 CB D5 = 3413363669;
1904-01-01 00:00:00 + 3413363669 seconds = 2012-02-29 12:34:29 (GMT) 
</code></pre>

<p>根据起始块地址和文件长度，我们定位到了文件的起始地址，如图5所示。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160515-5.png"/></figure>

<p>JPG 文件的 EXIF 标签表明这张照片是 29 February 2012, at 20:34:29 拍摄的，与我们从文件系统中得到的信息完全一致。我们从元数据中修复了整个文件，并且成功地恢复出了 IMG_0214.JPG。</p>

<h3>垃圾回收策略</h3>

<p>向 FTL 添加垃圾回收机制 (mechanism) 有助于清除无效的内容，并使得闪存驱动器为新的内容作好准备。这个过程包括，选中已过期内容所在的数据块，拷贝该数据块中的有效页到新数据块，将合适的数据块标记为无效，抹除无效数据块中的所有数据。但是，这些操作会显著降低系统性能，并造成写入放大效应 (write amplification, <a href="https://en.wikipedia.org/wiki/Write_amplification" title="写入放大">写入放大在维基百科上的解释</a>)。FTL 应该控制垃圾回收率与读写效率之间的平衡。</p>

<p>在闪存控制器执行垃圾回收过程之前，闪存中已过期的数据在物理层面上仍然存在，并且仍可能被完全恢复。因此，垃圾回收的策略决定了数据恢复的结果。两个知名的策略，TRIM 和空闲时间垃圾回收 (idle time garbage collection, ITGC)，被许多 SSD 所采用，并且对数据回复的结果有着关键性的影响。</p>

<p>即使在高负载 (heavy load) 的情况下，TRIM 仍然能够保证极高的效率。这项技术之所以能被新推出的 SSD 广泛接受，是因为它能够使得高层次的文件系统积极回收过期数据，预先抹除它们以供后续使用。TRIM 对于数字取证却是一种阻碍 —— 在 TRIM 开启的情况下，收集已过期数据的一个未分配页的成功率会降低超过 80%。</p>

<p>ITGC，以后台垃圾回收 (background garbage collection) 而知名。ITGC 能够在没有文件系统参与的情况下抹除数据 (erases data without any awareness of the file system)。闪存控制器在它的空闲时段调用 ITGC 过程。ITGC 重新收集有效数据块中分散在周围的有效页，写入到新的数据块中 (ITGC reassembles valid pages shattering around partially valid blocks into new blocks)，擦除旧的数据块以供新内容使用。这导致了比 TRIM 更严重的写入放大效应，所以驱动器的寿命显著缩短 (so devices wear out more quickly)。</p>

<p>ITGC 策略根据制造商而有所不同。有一些制造商，比如 OCZ，仅当驱动器空闲并停止在那里的时候，才会清除数据块的一小部分。但是，企业级的闪存存储器系统，例如 SandForce 和 Violin Memory，会在写入新内容的同步地 (simultaneously) 调用 ITGC 过程。</p>

<p>从数字取证的角度上说 (Forensically)，ITGC 意味着自动销毁证据，使得只读变得比听上去更加困难。ITGC 几乎在通电的瞬间抹除了数据，而不需要文件系统的干扰 (interference)。研究表明，有些 ITGC 过程会在闪存通电 200 秒后开始，并且能够 (be capable of) 在 400 秒内完全抹除一块 64G 的闪存驱动器。</p>

<h3>iOS 数据恢复结果</h3>

<p>我们想要观察 iOS 设备在高负载的情况下垃圾回收的工作情况，这对 iOS 下的数字取证有着关键性的影响。我们采用了配备 16G 闪存存储器的 iPhone 4 进行了几次实验。通过向设备中写入数据，我们测量了它的垃圾回收率 (如图6）。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160517-0.png"/></figure>

<p>iOS 上的垃圾回收策略是被动的 —— 它只在可用空白页数少于数据块总数的 6% 时才开始垃圾回收过程。也就是说，在这台 16G 的 iPhone 4 上，少于 1G 时才开始。没有证据表明 iOS 设备采用了 TRIM 或者 ITGC 策略。这台接受测试的 iPhone 4 是来自一位普通用户，并且使用了将近一年；它的闪存驱动器的页有超过 17% 是空白的。因此，在某些情况下，是有可能恢复曾在这台设备上存在过的所有数据的。</p>

<h4>数据恢复实验</h4>

<p>接着，我们采用了一台 16G 的 iPhone 4 来估算数据恢复率。我们在一台使用了 15 个月的旧 iPhone 上执行了数据恢复过程，删除了 0.7G 的数据，然后再次恢复数据。在写入了另外的 2.6G 数据之后，我们进行了另一次数据恢复分析。最终，为了测试这台 iPhone 4 上是否存在一种类似于 ITGC 的垃圾回收策略，我们将设备闲置了 12 小时，然后进行了第四次数据恢复。表3展示了实验的结果。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160517-1.png"/></figure>

<p>进一步的分析表明，94% 的被恢复文件与它们的原始版本是一致的。</p>

<h4>与 SSD 的比较</h4>

<p>即使 iOS 设备和 SSD 都采用了 NAND 闪存存储器，它们在垃圾回收策略上的不同使得数据恢复的结果大相径庭 (their differing garbage collection strategies result in a gap in data recovery results) —— 举个例子，iOS 设备比普通的 SSD 有着更好的数据回复率。在一次类似的 SSD 数据恢复分析中，我们在一次快速格式化后的 64G Corsair P64 SSD 上执行了数据恢复 (结果见表4)。</p>

<figure><img src="https://82flex.com/usr/static/translation/ios-data-recovery-using-low-level-nand-images/QQ20160517-2.png"/></figure>

<p>事实上，尽管我们在不同情况下进行了这些实验，我们仍然能总结出这样的结果：由于没有采用一种积极的垃圾回收策略，类似于 TRIM 或 ITGC，iOS 设备上的恢复结果显然要比 SSD 上的更好。</p>

<h2>总结</h2>

<p>有了这些策略，iOS 设备上的数据恢复是有希望的 (promising)。相比开启了 TRIM 和 ITGC 的 SSD 而言，iOS 设备上有着更高的数据回复率。因此，这对于数字取证领域有着重要的影响。这项工作也同样对执法过程中，通过数字取证从 iOS 设备上获取证据有所帮助。</p>

<p>将来，我们将扩展对于 iOS 6 的研究，并进一步分析如何在 iOS 上进行数字取证，以帮助执法。</p>

<h2>致谢</h2>

<p>This article was supported in part by New Century Excel- lent Talents in the University of Ministry of Education under grant number NCET-12-0358, the Technology Innovation Research Program, Shanghai Municipal Education Commis- sion under grant number 12ZZ019, and grants from Ministry of Finance, PR China (GY2013G-3 and 2011T-4). </p>

<h2>参考文献</h2>

<ol>
    <li>S.G. Punja, “Mobile Device Analysis,” Small Scale Digital Device Forensics J., vol. 2, no. 1, 2008, pp. 1–16. </li>
    <li>X.-Q. Wang, “How to Discover the Truth in Data,” China Information Security, vol. 11, no. 1, 2009, pp. 23–24. </li>
    <li>R Ahmed, “Mobile Forensics: An Overview, Tools, Future Trends and Challenges from Law Enforcement Perspective,” Proc. 6th Int’l Conf. E-Governance, Emerging Technologies in E-Government, M-Government, 2008, pp. 312–323. </li>
    <li>S. Gar nkel, “ e iPhone Has Passed a Key Secu- rity reshold,” MIT Technology Rev., 13 Aug. 2012; www.technologyreview.com/news/428477/the -iphone-has-passed-a-key-security-threshold. </li>
    <li>“iOS Security,” Apple, 2012; h p://images.apple.com/ ipad/business/docs/iOS<em>Security</em>Oct12.pdf. </li>
    <li>“WinCE 5.0 MLC Solution (PocketMory) Porting Guide,” Samsung Electronics AP Development Team, System LSI, 2011; h p://openembed.googlecode.com/ hg/som2416/wince5/SMDK2416<em>WinCE5.0</em>PM <em>MLC</em>NANDSolution<em>PortingGuide.pdf. 
        </em></li>
    <li>M.-L. Chiao and D.-W. Chang, “ROSE: A Novel Flash Translation Layer for NAND Flash Memory Based on Hybrid Address Translation,” IEEE Trans. Computers, vol. 60, no. 6, 2011, pp. 753–766. </li>
    <li>“YaFTL Introduction,” Sogeti ESEC Lab, 25 June 2012; http://code.google.com/p/iphone-dataprotection/ wiki/YaFTL. </li>
    <li>Y. Kim et al., “Coordinating Garbage Collection for Arrays of Solid-State Drives,” to be published in IEEE Trans. Computers; doi.ieeecomputersociety.org/10.1109/ TC.2012.256. </li>
    <li>K.-H. Jang and T. Hee Han, “E cient Garbage Collec- tion Policy and Block Management Method for NAND Flash Memory,” Proc. 2nd Int’l Conf. Mechanical and Electronics Engineering (ICMEE 10), IEEE, 2010, pp. V1-327–V1-331. </li>
    <li>C. King and T. Vidas, “Empirical Analysis of Solid State Disk Data Retention When Used with Contemporary Operating Systems,” Digital Investigation, vol. 8, 2011, pp. 111–117. </li>
    <li>J.B. Layton, “Anatomy of SSDs,” Linux, 27 Oct. 2009; www.linux-mag.com/id/7590/2. </li>
    <li>G.B. Bell and R. Boddington, “Solid State Drives: e Beginning of the End for Current Practice in Digital Forensic Recovery,” J. Digital Forensics, Security and Law, vol. 5, no. 3, 2010, pp. 1–20. </li>
</ol>

<h2>作者</h2>

<p>Wei-dong Qiu is a professor and head assistant at Shanghai Jiao Tong University’s School of Information Security and Engineering. His research interests include cryptographic theory, network security technology, and computer forensics. Qiu received a PhD in computer so ware theory from Shanghai Jiao Tong University. He’s the editor of Cryptographic Protocols (China Higher Education Press 2009). Contact him at qiuwd@sjtu.edu.cn. </p>

<p>Qian Su is pursuing an MS in computer science at Shanghai Jiao Tong University’s School of Information Security Engineering. Her research interests include computer forensics, data recovery, and iOS device forensics. Contact her at blackjack846@ hotmail.com. </p>

<p>Bo-zhong Liu is a PhD candidate in computer science and cryptography at Shanghai Jiao Tong University. His research interests include cryptanalysis of secure S-boxes and block ciphers and high-performance computing using GPUs. Contact him at liu.bo.zhong@gmail.com. </p>

<p>Yan Li is an assistant research scientist at the Institute of Forensic Science, Ministry of Justice in China. His research interests include digital forensics; forensic authentication of digital audio, video, and images; mobile device forensics; and email forensics. Li received an MS in computer science from Shanghai Jiao Tong University’s School of Information Security and Engineering. Contact him at jobliyan@gmail.com. </p>