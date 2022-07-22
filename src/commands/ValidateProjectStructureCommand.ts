import * as vscode from 'vscode';
import * as constants from '../constants/constants';
import * as utils from '../utils/utils';
import searchForRulesFileConfig from '../rulesFileConfig/rulesFileConfigUtils';
import { CosmiconfigResult } from 'cosmiconfig/dist/types';
import { validateRulesSchema } from '../schema/RulesSchema';
import SingleRule from '../interfaces/SingleRuleInterface';
import Rules from '../interfaces/RulesInterface';
import FileSystemWatcherArray from '../interfaces/FileSystemWatcherArrayInterface';
import FileSystemWatcherArrayElement from '../interfaces/FileSystemWatcherArrayElementInterface';

class ValidateProjectStructureCommand {
    // array to store filesystem watcher elements
    private fileSystemWatcherArray: FileSystemWatcherArray;

    constructor() {
        // initialize the fileSystemWatcherArray with fileSystemWatchers property as empty array
        this.fileSystemWatcherArray = { fileSystemWatchers: [] };
    }

    // main method of the command
    public executeCommand(): void {
        // if vscode is not launched with a folder then raise an error message
        if (!utils.checkIfFolderIsLaunched()) {
            vscode.window.showErrorMessage(
                constants.messages.folderNotLaunched
            );
            return;
        }

        // error status and config after searching and parsing of config
        const searchForRulesFileConfigResults: [boolean, CosmiconfigResult] =
            searchForRulesFileConfig();

        // if some error in config then terminate further execution of the command
        if (searchForRulesFileConfigResults[0]) {
            return;
        }

        // validate if the rules parsed from the config follow the desired schema
        const configValidation: boolean | PromiseLike<any> =
            validateRulesSchema(searchForRulesFileConfigResults[1]?.config);

        // if invalid then terminate command execution and display an error message to the user
        if (!configValidation) {
            vscode.window.showErrorMessage(
                constants.messages.doesNotFollowSchemaError
            );
            return;
        }

        // get the rules from config object
        const rules: Rules = searchForRulesFileConfigResults[1]?.config;

        // clean up existing filesystem watchers
        this.fileSystemWatcherArray =
            this.disposeExistingFileSystemWatchersFromFileSystemWatcherArray(
                this.fileSystemWatcherArray
            );

        // create appropriate fileSystem watchers rules and their destinations based on the rules given by the user
        this.fileSystemWatcherArray =
            this.generateFileSystemWatcherRules(rules);

        // attach file creation events based on rules provided by the user
        this.fileSystemWatcherArray = this.attachFileCreationEvents(
            this.fileSystemWatcherArray
        );
    }

    /**
     * Function to dispose the existing file system watchers
     * @param {FileSystemWatcherArray} fileSystemWatcherArray - FileSystemWatcherArray containing list of fileSystemWatcherElement
     * @returns {FileSystemWatcherArray} fileSystemWatcherArray - FileSystemWatcherArray containing list of fileSystemWatcherElement with disposed fileSystemWatchers
     */
    private disposeExistingFileSystemWatchersFromFileSystemWatcherArray(
        fileSystemWatcherArray: FileSystemWatcherArray
    ): FileSystemWatcherArray {
        //  dispose previously existing FileSystemWatcher
        for (let fileSystemWatcherElement of this.fileSystemWatcherArray
            .fileSystemWatchers) {
            fileSystemWatcherElement.fileSystemWatcher.dispose();
        }

        // remove all the elements from the fileSystemWatcherArray
        this.fileSystemWatcherArray.fileSystemWatchers.splice(0);

        return this.fileSystemWatcherArray;
    }

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
    private getExtensionsInDesiredFormat = (rule: SingleRule): string => {
        // extensionsInDesiredFormat extracts the extensions value provided by the user
        // and stores them in the desired manner
        let extensionsInDesiredFormat: string = '';

        // if the user has provided the extensions in array format
        if (Array.isArray(rule.rule.extensions)) {
            // reduce the array of strings into a single string
            extensionsInDesiredFormat = rule.rule.extensions.join(',');

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
    private getStartsWithInDesiredFormat = (rule: SingleRule): string => {
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
    private getEndsWithInDesiredFormat = (rule: SingleRule): string => {
        // stores the startsWith field in desired manner
        let getEndsWithInDesiredFormat: string = '';

        // if user has not provided then keep it empty else assign
        if (rule.rule.endsWith !== undefined) {
            getEndsWithInDesiredFormat = rule.rule.endsWith;
        }

        return getEndsWithInDesiredFormat;
    };

    /**
     * Function to extract destination field from the SingleRule and transform it in a meaningful manner
     * @param {SingleRule} rule - SingleRule that is parsed from the config
     * @returns {string} destinationInDesiredFormat - string value of the desired destination
     *
     *  @example
     *  if rule.destination === ['assets','image']
     *  return 'assets/image'
     *
     *  @example
     *  if rule.destination === 'assets'
     *  return 'assets'
     *  */
    private getDestinationInDesiredFormat = (rule: SingleRule): string => {
        // extensionsInDesiredFormat extracts the extensions value provided by the user
        // and stores them in the desired manner
        let destinationInDesiredFormat: string = '';

        // if the user has provided the destination in array format
        if (Array.isArray(rule.rule.destination)) {
            // reduce the array of strings into a single string
            destinationInDesiredFormat = rule.rule.destination
                .join(',')
                .replace(/,/g, '/');

            // if string format then take is as provided
        } else if (typeof rule.rule.destination === 'string') {
            destinationInDesiredFormat = rule.rule.destination;
        }

        return destinationInDesiredFormat;
    };

    /**
     * Function to generate the RelativePattern that will be used by fileSystemWatcher to look out for files based on rules provided by the user
     * @param {SingleRule} rule - SingleRule that is parsed from the config
     * @returns {vscode.RelativePattern} relativePatternOfFileSystemWatcher - RelativePattern of the desired FileSystemWatcher
     */
    private generateFileSystemWatcherRelativePattern = (
        rule: SingleRule
    ): vscode.RelativePattern => {
        // extract extensions in the desired format
        const extensionsExtractedInDesiredFormat: string =
            this.getExtensionsInDesiredFormat(rule);

        // extract startsWith in the desired format
        const startsWithExtractedInDesiredFormat: string =
            this.getStartsWithInDesiredFormat(rule);

        // extract endsWith in the desired format
        const endsWithExtractedInDesiredFormat: string =
            this.getEndsWithInDesiredFormat(rule);

        // create the regex for the Relative Pattern
        // based on the values of extensions, startsWith, endsWith
        let relativePatternRegex: string = `**/${startsWithExtractedInDesiredFormat}*${endsWithExtractedInDesiredFormat}.{${extensionsExtractedInDesiredFormat}}`;

        // get the path of the folder where vscode is launched
        const workSpaceFolderPath: string = utils.getWorkspaceFolderPath();

        // create the required RelativePattern of vscode
        const relativePatternOfFileSystemWatcher: vscode.RelativePattern =
            new vscode.RelativePattern(
                workSpaceFolderPath,
                relativePatternRegex
            );

        return relativePatternOfFileSystemWatcher;
    };

    /**
     * Function to get meaning full error messages based on rules provided by the user
     * @param {SingleRule} rule - SingleRule that is parsed from the config
     * @returns {string} meaningfulErrorMessage - meaningful error when a newly created file violates a specific rule
     */
    private getMeaningfulErrorMessage = (rule: SingleRule): string => {
        // create a meaningful error message when a newly created file violates a specific rule
        let meaningfulErrorMessage: string = `All ${this.getExtensionsInDesiredFormat(
            rule
        )} files `;

        // if startsWith property of the rule is defined
        if (rule.rule.startsWith !== undefined) {
            meaningfulErrorMessage = meaningfulErrorMessage.concat(
                `starting with ${rule.rule.startsWith} `
            );
        }

        // if both startsWith and endsWith properties are defined by the user
        if (
            rule.rule.startsWith !== undefined &&
            rule.rule.endsWith !== undefined
        ) {
            meaningfulErrorMessage = meaningfulErrorMessage.concat(' and ');
        }

        // if endsWith property of the rule is defined
        if (rule.rule.endsWith !== undefined) {
            meaningfulErrorMessage = meaningfulErrorMessage.concat(
                `ending with ${rule.rule.endsWith} `
            );
        }

        meaningfulErrorMessage = meaningfulErrorMessage.concat(
            ` should be present inside ${this.getDestinationInDesiredFormat(
                rule
            )} folder`
        );

        return meaningfulErrorMessage;
    };

    /**
     *
     * Function to generate FileSystemWatcher from the rules provided by the user
     * @param {Rules} rules - array of filesystem watchers
     * @returns {FileSystemWatcherArray} fileSystemWatcherArray - fileSystemWatcherArray having fileSystemWatcherArrayElement
     */
    private generateFileSystemWatcherRules(
        rules: Rules
    ): FileSystemWatcherArray {
        // fileSystemWatcherArray having fileSystemWatcherArrayElements to store watchers and other required properties
        let fileSystemWatcherArray: FileSystemWatcherArray = {
            fileSystemWatchers: [],
        };

        // iterate all rules
        for (let rule of rules.rules) {
            // get the RelativePattern needed for creating the required FileSystemWatcher based on user's rule
            const fileSystemWatcherRuleRelativePattern: vscode.RelativePattern =
                this.generateFileSystemWatcherRelativePattern(rule);

            // create a FileSystemWatcher based on the RelativePattern
            const watcher: vscode.FileSystemWatcher =
                vscode.workspace.createFileSystemWatcher(
                    fileSystemWatcherRuleRelativePattern,
                    false,
                    true,
                    true
                );

            // create an element with required properties
            const fileSystemWatcherArrayElement: FileSystemWatcherArrayElement =
                {
                    destination: rule.rule.destination,
                    fileSystemWatcher: watcher,
                    errorMessage: this.getMeaningfulErrorMessage(rule),
                };

            // append the fileSystemWatcherArrayElement
            fileSystemWatcherArray.fileSystemWatchers.push(
                fileSystemWatcherArrayElement
            );
        }

        return fileSystemWatcherArray;
    }

    /**
     * Function to attach file creation events to fileSystem watchers
     * @param {FileSystemWatcherArray} fileSystemWatcherArray - FileSystemWatcherArray containing list of fileSystemWatcherElement
     * @returns {FileSystemWatcherArray} fileSystemWatcherArray - FileSystemWatcherArray with file creation event attached to them
     */
    private attachFileCreationEvents = (
        fileSystemWatcherArray: FileSystemWatcherArray
    ): FileSystemWatcherArray => {
        // iterate all the fileSystemWatchers present in the  fileSystemWatcherArray
        fileSystemWatcherArray.fileSystemWatchers.map(
            (fileSystemWatcherArrayElement) => {
                // attach a file creation event on the fileSystemWatcher based on the regex
                fileSystemWatcherArrayElement.fileSystemWatcher.onDidCreate(
                    (event) => {
                        // check whether the newly created file violates the rule or not
                        const ruleViolated: boolean = this.validateFile(
                            fileSystemWatcherArrayElement,
                            event.fsPath
                        );

                        // if rule is violated then display an meaningful error message to the user
                        if (ruleViolated) {
                            vscode.window.showErrorMessage(
                                fileSystemWatcherArrayElement.errorMessage
                            );
                        }
                    }
                );
            }
        );

        return fileSystemWatcherArray;
    };

    /**
     * Function to validate newly created file by validating the file system path with it's desired destination
     * @param {FileSystemWatcherArrayElement} fileSystemWatcherArrayElement - fileSystemWatcherArrayElement containing information about the user
     * @param {string} newFilePath - path of the newly created file that matched the fileSystem watcher's regex pattern
     * @returns {boolean} ruleViolated - indicates whether the rule is violated or not
     */
    private validateFile = (
        fileSystemWatcherArrayElement: FileSystemWatcherArrayElement,
        newFilePath: string
    ): boolean => {
        let ruleViolated: boolean = true;

        // split the path into array of strings and store the path in reverse order
        const watchedFilePathSplit: string[] = newFilePath
            .split('\\')
            .reverse();

        // array to store names of the folder based on rules provided by the user
        // paths will be stored in the reverse order so the folder nearest to the file is evaluated with it's corresponding destination first
        let fileSystemWatcherArrayElementDestinationPaths: string[] = [];

        // if the user has provided destination in the rule as string then simply assign it as 1st element
        if (typeof fileSystemWatcherArrayElement.destination === 'string') {
            fileSystemWatcherArrayElementDestinationPaths.push(
                fileSystemWatcherArrayElement.destination
            );
        }

        // if the user has provided destination in the rule as array then simply assign it as array
        else if (Array.isArray(fileSystemWatcherArrayElement.destination)) {
            fileSystemWatcherArrayElementDestinationPaths =
                fileSystemWatcherArrayElement.destination.reverse();
        }

        // folder index of the newly file created
        let newFilePathFolderIndex: number = 1;

        // if the number of folders mentioned in the rule is greater than the number of folders inside the newly created file then
        // return ruleViolated equal to true
        if (
            fileSystemWatcherArrayElementDestinationPaths.length >=
            watchedFilePathSplit.length
        ) {
            return ruleViolated;
        }

        // iterate all folder names to compare both the paths
        for (let folderName of fileSystemWatcherArrayElementDestinationPaths) {
            if (folderName === watchedFilePathSplit[newFilePathFolderIndex]) {
                newFilePathFolderIndex += 1;
            }
            // if mismatch exists then return error
            else {
                return ruleViolated;
            }
        }

        // indicate there is no error
        ruleViolated = false;

        return ruleViolated;
    };
}

export default ValidateProjectStructureCommand;
