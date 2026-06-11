import { useRef, useState } from "react";
import { products } from "../data/products";
import { calculateItem, formatMoney } from "../utils/invoiceUtils";
import { exportAll, exportAsImage, exportAsPDF } from "../utils/exportInvoice";
import InvoicePreview from "./InvoicePreview";
import PaidStampTool from "./PaidStampTool";

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
    const [downloadType, setDownloadType] = useState("pdf");

    const downloadLabel = lang === "kh" ? "ទាញយក" : "Download";
    const paidStampLabel =
        lang === "kh" ? "បោះត្រា PAID លើវិក្កយបត្រ" : "Add PAID stamp on invoice";

    const paidStampHelp =
        lang === "kh"
            ? "ធីកតែពេលអតិថិជនបានបង់ប្រាក់រួច។"
            : "Only tick this after the customer has paid.";

    function updateInvoice(field, value) {
        setInvoice((prev) => ({
            ...prev,
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
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            setQrImage(reader.result);
        };

        reader.readAsDataURL(file);
    }

    async function downloadInvoice(type) {
        try {
            if (!invoiceRef.current) {
                throw new Error("Invoice preview is not ready.");
            }

            setIsExporting(true);

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
                    <select value={lang} onChange={(e) => setLang(e.target.value)}>
                        <option value="en">English</option>
                        <option value="kh">ខ្មែរ</option>
                    </select>

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
                    <div className="card">
                        <h2>{t.invoiceInfo}</h2>

                        <div className="grid2">
                            <label>
                                {t.invoiceNo}
                                <input
                                    value={invoice.invoiceNo}
                                    onChange={(e) => updateInvoice("invoiceNo", e.target.value)}
                                />
                            </label>

                            <label>
                                {t.date}
                                <input
                                    type="date"
                                    value={invoice.date}
                                    onChange={(e) => updateInvoice("date", e.target.value)}
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
                                onChange={(e) => updateInvoice("customerName", e.target.value)}
                            />
                        </label>

                        <label>
                            {t.phone}
                            <input
                                value={invoice.customerPhone}
                                onChange={(e) => updateInvoice("customerPhone", e.target.value)}
                            />
                        </label>

                        <label>
                            {t.address}
                            <textarea
                                rows="3"
                                value={invoice.customerAddress}
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
                                            <select
                                                value={item.productId}
                                                onChange={(e) =>
                                                    selectProduct(item.uid, e.target.value)
                                                }
                                            >
                                                <option value="">{t.selectProduct}</option>

                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {lang === "kh"
                                                            ? product.nameKh || product.nameEn
                                                            : product.nameEn}
                                                    </option>
                                                ))}
                                            </select>
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
                                                <select
                                                    value={item.discountType}
                                                    onChange={(e) =>
                                                        updateItem(item.uid, {
                                                            discountType: e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="percent">{t.percent}</option>
                                                    <option value="amount">{t.amount}</option>
                                                </select>
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
                                                <strong>{formatMoney(itemTotal.net)}</strong>
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
                                <select
                                    value={invoice.totalDiscountType}
                                    onChange={(e) =>
                                        updateInvoice("totalDiscountType", e.target.value)
                                    }
                                >
                                    <option value="amount">{t.amount}</option>
                                    <option value="percent">{t.percent}</option>
                                </select>
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

                    <div className="card">
                        <h2>{t.paymentQr}</h2>

                        <label className="uploadBox">
                            <input type="file" accept="image/*" onChange={uploadQr} />
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
                    </div>

                    <div className="card">
                        <h2>{t.note}</h2>

                        <textarea
                            rows="3"
                            value={invoice.note}
                            onChange={(e) => updateInvoice("note", e.target.value)}
                            placeholder={t.thankYou}
                        />
                    </div>

                    <div className="card">
                        <h2>Payment Stamp</h2>

                        <label className="checkboxLine">
                            <input
                                type="checkbox"
                                checked={invoice.status === "paid"}
                                onChange={(e) =>
                                    updateInvoice("status", e.target.checked ? "paid" : "unpaid")
                                }
                            />

                            <span>
                <strong>{paidStampLabel}</strong>
                <small>{paidStampHelp}</small>
              </span>
                        </label>
                    </div>

                    <PaidStampTool />

                    <div className="downloadBar singleDownloadBar">
                        <select
                            value={downloadType}
                            onChange={(e) => setDownloadType(e.target.value)}
                        >
                            <option value="pdf">PDF</option>
                            <option value="png">PNG</option>
                            <option value="jpg">JPG</option>
                            <option value="all">{t.exportAll}</option>
                        </select>

                        <button
                            type="button"
                            disabled={isExporting}
                            onClick={() => downloadInvoice(downloadType)}
                        >
                            {isExporting ? t.exporting : downloadLabel}
                        </button>
                    </div>
                </aside>

                <section className="preview">
                    <div className="previewTop">
                        <h2>{t.preview}</h2>
                        <strong>{formatMoney(totals.grandTotal)}</strong>
                    </div>

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
                </section>
            </section>
        </main>
    );
}