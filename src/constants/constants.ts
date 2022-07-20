const RULES_FILENAME: string = 'rules.yml';

const COSMIC_CONFIG_MODULE_NAME: string = 'structure';

const messages: { [key: string]: string } = {
    configFileMissing: `${RULES_FILENAME} is not present in the working directory`,
    folderNotLaunched: 'Please launch vscode with a folder',
    rulesFilesHasSyntaxError: 'Syntax Error while parsing the config file',
    configFileEmptyOrMissing: 'Config File is missing or it is empty',
};

export { RULES_FILENAME, messages, COSMIC_CONFIG_MODULE_NAME };
