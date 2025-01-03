// @ts-check
'use strict';

/**
 * @typedef {'landscape' | 'portrait'} Orientation
 * @typedef {'default' | 'theater'} ViewMode
 */

(() => {
    /**
     * When writing a switch-case with a finite number of cases, use this function in the
     * `default` clause of switch-case statements for exhaustive checking. This will make
     * TS complain until ALL cases are handled. For example, if we have a switch-case
     * in-which we evaluate every possible status of a component's state, if we add this
     * to the default clause and then add a new status to the state type, TS will complain
     * and force us to handle it as well, thus avoiding forgetting it.
     *
     * @param {never} _value
     * @returns {never}
     */
    const assertUnreachable = _value => {
        throw new Error('Statement should be unreachable');
    };

    /**
     * @param {string} name
     * @returns {string}
     */
    const getCookie = name => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length !== 2) {
            throw new Error(`Unexpected amount of "parts" found when getting cookie: ${parts}`);
        }
        // @ts-ignore
        return parts.pop().split(';').shift();
    };

    /** @returns {Orientation} */
    const getOrientation = () => {
        if (window.matchMedia('(orientation: portrait)').matches) {
            return 'portrait';
        }
        return 'landscape';
    };

    /** @returns {ViewMode} */
    const getCurrentViewMode = () => {
        const wideCookie = getCookie('wide');
        switch (wideCookie) {
            case '0':
                return 'default';

            case '1':
                return 'theater';

            default:
                throw new Error(`Unexpected wide cookie value: ${wideCookie}`);
        }
    };

    /** @returns {HTMLButtonElement} */
    const getPlayerSizeButton = () => {
        /** @type {HTMLButtonElement | null} */
        const theaterModeButton = document.querySelector('.ytp-size-button');
        if (theaterModeButton === null) {
            throw new Error('Unable to find player size button');
        }
        return theaterModeButton;
    };

    /** @param {Orientation} newOrientation */
    const onOrientationChange = newOrientation => {
        const playerSizeButton = getPlayerSizeButton();
        const currentViewMode = getCurrentViewMode();
        switch (newOrientation) {
            case 'landscape':
                switch (currentViewMode) {
                    case 'default':
                        break;
                    case 'theater':
                        playerSizeButton.click();
                        break;
                    default:
                        assertUnreachable(currentViewMode);
                }
                break;

            case 'portrait':
                switch (currentViewMode) {
                    case 'default':
                        playerSizeButton.click();
                        break;
                    case 'theater':
                        break;
                    default:
                        assertUnreachable(currentViewMode);
                }
                break;

            default:
                assertUnreachable(newOrientation);
        }
    };

    window.addEventListener('resize', () => {
        const newOrientation = getOrientation();
        onOrientationChange(newOrientation);
    });
})();
