import * as vscode from 'vscode';

class ViolatedFilesTreeItem extends vscode.TreeItem {
    // to store the child nodes
    children: ViolatedFilesTreeItem[];

    constructor(
        readonly label: string,
        isRoot: boolean = true,
        children: ViolatedFilesTreeItem[] = []
    ) {
        super(
            label,
            children.length === 0
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Expanded
        );
        this.children = children;
        this.tooltip = 'ERROR MESSAGE TO BE SHOWN TO THE END USER';

        // set the icons and resource URI for non root nodes only
        if (!isRoot) {
            this.iconPath = vscode.ThemeIcon.File;
            this.resourceUri = vscode.Uri.file(label);
        }
    }
}

export default ViolatedFilesTreeItem;
