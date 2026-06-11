export function newUid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getToday() {
    return new Date().toISOString().slice(0, 10);
}

export function generateInvoiceNumber() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${yyyy}${mm}${dd}-${random}`;
}

export function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export function discountAmount(baseAmount, discountType, discountValue) {
    const base = toNumber(baseAmount);
    const value = toNumber(discountValue);

    if (value <= 0) return 0;

    if (discountType === "percent") {
        return Math.min(base, (base * value) / 100);
    }

    return Math.min(base, value);
}

export function calculateItem(item) {
    const quantity = toNumber(item.qty);
    const price = toNumber(item.price);
    const gross = quantity * price;
    const discount = discountAmount(gross, item.discountType, item.discount);
    const net = Math.max(0, gross - discount);

    return {
        gross,
        discount,
        net,
    };
}

export function calculateInvoice(items, totalDiscountType, totalDiscountValue) {
    const subtotal = items.reduce((sum, item) => {
        return sum + calculateItem(item).net;
    }, 0);

    const totalDiscount = discountAmount(
        subtotal,
        totalDiscountType,
        totalDiscountValue
    );

    const grandTotal = Math.max(0, subtotal - totalDiscount);

    return {
        subtotal,
        totalDiscount,
        grandTotal,
    };
}

export function formatMoney(amount, currency) {
    const value = toNumber(amount);

    if (currency === "KHR") {
        return `${new Intl.NumberFormat("km-KH", {
            maximumFractionDigits: 0,
        }).format(value)} ៛`;
    }

    return `$${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)}`;
}

export function cleanFileName(text) {
    return String(text || "invoice")
        .trim()
        .replace(/[^\w\-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|\-$/g, "");
}