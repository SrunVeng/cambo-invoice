export function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export function newUid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getToday() {
    return new Date().toISOString().slice(0, 10);
}

export function generateInvoiceNumber() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);

    return `INV-${year}${month}${day}-${random}`;
}

export function cleanFileName(name) {
    return String(name || "invoice")
        .trim()
        .replace(/[^\w\-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
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

    const subtotal = items.reduce((sum, item) => {
        return sum + calculateItem(item).subtotal;
    }, 0);

    const itemDiscounts = items.reduce((sum, item) => {
        return sum + calculateItem(item).discount;
    }, 0);

    const subtotalAfterItemDiscounts = items.reduce((sum, item) => {
        return sum + calculateItem(item).net;
    }, 0);

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