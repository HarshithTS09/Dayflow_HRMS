import api from "./api";

export const getEmployees = (search = "") =>
  api.get("/employees", { params: search ? { search } : {} }).then((r) => r.data);

export const getEmployeeById = (id) => api.get(`/employees/${id}`).then((r) => r.data);

export const updateEmployee = (id, payload) =>
  api.put(`/employees/${id}`, payload).then((r) => r.data);
