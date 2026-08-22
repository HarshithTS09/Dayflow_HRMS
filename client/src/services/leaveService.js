import api from "./api";

export const applyLeave = (payload) => api.post("/leave", payload).then((r) => r.data);
export const getMyLeaves = () => api.get("/leave/me").then((r) => r.data);
export const getAllLeaves = (params = {}) => api.get("/leave", { params }).then((r) => r.data);
export const getLeaveById = (id) => api.get(`/leave/${id}`).then((r) => r.data);
export const approveLeave = (id, comment) =>
  api.put(`/leave/${id}/approve`, { comment }).then((r) => r.data);
export const rejectLeave = (id, comment) =>
  api.put(`/leave/${id}/reject`, { comment }).then((r) => r.data);
