import { useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import {
  calculateInvoice,
  generateInvoiceNumber,
  getToday,
  newUid,
} from "./utils/invoiceUtils";

const LOGO_URL = "/cambodia-coffee-logo.png";

const ADMIN = {
  username: "admin",
  password: "coffee123",
};

const slogan = {
  en: "By Cambodians, to Cambodians and the world",
  kh: "ដោយប្រជាជនកម្ពុជា សម្រាប់ប្រជាជនកម្ពុជា និងពិភពលោក",
};

const text = {
  en: {
    login: "Admin Login",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    wrongLogin: "Wrong username or password",
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
    paymentQr: "Payment QR",
    uploadQr: "Upload QR",
    removeQr: "Remove QR",
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
    preview: "Invoice Preview",
    website: "www.coffeecambodia.com",
  },

  kh: {
    login: "ចូលប្រើសម្រាប់អ្នកគ្រប់គ្រង",
    username: "ឈ្មោះអ្នកប្រើ",
    password: "ពាក្យសម្ងាត់",
    signIn: "ចូលប្រើ",
    wrongLogin: "ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
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
    paymentQr: "QR បង់ប្រាក់",
    uploadQr: "បញ្ចូល QR",
    removeQr: "លុប QR",
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
    preview: "មើលវិក្កយបត្រ",
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
  const [lang, setLang] = useState("en");
  const [invoice, setInvoice] = useState(blankInvoice);
  const [qrImage, setQrImage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const [loggedIn, setLoggedIn] = useState(
      localStorage.getItem("coffee_invoice_logged_in") === "yes"
  );

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");

  const t = text[lang];

  const totals = useMemo(() => {
    return calculateInvoice(invoice);
  }, [invoice]);

  function handleLogin(e) {
    e.preventDefault();

    if (
        loginForm.username === ADMIN.username &&
        loginForm.password === ADMIN.password
    ) {
      localStorage.setItem("coffee_invoice_logged_in", "yes");
      setLoggedIn(true);
      setLoginError("");
      return;
    }

    setLoginError(t.wrongLogin);
  }

  function logout() {
    localStorage.removeItem("coffee_invoice_logged_in");
    setLoggedIn(false);
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
              {t.username}
              <input
                  value={loginForm.username}
                  onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                  }
                  placeholder="admin"
              />
            </label>

            <label>
              {t.password}
              <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                  }
                  placeholder="coffee123"
              />
            </label>

            {loginError && <div className="errorMessage">{loginError}</div>}

            <button type="submit" className="primaryButton">
              {t.signIn}
            </button>

            <small>Default: admin / coffee123</small>
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