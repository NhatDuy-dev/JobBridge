// Dữ liệu, cấu hình và trạng thái dùng chung của SPA.
const STORAGE_KEYS = {
  users: "jobbridge_spa_users",
  jobs: "jobbridge_spa_jobs",
  applications: "jobbridge_spa_applications",
  cvs: "jobbridge_spa_cvs",
  reports: "jobbridge_spa_job_reports",
  adminLogs: "jobbridge_spa_admin_logs",
  adminSettings: "jobbridge_spa_admin_settings",
  session: "jobbridge_spa_session",
};

const CV_FILE_DATABASE = "jobbridge_cv_files";
const CV_FILE_STORE = "cvFiles";
const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;

const seedUsers = [
  {
    id: 1,
    name: "Nguyen Minh Anh",
    email: "ungvien@test.com",
    password: "123",
    role: "candidate",
    avatar: "MA",
    desiredTitle: "Frontend Developer",
    phone: "0901234567",
    location: "TP.HCM",
    dateOfBirth: "2000-05-12",
    gender: "Nữ",
    experienceLevel: "1 nam",
    education: "Đại học Công nghệ - Công nghệ thông tin",
    portfolio: "https://portfolio.example.com",
    summary: "Ứng viên frontend yêu thích xây dựng giao diện tuyển dụng rõ ràng, dễ dùng và tối ưu trải nghiệm người dùng.",
    skills: ["ReactJS", "Figma", "JavaScript"],
    savedJobs: [102],
    appliedJobs: [101, 102, 104],
  },
  {
    id: 2,
    name: "Cong ty BridgeTech",
    email: "congty@test.com",
    password: "123",
    role: "employer",
  },
  {
    id: 3,
    name: "Quan tri vien",
    email: "admin@test.com",
    password: "123",
    role: "admin",
  },
];

const seedJobs = [
  {
    id: 101,
    title: "Frontend Developer",
    company: "BridgeTech",
    salary: "20 - 35 trieu",
    minSalary: 20,
    maxSalary: 35,
    location: "TP.HCM",
    type: "Full-time",
    status: "Approved",
    description: "Xay dung giao dien dashboard tuyen dung bang HTML, CSS va JavaScript.",
    category: "IT - Cong nghe thong tin",
    experience: "1 nam",
    companyField: "Cong nghe",
    jobField: "IT - Cong nghe thong tin",
    saturday: "off",
  },
  {
    id: 102,
    title: "UI UX Designer",
    company: "Nova Studio",
    salary: "18 - 30 trieu",
    minSalary: 18,
    maxSalary: 30,
    location: "Ha Noi",
    type: "Full-time",
    status: "Approved",
    description: "Thiet ke flow ung tuyen, prototype va design system cho san pham viec lam.",
    category: "Thiet ke va Kien truc",
    experience: "2 nam",
    companyField: "Sang tao",
    jobField: "Marketing sang tao",
    saturday: "unknown",
  },
  {
    id: 103,
    title: "Backend Node.js Engineer",
    company: "CloudNest",
    salary: "30 - 45 trieu",
    minSalary: 30,
    maxSalary: 45,
    location: "Remote",
    type: "Remote",
    status: "Pending",
    description: "Phat trien API, xu ly ung tuyen va quan ly co so du lieu viec lam.",
    category: "IT - Cong nghe thong tin",
    experience: "3 nam",
    companyField: "Cong nghe",
    jobField: "IT - Cong nghe thong tin",
    saturday: "work",
  },
  {
    id: 104,
    title: "Data Analyst",
    company: "FinSight",
    salary: "16 - 28 trieu",
    minSalary: 16,
    maxSalary: 28,
    location: "Da Nang",
    type: "Remote",
    status: "Approved",
    description: "Phan tich du lieu ung vien, tao bao cao ve ty le ung tuyen va nganh nghe hot.",
    category: "Ke toan",
    experience: "Duoi 1 nam",
    companyField: "Tai chinh",
    jobField: "Ke toan/Kiem toan",
    saturday: "off",
  },
];

const jobCategories = [
  { label: "Marketing", value: "Marketing", count: 5515 },
  { label: "Kế toán", value: "Ke toan", count: 4654 },
  { label: "Nhân sự", value: "Nhan su", count: 2042 },
  { label: "Quản lý dự án xây dựng", value: "Quan ly du an xay dung", count: 1963 },
  { label: "Thiết kế và Kiến trúc", value: "Thiet ke va Kien truc", count: 1544 },
];

const experienceOptions = [
  { label: "Không yêu cầu", value: "Khong yeu cau" },
  { label: "Dưới 1 năm", value: "Duoi 1 nam" },
  { label: "1 năm", value: "1 nam" },
  { label: "2 năm", value: "2 nam" },
  { label: "3 năm", value: "3 nam" },
  { label: "4 năm", value: "4 nam" },
  { label: "5 năm", value: "5 nam" },
  { label: "Trên 5 năm", value: "Tren 5 nam" },
];

const companyFields = [
  { label: "Tất cả lĩnh vực", value: "" },
  { label: "Công nghệ", value: "Cong nghe" },
  { label: "Sáng tạo", value: "Sang tao" },
  { label: "Tài chính", value: "Tai chinh" },
  { label: "Dịch vụ", value: "Dich vu" },
  { label: "Xây dựng", value: "Xay dung" },
];

const jobFields = [
  { label: "Tất cả lĩnh vực", value: "" },
  { label: "IT - Công nghệ thông tin", value: "IT - Cong nghe thong tin" },
  { label: "Marketing sáng tạo", value: "Marketing sang tao" },
  { label: "Kế toán/Kiểm toán", value: "Ke toan/Kiem toan" },
  { label: "Hành chính/Văn phòng", value: "Hanh chinh/Van phong" },
  { label: "Bán hàng/Kinh doanh", value: "Ban hang/Kinh doanh" },
];

const careerCategories = [
  { title: "Việc không yêu cầu bằng cấp", icon: "doc", keyword: "Khong yeu cau" },
  { title: "Việc thực tập sinh", icon: "cap", keyword: "thuc tap" },
  { title: "Việc part-time, thời vụ", icon: "hour", keyword: "part-time" },
  { title: "Bán hàng/Kinh doanh", icon: "tag", keyword: "Ban hang/Kinh doanh" },
  { title: "Hành chính/Văn phòng", icon: "office", keyword: "Hanh chinh/Van phong" },
  { title: "IT-Công nghệ thông tin", icon: "code", keyword: "IT - Cong nghe thong tin" },
  { title: "Marketing sáng tạo", icon: "mega", keyword: "Marketing sang tao" },
  { title: "Kế toán/Kiểm toán", icon: "calc", keyword: "Ke toan/Kiem toan" },
  { title: "Xem tất cả Ngành nghề", icon: "more", keyword: "" },
];

const siteNavItems = [
  {
    label: "Việc làm",
    active: true,
    items: ["Tìm việc làm", "Việc làm mới nhất", "Việc làm theo ngành", "Việc làm theo địa điểm"],
  },
  {
    label: "Tạo CV",
    items: ["Mẫu CV chuyên nghiệp", "Tạo CV online", "Quản lý CV", "Kiểm tra CV"],
  },
  {
    label: "Công cụ",
    items: ["Tính lương Gross Net", "Trắc nghiệm tính cách", "Gợi ý nghề nghiệp", "So sánh lương"],
  },
  {
    label: "Cẩm nang nghề nghiệp",
    items: ["Định hướng nghề nghiệp", "Kinh nghiệm phỏng vấn", "Mẫu email ứng tuyển", "Xu hướng tuyển dụng"],
  },
];

const seedApplications = [
  {
    id: 1001,
    candidateId: 1,
    candidateName: "Nguyen Minh Anh",
    jobId: 101,
    jobTitle: "Frontend Developer",
    company: "BridgeTech",
    status: "Da nop",
    appliedAt: "2026-07-01",
    cvId: 501,
    cvName: "CV Frontend Developer",
    coverLetter: "Tôi mong muốn được ứng tuyển vị trí Frontend Developer và đóng góp kinh nghiệm xây dựng giao diện web.",
  },
  {
    id: 1002,
    candidateId: 1,
    candidateName: "Le Bao Tran",
    jobId: 102,
    jobTitle: "UI UX Designer",
    company: "Nova Studio",
    status: "Len lich phong van",
    appliedAt: "2026-07-03",
    cvId: 501,
    cvName: "CV Frontend Developer",
    coverLetter: "Tôi quan tâm đến cơ hội thiết kế sản phẩm tại Nova Studio.",
  },
  {
    id: 1003,
    candidateId: 1,
    candidateName: "Tran Hoang Khoa",
    jobId: 104,
    jobTitle: "Data Analyst",
    company: "FinSight",
    status: "Tu choi",
    appliedAt: "2026-07-05",
    cvId: 501,
    cvName: "CV Frontend Developer",
    coverLetter: "Tôi mong muốn phát triển thêm kỹ năng phân tích dữ liệu.",
  },
];

const featuredEmployers = [
  { name: "BridgeTech", mark: "BT", field: "Công nghệ", tone: "blue" },
  { name: "Nova Studio", mark: "NS", field: "Thiết kế sáng tạo", tone: "violet" },
  { name: "CloudNest", mark: "CN", field: "Nền tảng đám mây", tone: "cyan" },
  { name: "FinSight", mark: "FS", field: "Tài chính dữ liệu", tone: "green" },
  { name: "VietData", mark: "VD", field: "Dữ liệu doanh nghiệp", tone: "orange" },
  { name: "GreenWorks", mark: "GW", field: "Giải pháp bền vững", tone: "emerald" },
];

const seedCvs = [
  {
    id: 501,
    candidateId: 1,
    name: "CV Frontend Developer",
    source: "profile",
    createdAt: "2026-06-28",
    updatedAt: "2026-06-28",
  },
];

const seedJobReports = [];

const appState = {
  users: [],
  jobs: [],
  applications: [],
  cvs: [],
  reports: [],
  currentUser: null,
  authMode: "login",
  candidateTab: "jobs",
  candidateKeyword: "",
  candidateSort: "newest",
  detailJobId: null,
  candidateFilters: {
    location: "",
    types: [],
    minSalary: 0,
    saturday: "",
    categories: [],
    experiences: [],
    companyField: "",
    jobField: "",
  },
  matchScores: {},
  companyTab: "home",
  adminTab: "dashboard",
  adminSearch: "",
};

const app = document.querySelector("#app");
let realtimeUpdateTimer = null;
