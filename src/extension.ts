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
    setupFileSystemWatcher,
} from './utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    // array to store filesystem watchers for different files
    let watchers: vscode.FileSystemWatcher[] = [];

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

            const configValidation: boolean | PromiseLike<any> =
                validateRulesSchema(searchForRulesFileConfigResults[1]?.config);

            if (!configValidation) {
                vscode.window.showErrorMessage(
                    'Syntax does not match the desired Schema'
                );
                return;
            }

            let rules: Rules = JSON.parse(
                JSON.stringify(searchForRulesFileConfigResults[1]?.config)
            );

            generateFileSystemWatcherRules(rules);

            // clean up existing filesystem watchers
            watchers = cleanUpExistingFileSystemWatchers(watchers);

            // append watchers based on existing rules present in rules.yml file
            watchers.push(setupFileSystemWatcher());

            // iterate all filesystem watchers and attach a onChange event
            for (let watcher of watchers) {
                watcher.onDidCreate((event) => {
                    vscode.window.showInformationMessage(event.fsPath);
                });
            }

            vscode.window.showInformationMessage('Worked');
        }
    );

    let a = vscode.commands.registerCommand(
        'project-structure-validator.a',
        () => {
            searchForRulesFileConfig();
        }
    );

    context.subscriptions.push(validateProjectStructure);
    context.subscriptions.push(a);
}

// this method is called when your extension is deactivated
export function deactivate() {}
