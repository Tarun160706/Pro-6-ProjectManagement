import axios from "axios";

export const BASE_URL = "http://localhost:5010/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------------------------------------------
   Questionnaires
   ------------------------------------------------------------- */
export const questionnaireApi = {
  list: () => api.get("/questionnaires"),
  listPublished: () => api.get("/questionnaires/published"),
  get: (id) => api.get(`/questionnaires/${id}`),
  create: (payload) => api.post("/questionnaires", payload),
  remove: (id) => api.delete(`/questionnaires/${id}`),
  publish: (id) => api.post(`/questionnaires/${id}/publish`),
};

/* ---------------------------------------------------------------
   Questions
   ------------------------------------------------------------- */
export const questionApi = {
  create: (payload) =>
    api.post("/questions", payload),

  update: (questionId, payload) =>
    api.put(`/questions/${questionId}`, payload),

  remove: (questionId) =>
    api.delete(`/questions/${questionId}`),

  getByQuestionnaire: (
    questionnaireId
  ) =>
    api.get(
      `/questions/questionnaire/${questionnaireId}`
    ),
};

/* ---------------------------------------------------------------
   Options
   ------------------------------------------------------------- */
export const optionApi = {
  create: (payload) =>
    api.post("/options", payload),

  remove: (optionId) =>
    api.delete(`/options/${optionId}`),

  getByQuestion: (
    questionId
  ) =>
    api.get(
      `/options/question/${questionId}`
    ),
};

/* ---------------------------------------------------------------
   Rules
   ------------------------------------------------------------- */
export const ruleApi = {
  create: (payload) => api.post("/rules", payload),
  remove: (ruleId) => api.delete(`/rules/${ruleId}`),
  getAll: ()=>api.get("/rules")
};

/* ---------------------------------------------------------------
   Responses (user takes a questionnaire)
   ------------------------------------------------------------- */
export const responseApi = {
  submit: (questionnaireId, answers) =>
    api.post(`/questionnaires/${questionnaireId}/responses`, { answers }),
};

export default api;
