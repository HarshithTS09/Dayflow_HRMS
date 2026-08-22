import api from "./api";

export const getMyPayroll = () => api.get("/payroll/me").then((r) => r.data);
export const getAllPayroll = (params = {}) => api.get("/payroll", { params }).then((r) => r.data);
export const upsertPayroll = (id, payload) =>
  api.put(`/payroll/${id}`, payload).then((r) => r.data);
