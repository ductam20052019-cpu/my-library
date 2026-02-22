window.toggleModal = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = (el.style.display === "none" || el.style.display === "") ? "flex" : "none";
};

let loadingCounter = 0;

function updateLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  if (!overlay) return;
  overlay.style.display = loadingCounter > 0 ? "flex" : "none";
}

window.startLoading = function () {
  loadingCounter += 1;
  updateLoadingOverlay();
};

window.stopLoading = function () {
  loadingCounter = Math.max(0, loadingCounter - 1);
  updateLoadingOverlay();
};

window.withLoading = async function (fn) {
  window.startLoading();
  try {
    return await fn();
  } finally {
    window.stopLoading();
  }
};

window.setButtonBusy = function (btn, isBusy, busyText = "Đang xử lý...") {
  if (!btn) return;
  if (isBusy) {
    if (!btn.dataset.prevText) btn.dataset.prevText = btn.innerText;
    btn.innerText = busyText;
    btn.disabled = true;
    btn.classList.add("is-busy");
  } else {
    btn.innerText = btn.dataset.prevText || btn.innerText;
    btn.disabled = false;
    btn.classList.remove("is-busy");
    delete btn.dataset.prevText;
  }
};

window.runWithButtonBusy = async function (btn, busyText, fn) {
  window.setButtonBusy(btn, true, busyText);
  window.startLoading();
  try {
    return await fn();
  } finally {
    window.stopLoading();
    window.setButtonBusy(btn, false);
  }
};

const VI_TEXT_REPLACEMENTS = [
  ["? �ang t?i danh s�ch...", "Đang tải danh sách..."],
  ["? L?i: Kh�ng t�m th?y � nh?p li?u trong HTML!", "Lỗi: Không tìm thấy ô nhập liệu trong HTML!"],
  ["? M?t kh?u nh?p l?i kh�ng kh?p! Vui l�ng ki?m tra l?i.", "Mật khẩu nhập lại không khớp! Vui lòng kiểm tra lại."],
  ["? S? lu?ng s�ch kh�ng h?p l?! (Ph?i l?n hon ho?c b?ng 0)", "Số lượng sách không hợp lệ! (Phải lớn hơn hoặc bằng 0)"],
  ["? Kh�ng t?i du?c thu vi?n XLSX, d� xu?t CSV tuong th�ch Excel.", "Không tải được thư viện XLSX, đã xuất CSV tương thích Excel."],
  ["? Kh�ng t?i du?c thu vi?n XLSX, d� xu?t template CSV.", "Không tải được thư viện XLSX, đã xuất template CSV."],
  ["? �� c?p nh?t s�ch!", "Đã cập nhật sách!"],
  ["? �� th�m s�ch m?i!", "Đã thêm sách mới!"],
  ["? �� duy?t th�nh c�ng!", "Đã duyệt thành công!"],
  ["�� t? ch?i y�u c?u.", "Đã từ chối yêu cầu."],
  ["? �� x�c nh?n tr? s�ch!", "Đã xác nhận trả sách!"],
  ["�� tr? s�ch th�nh c�ng!", "Đã trả sách thành công!"],
  ["? �� t?o t�i kho?n d?c gi?!", "Đã tạo tài khoản độc giả!"],
  ["? �� th�m s�ch l�n Firebase!", "Đã thêm sách lên Firebase!"],
  ["? L?i Firebase:", "Lỗi Firebase:"],
  ["? L?i import:", "Lỗi import:"],
  ["? L?i t?o d?c gi?:", "Lỗi tạo độc giả:"],
  ["? L?i:", "Lỗi:"],
  ["? Email kh�ng d�ng d?nh d?ng.", "Email không đúng định dạng."],
  ["? Nam xu?t b?n kh�ng h?p l?.", "Năm xuất bản không hợp lệ."],
  ["? Nh?p d? T�n s�ch, T�c gi?, T?n kho (>=0) v� ch?n Ngu?i th�m.", "Nhập đủ Tên sách, Tác giả, Tồn kho (>=0) và chọn Người thêm."],
  ["? S�ch n�y v?a h?t h�ng, kh�ng th? duy?t!", "Sách này vừa hết hàng, không thể duyệt!"],
  ["? T�i kho?n n�y kh�ng t?n t?i!", "Tài khoản này không tồn tại!"],
  ["?? Xin ch�o,", "Xin chào,"],
  ["?? B?t d?u dang nh?p...", "Bắt đầu đăng nhập..."],
  ["?? T�m", "Tìm"],
  ["�?nh d?ng ng�y kh�ng h?p l?! Vui l�ng nh?p: ng�y/th�ng/nam", "Định dạng ngày không hợp lệ! Vui lòng nhập: ngày/tháng/năm"],
  ["B?n chua dang nh?p!", "Bạn chưa đăng nhập!"],
  ["B?n chua mu?n cu?n n�o.", "Bạn chưa mượn cuốn nào."],
  ["B?n ch? du?c t?i da", "Bạn chỉ được tối đa"],
  ["B?n d� dang k� ho?c dang mu?n cu?n n�y r?i.", "Bạn đã đăng ký hoặc đang mượn cuốn này rồi."],
  ["Ban chac chan muon xoa cuon sach nay khoi kho?", "Bạn chắc chắn muốn xóa cuốn sách này khỏi kho?"],
  ["C?P NH?T S�CH", "CẬP NHẬT SÁCH"],
  ["TH�M S�CH M?I", "THÊM SÁCH MỚI"],
  ["LUU L?I", "LƯU LẠI"],
  ["Ch? admin m?i du?c import d? li?u.", "Chỉ admin mới được import dữ liệu."],
  ["Ch?n d?c gi? v� s�ch d? tr? tr?c ti?p.", "Chọn độc giả và sách để trả trực tiếp."],
  ["Chua t?i du?c thu vi?n XLSX. Vui l�ng ki?m tra m?ng r?i t?i l?i trang.", "Chưa tải được thư viện XLSX. Vui lòng kiểm tra mạng rồi tải lại trang."],
  ["Duy?t cho mu?n s�ch n�y?", "Duyệt cho mượn sách này?"],
  ["T? ch?i y�u c?u n�y?", "Từ chối yêu cầu này?"],
  ["File import kh�ng c� d? li?u.", "File import không có dữ liệu."],
  ["Gi�o tr�nh", "Giáo trình"],
  ["H? so c� nh�n", "Hồ sơ cá nhân"],
  ["Hi?n kh�ng c� b?n ghi active d? tr? tr?c ti?p.", "Hiện không có bản ghi active để trả trực tiếp."],
  ["Kh�ng d?c du?c file.", "Không đọc được file."],
  ["Kh�ng r�", "Không rõ"],
  ["Kh�ng tang du?c t?n kho:", "Không tăng được tồn kho:"],
  ["Kh�ng c� d? li?u d? xu?t.", "Không có dữ liệu để xuất."],
  ["Kh�ng t�m th?y phi?u active ph� h?p.", "Không tìm thấy phiếu active phù hợp."],
  ["Kh�ng t�m th?y phi?u dang mu?n.", "Không tìm thấy phiếu đang mượn."],
  ["Kh�ng t�m th?y phi?u mu?n.", "Không tìm thấy phiếu mượn."],
  ["Kh�ng t�m th?y s�ch n�y!", "Không tìm thấy sách này!"],
  ["Kh�ng x�c d?nh du?c h?n tr? hi?n t?i.", "Không xác định được hạn trả hiện tại."],
  ["L?i c?p nh?t:", "Lỗi cập nhật:"],
  ["L?i k?t n?i:", "Lỗi kết nối:"],
  ["M?t kh?u ph?i d�i hon 3 k� t?!", "Mật khẩu phải dài hơn 3 ký tự!"],
  ["N?p 20 s�ch m?u v�o kho?", "Nạp 20 sách mẫu vào kho?"],
  ["Nh?p m�n C�ng ngh? ph?n m?m", "Nhập môn Công nghệ phần mềm"],
  ["Nh?p ng�y mu?n m?i (dd/mm/yyyy):", "Nhập ngày mượn mới (dd/mm/yyyy):"],
  ["Nh?p t�n s�ch tru?c!", "Nhập tên sách trước!"],
  ["NXB Gi�o D?c", "NXB Giáo Dục"],
  ["Ph?t/ng�y ph?i l� s? >= 0.", "Phạt/ngày phải là số >= 0."],
  ["Phi?u mu?n kh�ng h?p l? ho?c kh�ng c�n active.", "Phiếu mượn không hợp lệ hoặc không còn active."],
  ["Phi?u n�y kh�ng ? tr?ng th�i dang mu?n.", "Phiếu này không ở trạng thái đang mượn."],
  ["S�ch m?u d? import", "Sách mẫu để import"],
  ["S�ch n�y d� h?t!", "Sách này đã hết!"],
  ["T�i kho?n c?a b?n d� b? kh�a.", "Tài khoản của bạn đã bị khóa."],
  ["T�i kho?n d� b? KH�A, kh�ng th? dang k� mu?n!", "Tài khoản đã bị KHÓA, không thể đăng ký mượn!"],
  ["T�i kho?n d� b? KH�A. Li�n h? admin!", "Tài khoản đã bị KHÓA. Liên hệ admin!"],
  ["Vui l�ng ch?n file Excel tru?c khi import.", "Vui lòng chọn file Excel trước khi import."],
  ["Vui l�ng ch?n s�ch c?n tr?.", "Vui lòng chọn sách cần trả."],
  ["Vui l�ng dang nh?p!", "Vui lòng đăng nhập!"],
  ["Vui l�ng nh?p d?y d? T�n dang nh?p v� M?t kh?u!", "Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!"],
  ["Vui l�ng nh?p m?t kh?u m?i!", "Vui lòng nhập mật khẩu mới!"],
  ["Vui l�ng nh?p t�n s�ch!", "Vui lòng nhập tên sách!"],
  ["Vui l�ng nh?p t�n t�c gi?!", "Vui lòng nhập tên tác giả!"],
  ["X�c nh?n d� nh?n s�ch tr??", "Xác nhận đã nhận sách trả?"],
  ["X�c nh?n tr? cu?n s�ch n�y?", "Xác nhận trả cuốn sách này?"],
  ["X�c nh?n t?o phi?u returned cho", "Xác nhận tạo phiếu returned cho"],
  ["L?ch s? mu?n c?a:", "Lịch sử mượn của:"],
  ["�?c gi? n�y chua c� l?ch s? mu?n.", "Độc giả này chưa có lịch sử mượn."],
  ["? Ch? duy?t", "Chờ duyệt"],
  ["Ch? c�n", "Chỉ còn"],
  [" �ang mu?n", " Đang mượn"],
  ["Kh�ng c� y�u c?u n�o m?i", "Không có yêu cầu nào mới"],
  ["Kh�ng c� b?n ghi qu� h?n.", "Không có bản ghi quá hạn."],
  ["Hi?n kh�ng c� ai dang mu?n s�ch.", "Hiện không có ai đang mượn sách."],
  ["QU� H?N", "QUÁ HẠN"],
  ["�ANG MU?N", "ĐANG MƯỢN"],
  ["Ph?t t?m t�nh:", "Phạt tạm tính:"],
  ["Ph� ph?t: t?t", "Phí phạt: tắt"],
  ["X�c nh?n tr?", "Xác nhận trả"],
  ["Kh�ng c� d?c gi? dang mu?n", "Không có độc giả đang mượn"],
  ["Kh�ng c� s�ch dang mu?n", "Không có sách đang mượn"],
  ["Hi?n kh�ng c� b?n ghi active d? tr? tr?c ti?p.", "Hiện không có bản ghi active để trả trực tiếp."],
  ["S? tr? s�ch", "Sẽ trả sách"],
  ["Qu� h?n:", "Quá hạn:"],
  ["Ph?t:", "Phạt:"],
  ["ph?t:", "phạt:"],
  ["Gia han thanh cong", "Gia hạn thành công"],
  ["Phi?u n�y d� d�ng h?t", "Phiếu này đã dùng hết"],
  ["Kh�ng x�c d?nh du?c", "Không xác định được"],
  ["Gia h?n", "Gia hạn"],
  ["H?n cu", "Hạn cũ"],
  ["H?n m?i", "Hạn mới"],
  ["ng�y", "ngày"],
  ["lu?t", "lượt"],
  ["Chua c� d? li?u", "Chưa có dữ liệu"],
  ["Gi?ng vi�n", "Giảng viên"],
  ["Sinh vi�n", "Sinh viên"],
  ["L?ch s?", "Lịch sử"],
  ["T? ch?i", "Từ chối"],
  ["�� tr?", "Đã trả"],
  ["Ch? duy?t", "Chờ duyệt"],
  ["Vui l�ng tr? t?i qu?y", "Vui lòng trả tại quầy"],
  ["B? t? ch?i", "Bị từ chối"],
  ["�� tr? xong", "Đã trả xong"],
  ["KHOA tai khoan nay?", "KHÓA tài khoản này?"],
  ["Mo KHOA tai khoan nay?", "MỞ KHÓA tài khoản này?"],
  ["Da mo khoa!", "Đã mở khóa!"],
  ["Da khoa!", "Đã khóa!"],
  ["Dang cap nhat...", "Đang cập nhật..."],
  ["Dang import...", "Đang import..."],
  ["Dang xuat...", "Đang xuất..."],
  ["Dang tao...", "Đang tạo..."],
  ["Dang gui...", "Đang gửi..."],
  ["Dang xoa...", "Đang xóa..."],
  ["Dang gia han...", "Đang gia hạn..."],
  ["Dang hien thi", "Đang hiển thị"],
  ["dau sach", "đầu sách"],
  ["Khong co", "Không có"],
  ["tim thay", "tìm thấy"],
  ["DANG NHAP", "ĐĂNG NHẬP"],
  ["CHO DUYET", "CHỜ DUYỆT"],
  ["DANG MUON", "ĐANG MƯỢN"],
  ["HET SACH", "HẾT SÁCH"],
  ["DANG KY MUON", "ĐĂNG KÝ MƯỢN"],
  ["XOA", "XÓA"],
  ["Sua", "Sửa"],
  ["Xoa", "Xóa"],
  ["Kh�ng", "Không"],
  ["L?i", "Lỗi"],
  ["Vui l�ng", "Vui lòng"],
  ["Phi?u", "Phiếu"],
  ["s�ch", "sách"],
  ["mu?n", "mượn"],
  ["duy?t", "duyệt"],
  ["nh?p", "nhập"],
  ["h?p l?", "hợp lệ"]
];

window.normalizeViText = function (input) {
  let text = String(input ?? "");
  for (const [bad, good] of VI_TEXT_REPLACEMENTS) {
    if (!bad || !text.includes(bad)) continue;
    text = text.split(bad).join(good);
  }
  return text;
};

function normalizeViInNode(node) {
  if (!node) return;
  if (node.nodeType === Node.TEXT_NODE) {
    const raw = node.nodeValue || "";
    const fixed = window.normalizeViText(raw);
    if (fixed !== raw) node.nodeValue = fixed;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const tag = node.tagName;
  if (tag === "SCRIPT" || tag === "STYLE") return;

  const attrs = ["placeholder", "title", "aria-label", "value"];
  for (const attr of attrs) {
    if (!node.hasAttribute(attr)) continue;
    const rawAttr = node.getAttribute(attr) || "";
    const fixedAttr = window.normalizeViText(rawAttr);
    if (fixedAttr !== rawAttr) node.setAttribute(attr, fixedAttr);
  }

  for (const child of node.childNodes) normalizeViInNode(child);
}

function startAutoViTextFix() {
  if (window.__viTextFixStarted || !document.body) return;
  window.__viTextFixStarted = true;

  normalizeViInNode(document.body);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        normalizeViInNode(mutation.target);
      }
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((n) => normalizeViInNode(n));
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  window.__viTextFixObserver = observer;
}

window.showToast = function (message, type = "info", duration = 2800) {
  const box = document.getElementById("toastContainer");
  if (!box) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style.whiteSpace = "pre-line";
  toast.textContent = window.normalizeViText(message);
  box.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, Math.max(1200, duration));
};

function guessToastType(text) {
  const msg = window.normalizeViText(text).toLowerCase();
  if (/(❌|loi|lỗi|khong|không|sai|het|hết|tu choi|từ chối|khoa|khóa)/i.test(msg)) return "error";
  if (/(✅|thanh cong|thành công|da|đã|xong|xin chao|xin chào|mo khoa|mở khóa)/i.test(msg)) return "success";
  if (/(⚠|chu y|chú ý|canh bao|cảnh báo)/i.test(msg)) return "warning";
  return "info";
}

if (!window.__nativeAlert) {
  window.__nativeAlert = window.alert.bind(window);
}
if (!window.__toastAlertPatched) {
  window.alert = function (message) {
    const text = window.normalizeViText(message);
    window.showToast?.(text, guessToastType(text));
  };
  window.__toastAlertPatched = true;
}

if (!window.__nativeConfirm) {
  window.__nativeConfirm = window.confirm.bind(window);
}
if (!window.__confirmPatched) {
  window.confirm = function (message) {
    return window.__nativeConfirm(window.normalizeViText(message));
  };
  window.__confirmPatched = true;
}

if (!window.__nativePrompt) {
  window.__nativePrompt = window.prompt.bind(window);
}
if (!window.__promptPatched) {
  window.prompt = function (message, defaultValue = "") {
    return window.__nativePrompt(window.normalizeViText(message), window.normalizeViText(defaultValue));
  };
  window.__promptPatched = true;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAutoViTextFix, { once: true });
} else {
  startAutoViTextFix();
}

window.openAddModal = function () {
  document.getElementById("bookId").value = "";
  document.getElementById("bookTitle").value = "";
  document.getElementById("bookAuthor").value = "";
  document.getElementById("bookStock").value = "";
  document.getElementById("bookCategory").value = "";
  document.getElementById("bookTag").value = "";
  document.getElementById("bookYear").value = "";
  document.getElementById("bookPublisher").value = "";
  const addedByInput = document.getElementById("bookAddedBy");
  if (addedByInput) {
    const currentUser = window.currentUser || {};
    addedByInput.value = currentUser.name || currentUser.username || "";
  }
  document.getElementById("bookTitle").dataset.img = "";
  document.getElementById("modalTitle").innerText = "THÊM SÁCH MỚI";
  toggleModal("bookModal");
};

const introData = {
  phutrach: {
    title: "PHÂN CÔNG PHỤ TRÁCH",
    body: "<p><b>Tổ nghiệp vụ:</b> Tiếp nhận yêu cầu, xét duyệt mượn - trả, theo dõi tồn kho.</p><p><b>Tổ kỹ thuật:</b> Vận hành hệ thống, sao lưu dữ liệu, hỗ trợ sự cố.</p><p><b>Tổ truyền thông:</b> Cập nhật nội dung, hướng dẫn sử dụng thư viện số.</p>"
  },
  bando: {
    title: "BẢN ĐỒ CÁC TẦNG - TRUNG TÂM TRUYỀN THÔNG VÀ TRI THỨC SỐ",
    body: "<p><b>Tầng 1:</b> Khu tiếp tân, tra cứu nhanh, quầy hỗ trợ.</p><p><b>Tầng 2:</b> Phòng đọc, khu sách chuyên ngành.</p><p><b>Tầng 3:</b> Khu học nhóm, tài liệu số, khu tự học.</p>"
  },
  lichsu: {
    title: "LỊCH SỬ HÌNH THÀNH",
    body: "<p>Thư viện nhóm CNPM được xây dựng để hỗ trợ tra cứu tài liệu học tập và quản lý mượn - trả trực tuyến cho sinh viên PTIT cơ sở TP.HCM.</p>"
  },
  canbo: {
    title: "DANH SÁCH CÁN BỘ",
    body: "<ul style='padding-left:18px; margin:0;'><li>Quản trị hệ thống</li><li>Cán bộ xử lý nghiệp vụ</li><li>Nhóm hỗ trợ kỹ thuật và hướng dẫn người dùng</li></ul>"
  },
  cocau: {
    title: "CƠ CẤU TỔ CHỨC",
    body: "<p>Mô hình gồm 3 nhóm chính: Vận hành nghiệp vụ, Kỹ thuật hệ thống và Hỗ trợ người dùng.</p>"
  }
};

window.openIntro = function (key) {
  const item = introData[key];
  if (!item) return;

  const titleEl = document.getElementById("introModalTitle");
  const bodyEl = document.getElementById("introModalBody");
  if (!titleEl || !bodyEl) return;

  titleEl.innerText = item.title;
  bodyEl.innerHTML = item.body;

  const modal = document.getElementById("introContentModal");
  if (!modal) return;

  // This modal is declared inside header in HTML; move it to body
  // so fixed positioning behaves like other overlays (e.g. rules modal).
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  modal.style.display = "flex";
};

const STATIC_SECTION_IDS = new Set(["about", "guest", "news", "help", "contact", "chucnang"]);
const DYNAMIC_SECTION_ROUTES = {
  home: "search",
  "my-books": "my-books",
  profile: "profile",
  "admin-approvals": "admin/approvals",
  "admin-active-loans": "admin/loans",
  "admin-books": "admin/books",
  "admin-users": "admin/users",
  dashboard: "admin/dashboard"
};
const ROUTE_SECTION_IDS = Object.entries(DYNAMIC_SECTION_ROUTES).reduce((acc, [sectionId, route]) => {
  acc[route] = sectionId;
  return acc;
}, {});
const LEGACY_ROUTE_ALIASES = {
  home: "search",
  "admin-books": "admin/books",
  "admin-users": "admin/users",
  "admin-approvals": "admin/approvals",
  "admin-active-loans": "admin/loans",
  dashboard: "admin/dashboard"
};

let skipHashChangeOnce = false;

function normalizeHashRoute(routeLike) {
  return String(routeLike || "")
    .trim()
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/^section-/, "")
    .replace(/\/{2,}/g, "/");
}

function resolveRoute(routeLike) {
  const normalized = normalizeHashRoute(routeLike);
  return LEGACY_ROUTE_ALIASES[normalized] || normalized;
}

function sectionIdFromHash(hashValue = window.location.hash) {
  const route = resolveRoute(hashValue);
  return ROUTE_SECTION_IDS[route] || null;
}

function getSectionAccessUser() {
  const liveUser = window.currentUser;
  if (liveUser && typeof liveUser === "object") return liveUser;

  try {
    const raw = localStorage.getItem("library_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_err) {
    return null;
  }
}

function isAdminOnlySection(sectionId) {
  return sectionId === "dashboard" || String(sectionId || "").startsWith("admin-");
}

function syncHashForSection(sectionId) {
  const route = DYNAMIC_SECTION_ROUTES[sectionId];
  if (!route) return;
  const nextHash = `#/${route}`;
  if (window.location.hash === nextHash) return;
  skipHashChangeOnce = true;
  window.location.hash = nextHash;
}

window.navigateTo = function (routeLike) {
  const route = resolveRoute(routeLike);
  const sectionId = ROUTE_SECTION_IDS[route];
  if (!sectionId) return window.showSection?.("home");
  window.showSection?.(sectionId);
};

window.applyRouteFromHash = function () {
  const sectionId = sectionIdFromHash(window.location.hash);
  if (!sectionId) return false;
  window.showSection?.(sectionId, { skipHashSync: true, closeMobile: false });
  return true;
};

window.showSection = function (sectionId, options = {}) {
  const closeMobile = options.closeMobile !== false;
  if (closeMobile) window.closeMobileNav?.();

  const requestedSectionId = String(sectionId || "").trim();
  const accessUser = getSectionAccessUser();
  const deniedAdminSection = isAdminOnlySection(requestedSectionId) && accessUser?.role !== "admin";
  const resolvedSectionId = deniedAdminSection ? "home" : requestedSectionId;

  const allSections = document.querySelectorAll('[id^="section-"]');
  allSections.forEach((sec) => (sec.style.display = "none"));

  const target = document.getElementById("section-" + resolvedSectionId) || document.getElementById("section-home");
  if (!target) return;
  target.style.display = "block";

  const activeSectionId = target.id.replace(/^section-/, "");
  if (!options.skipHashSync || deniedAdminSection) syncHashForSection(activeSectionId);

  if (activeSectionId === "my-books") return window.renderStudentLoans?.();
  if (activeSectionId === "admin-approvals") return window.renderAdminApprovals?.();
  if (activeSectionId === "admin-active-loans") return window.renderAdminActiveLoans?.();
  if (activeSectionId === "dashboard") return window.renderDashboard?.();
  if (activeSectionId === "admin-users") return window.renderUsers?.();
  if (activeSectionId === "admin-books") {
    window.syncAdminBookControls?.();
    return window.renderAdminBooks?.();
  }

  if (STATIC_SECTION_IDS.has(activeSectionId)) return;
  window.renderAll?.();
};

window.toggleMobileNav = function () {
  const m = document.getElementById("mobileNav");
  if (!m) return;
  m.classList.toggle("show");
};

window.closeMobileNav = function () {
  const m = document.getElementById("mobileNav");
  if (!m) return;
  m.classList.remove("show");
};

window.initHashRouter = function () {
  if (window.__hashRouterReady) return;
  window.__hashRouterReady = true;

  window.addEventListener("hashchange", () => {
    if (skipHashChangeOnce) {
      skipHashChangeOnce = false;
      return;
    }
    window.applyRouteFromHash?.();
  });
};

function initSafeHashAnchors() {
  if (window.__safeHashAnchorsReady) return;
  window.__safeHashAnchorsReady = true;

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.('a[href="#"]');
    if (!anchor) return;
    event.preventDefault();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initSafeHashAnchors();
    window.initHashRouter?.();
    window.applyRouteFromHash?.();
  }, { once: true });
} else {
  initSafeHashAnchors();
  window.initHashRouter?.();
  window.applyRouteFromHash?.();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

window.homeSearchState = window.homeSearchState || {
  keyword: "",
  filterType: "title"
};

function getHomeSearchState() {
  const raw = window.homeSearchState || {};
  return {
    keyword: String(raw.keyword || ""),
    filterType: raw.filterType === "author" ? "author" : "title"
  };
}

function setHomeSearchState(nextState = {}) {
  const prev = getHomeSearchState();
  window.homeSearchState = {
    keyword: Object.prototype.hasOwnProperty.call(nextState, "keyword")
      ? String(nextState.keyword || "")
      : prev.keyword,
    filterType: nextState.filterType === "author" ? "author" : (Object.prototype.hasOwnProperty.call(nextState, "filterType") ? "title" : prev.filterType)
  };
}

function getAppDataState() {
  const raw = window.appDataState || {};
  return {
    initialLoaded: !!raw.initialLoaded,
    loading: !!raw.loading,
    hasError: !!raw.hasError
  };
}

function syncHomeSearchControls() {
  const state = getHomeSearchState();
  const searchInput = document.getElementById("mainSearch");
  const filterSelect = document.getElementById("searchFilter");
  if (searchInput) searchInput.value = state.keyword;
  if (filterSelect) filterSelect.value = state.filterType;
}

function buildBookActionButton(book, currentUser, loans) {
  if (!currentUser) {
    return `<button class="btn-borrow" style="background:gray" onclick="alert('Đăng nhập đi!')">ĐĂNG NHẬP</button>`;
  }

  if (currentUser.role === "admin") {
    return `<button class="btn-borrow" style="background:red" onclick="deleteBook('${book.id}', this)">XÓA</button>`;
  }

  const myLoan = loans.find(
    (l) =>
      l.username === currentUser.username &&
      l.bookId === book.id &&
      (l.status === "pending" || l.status === "active")
  );

  if (myLoan?.status === "active") {
    return `<button class="btn-borrow" style="background:#27ae60; color:white" disabled>ĐANG MƯỢN</button>`;
  }
  if (myLoan) {
    return `<button class="btn-borrow" style="background:#f1c40f; color:black" disabled>CHỜ DUYỆT</button>`;
  }
  if (Number(book.stock) <= 0) {
    return `<button class="btn-borrow" style="background:#bdc3c7" disabled>HẾT SÁCH</button>`;
  }
  return `<button class="btn-borrow" onclick="requestBorrow('${book.id}', this)">ĐĂNG KÝ MƯỢN</button>`;
}

function getFilteredHomeBooks(sourceBooks, state) {
  const keyword = String(state.keyword || "").toLowerCase().trim();
  if (!keyword) return sourceBooks.slice();

  return sourceBooks.filter((book) => {
    const valueToCheck = state.filterType === "author" ? book.author : book.title;
    return String(valueToCheck || "").toLowerCase().includes(keyword);
  });
}

window.renderAdminBooks = function () {
  const adminTable = document.getElementById("adminBookTable");
  const summaryEl = document.getElementById("adminBookFilterSummary");
  const currentUser = window.currentUser || null;
  if (!adminTable || currentUser?.role !== "admin") return;

  const dataState = getAppDataState();
  const books = window.books || [];
  const viewBooks = window.getFilteredAdminBooks ? window.getFilteredAdminBooks(books) : books.slice();

  adminTable.innerHTML = "";

  if (!dataState.initialLoaded && dataState.loading) {
    if (summaryEl) summaryEl.textContent = "Đang tải dữ liệu sách...";
    adminTable.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:18px; color:gray;">Đang tải danh sách sách...</td></tr>`;
    return;
  }

  if (dataState.hasError && !books.length) {
    if (summaryEl) summaryEl.textContent = "Không tải được dữ liệu sách.";
    adminTable.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:18px; color:#c0392b;">Không thể tải dữ liệu. Vui lòng thử lại.</td></tr>`;
    return;
  }

  if (!books.length) {
    if (summaryEl) summaryEl.textContent = "Kho sách hiện chưa có dữ liệu.";
    adminTable.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:18px; color:gray;">Kho sách hiện chưa có dữ liệu.</td></tr>`;
    return;
  }

  if (!viewBooks.length) {
    if (summaryEl) summaryEl.textContent = `Không có đầu sách phù hợp bộ lọc (0/${books.length}).`;
    adminTable.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:18px; color:gray;">Không có đầu sách phù hợp bộ lọc.</td></tr>`;
    return;
  }

  if (summaryEl) {
    summaryEl.textContent = `Đang hiển thị ${viewBooks.length}/${books.length} đầu sách.`;
  }

  viewBooks.forEach((book) => {
    const createdAtText = window.formatBookCreatedAt
      ? window.formatBookCreatedAt(book.createdAt)
      : String(book.createdAt || "--");
    const yearText = book.year === "" || book.year === null || book.year === undefined ? "--" : book.year;

    adminTable.innerHTML += `
      <tr>
        <td>${escapeHtml((book.id || "").substring(0, 6))}</td>
        <td style="font-weight:bold">${escapeHtml(book.title || "")}</td>
        <td>${escapeHtml(book.author || "")}</td>
        <td>${escapeHtml(book.category || "--")}</td>
        <td>${escapeHtml(book.tag || "--")}</td>
        <td>${escapeHtml(book.publisher || "--")}</td>
        <td>${escapeHtml(yearText)}</td>
        <td>${escapeHtml(book.addedBy || "--")}</td>
        <td>${Number(book.stock) || 0}</td>
        <td>${escapeHtml(createdAtText)}</td>
        <td>
          <div class="action-group">
            <button class="btn-table btn-approve" onclick="openEditModal('${book.id}')">Sửa</button>
            <button class="btn-table btn-reject" onclick="deleteBook('${book.id}', this)">Xóa</button>
          </div>
        </td>
      </tr>`;
  });
};

window.renderAll = function () {
  const list = document.getElementById("bookList");

  const dataState = getAppDataState();
  const books = window.books || [];
  const loans = window.loans || [];
  const currentUser = window.currentUser || null;
  const state = getHomeSearchState();

  syncHomeSearchControls();

  if (list) {
    if (!dataState.initialLoaded && dataState.loading) {
      list.innerHTML = `<div style="text-align:center; width:100%; color: gray; grid-column: 1/-1; padding: 20px;"><h3>Đang tải dữ liệu sách...</h3></div>`;
      window.renderPagination?.(0);
      if (currentUser?.role === "admin") window.renderAdminBooks?.();
      return;
    }

    const filteredBooks = getFilteredHomeBooks(books, state);
    const perPage = window.getBooksPerPage ? window.getBooksPerPage() : 9;
    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / perPage));
    const safeCurrentPage = Math.min(Math.max(Number(window.currentPage) || 1, 1), totalPages);
    window.currentPage = safeCurrentPage;

    const startIndex = (safeCurrentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    list.innerHTML = "";

    if (!filteredBooks.length) {
      const hasKeyword = String(state.keyword || "").trim().length > 0;
      const emptyText = dataState.hasError && !books.length
        ? "Không tải được dữ liệu sách. Vui lòng thử lại."
        : (hasKeyword ? "Không tìm thấy cuốn nào!" : "Kho sách hiện chưa có dữ liệu.");
      list.innerHTML = `<div style="text-align:center; width:100%; color: gray; grid-column: 1/-1; padding: 20px;"><h3>${emptyText}</h3></div>`;
      window.renderPagination?.(0);
    } else {
      paginatedBooks.forEach((book) => {
        const btnHtml = buildBookActionButton(book, currentUser, loans);
        list.innerHTML += `
        <div class="book-card">
          <img src="${book.img || ""}" class="book-img" />
          <div class="book-title">${book.title || ""}</div>
          <div class="book-author">${book.author || ""}</div>
          <div>Kho: ${Number(book.stock) || 0}</div>
          ${btnHtml}
        </div>`;
      });

      window.renderPagination?.(filteredBooks.length);
    }
  }

  if (currentUser?.role === "admin") window.renderAdminBooks?.();
};

window.renderPagination = function (totalItems) {
  const paginationDiv = document.getElementById("pagination");
  if (!paginationDiv) return;

  const perPage = window.getBooksPerPage ? window.getBooksPerPage() : 9;
  const totalPages = Math.ceil(totalItems / perPage);

  paginationDiv.innerHTML = "";
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.className = `page-btn ${i === (window.currentPage || 1) ? "active" : ""}`;
    btn.onclick = () => {
      window.currentPage = i;
      window.renderAll?.();
      window.scrollTo({ top: 400, behavior: "smooth" });
    };
    paginationDiv.appendChild(btn);
  }
};

window.getBooksPerPage = function () {
  return window.matchMedia("(max-width: 768px)").matches ? 6 : 9;
};

window.lastBPP = window.lastBPP ?? window.getBooksPerPage();

window.addEventListener("resize", () => {
  const now = window.getBooksPerPage();
  if (now !== window.lastBPP) {
    window.lastBPP = now;
    window.currentPage = 1;
    window.renderAll?.();
  }
});

window.handleSearch = function () {
  const searchInput = document.getElementById("mainSearch");
  const keyword = String(searchInput?.value || "");
  const filterType = document.getElementById("searchFilter")?.value || "title";
  setHomeSearchState({ keyword, filterType });
  window.currentPage = 1;
  window.renderAll?.();
};

window.handleContactFeedback = function (event) {
  event?.preventDefault?.();

  const form = event?.target || document.getElementById("contactFeedbackForm");
  if (!(form instanceof HTMLFormElement)) return;

  const nameEl = document.getElementById("contactName");
  const emailEl = document.getElementById("contactEmail");
  const messageEl = document.getElementById("contactMessage");
  const msgEl = document.getElementById("contactFeedbackMsg");
  const submitBtn = form.querySelector('button[type="submit"]');

  const name = String(nameEl?.value || "").trim();
  const email = String(emailEl?.value || "").trim();
  const message = String(messageEl?.value || "").trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (msgEl) {
    msgEl.textContent = "";
    msgEl.classList.remove("show");
  }

  if (!name || !email || !message) {
    window.showToast?.("Vui lòng nhập đầy đủ họ tên, email và nội dung phản hồi.", "warning");
    return;
  }

  if (!emailPattern.test(email)) {
    window.showToast?.("Email không đúng định dạng.", "error");
    emailEl?.focus();
    return;
  }

  window.setButtonBusy?.(submitBtn, true, "Đang gửi...");
  window.setTimeout(() => {
    window.setButtonBusy?.(submitBtn, false);
    form.reset();

    if (msgEl) {
      msgEl.textContent = "Đã gửi phản hồi thành công. Thư viện sẽ phản hồi qua email trong thời gian sớm nhất.";
      msgEl.classList.add("show");
    }

    window.showToast?.("Đã gửi phản hồi thành công!", "success");
  }, 450);
};

window.toggleRollPanel = function () {
  const panel = document.getElementById("addBookPanel");
  if (!panel) return;
  panel.hidden = !panel.hidden;
  if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.closeAddPanel = function () {
  const panel = document.getElementById("addBookPanel");
  if (!panel) return;

  panel.hidden = true;
  const form = panel.querySelector("form");
  if (form) form.reset();

  const msg = document.getElementById("addBookMsg");
  if (msg) {
    msg.style.display = "none";
    msg.textContent = "";
  }
};

window.toggleUserPanel = function () {
  const panel = document.getElementById("addUserPanel");
  if (!panel) return;

  panel.hidden = !panel.hidden;
  if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.closeUserPanel = function () {
  const panel = document.getElementById("addUserPanel");
  if (panel) panel.hidden = true;

  const form = document.getElementById("addUserForm");
  if (form) form.reset();

  const msg = document.getElementById("addUserMsg");
  if (msg) {
    msg.style.display = "none";
    msg.textContent = "";
    msg.style.background = "rgba(46,125,50,.10)";
    msg.style.color = "#1b5e20";
  }
};
