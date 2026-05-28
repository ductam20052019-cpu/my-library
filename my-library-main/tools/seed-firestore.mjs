import { createRequire } from "node:module";
import path from "node:path";

const PROJECT_ID = "mylibrary-cdb4e";
const DATABASE_ID = "(default)";
const ADMIN = {
  username: "admin",
  indexId: "ADMIN",
  name: "Admin Thu Vien",
  email: "lb@ptithcm.edu.vn",
  authUid: "2rEc9TY961QMmj9VF3e6JdP428y2",
  role: "admin"
};

const require = createRequire(import.meta.url);

function firebaseToolsPath(...parts) {
  const appData = process.env.APPDATA;
  if (!appData) {
    throw new Error("Khong tim thay bien moi truong APPDATA de nap firebase-tools.");
  }
  return path.join(appData, "npm", "node_modules", "firebase-tools", ...parts);
}

async function getFirebaseAccessToken() {
  const auth = require(firebaseToolsPath("lib", "auth.js"));
  const scopes = require(firebaseToolsPath("lib", "scopes.js"));
  const account = auth.getProjectDefaultAccount?.(process.cwd()) || auth.getGlobalDefaultAccount?.();

  if (!account?.tokens?.refresh_token) {
    throw new Error("Firebase CLI chua dang nhap. Chay: firebase.cmd login");
  }

  const tokenData = await auth.getAccessToken(account.tokens.refresh_token, [
    scopes.CLOUD_PLATFORM,
    scopes.FIREBASE_PLATFORM
  ]);

  if (!tokenData?.access_token) {
    throw new Error("Khong lay duoc access token tu Firebase CLI.");
  }

  return tokenData.access_token;
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(firestoreValue) } };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nestedValue]) => [key, firestoreValue(nestedValue)])
        )
      }
    };
  }
  return { stringValue: String(value) };
}

function firestoreFields(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, firestoreValue(value)])
  );
}

function docName(collectionId, docId) {
  return `projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/${collectionId}/${docId}`;
}

function upsertWrite(collectionId, docId, data) {
  return {
    update: {
      name: docName(collectionId, docId),
      fields: firestoreFields(data)
    },
    updateMask: {
      fieldPaths: Object.keys(data)
    }
  };
}

function todayVN() {
  return new Date().toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

const now = Date.now();
const nowIso = new Date().toISOString();

const books = [
  {
    id: "seed-book-cnpm",
    title: "Nhap mon Cong nghe phan mem",
    author: "PTIT Team",
    stock: 8,
    category: "Giao trinh",
    tag: "cnpm",
    year: 2025,
    publisher: "NXB Giao Duc",
    desc: "Tai lieu nen tang cho mon Cong nghe phan mem.",
    img: "https://placehold.co/240x340?text=CNPM"
  },
  {
    id: "seed-book-clean-code",
    title: "Clean Code",
    author: "Robert C. Martin",
    stock: 6,
    category: "Lap trinh",
    tag: "software",
    year: 2008,
    publisher: "Prentice Hall",
    desc: "Nguyen tac viet ma sach, de bao tri.",
    img: "https://placehold.co/240x340?text=Clean+Code"
  },
  {
    id: "seed-book-design-patterns",
    title: "Design Patterns",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    stock: 4,
    category: "Kien truc phan mem",
    tag: "patterns",
    year: 1994,
    publisher: "Addison-Wesley",
    desc: "Cac mau thiet ke huong doi tuong kinh dien.",
    img: "https://placehold.co/240x340?text=Patterns"
  },
  {
    id: "seed-book-algorithms",
    title: "Giai thuat va Lap trinh",
    author: "Le Minh Hoang",
    stock: 10,
    category: "Giai thuat",
    tag: "algorithm",
    year: 2012,
    publisher: "NXB Dai hoc",
    desc: "Bai tap va ky thuat giai thuat co ban den nang cao.",
    img: "https://placehold.co/240x340?text=Algorithms"
  },
  {
    id: "seed-book-database",
    title: "Co so du lieu",
    author: "Nguyen Kim Anh",
    stock: 9,
    category: "Co so du lieu",
    tag: "database",
    year: 2021,
    publisher: "NXB Bach Khoa",
    desc: "Thiet ke CSDL quan he, SQL va chuan hoa du lieu.",
    img: "https://placehold.co/240x340?text=Database"
  },
  {
    id: "seed-book-networking",
    title: "Mang may tinh",
    author: "Andrew S. Tanenbaum",
    stock: 7,
    category: "Mang may tinh",
    tag: "network",
    year: 2011,
    publisher: "Pearson",
    desc: "Kien thuc nen tang ve giao thuc va he thong mang.",
    img: "https://placehold.co/240x340?text=Network"
  },
  {
    id: "seed-book-os",
    title: "He dieu hanh",
    author: "Abraham Silberschatz",
    stock: 5,
    category: "He thong",
    tag: "os",
    year: 2018,
    publisher: "Wiley",
    desc: "Tien trinh, bo nho, file system va dong bo.",
    img: "https://placehold.co/240x340?text=OS"
  },
  {
    id: "seed-book-web",
    title: "Lap trinh Web",
    author: "PTIT HCM",
    stock: 12,
    category: "Lap trinh",
    tag: "web",
    year: 2024,
    publisher: "PTIT",
    desc: "HTML, CSS, JavaScript va ung dung web hien dai.",
    img: "https://placehold.co/240x340?text=Web"
  },
  {
    id: "seed-book-ai",
    title: "Tri tue nhan tao",
    author: "Stuart Russell, Peter Norvig",
    stock: 3,
    category: "AI",
    tag: "ai",
    year: 2020,
    publisher: "Pearson",
    desc: "Tong quan AI, tim kiem, hoc may va suy luan.",
    img: "https://placehold.co/240x340?text=AI"
  },
  {
    id: "seed-book-security",
    title: "An toan thong tin",
    author: "William Stallings",
    stock: 6,
    category: "Bao mat",
    tag: "security",
    year: 2017,
    publisher: "Pearson",
    desc: "Ma hoa, xac thuc, an toan mang va ung dung.",
    img: "https://placehold.co/240x340?text=Security"
  },
  {
    id: "seed-book-java",
    title: "Lap trinh Java",
    author: "Cay S. Horstmann",
    stock: 11,
    category: "Lap trinh",
    tag: "java",
    year: 2019,
    publisher: "Pearson",
    desc: "Cu phap Java, OOP, collection va xu ly ngoai le.",
    img: "https://placehold.co/240x340?text=Java"
  },
  {
    id: "seed-book-python",
    title: "Python Co Ban",
    author: "Al Sweigart",
    stock: 14,
    category: "Lap trinh",
    tag: "python",
    year: 2020,
    publisher: "No Starch Press",
    desc: "Lap trinh Python qua cac vi du thuc hanh.",
    img: "https://placehold.co/240x340?text=Python"
  },
  {
    id: "seed-book-git",
    title: "Git va GitHub",
    author: "Scott Chacon, Ben Straub",
    stock: 8,
    category: "Cong cu",
    tag: "git",
    year: 2014,
    publisher: "Apress",
    desc: "Quan ly phien ban va lam viec nhom voi Git.",
    img: "https://placehold.co/240x340?text=Git"
  },
  {
    id: "seed-book-ux",
    title: "Thiet ke giao dien nguoi dung",
    author: "Don Norman",
    stock: 4,
    category: "UI UX",
    tag: "ux",
    year: 2013,
    publisher: "Basic Books",
    desc: "Nguyen ly thiet ke san pham de su dung.",
    img: "https://placehold.co/240x340?text=UX"
  },
  {
    id: "seed-book-cloud",
    title: "Dien toan dam may",
    author: "Thomas Erl",
    stock: 5,
    category: "Cloud",
    tag: "cloud",
    year: 2015,
    publisher: "Prentice Hall",
    desc: "Khai niem dich vu cloud, mo hinh trien khai va van hanh.",
    img: "https://placehold.co/240x340?text=Cloud"
  },
  {
    id: "seed-book-testing",
    title: "Kiem thu phan mem",
    author: "Glenford J. Myers",
    stock: 9,
    category: "Kiem thu",
    tag: "testing",
    year: 2011,
    publisher: "Wiley",
    desc: "Ky thuat test case, unit test va quan ly loi.",
    img: "https://placehold.co/240x340?text=Testing"
  },
  {
    id: "seed-book-oop",
    title: "Lap trinh huong doi tuong",
    author: "Bertrand Meyer",
    stock: 7,
    category: "Lap trinh",
    tag: "oop",
    year: 1997,
    publisher: "Prentice Hall",
    desc: "Dong goi, ke thua, da hinh va thiet ke lop.",
    img: "https://placehold.co/240x340?text=OOP"
  },
  {
    id: "seed-book-data-structures",
    title: "Cau truc du lieu",
    author: "Mark Allen Weiss",
    stock: 10,
    category: "Giai thuat",
    tag: "data-structures",
    year: 2014,
    publisher: "Pearson",
    desc: "Mang, danh sach lien ket, cay, heap va bang bam.",
    img: "https://placehold.co/240x340?text=Data"
  },
  {
    id: "seed-book-project-management",
    title: "Quan ly du an phan mem",
    author: "Roger S. Pressman",
    stock: 6,
    category: "Quan ly du an",
    tag: "project",
    year: 2020,
    publisher: "McGraw-Hill",
    desc: "Lap ke hoach, uoc luong, rui ro va quan tri du an.",
    img: "https://placehold.co/240x340?text=Project"
  },
  {
    id: "seed-book-react",
    title: "React Thuc Chien",
    author: "Alex Banks, Eve Porcello",
    stock: 8,
    category: "Lap trinh Web",
    tag: "react",
    year: 2020,
    publisher: "O'Reilly",
    desc: "Component, state, hooks va xay dung UI hien dai.",
    img: "https://placehold.co/240x340?text=React"
  }
];

const loanPlaceholder = {
  username: ADMIN.username,
  userAuthUid: ADMIN.authUid,
  bookId: "seed-book-cnpm",
  bookTitle: "Nhap mon Cong nghe phan mem",
  status: "returned",
  date: todayVN(),
  borrowDate: todayVN(),
  dueDate: todayVN(),
  returnedAt: nowIso,
  returnMethod: "seed",
  overdueDays: 0,
  fineAmount: 0
};

const writes = [
  upsertWrite("roles", ADMIN.authUid, {
    role: ADMIN.role,
    updatedAt: now
  }),
  upsertWrite("usernames", ADMIN.indexId, {
    authUid: ADMIN.authUid,
    email: ADMIN.email,
    role: ADMIN.role,
    updatedAt: now,
    userId: ADMIN.username
  }),
  upsertWrite("authUsers", ADMIN.authUid, {
    authUid: ADMIN.authUid,
    email: ADMIN.email,
    role: ADMIN.role,
    updatedAt: now,
    userId: ADMIN.username
  }),
  upsertWrite("users", ADMIN.username, {
    username: ADMIN.username,
    name: ADMIN.name,
    email: ADMIN.email,
    class: "ADMIN",
    dept: "Thu vien",
    authUid: ADMIN.authUid,
    authProvider: "firebase-auth",
    passwordManagedBy: "firebase-auth",
    role: ADMIN.role,
    locked: false,
    createdAt: now,
    updatedAt: now
  }),
  ...books.map((book) => upsertWrite("books", book.id, {
    title: book.title,
    author: book.author,
    stock: book.stock,
    img: book.img,
    desc: book.desc,
    addedBy: ADMIN.name,
    category: book.category,
    tag: book.tag,
    year: book.year,
    publisher: book.publisher,
    createdAt: nowIso
  })),
  upsertWrite("loans", "seed-loan-returned", loanPlaceholder)
];

async function commitInBatches(token) {
  const batchSize = 400;
  let committed = 0;

  for (let i = 0; i < writes.length; i += batchSize) {
    const chunk = writes.slice(i, i + batchSize);
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${encodeURIComponent(DATABASE_ID)}/documents:commit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ writes: chunk })
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Firestore commit failed (${response.status}): ${body}`);
    }

    committed += chunk.length;
  }

  return committed;
}

async function documentExists(token, collectionId, docId) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/${docName(collectionId, docId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 404) return false;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore verify failed (${response.status}): ${body}`);
  }
  return true;
}

async function verifySeed(token) {
  const checks = [
    ["roles", ADMIN.authUid],
    ["usernames", ADMIN.indexId],
    ["authUsers", ADMIN.authUid],
    ["users", ADMIN.username],
    ["books", "seed-book-cnpm"],
    ["loans", "seed-loan-returned"]
  ];

  for (const [collectionId, docId] of checks) {
    const exists = await documentExists(token, collectionId, docId);
    console.log(`${exists ? "OK" : "MISS"} ${collectionId}/${docId}`);
  }

  const authResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: [ADMIN.email],
        targetProjectId: PROJECT_ID
      })
    }
  );

  if (!authResponse.ok) {
    const body = await authResponse.text();
    throw new Error(`Firebase Auth verify failed (${authResponse.status}): ${body}`);
  }

  const authBody = await authResponse.json();
  const authUser = authBody.users?.[0];
  if (!authUser) {
    console.log(`MISS auth/${ADMIN.email}`);
  } else if (authUser.localId === ADMIN.authUid) {
    console.log(`OK auth/${ADMIN.email} uid=${authUser.localId}`);
  } else {
    console.log(`WARN auth/${ADMIN.email} uid=${authUser.localId}, expected=${ADMIN.authUid}`);
  }
}

const dryRun = process.argv.includes("--dry-run");
const verify = process.argv.includes("--verify");
console.log(`Project: ${PROJECT_ID}`);
console.log(`Documents to upsert: ${writes.length}`);
console.log("Collections: authUsers, books, loans, roles, usernames, users");

if (dryRun) {
  console.log("Dry run only. Add --apply to write data.");
  process.exit(0);
}

if (verify) {
  const token = await getFirebaseAccessToken();
  await verifySeed(token);
  process.exit(0);
}

if (!process.argv.includes("--apply")) {
  throw new Error("Them co --apply de ghi du lieu len Firestore.");
}

const token = await getFirebaseAccessToken();
const committed = await commitInBatches(token);
console.log(`Done. Upserted ${committed} documents.`);
