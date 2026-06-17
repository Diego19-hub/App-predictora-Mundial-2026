import api from "./api";

export const savePrediction = (payload) => api.post("/predictions", payload);
export const getMyPredictions = () => api.get("/predictions/my");
export const updatePrediction = (id, payload) => api.put(`/predictions/${id}`, payload);
export const deletePrediction = (id) => api.delete(`/predictions/${id}`);