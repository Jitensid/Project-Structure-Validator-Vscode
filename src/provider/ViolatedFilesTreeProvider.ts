import * as vscode from 'vscode';
import * as path from 'path';
import ViolatedFilesTreeItem from './ViolatedFilesTreeItem';

class ViolatedFilesTreeProvider
    implements vscode.TreeDataProvider<ViolatedFilesTreeItem>
{
    // define the root node
    private rootViolatedFilesTreeItem: ViolatedFilesTreeItem =
        new ViolatedFilesTreeItem('Violated Files');

    private _onDidChangeTreeData: vscode.EventEmitter<
        ViolatedFilesTreeItem | undefined | null | void
    > = new vscode.EventEmitter<
        ViolatedFilesTreeItem | undefined | null | void
    >();

    readonly onDidChangeTreeData: vscode.Event<
        ViolatedFilesTreeItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    /**
     * Function to add a tree node in the TreeView
     * @param {fileFsPath} string - fsPath of the file for which node is created in the treeView
     */
    public addViolatedFilesTreeItem(fileFsPath: string): void {
        const newViolatedFilesTreeItem = new ViolatedFilesTreeItem(
            path.basename(fileFsPath),
            false,
            fileFsPath
        );

        newViolatedFilesTreeItem.command = {
            title: path.basename(fileFsPath),
            command: 'vscode.open',
            arguments: [fileFsPath],
        };

        this.rootViolatedFilesTreeItem.children.push(newViolatedFilesTreeItem);

        this._onDidChangeTreeData.fire();
    }

    public removeViolatedFilesTreeItem(): void {
        this.rootViolatedFilesTreeItem.children.pop();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(
        element: ViolatedFilesTreeItem
    ): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(
        element?: ViolatedFilesTreeItem | undefined
    ): vscode.ProviderResult<ViolatedFilesTreeItem[]> {
        if (!element) {
            if (this.rootViolatedFilesTreeItem.children.length !== 0) {
                // expand the root node now since it has some child nodes
                this.rootViolatedFilesTreeItem.collapsibleState =
                    vscode.TreeItemCollapsibleState.Expanded;
            }

            return [this.rootViolatedFilesTreeItem];
        }

        return element.children;
    }
}

export default ViolatedFilesTreeProvider;
