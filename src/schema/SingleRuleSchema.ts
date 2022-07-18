/**
 * singleRuleSchema is used in the rulesSchema
 * This schema basically represents the properties of a single rule object
 * @param {string|string[]} extensions - represents the extension of file or array of strings containing extensions of file for which the rule is written
 * @param {string} startsWith - represents the starting characters of the name of the file
 * @param {string} destination - represent the directory inside which the target file is supposed to reside
 * @property {string} $id - represents unique identifier for a schema
 * Do no use this schema directly in the source code.
 */

const singleRuleSchema = {
	$id: 'https://example.com/schemas/singleRulesSchema',
	type: 'object',
	properties: {
		extensions: {
			anyOf: [
				{ type: 'string' },
				{
					type: 'array',
					minItems: 1,
					items: {
						type: 'string',
					},
				},
			],
		},
		startsWith: { type: 'string' },
		destination: { type: 'string' },
	},
	required: ['extensions', 'destination'],
};

export default singleRuleSchema;
