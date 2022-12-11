import * as vscode from 'vscode';

class ViolatedFilesTreeProvider implements vscode.TreeDataProvider<any> {
    data: TreeItem[];

    constructor() {
        this.data = [
            new TreeItem('Violated Files', [
                new TreeItem('Ford', [new TreeItem('Fiesta')]),
                new TreeItem('BMW', [new TreeItem('X5')]),
            ]),
        ];
    }

    onDidChangeTreeData?: vscode.Event<any> | undefined;
    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: any): vscode.ProviderResult<any[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
    getParent?(element: any) {
        throw new Error('Method not implemented.');
    }
    resolveTreeItem?(
        item: vscode.TreeItem,
        element: any,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }
}

class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;

    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Expanded
        );
        this.children = children;
    }
}

export default ViolatedFilesTreeProvider;
