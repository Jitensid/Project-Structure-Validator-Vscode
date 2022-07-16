const RULES_FILENAME: string = 'rules.yml';

const messages: {[key: string]: string} = {
	"rulesFileMissing": `${RULES_FILENAME} is not present in the working directory`,
	"folderNotLaunched": 'Please launch vscode with a folder'
};

export {RULES_FILENAME, messages};