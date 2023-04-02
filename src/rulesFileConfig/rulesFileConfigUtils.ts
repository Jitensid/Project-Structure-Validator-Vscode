import { CosmiconfigResult } from 'cosmiconfig/dist/types';
import * as utils from '../utils/utils';
import * as constants from '../constants/constants';
import explorer from './rulesFileConfig';
import * as vscode from 'vscode';

const searchForRulesFileConfig = (
    showMessages: boolean = false
): [boolean, CosmiconfigResult] => {
    // get the workspaceFolderPath that will be used by the explorer to search
    // for the config
    const searchConfigFileFrom: string = utils.getWorkspaceFolderPath();

    // to check if there is any issue while searching or parsing config
    let errorInConfig: boolean = true;

    // to store the results when config is found
    let explorerSearchResults: CosmiconfigResult = null;

    // there may be parsing errors in the config hence surrounded with try catch
    try {
        // search results from the cosmiConfig explorer
        explorerSearchResults = explorer.search(searchConfigFileFrom);

        // if non empty and parsable config is found
        if (explorerSearchResults) {
            errorInConfig = false;
        }
        // else display error message to the user
        else {
            if (showMessages) {
                vscode.window.showErrorMessage(
                    constants.messages.configFileEmptyOrMissing
                );
            }
        }
    } catch (error) {
        // if config is found but there are syntax errors due to which errors are raised
        // while parsing it

        if (showMessages) {
            vscode.window.showErrorMessage(
                constants.messages.rulesFilesHasSyntaxError
            );
        }
    }

    // return error status and the config results
    return [errorInConfig, explorerSearchResults];
};

export default searchForRulesFileConfig;
