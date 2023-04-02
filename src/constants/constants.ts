// name of the config file or the property that will be used by cosmiConfig
const COSMIC_CONFIG_MODULE_NAME: string = 'structure';

// dictionary to store relevant messages
const messages: { [key: string]: string } = {
    folderNotLaunched: 'Please launch vscode with a folder',
    rulesFilesHasSyntaxError: 'Syntax Error while parsing the config file',
    configFileEmptyOrMissing: 'Config File is missing or it is empty',
    doesNotFollowSchemaError:
        'Config provided does not follow the required Schema',
    configFileAlreadyPresent:
        'Workspace already has a config file. Do you want to open it ?',
    configFileGenerationError: 'Unable to create config file',
    configFileGenerationSuccess: 'Successfully created the config file',
};

const PROJECT_STRUCTURE_CONFIG_FILENAME: string = '.structurerc.json';

const ASSETS_FOLDER_PATH: string = 'assets';

export {
    messages,
    COSMIC_CONFIG_MODULE_NAME,
    PROJECT_STRUCTURE_CONFIG_FILENAME,
    ASSETS_FOLDER_PATH,
};
