import { useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import {
  calculateInvoice,
  generateInvoiceNumber,
  getToday,
  newUid,
} from "./utils/InvoiceUtils.js";
import {
  isLoggedIn,
  setLoggedIn as setStoredLoggedIn,
  verifyAdminPassword,
} from "./utils/auth.js";

const LOGO_URL = "/cambodia-coffee-logo.png";

const slogan = {
  en: "By Cambodians, to Cambodians",
  kh: "ដោយប្រជាជនកម្ពុជា សម្រាប់ប្រជាជនកម្ពុជា",
};

const text = {
  en: {
    login: "Admin Login",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    wrongLogin: "Wrong password",
    invoiceApp: "Digital Invoice",
    logout: "Logout",
    newInvoice: "New Invoice",
    language: "Language",
    invoiceInfo: "Invoice Info",
    invoiceNo: "Invoice No.",
    date: "Date",
    status: "Status",
    paid: "Paid",
    unpaid: "Unpaid",
    currency: "Currency",
    customer: "Customer",
    name: "Name",
    phone: "Phone",
    address: "Address",
    items: "Items",
    product: "Product",
    selectProduct: "Select product",
    itemName: "Item name",
    qty: "Qty",
    price: "Price",
    discount: "Discount",
    discountType: "Discount Type",
    percent: "%",
    amount: "Amount",
    addItem: "Add Item",
    remove: "Remove",
    totalDiscount: "Total Discount",
    payment: "Payment",
    paymentQr: "Payment QR",
    uploadQr: "Choose QR image",
    removeQr: "Remove QR",
    qrReady: "QR image ready",
    replaceQr: "Tap to replace",
    qrImageTypes: "PNG / JPG / WebP",
    customerPaid: "Customer already paid",
    customerPaidHelp: "Shows a PAID mark on this invoice and hides the QR payment code.",
    note: "Note",
    invoice: "INVOICE",
    billTo: "Bill To",
    description: "Description",
    unitPrice: "Unit Price",
    total: "Total",
    subtotal: "Subtotal",
    grandTotal: "Grand Total",
    paymentStatus: "Payment Status",
    paidStatus: "PAID",
    unpaidStatus: "UNPAID",
    thankYou: "Thank you for choosing Cambodia Coffee.",
    exportPdf: "PDF",
    exportPng: "PNG",
    exportJpg: "JPG",
    exportAll: "All",
    exporting: "Exporting...",
    previewFirst: "Preview first",
    preview: "Invoice Preview",
    previewInvoice: "Preview invoice",
    reviewInvoice: "Review",
    closePreview: "Close preview",
    editInvoice: "Edit",
    stampExisting: "Update existing invoice as paid",
    updatePaidInvoiceHelp: "Upload a PDF, PNG, or JPG invoice and download a copy marked PAID.",
    website: "www.coffeecambodia.com",
  },

  kh: {
    login: "ចូលប្រើសម្រាប់អ្នកគ្រប់គ្រង",
    username: "ឈ្មោះអ្នកប្រើ",
    password: "ពាក្យសម្ងាត់",
    signIn: "ចូលប្រើ",
    wrongLogin: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
    invoiceApp: "វិក្កយបត្រឌីជីថល",
    logout: "ចេញ",
    newInvoice: "វិក្កយបត្រថ្មី",
    language: "ភាសា",
    invoiceInfo: "ព័ត៌មានវិក្កយបត្រ",
    invoiceNo: "លេខវិក្កយបត្រ",
    date: "កាលបរិច្ឆេទ",
    status: "ស្ថានភាព",
    paid: "បានបង់",
    unpaid: "មិនទាន់បង់",
    currency: "រូបិយប័ណ្ណ",
    customer: "អតិថិជន",
    name: "ឈ្មោះ",
    phone: "លេខទូរស័ព្ទ",
    address: "អាសយដ្ឋាន",
    items: "មុខទំនិញ",
    product: "ផលិតផល",
    selectProduct: "ជ្រើសរើសផលិតផល",
    itemName: "ឈ្មោះមុខទំនិញ",
    qty: "ចំនួន",
    price: "តម្លៃ",
    discount: "បញ្ចុះតម្លៃ",
    discountType: "ប្រភេទបញ្ចុះតម្លៃ",
    percent: "%",
    amount: "ចំនួនទឹកប្រាក់",
    addItem: "បន្ថែម",
    remove: "លុប",
    totalDiscount: "បញ្ចុះតម្លៃសរុប",
    payment: "ការបង់ប្រាក់",
    paymentQr: "QR បង់ប្រាក់",
    uploadQr: "ជ្រើសរើសរូបភាព QR",
    removeQr: "លុប QR",
    qrReady: "រូបភាព QR រួចរាល់",
    replaceQr: "ចុចដើម្បីប្តូរ",
    qrImageTypes: "PNG / JPG / WebP",
    customerPaid: "អតិថិជនបានបង់ប្រាក់រួច",
    customerPaidHelp: "បង្ហាញសញ្ញា PAID លើវិក្កយបត្រ និងលាក់ QR បង់ប្រាក់។",
    note: "ចំណាំ",
    invoice: "វិក្កយបត្រ",
    billTo: "ចេញវិក្កយបត្រជូន",
    description: "បរិយាយ",
    unitPrice: "តម្លៃរាយ",
    total: "សរុប",
    subtotal: "សរុបរង",
    grandTotal: "សរុបចុងក្រោយ",
    paymentStatus: "ស្ថានភាពបង់ប្រាក់",
    paidStatus: "បានបង់",
    unpaidStatus: "មិនទាន់បង់",
    thankYou: "សូមអរគុណដែលបានជ្រើសរើស Cambodia Coffee។",
    exportPdf: "PDF",
    exportPng: "PNG",
    exportJpg: "JPG",
    exportAll: "ទាំងអស់",
    exporting: "កំពុងទាញយក...",
    previewFirst: "មើលមុន",
    preview: "មើលវិក្កយបត្រ",
    previewInvoice: "មើលវិក្កយបត្រ",
    reviewInvoice: "ពិនិត្យមើល",
    closePreview: "បិទការមើល",
    editInvoice: "កែ",
    stampExisting: "ធ្វើបច្ចុប្បន្នភាពវិក្កយបត្រថាបានបង់",
    updatePaidInvoiceHelp: "បញ្ចូលវិក្កយបត្រ PDF, PNG ឬ JPG ហើយទាញយកច្បាប់ចម្លងដែលមានសញ្ញា PAID។",
    website: "www.coffeecambodia.com",
  },
};

function blankItem() {
  return {
    uid: newUid(),
    productId: "",
    name: "",
    nameKh: "",
    unit: "",
    qty: 1,
    price: 0,
    discountType: "percent",
    discount: 0,
  };
}

function blankInvoice() {
  return {
    invoiceNo: generateInvoiceNumber(),
    date: getToday(),
    status: "unpaid",
    currency: "USD",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    totalDiscountType: "amount",
    totalDiscount: 0,
    note: "",
    items: [blankItem()],
  };
}

export default function App() {
  const [lang, setLang] = useState("kh");
  const [invoice, setInvoice] = useState(blankInvoice);
  const [qrImage, setQrImage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const [loggedIn, setLoggedInState] = useState(isLoggedIn);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [loginForm, setLoginForm] = useState({
    password: "",
  });

  const [loginError, setLoginError] = useState("");

  const t = text[lang];

  const totals = useMemo(() => {
    return calculateInvoice(invoice);
  }, [invoice]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");

    try {
      setIsAuthenticating(true);
      const isPasswordValid = await verifyAdminPassword(loginForm.password);

      if (isPasswordValid) {
        setStoredLoggedIn(true);
        setLoggedInState(true);
        setLoginForm({
          password: "",
        });
        return;
      }

      setStoredLoggedIn(false);
      setLoggedInState(false);
      setLoginError(t.wrongLogin);
    } catch {
      setLoginError(t.wrongLogin);
    } finally {
      setIsAuthenticating(false);
    }
  }

  function logout() {
    setStoredLoggedIn(false);
    setLoggedInState(false);
  }

  function newInvoice() {
    setInvoice(blankInvoice());
    setQrImage("");
  }

  if (!loggedIn) {
    return (
        <main className="loginPage">
          <form className="loginCard" onSubmit={handleLogin}>
            <img src={LOGO_URL} alt="Cambodia Coffee" />

            <h1>{t.login}</h1>
            <p>Cambodia Coffee {t.invoiceApp}</p>

            <label>
              {t.password}
              <input
                  type="password"
                  value={loginForm.password}
                  autoComplete="current-password"
                  onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                  }
              />
            </label>

            {loginError && <div className="errorMessage">{loginError}</div>}

            <button type="submit" className="primaryButton" disabled={isAuthenticating}>
              {isAuthenticating ? t.exporting : t.signIn}
            </button>
          </form>
        </main>
    );
  }

  return (
      <Dashboard
          lang={lang}
          setLang={setLang}
          t={t}
          slogan={slogan}
          logoUrl={LOGO_URL}
          invoice={invoice}
          setInvoice={setInvoice}
          qrImage={qrImage}
          setQrImage={setQrImage}
          totals={totals}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          logout={logout}
          newInvoice={newInvoice}
          blankItem={blankItem}
      />
  );
}
