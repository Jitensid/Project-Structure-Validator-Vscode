import * as vscode from 'vscode';

interface FileSystemWatcherArrayElement {
    destination: string | string[];
    fileSystemWatcher: vscode.FileSystemWatcher;
    errorMessage: string;
}

export default FileSystemWatcherArrayElement;
