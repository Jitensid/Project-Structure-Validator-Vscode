import * as cosmiconfig from 'cosmiconfig';
import { COSMIC_CONFIG_MODULE_NAME } from '../constants/constants';

// create a cosmiconfig explorer that will search for the `COSMIC_CONFIG_MODULE_NAME` module
const explorer = cosmiconfig.cosmiconfigSync(COSMIC_CONFIG_MODULE_NAME, {
    cache: false,
});

export default explorer;
