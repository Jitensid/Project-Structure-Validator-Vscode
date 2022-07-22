import * as vscode from 'vscode';

/**
 * Function to check if vscode is launched with a folder or not
 * @returns {boolean} - true if vscode is launched with a folder or else return false
 */
const checkIfFolderIsLaunched = (): boolean => {
    // if no workspace folder found then return false
    if (vscode.workspace.workspaceFolders === undefined) {
        return false;
    }
    return true;
};

/**
 * Function that returns the workSpaceFolderPath
 * This function should be called only when `checkIfFolderIsLaunched` function returns true
 * @returns {string} workSpaceFolderPath
 */
const getWorkspaceFolderPath = (): string => {
    const workSpaceFolderPath: string =
        vscode.workspace.workspaceFolders?.[0].uri.fsPath!;

    return workSpaceFolderPath;
};

export { checkIfFolderIsLaunched, getWorkspaceFolderPath };
