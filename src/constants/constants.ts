// name of the config file or the property that will be used by cosmiConfig
const COSMIC_CONFIG_MODULE_NAME: string = 'structure';

// dictionary to store relevant messages
const messages: { [key: string]: string } = {
    configFileMissing: 'No config found',
    folderNotLaunched: 'Please launch vscode with a folder',
    rulesFilesHasSyntaxError: 'Syntax Error while parsing the config file',
    configFileEmptyOrMissing: 'Config File is missing or it is empty',
};

export { messages, COSMIC_CONFIG_MODULE_NAME };
