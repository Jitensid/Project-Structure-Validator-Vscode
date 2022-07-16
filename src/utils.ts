import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { RULES_FILENAME } from './constants';

const readFile = (filePath: string) => {
	const file = fs.readFileSync(filePath, 'utf-8');
	return file;
};

const setupFileSystemWatcher = (programmingLanguage: string) => {
	let watcher: any = null;

	if (programmingLanguage === 'Python') {
		watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(
				vscode.workspace.workspaceFolders?.[0]!,
				'**/*.py'
			),
			false,
			true,
			true
		);
	} else if (programmingLanguage === 'Javascript') {
		watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(
				vscode.workspace.workspaceFolders?.[0]!,
				'**/*.js'
			),
			false,
			true,
			true
		);
	}

	return watcher;
};

// function to check if vscode is launched with a folder or not
const checkIfFolderIsLaunched = (): boolean => {
	// if no workspace folder found then return false
	if (vscode.workspace.workspaceFolders === undefined) {
		return false;
	}
	return true;
};

// function to check if the folder launched with vscode has the required rules file
const checkRulesFilesExistingOrNot = (): boolean => {
	// set the path og the file containing rules to check if it exists
	const rulesFilePath = path.join(
		vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath!,
		RULES_FILENAME
	);

	// return true if present 
	if (fs.existsSync(rulesFilePath)) {
		return true;
	}

	return false;
};

// function to dispose the existing file system watchers
const cleanUpExistingFileSystemWatchers = (
	watchers: vscode.FileSystemWatcher[]
): vscode.FileSystemWatcher[] => {
	//  dispose previously existing FileSystemWatcher
	for (let watcher of watchers) {
		watcher.dispose();
	}

	// remove all the elements from the watchers array
	watchers.splice(0);

	return watchers;
};

export {
	readFile,
	setupFileSystemWatcher,
	cleanUpExistingFileSystemWatchers,
	checkRulesFilesExistingOrNot,
	checkIfFolderIsLaunched
};
