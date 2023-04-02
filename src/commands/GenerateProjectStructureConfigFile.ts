import * as vscode from 'vscode';
import * as path from 'path';
import * as constants from '../constants/constants';
import * as utils from '../utils/utils';
import { CosmiconfigResult } from 'cosmiconfig/dist/types';
import searchForRulesFileConfig from '../rulesFileConfig/rulesFileConfigUtils';

class GenerateProjectStructureConfigFile {
    // main method of the command
    public async executeCommand(
        context: vscode.ExtensionContext
    ): Promise<void> {
        // if vscode is not launched with a folder then raise an error message
        if (!utils.checkIfFolderIsLaunched()) {
            vscode.window.showErrorMessage(
                constants.messages.folderNotLaunched
            );
            return;
        }

        // error status and config after searching and parsing of config
        const searchForRulesFileConfigResults: [boolean, CosmiconfigResult] =
            searchForRulesFileConfig(false);

        // if a config file alreay exists then inform the user about it
        if (searchForRulesFileConfigResults[1]?.filepath) {
            const response = await vscode.window.showInformationMessage(
                constants.messages.configFileAlreadyPresent,
                'Yes',
                'No'
            );

            if (response === 'Yes') {
                const uri = vscode.Uri.file(
                    searchForRulesFileConfigResults[1].filepath
                );

                await vscode.commands.executeCommand('vscode.open', uri);
            }

            return;
        }

        // Get the source file path within the extension
        const sourcePath: vscode.Uri = vscode.Uri.file(
            context.asAbsolutePath(
                path.join(
                    'src',
                    constants.ASSETS_FOLDER_PATH,
                    constants.PROJECT_STRUCTURE_CONFIG_FILENAME
                )
            )
        );

        // set the target path for the config file
        const targetPath: vscode.Uri = vscode.Uri.file(
            path.join(
                utils.getWorkspaceFolderPath(),
                constants.PROJECT_STRUCTURE_CONFIG_FILENAME
            )
        );

        try {
            // copy to the targetPath
            await vscode.workspace.fs.copy(sourcePath, targetPath);
            // set the context to true
            vscode.commands.executeCommand(
                'setContext',
                'project-structure-validator.hasConfigFile',
                true
            );

            // open the file
            await vscode.commands.executeCommand('vscode.open', targetPath);

            vscode.window.showInformationMessage(
                constants.messages.configFileGenerationSuccess
            );
        } catch (error) {
            vscode.window.showErrorMessage(
                constants.messages.configFileGenerationError
            );
        }
    }
}

export default GenerateProjectStructureConfigFile;
