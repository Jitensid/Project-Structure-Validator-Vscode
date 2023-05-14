import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as constants from '../constants/constants';
import * as utils from '../utils/utils';
import searchForRulesFileConfig from '../rulesFileConfig/rulesFileConfigUtils';
import { CosmiconfigResult } from 'cosmiconfig/dist/types';
import { validateRulesSchema } from '../schema/RulesSchema';
import ViolatedFilesTreeProvider from '../provider/ViolatedFilesTreeProvider';
import SingleRule from '../interfaces/SingleRuleInterface';
import Rules from '../interfaces/RulesInterface';
import FileSystemWatcherArray from '../interfaces/FileSystemWatcherArrayInterface';
import FileSystemWatcherArrayElement from '../interfaces/FileSystemWatcherArrayElementInterface';

class ValidateProjectStructureCommand {
    // array to store filesystem watcher elements
    private fileSystemWatcherArray: FileSystemWatcherArray;

    // stores the path of the cosmiConfig file path from which the fileSystemWatcherArray is created
    private cosmiConfigFilePath: string | undefined;

    // fileDeleteEvent so that when cosmiConfig file is deleted by the user then cleanup operation can begin
    // and to update the tree view if a violated File is deleted by the user
    private fileDeleteEvent: vscode.Disposable | undefined;

    // fileRenameEvent so that when user renames file the TreeView can be updated accordingly
    private fileRenameEvent: vscode.Disposable | undefined;

    // treeView to show files that are violating project structure rules
    private violatedFilesTreeView: vscode.Disposable | undefined;

    // treeDataProvider so that nodes can be added or removed
    private violatedFilesTreeProvider: ViolatedFilesTreeProvider | undefined;

    constructor() {
        // initialize the fileSystemWatcherArray with fileSystemWatchers property as empty array
        this.fileSystemWatcherArray = { fileSystemWatchers: [] };

        // when the path of the cosmiConfig file is not yet known then set it to undefined
        this.cosmiConfigFilePath = undefined;

        // when the cosmiConfig file is not set so the event is initialized as undefined
        this.fileDeleteEvent = undefined;

        // when the cosmiConfig file is not set so the event is initialized as undefined
        this.fileRenameEvent = undefined;

        // when the violatedFilesTreeView is not yet created then it is initialized as undefined
        this.violatedFilesTreeView = undefined;

        // when the violatedFilesTreeProvider is not yet registered then it is initialized as undefined
        this.violatedFilesTreeProvider = undefined;
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
            searchForRulesFileConfig(true);

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

        // save the path for the cosmiConfig for later use
        this.cosmiConfigFilePath =
            searchForRulesFileConfigResults[1]?.filepath!;

        // set the context to true
        vscode.commands.executeCommand(
            'setContext',
            'project-structure-validator.hasConfigFile',
            true
        );

        this.fileRenameEvent = vscode.workspace.onWillRenameFiles(
            async (event) => {
                // iterate renamed files reported from the event
                for (const renamedFile of event.files) {
                    const fileStat = await vscode.workspace.fs.stat(
                        renamedFile.oldUri
                    );

                    if (fileStat.type === vscode.FileType.Directory) {
                        console.debug(
                            'Directory is Deleted so now all files present inside the workspace would be validated now'
                        );

                        this.validateExistingFilesInsideWorkspaceFolder();

                        return;
                    }

                    // get the actual file path of the file before it was renamed
                    const oldRenamedFilePath: string = renamedFile.oldUri
                        .toString(true)
                        .slice()
                        .replace('file://', '');

                    // remove the node from the TreeView if present because the violated file is deleted
                    this.violatedFilesTreeProvider?.removeViolatedFilesTreeItemIfExists(
                        oldRenamedFilePath
                    );
                }
            }
        );

        // attach a fileDeleteEvent once the config is successfully loaded
        this.fileDeleteEvent = vscode.workspace.onWillDeleteFiles(
            async (event) => {
                // iterate deleted files reported from the event
                for (const deletedFile of event.files) {
                    const fileStat = await vscode.workspace.fs.stat(
                        deletedFile
                    );

                    if (fileStat.type === vscode.FileType.Directory) {
                        console.debug(
                            'Directory is Deleted so now all files present inside the workspace would be validated now'
                        );

                        this.validateExistingFilesInsideWorkspaceFolder();

                        return;
                    }

                    if (
                        deletedFile.fsPath ===
                        this.cosmiConfigFilePath?.toString()
                    ) {
                        vscode.window.showWarningMessage(
                            'Config file has been deleted!'
                        );

                        // set the context to false
                        vscode.commands.executeCommand(
                            'setContext',
                            'project-structure-validator.hasConfigFile',
                            false
                        );

                        // dispose the existing fileSystemWatchers now since the config file is deleted
                        this.disposeExistingFileSystemWatchersFromFileSystemWatcherArray();

                        // dispose the fileDeleteEvent since it is now no longer needed
                        this.fileDeleteEvent!.dispose();

                        // dispose the fileRenameEvent since it is now no longer needed
                        this.fileRenameEvent!.dispose();

                        // dispose the current tree view
                        this.violatedFilesTreeView?.dispose();
                    } else {
                        // remove the node from the TreeView if present because a file is deleted
                        this.violatedFilesTreeProvider?.removeViolatedFilesTreeItemIfExists(
                            deletedFile.fsPath
                        );
                    }
                }
            }
        );

        this.violatedFilesTreeProvider = new ViolatedFilesTreeProvider();

        this.violatedFilesTreeView = vscode.window.createTreeView(
            'violatedFilesTreeView',
            {
                treeDataProvider: this.violatedFilesTreeProvider,
            }
        );

        // get the rules from config object
        const rules: Rules = searchForRulesFileConfigResults[1]?.config;

        // clean up existing filesystem watchers
        this.disposeExistingFileSystemWatchersFromFileSystemWatcherArray();

        // create appropriate fileSystem watchers rules and their destinations based on the rules given by the user
        this.generateFileSystemWatcherRules(rules);

        // attach file creation events based on rules provided by the user
        this.attachFileCreationEvents();

        // check files present in the workspace whether the rules are followed or not
        this.validateExistingFilesInsideWorkspaceFolder();
    }

    /**
     * Function to dispose the existing file system watchers
     */
    private disposeExistingFileSystemWatchersFromFileSystemWatcherArray(): void {
        //  dispose previously existing FileSystemWatcher
        for (let fileSystemWatcherElement of this.fileSystemWatcherArray
            .fileSystemWatchers) {
            fileSystemWatcherElement.fileSystemWatcher.dispose();
        }

        // remove all the elements from the fileSystemWatcherArray
        this.fileSystemWatcherArray.fileSystemWatchers.splice(0);
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
     * Function to generate the relativePatternRegex that will be used by fileSystemWatcher to look out for files based on rules provided by the user
     * @param {SingleRule} rule - SingleRule that is parsed from the config
     * @returns {string} relativePatternRegex - relativePatternRegex of the file based on file extension, startsWith and endsWith parameters
     */
    private generateRelativePatternRegex = (rule: SingleRule) => {
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
        const relativePatternRegex: string = `**/${startsWithExtractedInDesiredFormat}*${endsWithExtractedInDesiredFormat}.{${extensionsExtractedInDesiredFormat}}`;

        return relativePatternRegex;
    };

    /**
     * Function to generate the RelativePattern that will be used by fileSystemWatcher to look out for files based on rules provided by the user
     * @param {SingleRule} rule - SingleRule that is parsed from the config
     * @returns {vscode.RelativePattern} relativePatternOfFileSystemWatcher - RelativePattern of the desired FileSystemWatcher
     */
    private generateFileSystemWatcherRelativePattern = (
        rule: SingleRule
    ): vscode.RelativePattern => {
        // create the regex for the Relative Pattern
        // based on the values of extensions, startsWith, endsWith
        const relativePatternRegex: string =
            this.generateRelativePatternRegex(rule);

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
     * Function to generate FileSystemWatcher from the rules provided by the user
     * @param {Rules} rules - array of filesystem watchers
     */
    private generateFileSystemWatcherRules(rules: Rules) {
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
                    rule: rule,
                    fileSystemWatcher: watcher,
                    errorMessage: this.getMeaningfulErrorMessage(rule),
                };

            // append the fileSystemWatcherArrayElement
            this.fileSystemWatcherArray.fileSystemWatchers.push(
                fileSystemWatcherArrayElement
            );
        }
    }

    /**
     * Function to attach file creation events to fileSystem watchers
     */
    private attachFileCreationEvents = (): void => {
        // iterate all the fileSystemWatchers present in the fileSystemWatcherArray
        this.fileSystemWatcherArray.fileSystemWatchers.map(
            (fileSystemWatcherArrayElement) => {
                // attach a file creation event on the fileSystemWatcher based on the regex
                fileSystemWatcherArrayElement.fileSystemWatcher.onDidCreate(
                    (event) => {
                        // check whether the newly created file violates the rule or not
                        const ruleViolated: boolean = this.validateFile(
                            fileSystemWatcherArrayElement,
                            event.fsPath
                        );

                        // if rule is violated then display a meaningful error message to the user
                        if (ruleViolated) {
                            vscode.window.showErrorMessage(
                                fileSystemWatcherArrayElement.errorMessage
                            );

                            // add the violated file into the TreeView
                            this.violatedFilesTreeProvider!.addViolatedFilesTreeItem(
                                event.fsPath
                            );
                        }
                    }
                );
            }
        );
    };

    /**
     * Function to validate whether the newly created file is validating the file system path with it's desired destination
     * @param {FileSystemWatcherArrayElement} fileSystemWatcherArrayElement - fileSystemWatcherArrayElement containing information about the user
     * @param {string} newFilePath - path of the newly created file that matched the fileSystem watcher's regex pattern
     * @returns {boolean} ruleViolated - indicates whether the rule is violated or not
     */
    private validateFile = (
        fileSystemWatcherArrayElement: FileSystemWatcherArrayElement,
        newFilePath: string
    ): boolean => {
        let ruleViolated: boolean = true;

        let watchedFilePathSplit: string[];

        if (os.platform() === 'win32') {
            // split the path into array of strings and store the path in reverse order and remove any empty strings from the array
            watchedFilePathSplit = newFilePath
                .split('\\')
                .reverse()
                .filter(Boolean);
        } else {
            // split the path into array of strings and store the path in reverse order and remove any empty strings from the array
            watchedFilePathSplit = newFilePath
                .split('/')
                .reverse()
                .filter(Boolean);
        }

        // array to store names of the folder based on rules provided by the user
        // paths will be stored in the reverse order so the folder nearest to the file is evaluated with it's corresponding destination first
        let fileSystemWatcherArrayElementDestinationPaths: string[] = [];

        // if the user has provided destination in the rule as string then simply assign it as 1st element
        if (
            typeof fileSystemWatcherArrayElement.rule.rule.destination ===
            'string'
        ) {
            fileSystemWatcherArrayElementDestinationPaths.push(
                fileSystemWatcherArrayElement.rule.rule.destination
            );
        }

        // if the user has provided destination in the rule as array then simply assign it as array
        else if (
            Array.isArray(fileSystemWatcherArrayElement.rule.rule.destination)
        ) {
            fileSystemWatcherArrayElementDestinationPaths =
                fileSystemWatcherArrayElement.rule.rule.destination.reverse();
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
            // if mismatch then return error
            else {
                return ruleViolated;
            }
        }

        // indicate there is no error
        ruleViolated = false;

        return ruleViolated;
    };

    /**
     * Function to validate already opened files that are matching the rules provided by the user
     */
    private validateExistingFilesInsideWorkspaceFolder = () => {
        this.violatedFilesTreeProvider!.clearViolatedFilesTreeItem();

        for (let fileSystemWatcherArrayElement of this.fileSystemWatcherArray
            .fileSystemWatchers) {
            // get the relativePatternRegex based on the rule provided by the config
            const relativePatternRegex: string =
                this.generateRelativePatternRegex(
                    fileSystemWatcherArrayElement.rule
                );

            // for all files matching the fileRelativePattern now validate their locations
            vscode.workspace
                .findFiles(relativePatternRegex)
                .then((matchedFiles) => {
                    // iterate all files being matched by the rule
                    for (let matchedFile of matchedFiles) {
                        // check whether the file present in the workspace is following the rule or not
                        const ruleViolated: boolean = this.validateFile(
                            fileSystemWatcherArrayElement,
                            matchedFile.fsPath
                        );

                        // if rule is violated then display a meaningful error message to the user
                        if (ruleViolated) {
                            vscode.window.showErrorMessage(
                                vscode.workspace.asRelativePath(matchedFile) +
                                    ' ' +
                                    fileSystemWatcherArrayElement.errorMessage
                            );

                            // add the violated file into the TreeView
                            this.violatedFilesTreeProvider!.addViolatedFilesTreeItem(
                                matchedFile.fsPath
                            );
                        }
                    }
                });
        }
    };
}

export default ValidateProjectStructureCommand;
