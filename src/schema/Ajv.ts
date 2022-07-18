import * as ajv from 'ajv';

// create an instance of ajv
const ajvInstance = new ajv.default({
	allErrors: true,
});

export default ajvInstance;
