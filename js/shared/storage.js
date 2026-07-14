// LocalStorage, chuẩn hoá dữ liệu và cập nhật hồ sơ dùng chung.
function bootMockDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.jobs)) {
    localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(seedJobs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.applications)) {
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(seedApplications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.cvs)) {
    localStorage.setItem(STORAGE_KEYS.cvs, JSON.stringify(seedCvs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.reports)) {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(seedJobReports));
  }
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUser(user) {
  return {
    ...user,
    avatar: user.avatar || getInitials(user.name || user.email || "UV"),
    desiredTitle: user.desiredTitle || (user.role === "candidate" ? "Frontend Developer" : ""),
    phone: user.phone || "",
    location: user.location || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: user.gender || "",
    experienceLevel: user.experienceLevel || "",
    education: user.education || "",
    portfolio: user.portfolio || "",
    summary: user.summary || "",
    skills: Array.isArray(user.skills) ? user.skills : [],
    savedJobs: Array.isArray(user.savedJobs) ? user.savedJobs : [],
    appliedJobs: Array.isArray(user.appliedJobs) ? user.appliedJobs : [],
  };
}

function normalizeCv(cv) {
  const timestamp = cv.updatedAt || cv.createdAt || new Date().toISOString();
  return {
    ...cv,
    id: Number(cv.id),
    candidateId: Number(cv.candidateId),
    name: String(cv.name || "CV chưa đặt tên"),
    source: cv.source === "upload" ? "upload" : "profile",
    originalFileName: String(cv.originalFileName || ""),
    fileSize: Number(cv.fileSize || 0),
    mimeType: String(cv.mimeType || ""),
    createdAt: cv.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function normalizeApplication(application) {
  return {
    ...application,
    id: Number(application.id),
    candidateId: Number(application.candidateId),
    jobId: Number(application.jobId),
    coverLetter: String(application.coverLetter || ""),
    cvId: application.cvId ? Number(application.cvId) : null,
    cvName: String(application.cvName || "CV không xác định"),
    withdrawnAt: application.withdrawnAt || null,
  };
}

function normalizeJob(job) {
  const salaryNumbers = String(job.salary || "")
    .match(/\d+/g)
    ?.map(Number) || [0, 0];
  const minSalary = Number.isFinite(job.minSalary) ? job.minSalary : salaryNumbers[0] || 0;
  const maxSalary = Number.isFinite(job.maxSalary)
    ? job.maxSalary
    : salaryNumbers[salaryNumbers.length - 1] || minSalary;
  const now = new Date().toISOString();
  const createdAt = job.createdAt || job.postedAt || job.updatedAt || now;
  const updatedAt = job.updatedAt || createdAt;

  const normalizedJob = {
    ...job,
    minSalary,
    maxSalary,
    createdAt,
    updatedAt,
    type: job.type || (job.location === "Remote" ? "Remote" : "Full-time"),
  };

  return {
    ...normalizedJob,
    category: normalizedJob.category || getDefaultJobCategory(normalizedJob),
    experience: normalizedJob.experience || getDefaultJobExperience(normalizedJob),
    companyField: normalizedJob.companyField || getDefaultCompanyField(normalizedJob),
    jobField: normalizedJob.jobField || getDefaultJobField(normalizedJob),
    saturday: normalizedJob.saturday || "unknown",
  };
}

function getDefaultJobCategory(job) {
  const text = `${job.title} ${job.description}`.toLowerCase();
  if (text.includes("design") || text.includes("ux")) return "Thiet ke va Kien truc";
  if (text.includes("data") || text.includes("ke toan")) return "Ke toan";
  if (text.includes("marketing")) return "Marketing";
  if (text.includes("nhan su")) return "Nhan su";
  return "IT - Cong nghe thong tin";
}

function getDefaultJobExperience(job) {
  if (job.maxSalary >= 40) return "3 nam";
  if (job.maxSalary >= 30) return "2 nam";
  if (job.maxSalary >= 25) return "1 nam";
  return "Khong yeu cau";
}

function getDefaultCompanyField(job) {
  const category = getDefaultJobCategory(job);
  if (category === "Ke toan") return "Tai chinh";
  if (category === "Marketing" || category === "Thiet ke va Kien truc") return "Sang tao";
  if (category.includes("xay dung")) return "Xay dung";
  return "Cong nghe";
}

function getDefaultJobField(job) {
  const category = getDefaultJobCategory(job);
  if (category === "Ke toan") return "Ke toan/Kiem toan";
  if (category === "Marketing" || category === "Thiet ke va Kien truc") return "Marketing sang tao";
  return "IT - Cong nghe thong tin";
}

function hydrateSessionUser(sessionUser) {
  if (!sessionUser) return null;
  const fullUser = appState.users.find((user) => user.id === sessionUser.id);
  return fullUser ? createSessionUser(fullUser) : null;
}

function createSessionUser(user) {
  const normalizedUser = normalizeUser(user);
  return {
    id: normalizedUser.id,
    name: normalizedUser.name,
    email: normalizedUser.email,
    role: normalizedUser.role,
    avatar: normalizedUser.avatar,
    desiredTitle: normalizedUser.desiredTitle,
    phone: normalizedUser.phone,
    location: normalizedUser.location,
    dateOfBirth: normalizedUser.dateOfBirth,
    gender: normalizedUser.gender,
    experienceLevel: normalizedUser.experienceLevel,
    education: normalizedUser.education,
    portfolio: normalizedUser.portfolio,
    summary: normalizedUser.summary,
    skills: normalizedUser.skills,
    savedJobs: normalizedUser.savedJobs,
    appliedJobs: normalizedUser.appliedJobs,
  };
}

function syncAppliedJobsFromApplications() {
  appState.users = appState.users.map((user) => {
    if (user.role !== "candidate") return user;
    const appliedFromApplications = appState.applications
      .filter((application) => application.candidateId === user.id && !application.withdrawnAt)
      .map((application) => application.jobId);
    return {
      ...user,
      appliedJobs: Array.from(new Set(appliedFromApplications)),
    };
  });
}

function updateCurrentUser(patch) {
  const existingUser = appState.users.find((user) => user.id === appState.currentUser.id) || {};
  const updatedUser = normalizeUser({
    ...existingUser,
    ...appState.currentUser,
    ...patch,
  });
  appState.currentUser = createSessionUser(updatedUser);
  appState.users = appState.users.map((user) =>
    user.id === appState.currentUser.id ? updatedUser : user,
  );
  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
}
