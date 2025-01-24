import { createTripByKey } from "2ch-trip";

export async function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

// Expect key to start with # or ##
function calculateTripcode(key: string) {
    // for gikopoi compatibility, empty keys return ◆fnkquv7jY2 instead of ◆8NBuQ4l6uQ
    if (!key) return "fnkquv7jY2";

    return createTripByKey(key);
}

// Trim username and calculate tripcode
export function elaborateUserName(userName: string) {
    if (!userName) return "";
    const n = userName.indexOf("#");
    const userNamePart = userName
        .substring(0, n >= 0 ? n : 20) // Don't allow the user to have a name longer than 20 characters
        .replace(/[◆⯁♦⬥]/g, "◇");
    const tripcode = n < 0 ? "" : "◆" + calculateTripcode(userName.substring(n + 1));
    return userNamePart + tripcode;
}
