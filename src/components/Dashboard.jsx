import { useEffect, useRef, useState } from "react";
import { products } from "../data/products";
import { calculateItem, formatMoney } from "../utils/InvoiceUtils.js";
import { exportAll, exportAsImage, exportAsPDF } from "../utils/exportInvoice.js";
import { CustomSelect, DatePicker } from "./FormControls";
import InvoicePreview from "./InvoicePreview";
import PaidStampTool from "./PaidStampTool";

const SUPPORTED_CURRENCY = "USD";

export default function Dashboard({
                                      lang,
                                      setLang,
                                      t,
                                      slogan,
                                      logoUrl,
                                      invoice,
                                      setInvoice,
                                      qrImage,
                                      setQrImage,
                                      totals,
                                      isExporting,
                                      setIsExporting,
                                      logout,
                                      newInvoice,
                                      blankItem,
                                  }) {
    const invoiceRef = useRef(null);
    const downloadMenuRef = useRef(null);
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

    const downloadLabel = lang === "kh" ? "ទាញយក" : "Download";
    const paidStampLabel =
        lang === "kh" ? "បោះត្រា PAID លើវិក្កយបត្រ" : "Add PAID stamp on invoice";

    const paidStampHelp =
        lang === "kh"
            ? "ធីកតែពេលអតិថិជនបានបង់ប្រាក់រួច។"
            : "Only tick this after the customer has paid.";
    const currency = SUPPORTED_CURRENCY;
    const isPaid = invoice.status === "paid";
    const statusText = invoice.status === "paid" ? t.paid : t.unpaid;
    const discountOptions = [
        { value: "percent", label: t.percent },
        { value: "amount", label: t.amount },
    ];
    const totalDiscountOptions = [
        { value: "amount", label: t.amount },
        { value: "percent", label: t.percent },
    ];
    const downloadChoices = [
        { value: "jpg", label: "JPG", hint: lang === "kh" ? "លំនាំដើម" : "Default" },
        { value: "pdf", label: "PDF", hint: lang === "kh" ? "ទំព័រតែមួយ" : "Single page" },
        { value: "png", label: "PNG", hint: lang === "kh" ? "គុណភាពខ្ពស់" : "High quality" },
        { value: "all", label: t.exportAll, hint: "JPG + PDF + PNG" },
    ];
    const languageOptions = [
        { value: "en", label: "English" },
        { value: "kh", label: "ខ្មែរ" },
    ];
    const calendarLocale = lang === "kh" ? "km-KH" : "en-US";

    useEffect(() => {
        function closeDownloadMenu(event) {
            if (!downloadMenuRef.current?.contains(event.target)) {
                setIsDownloadMenuOpen(false);
            }
        }

        function closeDownloadMenuOnEscape(event) {
            if (event.key === "Escape") {
                setIsDownloadMenuOpen(false);
            }
        }

        document.addEventListener("pointerdown", closeDownloadMenu);
        document.addEventListener("keydown", closeDownloadMenuOnEscape);

        return () => {
            document.removeEventListener("pointerdown", closeDownloadMenu);
            document.removeEventListener("keydown", closeDownloadMenuOnEscape);
        };
    }, []);

    function updateInvoice(field, value) {
        setInvoice((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function updateInvoiceWithUsd(field, value) {
        setInvoice((prev) => ({
            ...prev,
            currency: SUPPORTED_CURRENCY,
            [field]: value,
        }));
    }

    function updateItem(uid, patch) {
        setInvoice((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.uid === uid ? { ...item, ...patch } : item
            ),
        }));
    }

    function addItem() {
        setInvoice((prev) => ({
            ...prev,
            items: [...prev.items, blankItem()],
        }));
    }

    function removeItem(uid) {
        setInvoice((prev) => ({
            ...prev,
            items:
                prev.items.length === 1
                    ? [blankItem()]
                    : prev.items.filter((item) => item.uid !== uid),
        }));
    }

    function selectProduct(uid, productId) {
        const product = products.find((item) => item.id === productId);

        if (!product) {
            updateItem(uid, {
                productId: "",
            });
            return;
        }

        updateItem(uid, {
            productId: product.id,
            name: product.nameEn,
            nameKh: product.nameKh,
            unit: product.unit,
            price: product.price,
        });
    }

    function uploadQr(e) {
        if (isPaid) {
            e.target.value = "";
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setQrImage(reader.result);
            e.target.value = "";
        };

        reader.onerror = () => {
            alert("Could not read QR image.");
            e.target.value = "";
        };

        reader.readAsDataURL(file);
    }

    function updatePaymentStatus(nextStatus) {
        updateInvoice("status", nextStatus);

        if (nextStatus === "paid") {
            setQrImage("");
        }
    }

    async function downloadInvoice(type) {
        try {
            if (!invoiceRef.current) {
                throw new Error("Invoice preview is not ready.");
            }

            setIsExporting(true);
            invoiceRef.current.classList.add("exportMode");
            invoiceRef.current
                .closest(".previewPaperWrap")
                ?.classList.add("exportModeWrap");

            const fileName = `${invoice.invoiceNo}-${invoice.customerName || "customer"}`;

            if (type === "pdf") {
                await exportAsPDF(invoiceRef.current, fileName);
            }

            if (type === "png") {
                await exportAsImage(invoiceRef.current, fileName, "png");
            }

            if (type === "jpg") {
                await exportAsImage(invoiceRef.current, fileName, "jpg");
            }

            if (type === "all") {
                await exportAll(invoiceRef.current, fileName);
            }
        } catch (error) {
            alert(error.message || "Export failed");
        } finally {
            invoiceRef.current?.classList.remove("exportMode");
            invoiceRef.current
                ?.closest(".previewPaperWrap")
                ?.classList.remove("exportModeWrap");
            setIsExporting(false);
        }
    }

    return (
        <main className="app">
            <header className="appHeader">
                <div className="appBrand">
                    <img src={logoUrl} alt="Cambodia Coffee" />

                    <div>
                        <h1>Cambodia Coffee</h1>
                        <p>{slogan[lang]}</p>
                    </div>
                </div>

                <div className="headerActions">
                    <CustomSelect
                        value={lang}
                        options={languageOptions}
                        onChange={setLang}
                    />

                    <button type="button" onClick={newInvoice} className="outlineButton">
                        {t.newInvoice}
                    </button>

                    <button type="button" onClick={logout} className="outlineButton">
                        {t.logout}
                    </button>
                </div>
            </header>

            <section className="layout">
                <aside className="editor">
                    <div className="mobileTotalBar">
                        <span>{t.grandTotal}</span>
                        <strong>{formatMoney(totals.grandTotal, currency)}</strong>
                    </div>

                    <div className="summaryPanel">
                        <div>
                            <span>{t.subtotal}</span>
                            <strong>{formatMoney(totals.subtotal, currency)}</strong>
                        </div>

                        <div>
                            <span>{t.totalDiscount}</span>
                            <strong>{formatMoney(totals.totalDiscount, currency)}</strong>
                        </div>

                        <div>
                            <span>{t.status}</span>
                            <strong className={isPaid ? "paidText" : ""}>
                                {statusText}
                            </strong>
                        </div>
                    </div>

                    <div className="card">
                        <h2>{t.invoiceInfo}</h2>

                        <div className="grid2">
                            <label>
                                {t.invoiceNo}
                                <input
                                    value={invoice.invoiceNo}
                                    readOnly
                                />
                            </label>

                            <label>
                                {t.date}
                                <DatePicker
                                    value={invoice.date}
                                    locale={calendarLocale}
                                    onChange={(value) =>
                                        updateInvoiceWithUsd("date", value)
                                    }
                                />
                            </label>
                        </div>
                    </div>

                    <div className="card">
                        <h2>{t.customer}</h2>

                        <label>
                            {t.name}
                            <input
                                value={invoice.customerName}
                                placeholder={t.name}
                                onChange={(e) => updateInvoice("customerName", e.target.value)}
                            />
                        </label>

                        <label>
                            {t.phone}
                            <input
                                inputMode="tel"
                                value={invoice.customerPhone}
                                placeholder={t.phone}
                                onChange={(e) => updateInvoice("customerPhone", e.target.value)}
                            />
                        </label>

                        <label>
                            {t.address}
                            <textarea
                                rows="3"
                                value={invoice.customerAddress}
                                placeholder={t.address}
                                onChange={(e) =>
                                    updateInvoice("customerAddress", e.target.value)
                                }
                            />
                        </label>
                    </div>

                    <div className="card">
                        <div className="cardTitleRow">
                            <h2>{t.items}</h2>

                            <button type="button" onClick={addItem} className="smallButton">
                                + {t.addItem}
                            </button>
                        </div>

                        <div className="itemsEditor">
                            {invoice.items.map((item, index) => {
                                const itemTotal = calculateItem(item);

                                return (
                                    <div className="itemBox" key={item.uid}>
                                        <div className="itemTop">
                                            <strong>
                                                {index + 1}. {t.itemName}
                                            </strong>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.uid)}
                                                className="removeButton"
                                            >
                                                {t.remove}
                                            </button>
                                        </div>

                                        <label>
                                            {t.product}
                                            <CustomSelect
                                                value={item.productId}
                                                onChange={(value) =>
                                                    selectProduct(item.uid, value)
                                                }
                                                options={[
                                                    {
                                                        value: "",
                                                        label: t.selectProduct,
                                                    },
                                                    ...products.map((product) => ({
                                                        value: product.id,
                                                        label:
                                                            lang === "kh"
                                                                ? product.nameKh ||
                                                                  product.nameEn
                                                                : product.nameEn,
                                                    })),
                                                ]}
                                            />
                                        </label>

                                        <label>
                                            {t.itemName}
                                            <input
                                                value={lang === "kh" ? item.nameKh : item.name}
                                                onChange={(e) =>
                                                    updateItem(item.uid, {
                                                        productId: "",
                                                        [lang === "kh" ? "nameKh" : "name"]:
                                                        e.target.value,
                                                    })
                                                }
                                            />
                                        </label>

                                        <div className="grid3">
                                            <label>
                                                {t.qty}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        updateItem(item.uid, { qty: e.target.value })
                                                    }
                                                />
                                            </label>

                                            <label>
                                                {t.price}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) =>
                                                        updateItem(item.uid, { price: e.target.value })
                                                    }
                                                />
                                            </label>

                                            <label>
                                                {t.discountType}
                                                <CustomSelect
                                                    value={item.discountType}
                                                    onChange={(value) =>
                                                        updateItem(item.uid, {
                                                            discountType: value,
                                                        })
                                                    }
                                                    options={discountOptions}
                                                />
                                            </label>
                                        </div>

                                        <div className="grid2">
                                            <label>
                                                {t.discount}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.discount}
                                                    onChange={(e) =>
                                                        updateItem(item.uid, { discount: e.target.value })
                                                    }
                                                />
                                            </label>

                                            <div className="lineTotal">
                                                <span>{t.total}</span>
                                                <strong>
                                                    {formatMoney(itemTotal.net, currency)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card">
                        <h2>{t.totalDiscount}</h2>

                        <div className="grid2">
                            <label>
                                {t.discountType}
                                <CustomSelect
                                    value={invoice.totalDiscountType}
                                    onChange={(value) =>
                                        updateInvoice("totalDiscountType", value)
                                    }
                                    options={totalDiscountOptions}
                                />
                            </label>

                            <label>
                                {t.discount}
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={invoice.totalDiscount}
                                    onChange={(e) =>
                                        updateInvoice("totalDiscount", e.target.value)
                                    }
                                />
                            </label>
                        </div>
                    </div>

                    <div className="card paymentCard">
                        <h2>{t.payment}</h2>

                        <label className="checkboxLine">
                            <input
                                type="checkbox"
                                checked={isPaid}
                                onChange={(e) =>
                                    updatePaymentStatus(
                                        e.target.checked ? "paid" : "unpaid"
                                    )
                                }
                            />

                            <span>
                                <strong>{paidStampLabel}</strong>
                                <small>{paidStampHelp}</small>
                            </span>
                        </label>

                        {!isPaid && (
                            <>
                                <label className="uploadBox">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={uploadQr}
                                    />
                                    {t.uploadQr}
                                </label>

                                {qrImage && (
                                    <button
                                        type="button"
                                        onClick={() => setQrImage("")}
                                        className="outlineButton full"
                                    >
                                        {t.removeQr}
                                    </button>
                                )}
                            </>
                        )}

                        <textarea
                            className="noteInput"
                            rows="3"
                            value={invoice.note}
                            onChange={(e) => updateInvoice("note", e.target.value)}
                            placeholder={t.thankYou}
                        />
                    </div>

                    <details className="advancedPanel">
                        <summary>{t.stampExisting}</summary>
                        <PaidStampTool />
                    </details>

                    <div className="downloadBar downloadMenuBar" ref={downloadMenuRef}>
                        <button
                            type="button"
                            disabled={isExporting}
                            onClick={() =>
                                setIsDownloadMenuOpen((current) => !current)
                            }
                        >
                            {isExporting ? t.exporting : downloadLabel}
                        </button>

                        {isDownloadMenuOpen && (
                            <div className="downloadChoicePanel">
                                {downloadChoices.map((choice) => (
                                    <button
                                        type="button"
                                        key={choice.value}
                                        className={
                                            choice.value === "jpg"
                                                ? "downloadChoice recommended"
                                                : "downloadChoice"
                                        }
                                        disabled={isExporting}
                                        onClick={async () => {
                                            setIsDownloadMenuOpen(false);
                                            await downloadInvoice(choice.value);
                                        }}
                                    >
                                        <span>{choice.label}</span>
                                        <small>{choice.hint}</small>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="preview">
                    <div className="previewTop">
                        <h2>{t.preview}</h2>
                        <strong>{formatMoney(totals.grandTotal, currency)}</strong>
                    </div>

                    <div className="previewPaperWrap">
                        <InvoicePreview
                            invoiceRef={invoiceRef}
                            invoice={invoice}
                            qrImage={qrImage}
                            t={t}
                            lang={lang}
                            slogan={slogan}
                            logoUrl={logoUrl}
                            totals={totals}
                        />
                    </div>
                </section>
            </section>
        </main>
    );
}
