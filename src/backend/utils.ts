import { createTrip } from "2ch-trip";
import log from "loglevel";

export async function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

export function indexOfMulti(array: Uint8Array, searchElements: number[], fromIndex: number): number {
    fromIndex = fromIndex || 0;

    const index = Array.prototype.indexOf.call(array, searchElements[0], fromIndex);
    if (searchElements.length === 1 || index === -1) {
        // Not found or no other elements to check
        return index;
    }

    for (var i = index, j = 0; j < searchElements.length && i < array.length; i++, j++) {
        if (array[i] !== searchElements[j]) {
            return indexOfMulti(array, searchElements, index + 1);
        }
    }

    return (i === index + searchElements.length) ? index : -1;
};

// Expect key to start with # or ##
function calculateTripcode(key: string) {
    if (!key) return "";
    // for gikopoi compatibility, empty keys return ◆fnkquv7jY2 instead of ◆8NBuQ4l6uQ
    if (key == "#") return "◆fnkquv7jY2"

    return createTrip(key, { hideWhitespace: true });
}

// Trim username and calculate tripcode
export function elaborateUserName(userName: string) {
    const n = userName.indexOf("#");
    const userNamePart = userName
        .substring(0, n >= 0 ? n : 20) // Don't allow the user to have a name longer than 20 characters
        .replace(/[◆⯁♦⬥]/g, "◇");
    const tripcodeKeyPart = n >= 0 ? userName.substring(n) : ""; // Include the # or ##, so that 2ch-trip can decide whether it's a raw key or a 10/12 character key
    const tripcode = tripcodeKeyPart ? calculateTripcode(tripcodeKeyPart) : "";
    const processedUserName = userNamePart + tripcode;

    log.error(`userNamePart: ${userNamePart}, tripcodeKeyPart: ${tripcodeKeyPart}, tripcode: ${tripcode}, processedUserName: ${processedUserName}`);

    return processedUserName;
}
