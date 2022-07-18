import ajvInstance from './Ajv';
import singleRuleSchema from './SingleRuleSchema';

/**
 * This schema basically represents the array of rules that is used to validate the files
 * @param {singleRuleSchema[]} rules - array of singRuleSchema
 * @property {string} $id - represents unique identifier for a schema
 */

const rulesSchema = {
	$id: 'https://example.com/schemas/rulesSchema',
	type: 'object',
	properties: {
		rules: {
			type: 'array',
			minItems: 1,
			items: {
				$ref: 'https://example.com/schemas/singleRulesSchema#',
			},
		},
	},
	required: ['rules'],
};

const validateRulesSchema = ajvInstance
	.addSchema(singleRuleSchema)
	.compile(rulesSchema);

export { rulesSchema, validateRulesSchema };
