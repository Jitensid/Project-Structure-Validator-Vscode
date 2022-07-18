const RULES_FILENAME: string = "rules.yml";

const messages: { [key: string]: string } = {
  rulesFileMissing: `${RULES_FILENAME} is not present in the working directory`,
  folderNotLaunched: "Please launch vscode with a folder",
  rulesFilesHasSyntaxError: `${RULES_FILENAME} has a syntax error`,
};

export { RULES_FILENAME, messages };
