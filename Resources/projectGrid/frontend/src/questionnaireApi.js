import axios from "axios";
import { updateProject, updateProjectField } from "./api";

const QA_BASE = "http://localhost:5010/api/v1";

const qaApi = axios.create({
  baseURL: QA_BASE,
  headers: { "Content-Type": "application/json" },
});

export const fetchQuestionnaireStatusAll = async () => {
  try {
    const { data } = await qaApi.get("/questionnaires/status");
    return data;
  } catch {
    return {};
  }
};

export const fetchQuestionnaireStatus = async (questionnaireId) => {
  try {
    const { data } = await qaApi.get(`/questionnaires/status/${questionnaireId}`);
    return data;
  } catch {
    return { isAnswered: false, submissionCount: 0 };
  }
};

export const createQuestionnaire = async (title, description = "") => {
  try {
    const { data } = await qaApi.post("/questionnaires", { title, description });
    return data; // { questionnaireId: "..." }
  } catch (err) {
    console.warn("Failed to create questionnaire:", err.message);
    return null;
  }
};

export const getAllQuestionnaires = async () => {
  try {
    const { data } = await qaApi.get("/questionnaires");
    return data;
  } catch {
    return [];
  }
};

/**
 * Find a questionnaire by its title (project name) from the
 * dynamic questionnaire service.
 */
export const findQuestionnaireByTitle = async (title) => {
  try {
    const all = await getAllQuestionnaires();
    return (
      all.find((q) => q.title?.toLowerCase() === title?.toLowerCase()) || null
    );
  } catch {
    return null;
  }
};

/**
 * Create a questionnaire for a project, then store the questionnaireId
 * back on the project document in projectGrid's DB.
 * Returns the questionnaireId or null.
 */
export const createAndLinkQuestionnaire = async (projectId, projectName) => {
  if (!projectName || !projectName.trim()) return null;

  // First check if one already exists for this project
  try {
    const existing = await findQuestionnaireByTitle(projectName.trim());
    if (existing) {
      const qId = existing._id || existing.id;
      // Store the ID on the project if not already stored
      await updateProject(projectId, { questionnaireId: qId }).catch(() => {});
      return qId;
    }
  } catch {
    // Not found, continue to create
  }

  // Create new questionnaire
  const result = await createQuestionnaire(projectName.trim());
  if (result && result.questionnaireId) {
    const qId = result.questionnaireId;
    // Store the questionnaireId on the project
    await updateProject(projectId, { questionnaireId: qId }).catch(() => {});
    return qId;
  }
  return null;
};

export const QUESTIONNAIRE_URL = "http://localhost:5177";
