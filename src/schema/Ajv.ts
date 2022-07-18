import * as ajv from 'ajv';

// create an instance of ajv
const ajvInstance = new ajv({
	allErrors: true,
	jsonPointers: true,
});

export default ajvInstance;
