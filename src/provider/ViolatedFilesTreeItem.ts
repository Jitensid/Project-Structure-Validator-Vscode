import * as vscode from 'vscode';

class ViolatedFilesTreeItem extends vscode.TreeItem {
    // to store the child nodes
    children: ViolatedFilesTreeItem[];

    // store the filePath
    readonly filePath: string | undefined;

    constructor(
        readonly label: string,
        readonly isRoot: boolean = true,
        filePath: string | undefined = undefined,
        children: ViolatedFilesTreeItem[] = []
    ) {
        super(
            label,
            children.length === 0
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Expanded
        );
        this.children = children;
        this.tooltip = 'SAMPLE ERROR MESSAGE';

        // set the icons and resource URI for non root nodes only
        // root node will always be with the label `Violated Files` in the TreeView
        if (!isRoot) {
            this.iconPath = vscode.ThemeIcon.File;
            this.resourceUri = vscode.Uri.file(label);
            this.description = vscode.workspace.asRelativePath(filePath!);
            this.filePath = filePath;
        }
    }
}

export default ViolatedFilesTreeItem;
