// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { CosmiconfigResult } from 'cosmiconfig/dist/types';
import * as vscode from 'vscode';
import { messages } from './constants/constants';
import FileSystemWatcherArray from './interfaces/FileSystemWatcherArray';
import Rules from './interfaces/RulesInterface';
import searchForRulesFileConfig from './rulesFileConfig/rulesFileConfigUtils';
import { validateRulesSchema } from './schema/RulesSchema';
import {
    checkIfFolderIsLaunched,
    disposeExistingFileSystemWatchersFromFileSystemWatcherArray,
    generateFileSystemWatcherRules,
} from './utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    // array to store filesystem watcher elements
    let fileSystemWatcherArray: FileSystemWatcherArray = {
        fileSystemWatchers: [],
    };

    let validateProjectStructure = vscode.commands.registerCommand(
        'project-structure-validator.validateProjectStructure',
        () => {
            // if vscode is not launched with a folder then raise an error message
            if (!checkIfFolderIsLaunched()) {
                vscode.window.showErrorMessage(messages.folderNotLaunched);
                return;
            }

            // error status and config after searching and parsing of config
            const searchForRulesFileConfigResults: [
                boolean,
                CosmiconfigResult
            ] = searchForRulesFileConfig();

            // if some error then terminate further execution of the command
            if (searchForRulesFileConfigResults[0]) {
                return;
            }

            // validate if the rules parsed from the config follow the desired schema
            const configValidation: boolean | PromiseLike<any> =
                validateRulesSchema(searchForRulesFileConfigResults[1]?.config);

            // if invalid then terminate command execution and display an error message to the user
            if (!configValidation) {
                vscode.window.showErrorMessage(
                    'Syntax does not match the desired Schema'
                );
                return;
            }

            let rules: Rules = searchForRulesFileConfigResults[1]?.config;

            // clean up existing filesystem watchers
            fileSystemWatcherArray =
                disposeExistingFileSystemWatchersFromFileSystemWatcherArray(
                    fileSystemWatcherArray
                );

            console.log({ fileSystemWatcherArray });

            // create appropriate fileSystem watchers rules and their destinations based on the rules given by the user
            fileSystemWatcherArray = generateFileSystemWatcherRules(rules);

            fileSystemWatcherArray.fileSystemWatchers.map(
                (fileSystemWatcherArrayElement) => {
                    fileSystemWatcherArrayElement.fileSystemWatcher.onDidCreate(
                        (event) => {
                            const watchedFilePath: string = event.fsPath;

                            const watchedFilePathSplit: string[] =
                                watchedFilePath.split('\\');

                            if (
                                watchedFilePathSplit[
                                    watchedFilePathSplit.length - 2
                                ] !== fileSystemWatcherArrayElement.destination
                            ) {
                                vscode.window.showErrorMessage(
                                    fileSystemWatcherArrayElement.errorMessage
                                );
                            }
                        }
                    );
                }
            );

            vscode.window.showInformationMessage('Worked');
        }
    );

    context.subscriptions.push(validateProjectStructure);
}

// this method is called when your extension is deactivated
export function deactivate() {}
