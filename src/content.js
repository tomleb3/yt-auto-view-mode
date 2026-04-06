// @ts-check
'use strict';

/**
 * @typedef {'landscape' | 'portrait'} Orientation
 * @typedef {'default' | 'theater'} ViewMode
 */

(() => {
    /**
     * When writing equality checks with a finite number of cases, use this function in the
     * final clause of the statements for exhaustive checking. This will make TS complain
     * until ALL cases are handled. For example, if we have a switch-case in-which we evaluate
     * every possible status of a component's state, if we add this to the default clause and
     * then add a new status to the state type, TS will complain and force us to handle it as
     * well, thus avoiding forgetting it.
     *
     * @param {never} _value
     * @returns {never}
     */
    const assertUnreachable = _value => {
        throw new Error('Statement should be unreachable');
    };

    /**
     * @param {string} name
     * @returns {string | null}
     */
    const getCookie = name => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length !== 2) {
            return null;
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

    /** @returns {ViewMode | null} */
    const getCurrentViewMode = () => {
        const wideCookie = getCookie('wide');
        switch (wideCookie) {
            case '0':
                return 'default';
            case '1':
                return 'theater';
            default:
                return null;
        }
    };

    /** @returns {HTMLButtonElement | null} */
    const getPlayerSizeButton = () => {
        return document.querySelector('.ytp-size-button');
    };

    /** @param {Orientation} newOrientation */
    const onOrientationChange = newOrientation => {
        const playerSizeButton = getPlayerSizeButton();
        const currentViewMode = getCurrentViewMode();
        if (playerSizeButton === null || currentViewMode === null) {
            return;
        }
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

    /** @returns {boolean} */
    const isWatchPage = () => location.pathname === '/watch';

    const enforceOrientation = () => {
        if (!isWatchPage()) {
            return;
        }
        const orientation = getOrientation();
        lastOrientation = orientation;
        onOrientationChange(orientation);
    };

    /** @type {Orientation | null} */
    let lastOrientation = null;

    /** @type {ReturnType<typeof setTimeout> | null} */
    let resizeTimer = null;

    window.addEventListener('resize', () => {
        if (!isWatchPage()) {
            return;
        }
        const newOrientation = getOrientation();

        // Apply immediately on orientation change (leading edge).
        if (newOrientation !== lastOrientation) {
            lastOrientation = newOrientation;
            onOrientationChange(newOrientation);
        }

        // Re-validate after settling (trailing edge) in case the cookie
        // was stale during the immediate application.
        if (resizeTimer !== null) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
            resizeTimer = null;
            onOrientationChange(getOrientation());
        }, 300);
    });

    // Re-enforce on YouTube SPA navigation (e.g. clicking a video from homepage).
    // The player DOM may be re-created, so wait for the size button to appear.
    window.addEventListener('yt-navigate-finish', () => {
        lastOrientation = null;
        waitForPlayerAndEnforce();
    });

    /** Wait for the player size button to appear, then enforce the correct view mode. */
    const waitForPlayerAndEnforce = () => {
        // If the button already exists, enforce immediately.
        if (document.querySelector('.ytp-size-button') !== null) {
            enforceOrientation();
            return;
        }
        const observer = new MutationObserver(() => {
            if (document.querySelector('.ytp-size-button') !== null) {
                observer.disconnect();
                enforceOrientation();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    waitForPlayerAndEnforce();
})();
