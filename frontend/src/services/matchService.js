import api from "./api";

export const updateMatchResult = (id, payload) =>
    api.put(`/matches/admin/${id}/result`, payload);

export const getUpcomingMatches = () => api.get("/matches/upcoming");
export const getLiveMatches = () => api.get("/matches/live");
export const getFinishedMatches = () => api.get("/matches/finished");
export const getMatchById = (id) => api.get(`/matches/${id}`);