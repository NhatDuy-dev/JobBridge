export const JOB_STATUSES = [
  "Pending",
  "Approved",
  "Rejected",
  "Closed",
];

export function isValidJobStatus(status) {
  return JOB_STATUSES.includes(status);
}

export function canAdminChangeApplicationStatus() {
  return false;
}

export function getApplicationManagementMessage() {
  return "Hồ sơ ứng tuyển do doanh nghiệp xử lý.";
}

export function getJobStatusLabel(status) {
  const labels = {
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Bị từ chối",
    Closed: "Đã đóng",
  };

  return labels[status] || "Không xác định";
}