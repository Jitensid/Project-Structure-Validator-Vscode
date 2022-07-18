import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";
import { RULES_FILENAME } from "./constants";

/**
 * Function to read the data present in a file
 * @param {string} filePath - string value of the path of the file
 * @returns {string} file - contents of the file
 */
const loadDataFromRulesFile = (filePath: string): string => {
  // read data of file in string
  const fileContents: string = fs.readFileSync(filePath, "utf-8");

  // parse yaml data as string
  const rulesData: any = YAML.parse(fileContents);

  // return the data extracted from the file
  return rulesData;
};

const setupFileSystemWatcher = (): vscode.FileSystemWatcher => {
  let watcher: vscode.FileSystemWatcher;

  watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      vscode.workspace.workspaceFolders?.[0]!,
      "**/*.{png,jpg,gif,jpeg,mp3,mp4}"
    ),
    false,
    true,
    true
  );

  return watcher;
};

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
 * Function to check if the folder launched with vscode has the required rules file
 * @returns {boolean} - true if rules file is present else return false
 */
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

/**
 * Function to dispose the existing file system watchers
 * @param {vscode.FileSystemWatcher[]} watchers - array of filesystem watchers
 * @returns {vscode.FileSystemWatcher[]} watchers - array of filesystem watchers
 */
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
  loadDataFromRulesFile,
  setupFileSystemWatcher,
  cleanUpExistingFileSystemWatchers,
  checkRulesFilesExistingOrNot,
  checkIfFolderIsLaunched,
};
