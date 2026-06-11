const LOGIN_STATE_KEY = "coffee_invoice_logged_in";
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 256;
const ADMIN_PASSWORD_CONFIG = {
    salt: "CO135/cefWHkEtk2H5gQpQ==",
    passwordHash: "PHePc0spOmEd1GSyfZXWKwtlwa9/nVBVhujpWEVG12U=",
};

function toBase64(bytes) {
    let binary = "";

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

function fromBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function derivePasswordHash(password, salt) {
    const passwordKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            hash: "SHA-256",
            salt: fromBase64(salt),
            iterations: PASSWORD_ITERATIONS,
        },
        passwordKey,
        PASSWORD_KEY_LENGTH
    );

    return toBase64(new Uint8Array(bits));
}

function safeEqual(left, right) {
    if (left.length !== right.length) {
        return false;
    }

    let difference = 0;

    for (let index = 0; index < left.length; index += 1) {
        difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }

    return difference === 0;
}

export function hasAdminPassword() {
    return true;
}

export function isLoggedIn() {
    return hasAdminPassword() && localStorage.getItem(LOGIN_STATE_KEY) === "yes";
}

export function setLoggedIn(value) {
    if (value) {
        localStorage.setItem(LOGIN_STATE_KEY, "yes");
        return;
    }

    localStorage.removeItem(LOGIN_STATE_KEY);
}

export async function verifyAdminPassword(password) {
    const passwordHash = await derivePasswordHash(password, ADMIN_PASSWORD_CONFIG.salt);

    return safeEqual(passwordHash, ADMIN_PASSWORD_CONFIG.passwordHash);
}
