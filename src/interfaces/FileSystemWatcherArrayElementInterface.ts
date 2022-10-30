import * as vscode from 'vscode';
import SingleRule from './SingleRuleInterface';

interface FileSystemWatcherArrayElement {
    rule: SingleRule;
    fileSystemWatcher: vscode.FileSystemWatcher;
    errorMessage: string;
}

export default FileSystemWatcherArrayElement;
