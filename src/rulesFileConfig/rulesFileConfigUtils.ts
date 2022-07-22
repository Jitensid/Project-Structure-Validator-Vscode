import { CosmiconfigResult } from 'cosmiconfig/dist/types';
import { getWorkspaceFolderPath } from '../utils/utils';
import explorer from './rulesFileConfig';
import * as vscode from 'vscode';
import { messages } from '../constants/constants';

const searchForRulesFileConfig = (): [boolean, CosmiconfigResult] => {
    // get the workspaceFolderPath that will be used by the explorer to search
    // for the config
    const searchConfigFileFrom: string = getWorkspaceFolderPath();

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
            vscode.window.showErrorMessage(
                'No Config found or config is empty'
            );
        }
    } catch (error) {
        // if config is found but there are syntax errors due to which errors are raised
        // while parsing it
        vscode.window.showErrorMessage(messages.rulesFilesHasSyntaxError);
    }

    // return error status and the config results
    return [errorInConfig, explorerSearchResults];
};

export default searchForRulesFileConfig;
