const { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc, getDoc, onSnapshot } = window.fs;
const runTransactionFn = window.fs.runTransaction;
const db = window.db;

const usersCollection = window.usersCollection;
const booksCollection = window.booksCollection;
const loansCollection = window.loansCollection;
const MAX_ACTIVE_BORROW = 3;  
        window.books = [];
        window.loans = [];
        window.currentUser = null;
        window.currentPage = 1;
        window.booksPerPage = 9;
        window.onlyOverdue = false;

let books = window.books;
let loans = window.loans;
let currentUser = window.currentUser;
let currentPage = window.currentPage;
let lastBPP = window.lastBPP ?? 9;

function syncState() {
  window.books = books;
  window.loans = loans;
  window.currentUser = currentUser;
  window.currentPage = currentPage;
  window.lastBPP = lastBPP;
}
async function isUserLocked(username) {
  try {
    const snap = await getDoc(doc(db, "users", username));
    if (!snap.exists()) return false;
    return !!snap.data().locked;
  } catch (e) {
    console.error(e);
    return false;
  }
}
window.isUserLocked = isUserLocked;

const ADMIN_LOW_STOCK_DEFAULT = 3;
const MAX_RENEWALS = 2;
const RENEW_DAYS = 7;
const DEFAULT_FINE_PER_DAY = 5000;
window.adminBookState = window.adminBookState || {
  keyword: "",
  filterBy: "title",
  sortBy: "newest",
  lowStockOnly: false,
  lowStockThreshold: ADMIN_LOW_STOCK_DEFAULT
};
window.penaltySettings = window.penaltySettings || {
  enabled: false,
  perDay: DEFAULT_FINE_PER_DAY
};
window.appDataState = window.appDataState || {
  initialLoaded: false,
  loading: true,
  hasError: false
};

function updateAppDataState(patch = {}) {
  window.appDataState = {
    ...(window.appDataState || {}),
    ...patch
  };
}

const IMPORT_COLUMN_ALIASES = {
  title: ["title", "booktitle", "tensach", "name"],
  author: ["author", "tacgia"],
  stock: ["stock", "tonkho", "soluong"],
  img: ["img", "image", "urlanh", "anh", "cover"],
  desc: ["desc", "description", "mota"],
  addedBy: ["addedby", "nguoithem", "createdby"],
  category: ["category", "danhmuc"],
  tag: ["tag", "tags", "nhan"],
  year: ["year", "nam", "namxuatban"],
  publisher: ["publisher", "nhaxuatban", "nxb"],
  createdAt: ["createdat", "ngaythem", "createdtime"]
};

function normalizeHeaderKey(key) {
  return String(key || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeComparableText(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function hasDuplicateBookTitleInList(sourceBooks, title, ignoreId = "") {
  const target = normalizeComparableText(title);
  if (!target) return null;

  const skipId = normalizeText(ignoreId);
  for (const rawBook of sourceBooks || []) {
    const book = normalizeBookRecord(rawBook || {});
    if (skipId && normalizeText(book.id) === skipId) continue;
    if (normalizeComparableText(book.title) !== target) continue;
    return book;
  }
  return null;
}

async function findDuplicateBookByTitle(title, ignoreId = "") {
  const localDuplicate = hasDuplicateBookTitleInList(books, title, ignoreId);
  if (localDuplicate) return localDuplicate;

  try {
    const snapshot = await getDocs(booksCollection);
    const remoteBooks = [];
    snapshot.forEach((d) => remoteBooks.push({ id: d.id, ...d.data() }));
    return hasDuplicateBookTitleInList(remoteBooks, title, ignoreId);
  } catch (error) {
    console.error("Duplicate title check error:", error);
    return null;
  }
}

function normalizeBookYear(value) {
  const raw = normalizeText(value);
  if (!raw) return "";
  const year = Number(raw);
  if (!Number.isFinite(year)) return "";
  return Math.trunc(year);
}

function normalizeBookStock(value) {
  const stock = Number(value);
  if (!Number.isFinite(stock) || stock < 0) return 0;
  return Math.trunc(stock);
}

function getCreatedAtTimestamp(createdAt) {
  if (typeof createdAt === "number" && Number.isFinite(createdAt)) return createdAt;
  const parsed = Date.parse(String(createdAt || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBookRecord(book = {}) {
  return {
    ...book,
    title: normalizeText(book.title),
    author: normalizeText(book.author),
    stock: normalizeBookStock(book.stock),
    img: normalizeText(book.img),
    desc: normalizeText(book.desc),
    addedBy: normalizeText(book.addedBy),
    category: normalizeText(book.category),
    tag: normalizeText(book.tag),
    year: normalizeBookYear(book.year),
    publisher: normalizeText(book.publisher),
    createdAt: book.createdAt ?? ""
  };
}

function defaultAddedBy() {
  return normalizeText(currentUser?.name || currentUser?.username || "Admin");
}

async function findUserDocByUsername(rawUsername) {
  const source = normalizeText(rawUsername);
  if (!source) return null;

  const candidates = [...new Set([source, source.toUpperCase(), source.toLowerCase()])];
  for (const candidate of candidates) {
    const snap = await getDoc(doc(db, "users", candidate));
    if (snap.exists()) return { id: candidate, data: snap.data() };
  }
  return null;
}

function readAdminBookStateFromDom() {
  const keyword = normalizeText(document.getElementById("adminBookKeyword")?.value);
  const filterBy = normalizeText(document.getElementById("adminBookFilterField")?.value || "title");
  const sortBy = normalizeText(document.getElementById("adminBookSort")?.value || "newest");
  const lowStockOnly = !!document.getElementById("adminLowStockOnly")?.checked;
  const thresholdRaw = Number(document.getElementById("adminLowStockThreshold")?.value);
  const lowStockThreshold = Number.isFinite(thresholdRaw) && thresholdRaw >= 0
    ? Math.trunc(thresholdRaw)
    : ADMIN_LOW_STOCK_DEFAULT;

  window.adminBookState = {
    ...window.adminBookState,
    keyword,
    filterBy,
    sortBy,
    lowStockOnly,
    lowStockThreshold
  };
}

window.syncAdminBookControls = function () {
  const state = window.adminBookState || {};
  const keywordEl = document.getElementById("adminBookKeyword");
  const filterEl = document.getElementById("adminBookFilterField");
  const sortEl = document.getElementById("adminBookSort");
  const lowStockEl = document.getElementById("adminLowStockOnly");
  const thresholdEl = document.getElementById("adminLowStockThreshold");

  if (keywordEl) keywordEl.value = state.keyword || "";
  if (filterEl) filterEl.value = state.filterBy || "title";
  if (sortEl) sortEl.value = state.sortBy || "newest";
  if (lowStockEl) lowStockEl.checked = !!state.lowStockOnly;
  if (thresholdEl) {
    const threshold = Number(state.lowStockThreshold);
    thresholdEl.value = Number.isFinite(threshold) ? String(Math.max(0, Math.trunc(threshold))) : String(ADMIN_LOW_STOCK_DEFAULT);
  }
};

window.getFilteredAdminBooks = function (sourceBooks = []) {
  const state = window.adminBookState || {};
  const keyword = normalizeText(state.keyword).toLowerCase();
  const filterBy = normalizeText(state.filterBy || "title");
  const sortBy = normalizeText(state.sortBy || "newest");
  const lowStockOnly = !!state.lowStockOnly;
  const threshold = Number.isFinite(Number(state.lowStockThreshold))
    ? Math.max(0, Number(state.lowStockThreshold))
    : ADMIN_LOW_STOCK_DEFAULT;

  const filtered = sourceBooks
    .map((book) => normalizeBookRecord(book))
    .filter((book) => {
      if (lowStockOnly && Number(book.stock) > threshold) return false;
      if (!keyword) return true;

      const fields = {
        title: String(book.title || ""),
        author: String(book.author || ""),
        addedBy: String(book.addedBy || ""),
        category: String(book.category || ""),
        publisher: String(book.publisher || ""),
        tag: String(book.tag || "")
      };

      if (fields[filterBy] !== undefined) {
        return fields[filterBy].toLowerCase().includes(keyword);
      }
      return Object.values(fields).some((value) => value.toLowerCase().includes(keyword));
    });

  filtered.sort((a, b) => {
    if (sortBy === "stockAsc") return Number(a.stock) - Number(b.stock);
    if (sortBy === "stockDesc") return Number(b.stock) - Number(a.stock);
    if (sortBy === "titleAsc") return String(a.title || "").localeCompare(String(b.title || ""), "vi");
    return getCreatedAtTimestamp(b.createdAt) - getCreatedAtTimestamp(a.createdAt);
  });

  return filtered;
};

window.applyAdminBookFilters = function () {
  readAdminBookStateFromDom();
  window.renderAdminBooks?.();
};

window.resetAdminBookFilters = function () {
  window.adminBookState = {
    keyword: "",
    filterBy: "title",
    sortBy: "newest",
    lowStockOnly: false,
    lowStockThreshold: ADMIN_LOW_STOCK_DEFAULT
  };
  window.syncAdminBookControls?.();
  window.renderAdminBooks?.();
};

window.formatBookCreatedAt = function (createdAt) {
  const ts = getCreatedAtTimestamp(createdAt);
  if (!ts) return "--";
  return new Date(ts).toLocaleString("vi-VN");
};

let realtimeStarted = false;
let unsubscribeBooks = null;
let unsubscribeLoans = null;

function renderDataDrivenViews() {
  window.renderAll?.();
  if (currentUser?.role === "admin") {
    window.renderAdminApprovals?.();
    window.renderAdminActiveLoans?.();
    const usersSection = document.getElementById("section-admin-users");
    if (usersSection && usersSection.style.display !== "none") window.renderUsers?.();
  } else {
    const mySection = document.getElementById("section-my-books");
    if (mySection && mySection.style.display !== "none") window.renderStudentLoans?.();
  }
}

function startRealtimeSync() {
  if (realtimeStarted || typeof onSnapshot !== "function") return false;
  realtimeStarted = true;

  let pendingInitial = 2;
  updateAppDataState({
    loading: true,
    hasError: false
  });
  renderDataDrivenViews();
  window.startLoading?.();
  const doneOne = () => {
    pendingInitial -= 1;
    if (pendingInitial <= 0) {
      updateAppDataState({
        initialLoaded: true,
        loading: false
      });
      window.stopLoading?.();
      renderDataDrivenViews();
    }
  };

  unsubscribeBooks = onSnapshot(
    booksCollection,
    (snapshot) => {
      books = [];
      snapshot.forEach((d) => books.push(normalizeBookRecord({ id: d.id, ...d.data() })));
      syncState();
      renderDataDrivenViews();
      if (pendingInitial > 0) doneOne();
    },
    (error) => {
      console.error("Realtime books error:", error);
      window.showToast?.("Loi realtime books: " + error.message, "error", 4200);
      updateAppDataState({ hasError: true });
      if (pendingInitial > 0) doneOne();
    }
  );

  unsubscribeLoans = onSnapshot(
    loansCollection,
    (snapshot) => {
      loans = [];
      snapshot.forEach((d) => loans.push({ id: d.id, ...d.data() }));
      syncState();
      renderDataDrivenViews();
      if (pendingInitial > 0) doneOne();
    },
    (error) => {
      console.error("Realtime loans error:", error);
      window.showToast?.("Loi realtime loans: " + error.message, "error", 4200);
      updateAppDataState({ hasError: true });
      if (pendingInitial > 0) doneOne();
    }
  );

  window.stopRealtimeSync = function () {
    if (typeof unsubscribeBooks === "function") unsubscribeBooks();
    if (typeof unsubscribeLoans === "function") unsubscribeLoans();
    unsubscribeBooks = null;
    unsubscribeLoans = null;
    realtimeStarted = false;
  };

  return true;
}

window.loadData = async function() {
  if (startRealtimeSync()) return;

  updateAppDataState({
    loading: true,
    hasError: false
  });
  renderDataDrivenViews();

  if (window.withLoading) {
    await window.withLoading(async () => {
      try {
        const booksSnapshot = await getDocs(booksCollection);
        books = [];
        booksSnapshot.forEach((d) => books.push(normalizeBookRecord({ id: d.id, ...d.data() })));

        const loansSnapshot = await getDocs(loansCollection);
        loans = [];
        loansSnapshot.forEach((d) => loans.push({ id: d.id, ...d.data() }));

        syncState();
        updateAppDataState({
          initialLoaded: true,
          loading: false,
          hasError: false
        });
        renderDataDrivenViews();
      } catch (error) {
        console.error("Load data error:", error);
        window.showToast?.("Loi tai du lieu: " + error.message, "error", 4200);
        updateAppDataState({
          initialLoaded: true,
          loading: false,
          hasError: true
        });
        renderDataDrivenViews();
      }
    });
    return;
  }

  try {
    const booksSnapshot = await getDocs(booksCollection);
    books = [];
    booksSnapshot.forEach((d) => books.push(normalizeBookRecord({ id: d.id, ...d.data() })));
    const loansSnapshot = await getDocs(loansCollection);
    loans = [];
    loansSnapshot.forEach((d) => loans.push({ id: d.id, ...d.data() }));
    syncState();
    updateAppDataState({
      initialLoaded: true,
      loading: false,
      hasError: false
    });
    renderDataDrivenViews();
  } catch (error) {
    console.error("Load data error:", error);
    updateAppDataState({
      initialLoaded: true,
      loading: false,
      hasError: true
    });
    renderDataDrivenViews();
  }
}
window.requestBorrow = async function(bookId, triggerBtn) {
           if(!currentUser) return alert("Vui lòng đăng nhập!");

  // Bu?c 2: check kh�a
                const locked = await isUserLocked(currentUser.username);
           if (locked) return alert("Tài khoản đã bị KHÓA, không thể đăng ký mượn!");

  // Bu?c 3: gi?i h?n t?i da 3 cu?n (pending + active)
                     const myCount = loans.filter(l =>
                      l.username === currentUser.username &&
                  (l.status === "pending" || l.status === "active")
                 ).length;

           if (myCount >= MAX_ACTIVE_BORROW) {
                return alert(`Bạn chỉ được tối đa ${MAX_ACTIVE_BORROW} cuốn (đang mượn + chờ duyệt).`);
  }

            const alreadyRequested = loans.some(l =>
                l.username === currentUser.username &&
                l.bookId === bookId &&
                (l.status === "pending" || l.status === "active")
            );
            if (alreadyRequested) {
                return alert("Bạn đã đăng ký hoặc đang mượn cuốn này rồi.");
            }

                    const book = books.find(b => b.id === bookId);
            if(!book) return alert("Không tìm thấy sách này!");
            if(book.stock <= 0) return alert("Sách này đã hết!");

             if(!confirm(`Mượn cuốn "${book.title}" nhé?`)) return;

  const run = async () => {
    await addDoc(loansCollection, {
      username: currentUser.username,
      bookId: bookId,
      bookTitle: book.title,
      status: 'pending',
      date: new Date().toLocaleDateString('vi-VN')
    });
    alert("Đã gửi yêu cầu! Chờ Admin duyệt.");
    loadData();
  };

  if (triggerBtn && window.runWithButtonBusy) {
    return window.runWithButtonBusy(triggerBtn, "Đang gửi...", run);
  }
  if (window.withLoading) return window.withLoading(run);
  return run();
}

function parseVNDate(s) {
  const parts = String(s || "").trim().split("/");
  if (parts.length !== 3) return null;

  const dd = Number(parts[0]);
  const mm = Number(parts[1]);
  const yyyy = Number(parts[2]);
  if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yyyy)) return null;
  if (yyyy < 1000 || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;

  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}
function isOverdue(dueStr) {
  const due = parseVNDate(dueStr);
  if (!due) return false;
  const today = new Date();
  return new Date(due.getFullYear(), due.getMonth(), due.getDate())
       < new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatVNDate(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleDateString("vi-VN");
}

function getLoanDueDate(loan) {
  if (!loan) return "";
  if (loan.dueDate) return loan.dueDate;

  const base = parseVNDate(loan.borrowDate || loan.date);
  if (!base) return "";
  const d = new Date(base);
  d.setDate(d.getDate() + 7);
  return formatVNDate(d);
}

function getCalendarDateOnly(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

function calcOverdueDays(dueStr, refDate = new Date()) {
  const due = parseVNDate(dueStr);
  if (!due) return 0;
  const dueDate = getCalendarDateOnly(due);
  const ref = getCalendarDateOnly(refDate);
  const diff = Math.floor((ref - dueDate) / (24 * 60 * 60 * 1000));
  return diff > 0 ? diff : 0;
}

function calcFineAmount(overdueDays) {
  if (!window.penaltySettings?.enabled) return 0;
  const perDay = Number(window.penaltySettings?.perDay || 0);
  if (!Number.isFinite(perDay) || perDay <= 0) return 0;
  return overdueDays * perDay;
}

function toSafeText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sameUser(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function getStatusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return '<span style="color:#f39c12;font-weight:700;">Chờ duyệt</span>';
  if (s === "active") return '<span style="color:#27ae60;font-weight:700;">Đang mượn</span>';
  if (s === "returned") return '<span style="color:#2980b9;font-weight:700;">Đã trả</span>';
  if (s === "rejected") return '<span style="color:#c0392b;font-weight:700;">Từ chối</span>';
  return `<span>${toSafeText(status || "--")}</span>`;
}

function parseAnyDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const vn = parseVNDate(String(value));
  if (vn) return vn;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDateTime(value) {
  const d = parseAnyDate(value);
  if (!d) return value ? String(value) : "--";
  const raw = String(value || "");
  if (raw.includes("T")) return d.toLocaleString("vi-VN");
  return d.toLocaleDateString("vi-VN");
}

function getLoanTimelineTs(loan) {
  const direct = parseAnyDate(loan?.returnedAt) || parseAnyDate(loan?.borrowDate) || parseAnyDate(loan?.date);
  return direct ? direct.getTime() : 0;
}

async function finalizeReturnLoan(loan, returnMethod = "admin-confirm") {
  if (!loan) throw new Error("Không tìm thấy phiếu mượn.");
  if (loan.status !== "active") throw new Error("Phiếu này không ở trạng thái đang mượn.");

  const returnedAtIso = new Date().toISOString();
  let outcome = null;

  if (typeof runTransactionFn === "function") {
    await runTransactionFn(db, async (tx) => {
      const loanRef = doc(db, "loans", loan.id);
      const liveLoanSnap = await tx.get(loanRef);
      if (!liveLoanSnap.exists()) throw new Error("Không tìm thấy phiếu mượn.");

      const liveLoan = { id: loan.id, ...liveLoanSnap.data() };
      if (liveLoan.status !== "active") {
        throw new Error("Phiếu mượn không hợp lệ hoặc không còn active.");
      }

      const dueDate = getLoanDueDate(liveLoan);
      const overdueDays = calcOverdueDays(dueDate, new Date());
      const fineAmount = calcFineAmount(overdueDays);
      const payload = {
        status: "returned",
        returnedAt: returnedAtIso,
        overdueDays,
        fineAmount,
        returnMethod
      };
      if (!liveLoan.dueDate && dueDate) payload.dueDate = dueDate;

      const bookRef = doc(db, "books", liveLoan.bookId);
      const liveBookSnap = await tx.get(bookRef);
      let nextStock = null;
      if (liveBookSnap.exists()) {
        nextStock = Number(liveBookSnap.data().stock || 0) + 1;
        tx.update(bookRef, { stock: nextStock });
      }

      tx.update(loanRef, payload);
      outcome = { payload, overdueDays, fineAmount, bookId: liveLoan.bookId, nextStock };
    });
  } else {
    const dueDate = getLoanDueDate(loan);
    const overdueDays = calcOverdueDays(dueDate, new Date());
    const fineAmount = calcFineAmount(overdueDays);
    const payload = {
      status: "returned",
      returnedAt: returnedAtIso,
      overdueDays,
      fineAmount,
      returnMethod
    };
    if (!loan.dueDate && dueDate) payload.dueDate = dueDate;

    const bookRef = doc(db, "books", loan.bookId);
    const bookSnap = await getDoc(bookRef);
    let nextStock = null;
    if (bookSnap.exists()) {
      nextStock = Number(bookSnap.data().stock || 0) + 1;
      await updateDoc(bookRef, { stock: nextStock });
    }
    await updateDoc(doc(db, "loans", loan.id), payload);
    outcome = { payload, overdueDays, fineAmount, bookId: loan.bookId, nextStock };
  }

  if (!outcome) throw new Error("Không thể xác nhận trả sách.");

  const loanInMem = loans.find((l) => l.id === loan.id);
  if (loanInMem) Object.assign(loanInMem, outcome.payload);

  const bookInMem = books.find((b) => b.id === outcome.bookId);
  if (bookInMem && Number.isFinite(Number(outcome.nextStock))) {
    bookInMem.stock = Number(outcome.nextStock);
  }

  syncState();
  return { overdueDays: outcome.overdueDays, fineAmount: outcome.fineAmount };
}
window.deleteBook = async function(id, triggerBtn) {
            const isBusy = loans.some(l =>
                l.bookId === id && (l.status === 'active' || l.status === 'pending')
            );

            if (isBusy) {
                alert("Khong the xoa: sach dang co nguoi muon/cho duyet.");
                return;
            }
            if(!confirm("Bạn chắc chắn muốn xóa cuốn sách này khỏi kho?")) return;

            const run = async () => {
              try {
                  await deleteDoc(doc(db, "books", id));
                  alert("Đã xóa thành công!");
                  loadData();
              } catch (e) {
                  console.error(e);
                  alert("Lỗi: " + e.message);
              }
            };

            if (triggerBtn && window.runWithButtonBusy) {
              return window.runWithButtonBusy(triggerBtn, "Đang xóa...", run);
            }
            if (window.withLoading) return window.withLoading(run);
            return run();
        }
window.openEditModal = function(id) {
            const book = books.find(b => b.id === id);
            if (!book) return;

            document.getElementById('bookId').value = book.id; 
            document.getElementById('bookTitle').value = book.title;
            document.getElementById('bookAuthor').value = book.author;
            document.getElementById('bookStock').value = book.stock;
            document.getElementById('bookAddedBy').value = book.addedBy || defaultAddedBy();
            document.getElementById('bookCategory').value = book.category || "";
            document.getElementById('bookTag').value = book.tag || "";
            document.getElementById('bookYear').value = book.year || "";
            document.getElementById('bookPublisher').value = book.publisher || "";
            
            // Luu ?nh cu
            document.getElementById('bookTitle').dataset.img = book.img;

            document.getElementById('modalTitle').innerText = "CẬP NHẬT SÁCH";
            toggleModal('bookModal');
        }
window.handleSaveBook = async function() {
            const id = document.getElementById('bookId').value;
            const titleInput = document.getElementById('bookTitle');
            const title = titleInput.value.trim();
            const author = document.getElementById('bookAuthor').value.trim();
            const stockInput = document.getElementById('bookStock');
            const stock = Number(stockInput.value);
            const addedBy = normalizeText(document.getElementById('bookAddedBy')?.value || defaultAddedBy());
            const category = normalizeText(document.getElementById('bookCategory')?.value);
            const tag = normalizeText(document.getElementById('bookTag')?.value);
            const yearRaw = normalizeText(document.getElementById('bookYear')?.value);
            const publisher = normalizeText(document.getElementById('bookPublisher')?.value);
            const year = normalizeBookYear(yearRaw);
            
            // ?nh: L?y t? API ho?c d�ng ?nh cu/m?c d?nh
            const tempImg = titleInput.dataset.img; 
            const finalImg = tempImg ? tempImg : 'https://placehold.co/200x300?text=Sach';

            // 1. VALIDATION (Ki?m tra d? li?u d?u v�o)
            if(!title) return alert("Vui lòng nhập tên sách!");
            if(!author) return alert("Vui lòng nhập tên tác giả!");
            
            // --> Ki?m tra s? �m ? d�y
            if (stock < 0 || isNaN(stock)) {
                return alert("Số lượng sách không hợp lệ! (Phải lớn hơn hoặc bằng 0)");
            }
            if (yearRaw && year === "") {
                return alert("Năm xuất bản không hợp lệ.");
            }

            const duplicateBook = await findDuplicateBookByTitle(title, id);
            if (duplicateBook) {
                return alert(`Sách "${duplicateBook.title}" đã có sẵn trong kho!`);
            }

            window.startLoading?.();
            try {
                const btn = document.querySelector('#bookModal button[type="submit"]');
                btn.innerText = "Đang lưu...";
                btn.disabled = true;

                const existingBook = id ? books.find((b) => b.id === id) : null;
                const payload = normalizeBookRecord({
                    title,
                    author,
                    stock,
                    img: finalImg,
                    desc: existingBook?.desc || "",
                    addedBy: addedBy || defaultAddedBy(),
                    category,
                    tag,
                    year,
                    publisher,
                    createdAt: existingBook?.createdAt || new Date().toISOString()
                });

                if (id) {
                    // --- �ANG S?A ---
                    await updateDoc(doc(db, "books", id), payload);
                    alert("Đã cập nhật sách!");
                } else {
                    // --- �ANG TH�M M?I ---
                    await addDoc(booksCollection, payload);
                    alert("Đã thêm sách mới!");
                }
                
                document.getElementById('bookModal').style.display = 'none';
                
                // Reset form
                document.getElementById('bookId').value = "";
                titleInput.value = "";
                document.getElementById('bookAuthor').value = "";
                stockInput.value = "";
                document.getElementById('bookAddedBy').value = defaultAddedBy();
                document.getElementById('bookCategory').value = "";
                document.getElementById('bookTag').value = "";
                document.getElementById('bookYear').value = "";
                document.getElementById('bookPublisher').value = "";
                titleInput.dataset.img = "";
                document.getElementById('modalTitle').innerText = "THÊM SÁCH MỚI";

                loadData();
            } catch (e) {
                console.error(e);
                alert("Lỗi: " + e.message);
            } finally {
                // Tr? l?i n�t b?m d� c� l?i hay kh�ng
                const btn = document.querySelector('#bookModal button[type="submit"]');
                if(btn) {
                    btn.innerText = "LƯU LẠI";
                    btn.disabled = false;
                }
                window.stopLoading?.();
            }
        }
window.autoFillBook  = async function() {
            const titleInput = document.getElementById('bookTitle');
            const keyword = titleInput.value.trim();
            if (!keyword) return alert("Nhập tên sách trước!");

            const btn = event.target; 
            btn.innerText = "?...";
            
            try {
                const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(keyword)}&maxResults=1`);
                const data = await res.json();
                
                if (data.items && data.items.length > 0) {
                    const info = data.items[0].volumeInfo;
                    titleInput.value = info.title;
                    document.getElementById('bookAuthor').value = info.authors ? info.authors.join(', ') : "Không rõ";
                    
                    if (info.imageLinks?.thumbnail) {
                        titleInput.dataset.img = info.imageLinks.thumbnail;
                        alert(`Đã tìm thấy: ${info.title}`);
                    }
                } else {
                    alert("Không tìm thấy sách này!");
                }
            } catch (e) { console.error(e); }
            btn.innerText = "Tìm";
        }
window.seedData = async function() {
            if(!confirm("Nạp 20 sách mẫu vào kho?")) return;
            try {
                const res = await fetch('https://api.itbook.store/1.0/new');
                const data = await res.json();
                for (const book of data.books) {
                    await addDoc(booksCollection, normalizeBookRecord({
                        title: book.title, 
                        author: book.subtitle || "IT Expert", 
                        stock: Math.floor(Math.random() * 20) + 1, 
                        img: book.image,
                        addedBy: defaultAddedBy(),
                        category: "CNTT",
                        tag: "sample",
                        year: "",
                        publisher: "",
                        createdAt: new Date().toISOString()
                    }));
                }
                alert("Xong!"); loadData();
            } catch (e) { alert("Lỗi: " + e.message); }
        }
// H�M �ANG NH?P (KI?M TRA TR?C TI?P TR�N FIREBASE)
window.handleLogin = async function() {
            console.log("?? B?t d?u dang nh?p...");

            const uInput = document.getElementById('username');
            const pInput = document.getElementById('password');

            // 1. Ki?m tra xem � nh?p c� t?n t?i kh�ng
            if (!uInput || !pInput) {
                return alert("Lỗi: Không tìm thấy ô nhập liệu trong HTML!");
            }

            const u = uInput.value.trim();
            const p = pInput.value.trim();

            if (!u || !p) return alert("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!");

            // 2. S?a l?i t�m n�t (D�ng ID c?a Modal d? t�m cho chu?n)
            const btn = document.querySelector('#loginModal button'); 
            
            // N?u t�m th?y n�t th� m?i d?i ch?, kh�ng th� th�i (tr�nh l?i)
            let oldText = "ĐĂNG NHẬP";
            if (btn) {
                oldText = btn.innerText;
                btn.innerText = "Đang kiểm tra...";
                btn.disabled = true; // Kh�a n�t l?i d? kh�ng b?m li�n t?c
            }

            try {
                // 3. G?i l�n Firebase ki?m tra
                const matchedUser = await findUserDocByUsername(u);

                if (matchedUser) {
                    const matchedUserId = matchedUser.id;
                    const userData = matchedUser.data || {};
                    if (userData.locked) {
                        alert("Tài khoản đã bị KHÓA. Liên hệ admin!");
                        return;
                    }
                    // So s�nh m?t kh?u (Luu �: pass tr�n Firebase ph?i gi?ng h?t pass nh?p v�o)
                    if (String(userData.pass) === String(p)) {
                        alert(`Xin chào, ${userData.name}!`);
                        
                        // Luu user v�o b? nh? tr�nh duy?t
                        currentUser = {
                          ...userData,
                          username: userData.username || matchedUserId
                        };
                        syncState();
                        localStorage.setItem('library_user', JSON.stringify(currentUser));
                        
                        // ?n b?ng dang nh?p & C?p nh?t giao di?n
                        toggleModal('loginModal');
                        checkUserStatus();
                        
                        // X�a tr?ng � nh?p
                        uInput.value = "";
                        pInput.value = "";
                    } else {
                        alert("Mật khẩu không đúng!");
                    }
                } else {
                    alert("Tài khoản này không tồn tại!");
                }
            } catch (e) {
                console.error(e);
                alert("Lỗi kết nối: " + e.message);
            } finally {
                // 4. Tr? l?i tr?ng th�i cu cho n�t
                if (btn) {
                    btn.innerText = oldText;
                    btn.disabled = false;
                }
            }
        }

        window.handleLogout = function() {
            currentUser = null;
            syncState();
            localStorage.removeItem('library_user');
            location.reload();
        }
window.checkUserStatus = function() {
            // 1. L?y user t? b? nh? n?u chua c� bi?n currentUser
            if(!currentUser) {
                const saved = localStorage.getItem('library_user');
                if(saved) currentUser = JSON.parse(saved);
            }
            syncState();

            const menuAdmin = document.getElementById('menu-admin');
            const menuStudent = document.getElementById('menu-student');
            const mobileMenuAdmin = document.getElementById('mobileMenuAdmin');
            const mobileMenuStudent = document.getElementById('mobileMenuStudent');
            if (menuAdmin) menuAdmin.style.display = 'none';
            if (menuStudent) menuStudent.style.display = 'none';
            if (mobileMenuAdmin) mobileMenuAdmin.style.display = 'none';
            if (mobileMenuStudent) mobileMenuStudent.style.display = 'none';
            
            // 2. Ki?m tra v� hi?n th? giao di?n
            if(currentUser) {
                isUserLocked(currentUser.username).then((locked) => {
                    if (locked) {
                        alert("Tài khoản của bạn đã bị khóa.");
                        handleLogout();
                    }
                });
                // C?p nh?t n�t ? g�c tr�n b�n ph?i
                const btn = document.querySelector('.login-btn');
                if(btn) {
                    btn.innerText = `Hi, ${currentUser.name}`;
                    btn.onclick = handleLogout;
                }

                // T? d?ng di?n t�n v� m� SV v�o trang "H? so c� nh�n"
                const nameDisplay = document.getElementById('profileNameDisplay');
                const idDisplay = document.getElementById('profileIdDisplay');
                
                if (nameDisplay) nameDisplay.innerText = currentUser.name; // V� d?: Nguy?n Van A
                if (idDisplay) idDisplay.innerText = currentUser.username; // V� d?: N21DCCN001
                // -------------------------------------

                // Ph�n quy?n hi?n th? Menu (Admin / Sinh vi�n)
                if(currentUser.role === 'admin') {
                    if(menuAdmin) menuAdmin.style.display = 'block';
                    if(menuStudent) menuStudent.style.display = 'none';
                    if(mobileMenuAdmin) mobileMenuAdmin.style.display = 'block';
                    if(mobileMenuStudent) mobileMenuStudent.style.display = 'none';
                    
                    // N?u m?i v�o trang th� m? lu�n tab qu?n l�
                    // (Ch? m? n?u chua ch?n tab n�o kh�c)
                    // showSection('admin-books'); 
                } else {
                    if(menuStudent) menuStudent.style.display = 'block';
                    if(menuAdmin) menuAdmin.style.display = 'none';
                    if(mobileMenuStudent) mobileMenuStudent.style.display = 'block';
                    if(mobileMenuAdmin) mobileMenuAdmin.style.display = 'none';
                    
                    // showSection('home');
                }
            } else {
                const btn = document.querySelector('.login-btn');
                if (btn) {
                  btn.innerText = "ĐĂNG NHẬP";
                  btn.onclick = () => toggleModal('loginModal');
                }
                const nameDisplay = document.getElementById('profileNameDisplay');
                const idDisplay = document.getElementById('profileIdDisplay');
                if (nameDisplay) nameDisplay.innerText = "Chưa đăng nhập";
                if (idDisplay) idDisplay.innerText = "(MSSV)";
            }
            
            // V? l?i d? li?u s�ch
            renderAll();
        }
//Admin duy?t / tr? / gia h?n
        // H�M X? L� DUY?T MU?N (ADMIN)
        
window.handleApprove = async function(btn, loanId, bookId, isApproved) {
    if (!confirm(isApproved ? "Duyệt cho mượn sách này?" : "Từ chối yêu cầu này?")) return;

    const rowEl = btn ? btn.closest('tr') : null;

    if (rowEl) {
        rowEl.style.opacity = '0.5';
        rowEl.querySelectorAll('button').forEach(b => b.disabled = true);
    }

    window.startLoading?.();
    try {
        if (isApproved) {
        const borrowDate = new Date().toLocaleDateString("vi-VN");
        const d = new Date(); d.setDate(d.getDate() + RENEW_DAYS);
        const dueDate = d.toLocaleDateString("vi-VN");
        const activePayload = {
          status: "active",
          borrowDate,
          dueDate,
          renewalCount: 0,
          fineAmount: 0,
          overdueDays: 0
        };

        if (typeof runTransactionFn === "function") {
          await runTransactionFn(db, async (tx) => {
            const loanRef = doc(db, "loans", loanId);
            const bookRef = doc(db, "books", bookId);

            const liveLoanSnap = await tx.get(loanRef);
            if (!liveLoanSnap.exists()) throw new Error("Không tìm thấy phiếu mượn.");
            const liveLoan = liveLoanSnap.data() || {};
            if (String(liveLoan.status || "") !== "pending") {
              throw new Error("Phiếu mượn không còn ở trạng thái chờ duyệt.");
            }

            const liveBookSnap = await tx.get(bookRef);
            if (!liveBookSnap.exists()) throw new Error("Không tìm thấy sách này!");
            const liveStock = Number(liveBookSnap.data().stock || 0);
            if (liveStock <= 0) throw new Error("Sách này vừa hết hàng, không thể duyệt!");

            tx.update(bookRef, { stock: liveStock - 1 });
            tx.update(loanRef, activePayload);
          });
        } else {
          const bookRef = doc(db, "books", bookId);
          const bookInMem = books.find((b) => b.id === bookId);
          if (!bookInMem || Number(bookInMem.stock) <= 0) {
            if (rowEl) {
              rowEl.style.opacity = "1";
              rowEl.querySelectorAll("button").forEach((b) => b.disabled = false);
            }
            alert("Sách này vừa hết hàng, không thể duyệt!");
            return;
          }

          await updateDoc(bookRef, { stock: Number(bookInMem.stock) - 1 });
          await updateDoc(doc(db, "loans", loanId), activePayload);
        }

        const loanInMem = loans.find((l) => l.id === loanId);
        if (loanInMem) Object.assign(loanInMem, activePayload);

        const bookInMem = books.find((b) => b.id === bookId);
        if (bookInMem) bookInMem.stock = Math.max(0, Number(bookInMem.stock || 0) - 1);

        syncState();

        if (rowEl) rowEl.remove();

        const tableBody = document.getElementById('adminApprovalTable');
        if (tableBody && tableBody.querySelectorAll('tr').length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Không có yêu cầu nào mới</td></tr>`;
        }

        alert("Đã duyệt thành công!");

        } else {
        const rejectedAt = new Date().toISOString();
        const rejectPayload = {
          status: "rejected",
          rejectedAt
        };

        await updateDoc(doc(db, "loans", loanId), rejectPayload);

        const loanInMem = loans.find(l => l.id === loanId);
        if (loanInMem) Object.assign(loanInMem, rejectPayload);
        syncState();

        if (rowEl) rowEl.remove();

        const tableBody = document.getElementById('adminApprovalTable');
        if (tableBody && tableBody.querySelectorAll('tr').length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Không có yêu cầu nào mới</td></tr>`;
        }

        alert("Đã từ chối yêu cầu.");
        }

    } catch (e) {
        console.error(e);

        if (rowEl) {
        rowEl.style.opacity = '1';
        rowEl.querySelectorAll('button').forEach(b => b.disabled = false);
        }

        alert("Lỗi: " + e.message);
    } finally {
        window.stopLoading?.();
    }
    };
// 2. H�M HI?N TH? DUY?T MU?N CHO ADMIN (Menu: Duy?t y�u c?u)
window.renderAdminApprovals = function () {
    const table = document.getElementById("adminApprovalTable");
    if (!table || !currentUser || currentUser.role !== "admin") return;

    table.innerHTML = "";

    const pendingLoans = loans.filter((l) => l.status === "pending");

    if (pendingLoans.length === 0) {
        table.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Không có yêu cầu nào mới</td></tr>`;
        return;
    }

    pendingLoans.forEach((loan) => {
        table.innerHTML += `
        <tr>
            <td>${(loan.id || "").slice(0, 5)}...</td>
            <td><b>${loan.username}</b></td>
            <td>${loan.bookTitle}</td>
            <td>${loan.date}</td>
            <td>
            <div class="action-group">
                <button class="btn-table btn-approve"
                onclick="handleApprove(this, '${loan.id}', '${loan.bookId}', true)">Duyệt</button>
                <button class="btn-table btn-reject"
                onclick="handleApprove(this, '${loan.id}', '${loan.bookId}', false)">Từ chối</button>
            </div>
            </td>
        </tr>`;
    });
    };
window.renderAdminActiveLoans = function() {
        const table = document.getElementById('adminActiveLoansTable');
        if (!table) return;

        const ruleLabel = document.getElementById("renewalRuleLabel");
        if (ruleLabel) ruleLabel.textContent = `Gia hạn tối đa ${MAX_RENEWALS} lần, mỗi lần +${RENEW_DAYS} ngày.`;

        window.syncPenaltyControls?.();
        table.innerHTML = "";
        const onlyOverdue = !!window.onlyOverdue;

        const activeLoans = loans.filter(l => l.status === 'active');

        if (activeLoans.length === 0) {
            table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:gray;">Hiện không có ai đang mượn sách.</td></tr>`;
            window.refreshDirectReturnOptions?.();
            return;
        }

        let rendered = 0;
        activeLoans.forEach(loan => {
            const finalDueDate = getLoanDueDate(loan) || "--";
            const overdueDays = calcOverdueDays(finalDueDate, new Date());
            if (onlyOverdue && overdueDays <= 0) return;

            const renewalCount = Number(loan.renewalCount || 0);
            const remainRenew = Math.max(0, MAX_RENEWALS - renewalCount);
            const canRenew = remainRenew > 0;
            const fineAmount = calcFineAmount(overdueDays);

            const statusHtml = overdueDays > 0
              ? `<span style="color:#c0392b;font-weight:800;">QUÁ HẠN ${overdueDays} ngày</span>`
              : `<span style="color:#27ae60;font-weight:800;">ĐANG MƯỢN</span>`;

            const fineHtml = window.penaltySettings?.enabled
              ? `<div style="margin-top:4px; color:#b71c1c; font-weight:700;">Phạt tạm tính: ${fineAmount.toLocaleString("vi-VN")} d</div>`
              : `<div style="margin-top:4px; color:#888;">Phí phạt: tắt</div>`;

            rendered++;
            table.innerHTML += `
            <tr>
                <td>${toSafeText((loan.id || "").substring(0, 5))}...</td>
                <td style="font-weight:bold; color:#2980b9;">${toSafeText(loan.username)}</td>
                <td>${toSafeText(loan.bookTitle)}</td>
                <td>${toSafeText(loan.borrowDate || loan.date || "--")}</td>

                <td>
                    <div class="due-date-wrapper">
                        <span>${toSafeText(finalDueDate)}</span>
                        <button class="btn-edit-small" ${canRenew ? "" : "disabled"}
                          title="${canRenew ? `Còn ${remainRenew} lượt` : "Đã hết lượt gia hạn"}"
                          onclick="updateDueDate('${loan.id}', this)">
                          +${RENEW_DAYS}d
                        </button>
                    </div>
                    <div style="font-size:12px; color:#666; margin-top:4px;">Gia hạn: ${renewalCount}/${MAX_RENEWALS}</div>
                </td>

                <td>
                  ${statusHtml}
                  ${fineHtml}
                  <button class="btn-table btn-approve"
                    style="margin-top:8px;"
                    onclick="adminReturnBook(this, '${loan.id}', '${loan.bookId}')">
                    Xác nhận trả
                  </button>
                </td>
            </tr>`;
        });

        if (rendered === 0) {
            table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:gray;">Không có bản ghi quá hạn.</td></tr>`;
        }

        window.refreshDirectReturnOptions?.();
    }
window.setOnlyOverdue = function(checked) {
    window.onlyOverdue = !!checked;
    renderAdminActiveLoans();
}
window.syncPenaltyControls = function() {
  const ckb = document.getElementById("enablePenaltyCheckbox");
  const perDayInput = document.getElementById("penaltyPerDayInput");
  if (ckb) ckb.checked = !!window.penaltySettings?.enabled;
  if (perDayInput) {
    const perDay = Number(window.penaltySettings?.perDay || DEFAULT_FINE_PER_DAY);
    perDayInput.value = Number.isFinite(perDay) && perDay >= 0 ? String(Math.trunc(perDay)) : String(DEFAULT_FINE_PER_DAY);
  }
};

window.togglePenaltyEnabled = function(checked) {
  window.penaltySettings = {
    ...window.penaltySettings,
    enabled: !!checked
  };
  window.renderAdminActiveLoans?.();
  window.updateDirectReturnHint?.();
};

window.setPenaltyPerDay = function(value) {
  const perDay = Number(value);
  if (!Number.isFinite(perDay) || perDay < 0) {
    alert("Phạt/ngày phải là số >= 0.");
    window.syncPenaltyControls?.();
    return;
  }
  window.penaltySettings = {
    ...window.penaltySettings,
    perDay: Math.trunc(perDay)
  };
  window.renderAdminActiveLoans?.();
  window.updateDirectReturnHint?.();
};

window.refreshDirectReturnOptions = function(preferredUser = "") {
  const userSelect = document.getElementById("directReturnUser");
  const loanSelect = document.getElementById("directReturnLoan");
  if (!userSelect || !loanSelect) return;

  const activeLoans = loans.filter((l) => l.status === "active");
  if (!activeLoans.length) {
    userSelect.innerHTML = `<option value="">Không có độc giả đang mượn</option>`;
    loanSelect.innerHTML = `<option value="">Không có sách đang mượn</option>`;
    const hint = document.getElementById("directReturnHint");
    if (hint) hint.textContent = "Hiện không có bản ghi active để trả trực tiếp.";
    return;
  }

  const users = [...new Set(activeLoans.map((l) => l.username).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "vi"));

  let selectedUser = preferredUser || userSelect.value;
  if (!users.some((u) => sameUser(u, selectedUser))) selectedUser = users[0];

  userSelect.innerHTML = users
    .map((u) => `<option value="${toSafeText(u)}" ${sameUser(u, selectedUser) ? "selected" : ""}>${toSafeText(u)}</option>`)
    .join("");

  const loansOfUser = activeLoans.filter((l) => sameUser(l.username, selectedUser));
  loanSelect.innerHTML = loansOfUser
    .map((l) => `<option value="${toSafeText(l.id)}">${toSafeText(l.bookTitle)} | Hạn: ${toSafeText(getLoanDueDate(l) || "--")}</option>`)
    .join("");

  if (!loansOfUser.length) {
    loanSelect.innerHTML = `<option value="">Không có sách đang mượn</option>`;
  }
  window.updateDirectReturnHint?.();
};

window.onDirectReturnUserChange = function() {
  const user = document.getElementById("directReturnUser")?.value || "";
  window.refreshDirectReturnOptions?.(user);
};

window.updateDirectReturnHint = function() {
  const hint = document.getElementById("directReturnHint");
  const loanId = document.getElementById("directReturnLoan")?.value;
  if (!hint) return;
  if (!loanId) {
    hint.textContent = "Chọn độc giả và sách để trả trực tiếp.";
    return;
  }

  const loan = loans.find((l) => l.id === loanId && l.status === "active");
  if (!loan) {
    hint.textContent = "Không tìm thấy phiếu active phù hợp.";
    return;
  }

  const dueDate = getLoanDueDate(loan);
  const overdueDays = calcOverdueDays(dueDate, new Date());
  const fine = calcFineAmount(overdueDays);
  hint.textContent = `Sẽ trả sách "${loan.bookTitle}" của ${loan.username}. Quá hạn: ${overdueDays} ngày, phạt: ${fine.toLocaleString("vi-VN")} d.`;
};

window.handleDirectReturn = async function(triggerBtn) {
  const loanId = document.getElementById("directReturnLoan")?.value;
  if (!loanId) return alert("Vui lòng chọn sách cần trả.");

  const loan = loans.find((l) => l.id === loanId);
  if (!loan || loan.status !== "active") return alert("Phiếu mượn không hợp lệ hoặc không còn active.");
  if (!confirm(`Xác nhận trả trực tiếp sách "${loan.bookTitle}" của ${loan.username}?`)) return;

  const run = async () => {
    try {
      const { overdueDays, fineAmount } = await finalizeReturnLoan(loan, "admin-direct");
      alert(`Đã xác nhận trả trực tiếp.\nQuá hạn: ${overdueDays} ngày\nPhạt: ${fineAmount.toLocaleString("vi-VN")} d`);
      renderAll();
      renderAdminActiveLoans();
    } catch (e) {
      console.error(e);
      alert("Lỗi: " + e.message);
    }
  };

  if (triggerBtn && window.runWithButtonBusy) {
    return window.runWithButtonBusy(triggerBtn, "Đang tạo...", run);
  }
  if (window.withLoading) return window.withLoading(run);
  return run();
};

window.adminReturnBook = async function(btn, loanId, bookId) {
    if (!confirm("Xác nhận đã nhận sách trả?")) return;

    const rowEl = btn ? btn.closest('tr') : null;

    if (rowEl) {
        rowEl.style.opacity = '0.5';
        rowEl.querySelectorAll('button').forEach(b => b.disabled = true);
    }

    window.startLoading?.();
    try {
        const loan = loans.find((l) => l.id === loanId && l.bookId === bookId);
        if (!loan) throw new Error("Không tìm thấy phiếu mượn.");

        const { overdueDays, fineAmount } = await finalizeReturnLoan(loan, "admin-confirm");

        if (rowEl) rowEl.remove();
        renderAll();
        renderAdminActiveLoans();

        alert(`Đã xác nhận trả sách!\nQuá hạn: ${overdueDays} ngày\nPhạt: ${fineAmount.toLocaleString("vi-VN")} d`);
    } catch (e) {
        console.error(e);

        if (rowEl) {
        rowEl.style.opacity = '1';
        rowEl.querySelectorAll('button').forEach(b => b.disabled = false);
        }

        alert("Lỗi: " + e.message);
    } finally {
        window.stopLoading?.();
    }
    }; 
            // H�M S?A H?N TR? (GIA H?N S�CH)

window.updateDueDate = async function(loanId, triggerBtn) {
            const loan = loans.find((l) => l.id === loanId && l.status === "active");
            if (!loan) return alert("Không tìm thấy phiếu đang mượn.");

            const renewalCount = Number(loan.renewalCount || 0);
            if (renewalCount >= MAX_RENEWALS) {
              return alert(`Phiếu này đã dùng hết ${MAX_RENEWALS} lượt gia hạn.`);
            }

            const dueDate = getLoanDueDate(loan);
            const due = parseVNDate(dueDate);
            if (!due) return alert("Không xác định được hạn trả hiện tại.");

            const nextDue = new Date(due);
            nextDue.setDate(nextDue.getDate() + RENEW_DAYS);
            const nextDueStr = formatVNDate(nextDue);
            const nextCount = renewalCount + 1;

            if (!confirm(`Gia hạn thêm ${RENEW_DAYS} ngày?\nHạn cũ: ${dueDate}\nHạn mới: ${nextDueStr}\nLượt: ${nextCount}/${MAX_RENEWALS}`)) {
              return;
            }

            const run = async () => {
              try {
                  await updateDoc(doc(db, "loans", loanId), {
                    dueDate: nextDueStr,
                    renewalCount: nextCount,
                    lastRenewAt: new Date().toISOString()
                  });

                  loan.dueDate = nextDueStr;
                  loan.renewalCount = nextCount;
                  syncState();
                  renderAdminActiveLoans();
                  alert(`Gia hạn thành công (${nextCount}/${MAX_RENEWALS}).`);
              } catch (e) {
                  console.error(e);
                  alert("Lỗi: " + e.message);
              }
            };

            if (triggerBtn && window.runWithButtonBusy) {
              return window.runWithButtonBusy(triggerBtn, "Đang gia hạn...", run);
            }
            if (window.withLoading) return window.withLoading(run);
            return run();
        }
        // 2. H�M S?A NG�Y MU?N (�? ch?nh ng�y th�ng)
window.editLoanDate = async function(loanId, currentDate) {
            // Hi?n khung nh?p ng�y m?i
            const newDate = prompt("Nh?p ng�y mu?n m?i (dd/mm/yyyy):", currentDate);

            if (newDate && newDate !== currentDate) {
                // Ki?m tra d?nh d?ng ng�y so b? (ph?i c� d?u /)
                if (!newDate.includes('/') || newDate.length < 8) {
                    return alert("Định dạng ngày không hợp lệ! Vui lòng nhập: ngày/tháng/năm");
                }

                try {
                    // C?p nh?t l�n Firebase
                    await updateDoc(doc(db, "loans", loanId), { date: newDate });
                    alert("Đã cập nhật ngày mượn!");
                    loadData(); // Load l?i d? h? th?ng t? t�nh l?i H?n tr?
                } catch (e) {
                    console.error(e);
                    alert("Lỗi cập nhật: " + e.message);
                }
            }
        }
// 3. H�M TR? S�CH (D�nh cho sinh vi�n)
window.returnBook = async function(loanId, bookId) {
            if(!confirm("Xác nhận trả cuốn sách này?")) return;
            try {
                const loan = loans.find((l) => l.id === loanId && l.bookId === bookId);
                if (!loan) return alert("Không tìm thấy phiếu mượn.");
                const { overdueDays, fineAmount } = await finalizeReturnLoan(loan, "student-return");
                alert(`Đã trả sách thành công!\nQuá hạn: ${overdueDays} ngày\nPhạt: ${fineAmount.toLocaleString("vi-VN")} d`);
                loadData();
            } catch(e) { console.error(e); alert("Lỗi: " + e.message); }
        }
    //Th?ng k� / ngu?i d�ng / l?ch s? sinh vi�n
window.renderDashboard = function() {
            // Ch? ch?y n?u l� Admin
            if (!currentUser || currentUser.role !== 'admin') return;

            console.log("Đang tính toán thống kê...");

            // A. T�nh to�n s? li?u
            const totalTitles = books.length; // T?ng d?u s�ch
            // C?ng d?n t?t c? s? lu?ng t?n kho (d�ng h�m reduce)
            const totalStock = books.reduce((sum, book) => sum + Number(book.stock), 0);
            // �?m s? phi?u c� tr?ng th�i 'active' (dang mu?n)
            const borrowedCount = loans.filter(l => l.status === 'active').length;
            // T�m s�ch s?p h?t (s? lu?ng < 5)
            const lowStockBooks = books.filter(b => b.stock < 5);

            // B. �?y s? li?u ra m�n h�nh HTML
            // (Luu �: C�c ID n�y ph?i kh?p v?i b�n HTML c?a b?n)
            const elTotal = document.getElementById('stat-total-titles');
            const elStock = document.getElementById('stat-total-stock');
            const elBorrow = document.getElementById('stat-borrowed');
            const elLow = document.getElementById('stat-low-stock');
            const elList = document.getElementById('low-stock-list');

            if(elTotal) elTotal.innerText = totalTitles;
            if(elStock) elStock.innerText = totalStock;
            if(elBorrow) elBorrow.innerText = borrowedCount;
            if(elLow) elLow.innerText = lowStockBooks.length;

            // C. Hi?n th? danh s�ch c?nh b�o
            if (elList) {
                elList.innerHTML = "";
                if (lowStockBooks.length === 0) {
                    elList.innerHTML = "<li>Kho ổn định, không có sách thiếu.</li>";
                } else {
                    lowStockBooks.forEach((b) => {
                        const rawTitle = String(b.title || "").trim();
                        const normalizedTitle = rawTitle && rawTitle.length > 1 && !/^\d+$/.test(rawTitle)
                          ? rawTitle
                          : `Mã sách ${String(b.id || "").slice(0, 6)}`;
                        const displayTitle = normalizedTitle === normalizedTitle.toLowerCase()
                          ? normalizedTitle.charAt(0).toLocaleUpperCase("vi-VN") + normalizedTitle.slice(1)
                          : normalizedTitle;

                        elList.innerHTML += `<li><b>${toSafeText(displayTitle)}</b> (Chỉ còn: ${b.stock})</li>`;
                    });
                }
            }
        }
// H�M HI?N TH? DANH S�CH USER T? FIREBASE (C?P NH?T M?I)
        // ============================================================
window.renderUsers = async function() {
            const table = document.getElementById('userTable');
            if (!table) return;

            const requestId = `${Date.now()}-${Math.random()}`;
            table.dataset.requestId = requestId;
            table.innerHTML = '<tr><td colspan="4" style="text-align:center; color: gray;">Đang tải danh sách độc giả...</td></tr>';
            const slowHintTimer = window.setTimeout(() => {
              if (table.dataset.requestId !== requestId) return;
              table.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #7f8c8d;">Đang tải lâu hơn dự kiến. Vui lòng kiểm tra kết nối mạng.</td></tr>';
            }, 7000);

            try {
                const usersCol = collection(db, "users");
                const userSnapshot = await getDocs(usersCol);
                if (table.dataset.requestId !== requestId) return;
                
                table.innerHTML = ""; // X�a d�ng dang t?i

                if (userSnapshot.empty) {
                    table.innerHTML = '<tr><td colspan="4" style="text-align:center">Chưa có dữ liệu</td></tr>';
                    return;
                }

 userSnapshot.forEach(d => {
  const u = d.data();
  const userId = d.id;         // id document
  const locked = !!u.locked;

  // ? T?o roleHtml (d�y l� th? b?n b? thi?u)
  let roleHtml = "";
  if (u.role === "admin") {
    roleHtml = `<span style="color:red; font-weight:bold;">Admin</span>`;
  } else if (u.role === "lecturer" || (u.username || "").startsWith("gv")) {
    roleHtml = `<span style="color:blue; font-weight:bold;">Giảng viên</span>`;
  } else {
    roleHtml = `<span style="color:green;">Sinh viên</span>`;
  }

  // kh�ng cho kh�a admin (tu? b?n)
  const role = String(u.role || "").toLowerCase();
  const canLock = role !== "admin";

  const btnText = locked ? "Mở" : "Khóa";
  const btnStyle = locked
    ? "background:#27ae60; color:white;"
    : "background:#bdc3c7; color:#111;";

  table.innerHTML += `
    <tr>
      <td>${u.username || userId}</td>
      <td>${u.name || ""}</td>
      <td>${roleHtml}</td>
      <td>
        <div class="action-group">
          <button class="btn-table"
            style="${btnStyle} border:none;"
            ${canLock ? `onclick="toggleUserLock('${userId}', ${locked}, this)"` : "disabled"}
          >
            ${btnText}
          </button>
          <button class="btn-table btn-approve" onclick="viewUserLoanHistory('${u.username || userId}')">
            Lịch sử
          </button>
        </div>
      </td>
    </tr>
  `;
});

            } catch (e) {
                if (table.dataset.requestId !== requestId) return;
                console.error(e);
                table.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center">Lỗi: ${e.message}</td></tr>`;
            } finally {
                window.clearTimeout(slowHintTimer);
                if (table.dataset.requestId === requestId) {
                  delete table.dataset.requestId;
                }
            }
        }
window.viewUserLoanHistory = function(userId) {
            if (!currentUser || currentUser.role !== "admin") return;

            const modal = document.getElementById("userLoanHistoryModal");
            const titleEl = document.getElementById("userLoanHistoryTitle");
            const statsEl = document.getElementById("userLoanHistoryStats");
            const bodyEl = document.getElementById("userLoanHistoryTable");
            if (!modal || !titleEl || !statsEl || !bodyEl) return;

            const uid = String(userId || "").trim();
            const userLoans = loans
              .filter((l) => sameUser(l.username, uid))
              .sort((a, b) => getLoanTimelineTs(b) - getLoanTimelineTs(a));

            titleEl.textContent = `Lịch sử mượn của: ${uid}`;

            const stat = {
              pending: userLoans.filter((l) => l.status === "pending").length,
              active: userLoans.filter((l) => l.status === "active").length,
              returned: userLoans.filter((l) => l.status === "returned").length,
              rejected: userLoans.filter((l) => l.status === "rejected").length
            };
            statsEl.innerHTML = `
              <span class="history-pill">Tổng: ${userLoans.length}</span>
              <span class="history-pill">Chờ duyệt: ${stat.pending}</span>
              <span class="history-pill">Đang mượn: ${stat.active}</span>
              <span class="history-pill">Đã trả: ${stat.returned}</span>
              <span class="history-pill">Từ chối: ${stat.rejected}</span>
            `;

            bodyEl.innerHTML = "";
            if (!userLoans.length) {
              bodyEl.innerHTML = `<tr><td colspan="7" style="text-align:center; color:gray; padding:18px;">Độc giả này chưa có lịch sử mượn.</td></tr>`;
              modal.style.display = "flex";
              return;
            }

            userLoans.forEach((loan) => {
              const dueDate = getLoanDueDate(loan) || "--";
              const refDate = loan.status === "returned"
                ? (parseAnyDate(loan.returnedAt) || new Date())
                : new Date();
              const overdueDays = Number.isFinite(Number(loan.overdueDays))
                ? Math.max(0, Number(loan.overdueDays))
                : calcOverdueDays(dueDate, refDate);
              const fineStored = Number(loan.fineAmount);
              const fineAmount = Number.isFinite(fineStored) ? fineStored : calcFineAmount(overdueDays);

              bodyEl.innerHTML += `
                <tr>
                  <td>${toSafeText(loan.bookTitle || "--")}</td>
                  <td>${toSafeText(loan.borrowDate || loan.date || "--")}</td>
                  <td>${toSafeText(dueDate)}</td>
                  <td>${toSafeText(formatDisplayDateTime(loan.returnedAt))}</td>
                  <td>${getStatusLabel(loan.status)}</td>
                  <td>${overdueDays} ngày</td>
                  <td>${fineAmount.toLocaleString("vi-VN")} d</td>
                </tr>
              `;
            });

            modal.style.display = "flex";
        }
        // 1. H�M HI?N TH? S�CH C?A SINH VI�N (Menu: S�ch & L?ch s?)
window.renderStudentLoans = function() {
            if (!currentUser) return;

            // L?y 2 c�i b?ng trong HTML
            const currentTable = document.getElementById('myCurrentBookTable');
            const historyTable = document.getElementById('myHistoryBookTable');

            if (!currentTable || !historyTable) return;

            // X�a n?i dung cu
            currentTable.innerHTML = "";
            historyTable.innerHTML = "";

            // L?c s�ch c?a ngu?i n�y
            const myLoans = loans.filter(l => sameUser(l.username, currentUser.username));

            // Duy?t qua t?ng phi?u v� chia v�o 2 b?ng
            myLoans.forEach(loan => {
                // B?NG 1: �ANG MU?N ho?c CH? DUY?T (status = pending / active)
                if (loan.status === 'pending' || loan.status === 'active') {
                    let dueDate = loan.dueDate;
                    if (!dueDate && loan.date) {
                        try {
                            const parts = loan.date.split('/');
                            if (parts.length === 3) {
                                const borrowDate = new Date(parts[2], parts[1] - 1, parts[0]);
                                const d = new Date(borrowDate);
                                d.setDate(borrowDate.getDate() + 7);
                                dueDate = d.toLocaleDateString('vi-VN');
                            }
                        } catch (e) { dueDate = '--'; }
                    }
                    const statusText = loan.status === 'pending' 
                        ? '<span style="color:orange; font-weight:bold;">Chờ duyệt</span>' 
                        : '<span style="color:green; font-weight:bold;">Đang mượn</span>';
                    
                    // N�t tr? s�ch (ch? hi?n khi �ang mu?n)
                    const actionBtn = loan.status === 'active' 
            ? '<span style="color:#2980b9; font-size:12px;">Vui lòng trả tại quầy</span>' 
            : '...';

                    currentTable.innerHTML += `
                    <tr>
                        <td>${loan.bookTitle}</td>
                        <td>${loan.date}</td>
                        <td>${dueDate || '--'}</td>
                        <td>${statusText}</td>
                        <td>${actionBtn}</td>
                    </tr>`;
                } 
                // B?NG 2: L?CH S? (�� tr? ho?c B? t? ch?i)
                else {
                    const note = loan.status === 'returned' ? 'Đã trả xong' : 'Bị từ chối';
                    historyTable.innerHTML += `
                    <tr>
                        <td>${loan.bookTitle}</td>
                        <td>${loan.date}</td>
                        <td>--</td>
                        <td><span style="color:gray;">${note}</span></td>
                        <td></td>
                    </tr>`;
                }
            });

            // N?u kh�ng c� s�ch n�o
            if (currentTable.innerHTML === "") currentTable.innerHTML = "<tr><td colspan='5' style='text-align:center'>Bạn chưa mượn cuốn nào.</td></tr>";
        }
// H�M �?I M?T KH?U
        // ============================================================
window.handleChangePassword = async function() {
            // 1. Ki?m tra dang nh?p
            if (!currentUser) return alert("Bạn chưa đăng nhập!");

            // 2. L?y d? li?u t? 2 � nh?p
            const newPassInput = document.getElementById('newPass');
            const confirmPassInput = document.getElementById('confirmPass'); // L?y th�m � x�c nh?n

            const newPass = newPassInput.value.trim();
            const confirmPass = confirmPassInput ? confirmPassInput.value.trim() : "";

            // 3. Ki?m tra l?i nh?p li?u
            if (!newPass) return alert("Vui lòng nhập mật khẩu mới!");
            
            if (newPass.length < 3) return alert("Mật khẩu phải dài hơn 3 ký tự!");

            // QUAN TR?NG: Ki?m tra 2 m?t kh?u c� kh?p kh�ng?
            if (confirmPassInput && newPass !== confirmPass) {
                return alert("Mật khẩu nhập lại không khớp! Vui lòng kiểm tra lại.");
            }

            // Hi?u ?ng n�t b?m
            const btn = document.querySelector('#section-profile button');
            const oldText = btn.innerText;
            btn.innerText = "Đang lưu...";
            btn.disabled = true;

            try {
                // 4. C?p nh?t l�n Firebase
                const userRef = doc(db, "users", currentUser.username);
                await updateDoc(userRef, { pass: newPass });

                // 5. C?p nh?t l?i b? nh? tr�nh duy?t
                currentUser.pass = newPass;
                localStorage.setItem('library_user', JSON.stringify(currentUser));

                alert("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới nhé.");
                
                // X�a tr?ng c? 2 �
                newPassInput.value = ""; 
                if(confirmPassInput) confirmPassInput.value = "";

            } catch (e) {
                console.error(e);
                alert("Lỗi: " + e.message);
            }

            btn.innerText = oldText;
            btn.disabled = false;
        }
window.handleAddBookPanel = async function (e) {
    e.preventDefault();

    const title = document.getElementById("pTitle").value.trim();
    const author = document.getElementById("pAuthor").value.trim();
    const stock = Number(document.getElementById("pStock").value || 0);
    const img = document.getElementById("pImg").value.trim();
    const addedBy = document.getElementById("pAddedBy").value; // select
    const desc = document.getElementById("pDesc").value.trim();
    const category = document.getElementById("pCategory").value.trim();
    const tag = document.getElementById("pTag").value.trim();
    const yearRaw = document.getElementById("pYear").value.trim();
    const publisher = document.getElementById("pPublisher").value.trim();
    const year = normalizeBookYear(yearRaw);

    const msg = document.getElementById("addBookMsg");

    if (!title || !author || !Number.isFinite(stock) || stock < 0 || !addedBy) {
        msg.style.display = "block";
        msg.style.background = "rgba(198,40,40,.10)";
        msg.style.color = "#b71c1c";
        msg.textContent = "Nhập đủ Tên sách, Tác giả, Tồn kho (>=0) và chọn Người thêm.";
        return;
    }
    if (yearRaw && year === "") {
        msg.style.display = "block";
        msg.style.background = "rgba(198,40,40,.10)";
        msg.style.color = "#b71c1c";
        msg.textContent = "Năm xuất bản không hợp lệ.";
        return;
    }

    const duplicateBook = await findDuplicateBookByTitle(title);
    if (duplicateBook) {
        msg.style.display = "block";
        msg.style.background = "rgba(198,40,40,.10)";
        msg.style.color = "#b71c1c";
        msg.textContent = `Sách "${duplicateBook.title}" đã có sẵn trong kho!`;
        return;
    }

    // kh�a form khi dang luu
    const panel = document.getElementById("addBookPanel");
    panel.querySelectorAll("button, input, select, textarea").forEach(el => el.disabled = true);

    try {
        const payload = normalizeBookRecord({
          title,
          author,
          stock,
          img: img || "",
          desc: desc || "",
          addedBy,
          category: category || "",
          tag: tag || "",
          year,
          publisher: publisher || "",
          createdAt: new Date().toISOString()
        });

        const ref = await addDoc(collection(db, "books"), payload);

        // c?p nh?t m?ng local d? UI th?y ngay (n?u b?n d�ng window.books)
        if (Array.isArray(window.books)) {
          window.books.unshift({ id: ref.id, ...payload });
          books = window.books.map((book) => normalizeBookRecord(book));
          syncState();
        }

        msg.style.display = "block";
        msg.style.background = "rgba(46,125,50,.10)";
        msg.style.color = "#1b5e20";
        msg.textContent = "Đã thêm sách lên Firebase!";

        // refresh l?i b?ng admin + trang ch? (t�y b?n c� h�m n�o)
        if (window.renderAll) window.renderAll();
        if (window.renderAdminBooks) window.renderAdminBooks();

        setTimeout(() => closeAddPanel(), 500);

    } catch (err) {
        console.error(err);
        msg.style.display = "block";
        msg.style.background = "rgba(198,40,40,.10)";
        msg.style.color = "#b71c1c";
        msg.textContent = "Lỗi Firebase: " + err.message;
    } finally {
        panel.querySelectorAll("button, input, select, textarea").forEach(el => el.disabled = false);
    }
    };

function pickImportValue(rowMap, key) {
  const aliases = IMPORT_COLUMN_ALIASES[key] || [];
  for (const alias of aliases) {
    const value = rowMap[alias];
    if (value !== undefined && normalizeText(value) !== "") return value;
  }
  return "";
}

function csvCell(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))
  ];
  const bom = "\ufeff";
  const blob = new Blob([bom + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function booksToExportRows(sourceBooks) {
  return sourceBooks.map((book) => {
    const b = normalizeBookRecord(book);
    return {
      ID: b.id || "",
      Title: b.title || "",
      Author: b.author || "",
      Stock: Number(b.stock) || 0,
      AddedBy: b.addedBy || "",
      Category: b.category || "",
      Tag: b.tag || "",
      Year: b.year || "",
      Publisher: b.publisher || "",
      CreatedAt: b.createdAt || "",
      Desc: b.desc || "",
      Img: b.img || ""
    };
  });
}

async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Không đọc được file."));
    reader.readAsArrayBuffer(file);
  });
}

function parseImportRow(row, lineNumber) {
  const normalizedRow = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    normalizedRow[normalizeHeaderKey(key)] = value;
  });

  const title = normalizeText(pickImportValue(normalizedRow, "title"));
  const author = normalizeText(pickImportValue(normalizedRow, "author"));
  const stockRaw = pickImportValue(normalizedRow, "stock");
  const stock = Number(stockRaw);
  const img = normalizeText(pickImportValue(normalizedRow, "img"));
  const desc = normalizeText(pickImportValue(normalizedRow, "desc"));
  const addedBy = normalizeText(pickImportValue(normalizedRow, "addedBy")) || defaultAddedBy();
  const category = normalizeText(pickImportValue(normalizedRow, "category"));
  const tag = normalizeText(pickImportValue(normalizedRow, "tag"));
  const yearRaw = normalizeText(pickImportValue(normalizedRow, "year"));
  const year = normalizeBookYear(yearRaw);
  const publisher = normalizeText(pickImportValue(normalizedRow, "publisher"));
  const createdAtRaw = pickImportValue(normalizedRow, "createdAt");

  if (!title || !author || !Number.isFinite(stock) || stock < 0) {
    return { error: `Dòng ${lineNumber}: thiếu Title/Author/Stock hợp lệ.` };
  }
  if (yearRaw && year === "") {
    return { error: `Dòng ${lineNumber}: Year không hợp lệ.` };
  }

  return {
    payload: normalizeBookRecord({
      title,
      author,
      stock,
      img,
      desc,
      addedBy,
      category,
      tag,
      year,
      publisher,
      createdAt: normalizeText(createdAtRaw) || new Date().toISOString()
    })
  };
}

window.exportBooksExcel = function (triggerBtn) {
  const run = () => {
    readAdminBookStateFromDom();
    const allBooks = Array.isArray(window.books) ? window.books : [];
    const booksForExport = window.getFilteredAdminBooks ? window.getFilteredAdminBooks(allBooks) : allBooks;
    if (!booksForExport.length) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const rows = booksToExportRows(booksForExport);
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const fileBase = `bao_cao_sach_${stamp}`;

    if (window.XLSX) {
      const wb = window.XLSX.utils.book_new();
      const ws = window.XLSX.utils.json_to_sheet(rows);
      window.XLSX.utils.book_append_sheet(wb, ws, "Books");
      window.XLSX.writeFile(wb, `${fileBase}.xlsx`);
      return;
    }

    downloadCsv(rows, `${fileBase}.csv`);
    alert("Không tải được thư viện XLSX, đã xuất CSV tương thích Excel.");
  };

  if (triggerBtn && window.runWithButtonBusy) {
    return window.runWithButtonBusy(triggerBtn, "Đang xuất...", async () => run());
  }
  if (window.withLoading) return window.withLoading(async () => run());
  return run();
};

window.downloadBookImportTemplate = function () {
  const sampleRows = [{
    Title: "Nhập môn Công nghệ phần mềm",
    Author: "PTIT Team",
    Stock: 5,
    AddedBy: defaultAddedBy(),
    Category: "Giáo trình",
    Tag: "cnpm",
    Year: 2025,
    Publisher: "NXB Giáo Dục",
    CreatedAt: new Date().toISOString(),
    Desc: "Sách mẫu để import",
    Img: "https://placehold.co/200x300?text=Sach"
  }];

  if (window.XLSX) {
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.json_to_sheet(sampleRows);
    window.XLSX.utils.book_append_sheet(wb, ws, "Template");
    window.XLSX.writeFile(wb, "mau_import_sach.xlsx");
    return;
  }

  downloadCsv(sampleRows, "mau_import_sach.csv");
  alert("Không tải được thư viện XLSX, đã xuất template CSV.");
};

window.importBooksExcel = async function (triggerBtn) {
  if (!currentUser || currentUser.role !== "admin") {
    alert("Chỉ admin mới được import dữ liệu.");
    return;
  }

  const input = document.getElementById("adminBookImportFile");
  const file = input?.files?.[0];
  if (!file) {
    alert("Vui lòng chọn file Excel trước khi import.");
    return;
  }
  if (!window.XLSX) {
    alert("Chưa tải được thư viện XLSX. Vui lòng kiểm tra mạng rồi tải lại trang.");
    return;
  }

  const run = async () => {
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (!rows.length) {
        alert("File import không có dữ liệu.");
        return;
      }

      const parsedRows = [];
      const errors = [];
      rows.forEach((row, index) => {
        const lineNumber = index + 2;
        const parsed = parseImportRow(row, lineNumber);
        if (parsed.error) errors.push(parsed.error);
        if (parsed.payload) parsedRows.push({ lineNumber, payload: parsed.payload });
      });

      if (!parsedRows.length) {
        alert(`Không có dòng hợp lệ để import.\n${errors.slice(0, 5).join("\n")}`);
        return;
      }

      const existingSnapshot = await getDocs(booksCollection);
      const existingTitleKeys = new Set();
      existingSnapshot.forEach((d) => {
        const key = normalizeComparableText(d.data()?.title);
        if (key) existingTitleKeys.add(key);
      });

      const payloads = [];
      const importTitleKeys = new Set();
      parsedRows.forEach(({ lineNumber, payload }) => {
        const titleKey = normalizeComparableText(payload.title);
        if (!titleKey) {
          errors.push(`Dòng ${lineNumber}: thiếu Title hợp lệ.`);
          return;
        }
        if (existingTitleKeys.has(titleKey)) {
          errors.push(`Dòng ${lineNumber}: trùng tên sách "${payload.title}".`);
          return;
        }
        if (importTitleKeys.has(titleKey)) {
          errors.push(`Dòng ${lineNumber}: trùng tên với dòng khác trong file.`);
          return;
        }
        importTitleKeys.add(titleKey);
        payloads.push(payload);
      });

      if (!payloads.length) {
        alert(`Không có dòng hợp lệ để import.\n${errors.slice(0, 5).join("\n")}`);
        return;
      }

      const message = `Sẽ import ${payloads.length} dòng hợp lệ.${errors.length ? `\nBỏ qua ${errors.length} dòng lỗi.` : ""}\nTiếp tục?`;
      if (!confirm(message)) return;

      for (const payload of payloads) {
        await addDoc(booksCollection, payload);
      }

      input.value = "";
      await loadData();

      const doneMsg = errors.length
        ? `Import xong ${payloads.length} sách.\nBỏ qua ${errors.length} dòng lỗi:\n${errors.slice(0, 5).join("\n")}`
        : `Import thành công ${payloads.length} sách.`;
      alert(doneMsg);
    } catch (err) {
      console.error(err);
      alert("Lỗi import: " + err.message);
    }
  };

  if (triggerBtn && window.runWithButtonBusy) {
    return window.runWithButtonBusy(triggerBtn, "Đang import...", run);
  }
  if (window.withLoading) return window.withLoading(run);
  return run();
};

window.handleAddUserPanel = async function (e) {
    e.preventDefault();

    const msg = document.getElementById('addUserMsg');

    const username = document.getElementById('uUsername').value.trim();
    const name = document.getElementById('uName').value.trim();
    const email = document.getElementById('uEmail').value.trim();
    const className = document.getElementById('uClass').value.trim();
    const dept = document.getElementById('uDept').value.trim();
    const pass = document.getElementById('uPass').value.trim();
    const roleRaw = String(document.getElementById('uRole').value || '').toLowerCase();
    const role = roleRaw === 'lecturer' ? 'lecturer' : 'student';

    if (!username || !name || !email || !className || !dept || !pass) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        if (msg) {
            msg.style.display = 'block';
            msg.textContent = "Email không đúng định dạng.";
            msg.style.background = 'rgba(198,40,40,.10)';
            msg.style.color = '#b71c1c';
        }
        return;
    }

    // Chu?n ho� MSSV (tu? b?n, th�ch th� b?)
    const userId = username.toUpperCase();

    try {
        const userRef = doc(db, "users", userId);
        const existsSnap = await getDoc(userRef);

        if (existsSnap.exists()) {
        if (msg) {
            msg.style.display = 'block';
            msg.textContent = `Username "${userId}" đã tồn tại.`;
            msg.style.background = 'rgba(198,40,40,.10)';
            msg.style.color = '#b71c1c';
        }
        return;
        }

        // Luu theo d�ng structure b?n dang c� tr�n Firestore
        await setDoc(userRef, {
        username: userId,
        name,
        email,
        class: className,
        dept,
        pass,
        role,          // student | lecturer
        locked: false, // th�m field d? sau n�y "Kh�a" d? x? l�
        createdAt: Date.now()
        });

        if (msg) {
        msg.style.display = 'block';
        msg.textContent = "Đã tạo tài khoản độc giả!";
        msg.style.background = 'rgba(46,125,50,.10)';
        msg.style.color = '#1b5e20';
        }

        // C?p nh?t UI: render l?i danh s�ch d?c gi?
        if (window.renderUsers) {
        await renderUsers();
        }

        // ��ng panel sau 0.6s (tu? b?n)
        setTimeout(() => closeUserPanel(), 600);

    } catch (err) {
        console.error(err);
        if (msg) {
        msg.style.display = 'block';
        msg.textContent = "Lỗi tạo độc giả: " + err.message;
        msg.style.background = 'rgba(198,40,40,.10)';
        msg.style.color = '#b71c1c';
        }
    }
    };
// Admin kh�a/m? kh�a user
window.toggleUserLock = async function (userId, currentLocked, triggerBtn) {
  if (!confirm(currentLocked ? "MỞ KHÓA tài khoản này?" : "KHÓA tài khoản này?")) return;

  const run = async () => {
    try {
      await updateDoc(doc(db, "users", userId), { locked: !currentLocked });
      alert(currentLocked ? "Đã mở khóa!" : "Đã khóa!");
      if (window.renderUsers) await renderUsers();
    } catch (e) {
      console.error(e);
      alert("Lỗi khóa/mở: " + e.message);
    }
  };

  if (triggerBtn && window.runWithButtonBusy) {
    return window.runWithButtonBusy(triggerBtn, "Đang cập nhật...", run);
  }
  if (window.withLoading) return window.withLoading(run);
  return run();
};



