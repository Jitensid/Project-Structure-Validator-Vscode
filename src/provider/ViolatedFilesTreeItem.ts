import * as vscode from 'vscode';

class ViolatedFilesTreeItem extends vscode.TreeItem {
    // to store the child nodes
    children: ViolatedFilesTreeItem[];

    constructor(
        label: string | vscode.TreeItemLabel,
        children: ViolatedFilesTreeItem[] = []
    ) {
        super(
            label,
            children.length === 0
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Expanded
        );
        this.children = children;
    }
}

export default ViolatedFilesTreeItem;
