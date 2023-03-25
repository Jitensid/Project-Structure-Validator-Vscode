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

        // attach `vscode.open` command to open the file when node is clicked
        newViolatedFilesTreeItem.command = {
            title: path.basename(fileFsPath),
            command: 'vscode.open',
            arguments: [fileFsPath],
        };

        // add the new node as child to the root node
        this.rootViolatedFilesTreeItem.children.push(newViolatedFilesTreeItem);

        // refresh the contents of the TreeView
        this._onDidChangeTreeData.fire();
    }

    public removeViolatedFilesTreeItemIfExists(fileFsPath: string): void {
        // remove the node from the tree whose file path matches with the deleted file path
        const newRootViolatedFilesTreeItemChildren =
            this.rootViolatedFilesTreeItem.children.filter(
                (rootViolatedFilesTreeItemNode) => {
                    rootViolatedFilesTreeItemNode.filePath !== fileFsPath;
                }
            );

        // update the tree only when a file whose node is present in the tree is deleted
        if (
            newRootViolatedFilesTreeItemChildren.length !==
            this.rootViolatedFilesTreeItem.children.length
        ) {
            // update the children of the Root Node in the TreeView
            this.rootViolatedFilesTreeItem.children =
                newRootViolatedFilesTreeItemChildren;
            // refresh the contents of the TreeView
            this._onDidChangeTreeData.fire();
        }
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
