# Project Structure Validator

![AWS CODEBUILD Status](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiVm9odXBpT3ZYMUlUVU44WlpQT2V2MnQ5OVRtYjlKaXRXR3g1elYxbEdDNkNJSDJ6OEpRdVpUYWhrblFYU2M1aE5ETWtCeE1lN1hZeWp1am1mV1lwWG80PSIsIml2UGFyYW1ldGVyU3BlYyI6InBkR0RWNkdlbmdqd3h6c3MiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=main)

# Installation

Install through VS Code extensions. Search for `Project Structure Validator`.

# About the Extension

With the [Project Structure Validator](https://marketplace.visualstudio.com/items?itemName=JitenSidhpura.project-structure-validator) extension, you can define a specific file structure for your project and then validate the actual file structure with the defined structure. This will help to ensure that all files are organized correctly and makes it easier to navigate and manage your project.

The extension allows you to define the file structure using a simple configuration file (**JSON** or **YAML**) in a simple human readable format, which can be customized to suit your project's specific needs. You can define rules in the config file to validate files of specific **extensions** with their **destinations**. You can optionally pass the **startsWith** and **endsWith** values in your rule to only validate files matching your conditions. The extension will then compare your defined structure to the actual structure of your project and show notifications to the developer.

This extension can be especially useful for larger projects or teams, where maintaining a consistent file structure can be challenging. By enforcing a defined structure, you can make it easier for team members to understand and navigate the project, and reduce the likelihood of errors or inconsistencies.

# Quick Start

1. Launch / Open a folder with vscode.
2. Launch Command Pallete with `Cmd + Shift + P`
3. Generate a project structure config file using the command `Generate Project Structure Config File`. (This will create a `.structurerc.yaml` file in the root folder)
4. Once your configuration file is ready run the command `Validate Project Structure` to validate the project structure.

![Project_Structure_Validator_VSCode](https://raw.githubusercontent.com/Jitensid/Project-Structure-Validator-Vscode/main/Project_Structure_Validator_VSCode.gif)


# Defining Rules in Config File

In the configuration file you can define array of rules. Each rule consists of the following properties.

1. `extensions` (Required): Extension of the file.
2. `destination` (Required): Folder in which the matched file should be present.
3. `startsWith` (Optional): Starting characters of the filename to match.
4. `endsWith` (Optional): Ending characters of the filename to match.

# Sample Config File (YAML):

1. Rule to validate all js files beginning with hello to be present inside frontend folder.

```yaml
rules:
    - rule:
          extensions: js
          startsWith: hello
          destination: frontend
```

2. Rule to validate all js files beginning with hello to be present inside frontend/javascript folders.

```yaml
rules:
    - rule:
          extensions: js
          startsWith: hello
          destination: [frontend, javascript]
```

# Key Features

1. The **Generate Project Structure Config File** command from the Command Pallete will create a `.structurerc.yaml` file.

2. You can also define rules of your project in any one of the files in the root folder

    1. `.structurerc.json`
    2. `.structurerc.yaml`
    3. `.structurerc.yml`
    4. `.structurerc.js`
    5. `.structurerc.cjs`
    6. `structure.config.js`
    7. `structure.config.cjs`

3. Files violating the rules are displayed separately in a Tree View in the Project Structure Container in the activity bar.

4. Error messages displayed when a new file created violates any rule.

5. Entire project structure validated when a folder is launched containing the configuration file.

# Contributions

If you find an issue or have a new feature then feel free to make a Pull Request. Your Contributions are always welcomed.
