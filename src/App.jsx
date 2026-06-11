import { useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import {
  calculateInvoice,
  generateInvoiceNumber,
  getToday,
  newUid,
} from "./utils/InvoiceUtils.js";
import {
  hasAdminPassword,
  isLoggedIn,
  setLoggedIn as setStoredLoggedIn,
  setupAdminPassword,
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
    confirmPassword: "Confirm Password",
    setupPassword: "Set Admin Password",
    savePassword: "Save Password",
    signIn: "Sign In",
    wrongLogin: "Wrong password",
    passwordRequired: "Password must be at least 8 characters",
    passwordMismatch: "Passwords do not match",
    authError: "Could not save password. Please try again.",
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
    stampExisting: "Stamp Existing Invoice",
    website: "www.coffeecambodia.com",
  },

  kh: {
    login: "ចូលប្រើសម្រាប់អ្នកគ្រប់គ្រង",
    username: "ឈ្មោះអ្នកប្រើ",
    password: "ពាក្យសម្ងាត់",
    confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់",
    setupPassword: "កំណត់ពាក្យសម្ងាត់អ្នកគ្រប់គ្រង",
    savePassword: "រក្សាទុកពាក្យសម្ងាត់",
    signIn: "ចូលប្រើ",
    wrongLogin: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
    passwordRequired: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 8 តួអក្សរ",
    passwordMismatch: "ពាក្យសម្ងាត់មិនដូចគ្នា",
    authError: "មិនអាចរក្សាទុកពាក្យសម្ងាត់បានទេ សូមព្យាយាមម្តងទៀត",
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
    stampExisting: "បោះត្រាវិក្កយបត្រចាស់",
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

  const [passwordConfigured, setPasswordConfigured] = useState(hasAdminPassword);
  const [loggedIn, setLoggedInState] = useState(isLoggedIn);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [loginForm, setLoginForm] = useState({
    password: "",
  });

  const [setupForm, setSetupForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loginError, setLoginError] = useState("");

  const t = text[lang];

  const totals = useMemo(() => {
    return calculateInvoice(invoice);
  }, [invoice]);

  async function handleSetupPassword(e) {
    e.preventDefault();
    setLoginError("");

    if (setupForm.password.length < 8) {
      setLoginError(t.passwordRequired);
      return;
    }

    if (setupForm.password !== setupForm.confirmPassword) {
      setLoginError(t.passwordMismatch);
      return;
    }

    try {
      setIsAuthenticating(true);
      await setupAdminPassword(setupForm.password);
      setStoredLoggedIn(true);
      setPasswordConfigured(true);
      setLoggedInState(true);
      setSetupForm({
        password: "",
        confirmPassword: "",
      });
    } catch {
      setLoginError(t.authError);
    } finally {
      setIsAuthenticating(false);
    }
  }

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

  if (!passwordConfigured) {
    return (
        <main className="loginPage">
          <form className="loginCard" onSubmit={handleSetupPassword}>
            <img src={LOGO_URL} alt="Cambodia Coffee" />

            <h1>{t.setupPassword}</h1>
            <p>Cambodia Coffee {t.invoiceApp}</p>

            <label>
              {t.password}
              <input
                  type="password"
                  value={setupForm.password}
                  minLength="8"
                  autoComplete="new-password"
                  onChange={(e) =>
                      setSetupForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                  }
              />
            </label>

            <label>
              {t.confirmPassword}
              <input
                  type="password"
                  value={setupForm.confirmPassword}
                  minLength="8"
                  autoComplete="new-password"
                  onChange={(e) =>
                      setSetupForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                  }
              />
            </label>

            {loginError && <div className="errorMessage">{loginError}</div>}

            <button type="submit" className="primaryButton" disabled={isAuthenticating}>
              {isAuthenticating ? t.exporting : t.savePassword}
            </button>
          </form>
        </main>
    );
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
