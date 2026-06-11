import { calculateItem, formatMoney } from "../utils/invoiceUtils";

export default function InvoicePreview({
                                           invoiceRef,
                                           invoice,
                                           qrImage,
                                           t,
                                           lang,
                                           slogan,
                                           logoUrl,
                                           totals,
                                       }) {
    const isPaid = invoice.status === "paid";

    function getItemName(item) {
        if (lang === "kh") {
            return item.nameKh || item.name || "-";
        }

        return item.name || item.nameKh || "-";
    }

    function getDiscountText(item, calculated) {
        const discountValue = Number(item.discount) || 0;

        if (discountValue <= 0) {
            return "-";
        }

        if (item.discountType === "percent") {
            return `${discountValue}% (${formatMoney(calculated.discount)})`;
        }

        return formatMoney(calculated.discount);
    }

    return (
        <article className="invoicePaper professionalInvoice" ref={invoiceRef}>
            {isPaid && <div className="paidStampMark">PAID</div>}

            <header className="proInvoiceHeader">
                <div className="proBrand">
                    <img src={logoUrl} alt="Cambodia Coffee" />

                    <div>
                        <h1>Cambodia Coffee</h1>
                        <p>{slogan[lang]}</p>
                        <span>{t.website}</span>
                    </div>
                </div>

                <div className="proInvoiceTitle">
                    <h2>{t.invoice}</h2>
                </div>
            </header>

            <section className="proInfoBar proInfoBarThree">
                <div>
                    <span>{t.invoiceNo}</span>
                    <strong>{invoice.invoiceNo}</strong>
                </div>

                <div>
                    <span>{t.date}</span>
                    <strong>{invoice.date}</strong>
                </div>

                <div>
                    <span>{t.currency}</span>
                    <strong>USD</strong>
                </div>
            </section>

            <section className="proCustomerSection">
                <div className="proCustomerBox">
                    <span>{t.billTo}</span>
                    <h3>{invoice.customerName || "-"}</h3>
                    <p>{invoice.customerPhone || "-"}</p>
                    <p>{invoice.customerAddress || "-"}</p>
                </div>

                <div className="proNoteBox">
                    <span>{t.note}</span>
                    <p>{invoice.note || t.thankYou}</p>
                </div>
            </section>

            <table className="proInvoiceTable">
                <thead>
                <tr>
                    <th>#</th>
                    <th>{t.description}</th>
                    <th>{t.qty}</th>
                    <th>{t.unitPrice}</th>
                    <th>{t.discount}</th>
                    <th>{t.total}</th>
                </tr>
                </thead>

                <tbody>
                {invoice.items.map((item, index) => {
                    const calculated = calculateItem(item);

                    return (
                        <tr key={item.uid}>
                            <td>{index + 1}</td>

                            <td>
                                <strong>{getItemName(item)}</strong>
                                {item.unit && <small>{item.unit}</small>}
                            </td>

                            <td>{item.qty || 0}</td>

                            <td>{formatMoney(item.price)}</td>

                            <td>{getDiscountText(item, calculated)}</td>

                            <td>
                                <strong>{formatMoney(calculated.net)}</strong>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            <section className="proBottomSection">
                <div className="proQrBox" style={qrBoxStyle}>
                    <span>{t.paymentQr}</span>

                    {qrImage ? (
                        <img src={qrImage} alt="Payment QR" style={qrImageStyle} />
                    ) : (
                        <div className="proEmptyQr" style={emptyQrStyle}>
                            QR
                        </div>
                    )}
                </div>

                <div className="proSummaryBox">
                    <div>
                        <span>{t.subtotal}</span>
                        <strong>{formatMoney(totals.subtotal)}</strong>
                    </div>

                    <div>
                        <span>{t.totalDiscount}</span>
                        <strong>- {formatMoney(totals.totalDiscount)}</strong>
                    </div>

                    <div className="proGrandTotal">
                        <span>{t.grandTotal}</span>
                        <strong>{formatMoney(totals.grandTotal)}</strong>
                    </div>
                </div>
            </section>

            <footer className="proInvoiceFooter">
                <p>{t.thankYou}</p>
                <strong>Cambodia Coffee</strong>
            </footer>
        </article>
    );
}

const qrBoxStyle = {
    minWidth: "260px",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
};

const qrImageStyle = {
    width: "220px",
    maxWidth: "100%",
    height: "auto",
    objectFit: "contain",
    display: "block",
};

const emptyQrStyle = {
    width: "220px",
    height: "220px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};