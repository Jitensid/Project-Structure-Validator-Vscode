import * as cosmiconfig from 'cosmiconfig';
import * as constants from '../constants/constants';

// create a cosmiconfig explorer that will search for the `COSMIC_CONFIG_MODULE_NAME` module
const explorer = cosmiconfig.cosmiconfigSync(
    constants.COSMIC_CONFIG_MODULE_NAME,
    {
        cache: false,
        searchPlaces: [
            `.${constants.COSMIC_CONFIG_MODULE_NAME}rc.json`,
            `.${constants.COSMIC_CONFIG_MODULE_NAME}rc.yaml`,
            `.${constants.COSMIC_CONFIG_MODULE_NAME}rc.yml`,
            `.${constants.COSMIC_CONFIG_MODULE_NAME}rc.js`,
            `.${constants.COSMIC_CONFIG_MODULE_NAME}rc.cjs`,
            `${constants.COSMIC_CONFIG_MODULE_NAME}.config.js`,
            `${constants.COSMIC_CONFIG_MODULE_NAME}.config.cjs`,
        ],
    }
);

export default explorer;
