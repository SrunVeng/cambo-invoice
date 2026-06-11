const AUTH_CONFIG_KEY = "coffee_invoice_admin_auth";
const LOGIN_STATE_KEY = "coffee_invoice_logged_in";
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 256;

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

function createSalt() {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    return toBase64(salt);
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

function readAuthConfig() {
    try {
        const value = localStorage.getItem(AUTH_CONFIG_KEY);

        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

export function hasAdminPassword() {
    const config = readAuthConfig();

    return Boolean(config?.salt && config?.passwordHash);
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

export async function setupAdminPassword(password) {
    const salt = createSalt();
    const passwordHash = await derivePasswordHash(password, salt);

    localStorage.setItem(
        AUTH_CONFIG_KEY,
        JSON.stringify({
            salt,
            passwordHash,
            iterations: PASSWORD_ITERATIONS,
        })
    );
}

export async function verifyAdminPassword(password) {
    const config = readAuthConfig();

    if (!config?.salt || !config?.passwordHash) {
        return false;
    }

    const passwordHash = await derivePasswordHash(password, config.salt);

    return safeEqual(passwordHash, config.passwordHash);
}
