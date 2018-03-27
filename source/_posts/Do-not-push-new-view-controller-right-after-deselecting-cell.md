---
title: 不要在取消 Cell 的选中状态以后马上 push 一个 ViewController 出来 
date: 2018-02-22 18:11:39
tags: [iOS, Bugs]
---

```objectivec
// Bug: 一只手指按住一个 Cell，另一只手指连续点击其它 Cell 2 次以上，会造成 tableView:didSelectRowAtIndexPath: 被连续触发多次

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    ...
    [self.navigationController pushViewController:vc animated:YES];
}

// Modify it!

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.tableView deselectRowAtIndexPath:[self.tableView indexPathForSelectedRow] animated:NO];
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    // [tableView deselectRowAtIndexPath:indexPath animated:YES];
    ...
    [self.navigationController pushViewController:vc animated:YES];
}

- (nullable NSIndexPath *)tableView:(UITableView *)tableView willSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    NSIndexPath *selectedPath = [tableView indexPathForSelectedRow];
    if (selectedPath) {
        return nil;
    }
    return indexPath;
} 
```
