const INVOICE_SEQUENCE_KEY = "coffee_invoice_number_sequence";

export function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export function newUid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getLocalDateParts(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return { year, month, day };
}

function getDateKey(date = new Date()) {
    const { year, month, day } = getLocalDateParts(date);

    return `${year}${month}${day}`;
}

function readInvoiceSequence() {
    try {
        const value = localStorage.getItem(INVOICE_SEQUENCE_KEY);
        const parsed = value ? JSON.parse(value) : {};

        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function saveInvoiceSequence(sequence) {
    try {
        localStorage.setItem(INVOICE_SEQUENCE_KEY, JSON.stringify(sequence));
        return true;
    } catch {
        // If storage is unavailable, the timestamp fallback still prevents most collisions.
        return false;
    }
}

function generateFallbackInvoiceNumber(date = new Date()) {
    const time = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
    ]
        .map((part) => String(part).padStart(2, "0"))
        .join("");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `INV-${getDateKey(date)}-${time}${milliseconds}`;
}

export function getToday() {
    const { year, month, day } = getLocalDateParts();

    return `${year}-${month}-${day}`;
}

export function generateInvoiceNumber() {
    const date = new Date();
    const dateKey = getDateKey(date);
    const sequence = readInvoiceSequence();
    const lastNumber = Number(sequence[dateKey]) || 0;
    const nextNumber = lastNumber + 1;

    sequence[dateKey] = nextNumber;
    if (!saveInvoiceSequence(sequence)) {
        return generateFallbackInvoiceNumber(date);
    }

    return `INV-${dateKey}-${String(nextNumber).padStart(4, "0")}`;
}

export function cleanFileName(name) {
    return String(name || "invoice")
        .trim()
        .replace(/[^\w-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function formatMoney(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(toNumber(amount));
}

export function calculateItem(item) {
    const qty = toNumber(item?.qty);
    const price = toNumber(item?.price);
    const discountValue = toNumber(item?.discount);

    const subtotal = qty * price;

    const discount =
        item?.discountType === "percent"
            ? subtotal * (discountValue / 100)
            : discountValue;

    const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
    const net = Math.max(subtotal - safeDiscount, 0);

    return {
        subtotal,
        discount: safeDiscount,
        net,
    };
}

export function calculateInvoice(invoiceOrItems, discountTypeArg, discountArg) {
    const invoice = Array.isArray(invoiceOrItems)
        ? {
            items: invoiceOrItems,
            totalDiscountType: discountTypeArg || "amount",
            totalDiscount: discountArg || 0,
        }
        : invoiceOrItems || {};

    const items = Array.isArray(invoice.items) ? invoice.items : [];

    const lineTotals = items.reduce(
        (totals, item) => {
            const calculated = calculateItem(item);

            totals.subtotal += calculated.subtotal;
            totals.itemDiscounts += calculated.discount;
            totals.subtotalAfterItemDiscounts += calculated.net;

            return totals;
        },
        {
            subtotal: 0,
            itemDiscounts: 0,
            subtotalAfterItemDiscounts: 0,
        }
    );

    const { subtotal, itemDiscounts, subtotalAfterItemDiscounts } = lineTotals;

    const totalDiscountValue = toNumber(invoice.totalDiscount);

    const invoiceDiscount =
        invoice.totalDiscountType === "percent"
            ? subtotalAfterItemDiscounts * (totalDiscountValue / 100)
            : totalDiscountValue;

    const safeInvoiceDiscount = Math.min(
        Math.max(invoiceDiscount, 0),
        subtotalAfterItemDiscounts
    );

    const totalDiscount = itemDiscounts + safeInvoiceDiscount;

    const grandTotal = Math.max(
        subtotalAfterItemDiscounts - safeInvoiceDiscount,
        0
    );

    return {
        subtotal,
        itemDiscounts,
        invoiceDiscount: safeInvoiceDiscount,
        totalDiscount,
        grandTotal,
    };
}

export const calculateTotals = calculateInvoice;
