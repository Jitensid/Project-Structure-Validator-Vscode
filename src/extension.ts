// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ValidateProjectStructureCommand from './commands/ValidateProjectStructureCommand';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    // vscode.window.showInformationMessage('Extension is Activated');

    // vscode.workspace
    //     .findFiles('**/.structurerc.{json,yaml,yml,js,cjs}')
    //     .then((value) => {
    //         if (value.length > 0) {
    //             vscode.window.showInformationMessage('Found Existing Config');
    //         }
    //     });

    let validateProjectStructure: vscode.Disposable =
        vscode.commands.registerCommand(
            'project-structure-validator.validateProjectStructure',
            () => {
                const validateProjectStructureCommand =
                    new ValidateProjectStructureCommand();
                validateProjectStructureCommand.executeCommand();
            }
        );

    let generateProjectStructureConfigFile: vscode.Disposable =
        vscode.commands.registerCommand(
            'project-structure-validator.generateProjectStructureConfigFile',
            () => {
                vscode.window.showInformationMessage(
                    'Config File Generator Command is Executed'
                );
            }
        );

    context.subscriptions.push(validateProjectStructure);
    context.subscriptions.push(generateProjectStructureConfigFile);
}

// this method is called when your extension is deactivated
export function deactivate() {}
