// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { CosmiconfigResult } from 'cosmiconfig/dist/types';
import * as vscode from 'vscode';
import { messages } from './constants/constants';
import Rules from './interfaces/RulesInterface';
import searchForRulesFileConfig from './rulesFileConfig/rulesFileConfigUtils';
import { validateRulesSchema } from './schema/RulesSchema';
import {
    checkIfFolderIsLaunched,
    cleanUpExistingFileSystemWatchers,
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

    // array to store filesystem watchers and their destinations
    let watchersAndDestinations: [vscode.FileSystemWatcher, string][] = [];

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
            watchersAndDestinations = cleanUpExistingFileSystemWatchers(
                watchersAndDestinations
            );

            // create appropriate fileSystem watchers rules and their destinations based on the rules given by the user
            watchersAndDestinations = generateFileSystemWatcherRules(rules);

            // iterate all watchersAndDestinations
            watchersAndDestinations.map(([watcher, destination]) => {
                // when a file of specific regex is created then following
                // function gets executed
                watcher.onDidCreate((event) => {
                    const watchedFilePath: string = event.fsPath;

                    const watchedFilePathSplit: string[] =
                        watchedFilePath.split('\\');

                    if (
                        watchedFilePathSplit[
                            watchedFilePathSplit.length - 2
                        ] !== destination
                    ) {
                        vscode.window.showErrorMessage('Rule Violated');
                    }
                });
            });

            vscode.window.showInformationMessage('Worked');
        }
    );

    let a = vscode.commands.registerCommand(
        'project-structure-validator.a',
        () => {}
    );

    context.subscriptions.push(validateProjectStructure);
    context.subscriptions.push(a);
}

// this method is called when your extension is deactivated
export function deactivate() {}
