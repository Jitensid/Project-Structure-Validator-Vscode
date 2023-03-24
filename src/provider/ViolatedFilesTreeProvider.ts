import * as vscode from 'vscode';
import ViolatedFilesTreeItem from './ViolatedFilesTreeItem';

class ViolatedFilesTreeProvider
    implements vscode.TreeDataProvider<ViolatedFilesTreeItem>
{
    rootViolatedFilesTreeItem: ViolatedFilesTreeItem | undefined;

    setRootViolatedFilesTreeItem(
        violatedFilesTreeItem: ViolatedFilesTreeItem
    ): void {
        this.rootViolatedFilesTreeItem = violatedFilesTreeItem;
    }

    getRootViolatedFilesTreeItem(): ViolatedFilesTreeItem | undefined {
        return this.rootViolatedFilesTreeItem;
    }

    private _onDidChangeTreeData: vscode.EventEmitter<
        ViolatedFilesTreeItem | undefined | null | void
    > = new vscode.EventEmitter<
        ViolatedFilesTreeItem | undefined | null | void
    >();

    readonly onDidChangeTreeData: vscode.Event<
        ViolatedFilesTreeItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public addViolatedFilesTreeItem(): void {
        console.log('Inside the method');

        const x = new ViolatedFilesTreeItem('New Node');
        this.getRootViolatedFilesTreeItem()!.children.push(x);
        this.refresh();

        console.log('Outside the method');
    }

    getTreeItem(
        element: ViolatedFilesTreeItem
    ): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(
        element?: ViolatedFilesTreeItem | undefined
    ): vscode.ProviderResult<ViolatedFilesTreeItem[]> {
        const rootViolatedFilesTreeItem = new ViolatedFilesTreeItem(
            'Violated Files'
        );

        this.setRootViolatedFilesTreeItem(rootViolatedFilesTreeItem);

        if (!element) {
            return [rootViolatedFilesTreeItem];
        }
        return element.children;
    }
}

export default ViolatedFilesTreeProvider;
