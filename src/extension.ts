// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ValidateProjectStructureCommand from './commands/ValidateProjectStructureCommand';
import GenerateProjectStructureConfigFile from './commands/GenerateProjectStructureConfigFile';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    const validateProjectStructureCommand: ValidateProjectStructureCommand =
        new ValidateProjectStructureCommand();

    const generateProjectStructureConfigFileCommand: GenerateProjectStructureConfigFile =
        new GenerateProjectStructureConfigFile();

    // if existing project structure config is found then
    // when the extension is activated it would be loaded
    vscode.workspace
        .findFiles('**/.structurerc.{json,yaml,yml,js,cjs}')
        .then((value) => {
            if (value.length > 0) {
                vscode.window.showInformationMessage(
                    'Loaded Existing Project Structure Configuration'
                );

                validateProjectStructureCommand.executeCommand();
            }
        });

    let validateProjectStructure: vscode.Disposable =
        vscode.commands.registerCommand(
            'project-structure-validator.validateProjectStructure',
            () => {
                validateProjectStructureCommand.executeCommand();
            }
        );

    let generateProjectStructureConfigFile: vscode.Disposable =
        vscode.commands.registerCommand(
            'project-structure-validator.generateProjectStructureConfigFile',
            () => {
                generateProjectStructureConfigFileCommand.executeCommand(
                    context
                );
            }
        );

    context.subscriptions.push(validateProjectStructure);
    context.subscriptions.push(generateProjectStructureConfigFile);
}

// this method is called when your extension is deactivated
export function deactivate() {}
