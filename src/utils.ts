import * as fs from 'fs';
import * as vscode from 'vscode';
import * as YAML from 'yaml';
import Rules from './interfaces/RulesInterface';
import SingleRule from './interfaces/SingleRuleInterface';

/**
 * Function to read the data present in a file
 * @param {string} filePath - string value of the path of the file
 * @returns {string} file - contents of the file
 */
const loadDataFromRulesFile = (filePath: string): string => {
    // read data of file in string
    const fileContents: string = fs.readFileSync(filePath, 'utf-8');

    // parse yaml data as string
    const rulesData: any = YAML.parse(fileContents);

    // return the data extracted from the file
    return rulesData;
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
 * Function that returns the workSpaceFolderPath
 * This function should be called only when `checkIfFolderIsLaunched` function returns true
 * @returns {string} workSpaceFolderPath
 */
const getWorkspaceFolderPath = (): string => {
    const workSpaceFolderPath: string =
        vscode.workspace.workspaceFolders?.[0].uri.fsPath!;

    return workSpaceFolderPath;
};

/**
 * Function to dispose the existing file system watchers
 * @param {[vscode.FileSystemWatcher, string][]} watchers - array of tuple of filesystem watchers and their desired destinations of the files
 * @returns {[vscode.FileSystemWatcher, string][]} watchers - array of tuple of filesystem watchers and their desired destinations of the files
 */
const cleanUpExistingFileSystemWatchers = (
    watchersAndDestinations: [vscode.FileSystemWatcher, string][]
): [vscode.FileSystemWatcher, string][] => {
    //  dispose previously existing FileSystemWatcher
    for (let [watcher, destination] of watchersAndDestinations) {
        watcher.dispose();
    }

    // remove all the elements from the watchers array
    watchersAndDestinations.splice(0);

    return watchersAndDestinations;
};

/**
 * Function to extract extensions field from the SingleRule and transform it in a meaningful manner
 * @param {SingleRule} rule - SingleRule that is parsed from the config
 * @returns {string} extensionsInDesiredFormat - string value of the desired extensions
 *
 *  @example
 *  if rule.extensions === ['js','ts']
 *  return 'js,ts'
 *
 *  @example
 *  if rule.extensions === 'js'
 *  return 'js'
 *  */
const getExtensionsInDesiredFormat = (rule: SingleRule): string => {
    // extensionsInDesiredFormat extracts the extensions value provided by the user
    // and stores them in the desired manner
    let extensionsInDesiredFormat: string = '';

    // if the user has provided the extensions in array format
    if (Array.isArray(rule.rule.extensions)) {
        // iterate each extension from the array and concat all the values
        // and make them comma separated
        rule.rule.extensions.map((extension) => {
            extensionsInDesiredFormat = extensionsInDesiredFormat.concat(
                `${extension},`
            );
        });

        // remove the last `,` character from the string
        extensionsInDesiredFormat = extensionsInDesiredFormat.slice(0, -1);

        // if string format then take is as provided
    } else if (typeof rule.rule.extensions === 'string') {
        extensionsInDesiredFormat = rule.rule.extensions;
    }

    return extensionsInDesiredFormat;
};

/**
 * Function to extract startsWith field from the SingleRule and transform it in a meaningful manner
 * @param {SingleRule} rule - SingleRule that is parsed from the config
 * @returns {string} startsWithInDesiredFormat - string value of the desired startsWith
 */
const getStartsWithInDesiredFormat = (rule: SingleRule): string => {
    // stores the startsWith field in desired manner
    let startsWithInDesiredFormat: string = '';

    // if user has not provided then keep it empty else assign
    if (rule.rule.startsWith !== undefined) {
        startsWithInDesiredFormat = rule.rule.startsWith;
    }

    return startsWithInDesiredFormat;
};

/**
 * Function to extract endsWith field from the SingleRule and transform it in a meaningful manner
 * @param {SingleRule} rule - SingleRule that is parsed from the config
 * @returns {string} getEndsWithInDesiredFormat - string value of the desired endsWith
 */
const getEndsWithInDesiredFormat = (rule: SingleRule): string => {
    // stores the startsWith field in desired manner
    let getEndsWithInDesiredFormat: string = '';

    // if user has not provided then keep it empty else assign
    if (rule.rule.endsWith !== undefined) {
        getEndsWithInDesiredFormat = rule.rule.endsWith;
    }

    return getEndsWithInDesiredFormat;
};

/**
 * Function to generate the RelativePattern that will be used by fileSystemWatcher to look out for files based on rules provided by the user
 * @param {SingleRule} rule - SingleRule that is parsed from the config
 * @returns {vscode.RelativePattern} relativePatternOfFileSystemWatcher - RelativePattern of the desired FileSystemWatcher
 */
const generateFileSystemWatcherRelativePattern = (rule: SingleRule) => {
    // extract extensions in the desired format
    const extensionsExtractedInDesiredFormat: string =
        getExtensionsInDesiredFormat(rule);

    // extract startsWith in the desired format
    const startsWithExtractedInDesiredFormat: string =
        getStartsWithInDesiredFormat(rule);

    // extract endsWith in the desired format
    const endsWithExtractedInDesiredFormat: string =
        getEndsWithInDesiredFormat(rule);

    // create the regex for the Relative Pattern
    // based on the values of extensions, startsWith, endsWith
    let relativePatternRegex: string = `**/${startsWithExtractedInDesiredFormat}*${endsWithExtractedInDesiredFormat}.{${extensionsExtractedInDesiredFormat}}`;

    // get the path of the folder where vscode is launched
    const workSpaceFolderPath: string = getWorkspaceFolderPath();

    // create the required RelativePattern of vscode
    const relativePatternOfFileSystemWatcher: vscode.RelativePattern =
        new vscode.RelativePattern(workSpaceFolderPath, relativePatternRegex);

    return relativePatternOfFileSystemWatcher;
};

/**
 *
 * Function to generate FileSystemWatcher from the rules provided by the user
 * @param {Rules} rules - array of filesystem watchers
 * @returns {[vscode.FileSystemWatcher, string][]} fileSystemWatchersBasedOnRules - array of filesystem watchers
 */
const generateFileSystemWatcherRules = (rules: Rules) => {
    // array of tuple of fileSystemWatcher and destination
    let fileSystemWatchersBasedOnRules: [vscode.FileSystemWatcher, string][] =
        [];

    // iterate all rules
    for (let rule of rules.rules) {
        // get the RelativePattern needed for creating the required FileSystemWatcher based on user's rule
        const fileSystemWatcherRuleRelativePattern: vscode.RelativePattern =
            generateFileSystemWatcherRelativePattern(rule);

        // create a FileSystemWatcher based on the RelativePattern
        const watcher: vscode.FileSystemWatcher =
            vscode.workspace.createFileSystemWatcher(
                fileSystemWatcherRuleRelativePattern,
                false,
                true,
                true
            );

        // append the fileSystemWatcher along with the destination
        fileSystemWatchersBasedOnRules.push([watcher, rule.rule.destination]);
    }

    return fileSystemWatchersBasedOnRules;
};

export {
    loadDataFromRulesFile,
    cleanUpExistingFileSystemWatchers,
    checkIfFolderIsLaunched,
    generateFileSystemWatcherRules,
    getWorkspaceFolderPath,
};
