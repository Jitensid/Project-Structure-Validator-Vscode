// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import betterAjvErrors from "better-ajv-errors";
import * as path from "path";
import * as vscode from "vscode";
import { messages, RULES_FILENAME } from "./constants";
import { rulesSchema, validateRulesSchema } from "./schema/RulesSchema";
import {
  checkIfFolderIsLaunched,
  checkRulesFilesExistingOrNot,
  cleanUpExistingFileSystemWatchers,
  loadDataFromRulesFile,
  setupFileSystemWatcher,
} from "./utils";

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
    "project-structure-validator.validateProjectStructure",
    () => {
      // if vscode is not launched with a folder then raise an error message
      if (!checkIfFolderIsLaunched()) {
        vscode.window.showErrorMessage(messages.folderNotLaunched);
        return;
      }

      // if rules file is absent in the folder then raise an error message
      if (!checkRulesFilesExistingOrNot()) {
        vscode.window.showErrorMessage(messages.rulesFileMissing);
        return;
      }

      // path to the rules file present in the folder
      const rulesFilePath = path.join(
        vscode.workspace.workspaceFolders?.[0].uri.fsPath!,
        RULES_FILENAME
      );

      // extract the rulesData from the rules file present in the directory
      const rulesData: any = loadDataFromRulesFile(rulesFilePath);

      // evaluate the RulesSchema present in the rules file given by the user
      const valid = validateRulesSchema(rulesData);

      // if RulesSchema validation fails
      if (!valid) {
        const output = betterAjvErrors(
          rulesSchema,
          rulesData,
          validateRulesSchema.errors!,
          { format: "js" }
        );

        // display appropriate error message if there is a syntax error
        // present in the rules file
        vscode.window.showErrorMessage(messages.rulesFilesHasSyntaxError);

        return;
      }

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

      vscode.window.showInformationMessage("Worked");
    }
  );

  let a = vscode.commands.registerCommand(
    "project-structure-validator.a",
    () => {}
  );

  context.subscriptions.push(validateProjectStructure);
  context.subscriptions.push(a);
}

// this method is called when your extension is deactivated
export function deactivate() {}
