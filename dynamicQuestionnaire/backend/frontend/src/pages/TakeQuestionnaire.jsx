import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api, { questionnaireApi, questionApi, optionApi, ruleApi } from "../services/api";
import axios from "axios";

const FEATURES_API = "http://127.0.0.1:5006/api/features";

function resolveNextQuestionId(question, allQuestions, answerValue) {
  const rules = question.rules || [];
  let nextId = null;

  // Single Choice and Complexity both use exact string matching for rules
  if (question.questionType === "SINGLE_CHOISE" || question.questionType === "COMPLEXITY") {
    const rule = rules.find((r) => String(r.optionId) === String(answerValue));
    if (rule) nextId = rule.nextQuestionId || rule.next_question_id;
  } 
  else if (question.questionType === "TEXT" || question.questionType === "NUMBER") {
    const rule = rules.find((r) => r.optionId === "ANY");
    if (rule) nextId = rule.nextQuestionId || rule.next_question_id;
  }

  if (nextId) {
    if (nextId === "SUBMIT") return "SUBMIT"; 
    return nextId; 
  }

  const currentId = question._id || question.id;
  const currentIndex = allQuestions.findIndex((q) => String(q._id || q.id) === String(currentId));

  if (currentIndex !== -1 && currentIndex + 1 < allQuestions.length) {
    const nextQuestion = allQuestions[currentIndex + 1];
    return nextQuestion._id || nextQuestion.id;
  }

  return "SUBMIT"; 
}

export default function TakeQuestionnaire({ isEmbedded = false }) {
  const { questionnaireId } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const currentVersion = urlParams.get("version") || "";

  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [answers, setAnswers] = useState({}); 
  const [hoursTracker, setHoursTracker] = useState({});
  const [responses, setResponses] = useState([]); 

  // Removed multiSelected, added complexitySelected
  const [singleSelected, setSingleSelected] = useState("");
  const [complexitySelected, setComplexitySelected] = useState("");
  const [textValue, setTextValue] = useState("");
  const [currentHours, setCurrentHours] = useState("");

  const [validationError, setValidationError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchFullQuestionnaire() {
      try {
        const qnRes = await questionnaireApi.get(questionnaireId);
        const questionnaireData = qnRes.data;

        const questionsRes = await questionApi.getByQuestionnaire(questionnaireId);
        
        const questionsWithData = await Promise.all(
          questionsRes.data.map(async (question) => {
            const qId = question._id || question.id;
            let options = [];
            let rules = [];

            try {
              const optionsRes = await optionApi.getByQuestion(qId);
              options = Array.isArray(optionsRes.data) ? optionsRes.data : [];
            } catch (e) { }

            try {
              const rulesRes = await ruleApi.getAll(); 
              rules = rulesRes.data.filter((r) => String(r.questionId) === String(qId));
            } catch (e) { }

            return { ...question, options, rules };
          })
        );

        setQuestionnaire({ ...questionnaireData, questions: questionsWithData });

        const start = questionsWithData.find((q) => q.isStartQuestion || q.isStarQuestion) ?? questionsWithData[0];
        if (start) {
          setCurrentQuestionId(start._id || start.id);
          setHistory([start._id || start.id]);
        }
      } catch (err) {
        setLoadError(err.response?.data?.detail || "Couldn't load this assessment.");
      } finally {
        setLoading(false);
      }
    }
    fetchFullQuestionnaire();
  }, [questionnaireId]);

  const questions = questionnaire?.questions ?? [];
  const currentQuestion = useMemo(
    () => questions.find((q) => String(q._id || q.id) === String(currentQuestionId)) || null,
    [questions, currentQuestionId]
  );

  // HYDRATION: Restores state when moving backwards
  useEffect(() => {
    if (!currentQuestionId || !currentQuestion) return;

    const existingAnswer = answers[currentQuestionId];
    const existingHours = hoursTracker[currentQuestionId];

    setSingleSelected("");
    setComplexitySelected("");
    setTextValue("");

    if (currentQuestion.questionType === "SINGLE_CHOISE") {
      setSingleSelected(existingAnswer || "");
    } else if (currentQuestion.questionType === "COMPLEXITY") {
      setComplexitySelected(existingAnswer || "");
    } else {
      setTextValue(existingAnswer !== undefined ? String(existingAnswer) : "");
    }

    setCurrentHours(existingHours !== undefined ? String(existingHours) : "");
    setValidationError("");
  }, [currentQuestionId, currentQuestion, answers, hoursTracker]);

  function handleBack() {
    if (history.length <= 1) return; 
    const newHistory = [...history];
    newHistory.pop(); 
    setHistory(newHistory);
    setCurrentQuestionId(newHistory[newHistory.length - 1]);
  }

  // AUTO-HOUR ALLOCATION LOGIC
  function handleComplexityChange(val) {
    setComplexitySelected(val);
    if (val === "High") setCurrentHours("8");
    else if (val === "Medium") setCurrentHours("4");
    else if (val === "Low") setCurrentHours("2");
    else setCurrentHours("");
  }

  async function handleNext() {
    if (!currentQuestion) return;

    let answerValue;
    const safeCurrentId = currentQuestion._id || currentQuestion.id;
    
    if (currentQuestion.questionType === "SINGLE_CHOISE") {
      if (!singleSelected) { setValidationError("Choose an option."); return; }
      answerValue = singleSelected;
    } else if (currentQuestion.questionType === "COMPLEXITY") {
      if (!complexitySelected) { setValidationError("Select a complexity level."); return; }
      answerValue = complexitySelected;
    } else if (currentQuestion.questionType === "NUMBER") {
      if (textValue.trim() === "" || Number.isNaN(Number(textValue))) { setValidationError("Enter a valid number."); return; }
      answerValue = Number(textValue);
    } else {
      if (!textValue.trim()) { setValidationError("Enter an answer."); return; }
      answerValue = textValue.trim();
    }

    if (!currentHours.trim() || Number.isNaN(Number(currentHours)) || Number(currentHours) < 0) {
      setValidationError("Please enter valid hours spent."); return;
    }
    
    const responseEntry = { 
      questionId: safeCurrentId, 
      answer: answerValue,
      platform: currentQuestion.platform || "",
      module: currentQuestion.module || "",
      subModule: currentQuestion.subModule || "",
      hours: Number(currentHours)
    };

    setAnswers({ ...answers, [safeCurrentId]: answerValue });
    setHoursTracker({ ...hoursTracker, [safeCurrentId]: Number(currentHours) });
    setResponses([...responses.filter((r) => String(r.questionId) !== String(safeCurrentId)), responseEntry]);

    const nextId = resolveNextQuestionId(currentQuestion, questions, answerValue);

    if (nextId === "SUBMIT") {
      await finish([...responses.filter((r) => String(r.questionId) !== String(safeCurrentId)), responseEntry]);
      return;
    }

    setHistory((prev) => [...prev, nextId]);
    setCurrentQuestionId(nextId);
  }

  async function finish(finalResponses) {
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/submissions", {
        questionnaireId: questionnaireId,
        userId: isEmbedded ? "admin-preview-999" : "anonymous",
        answers: finalResponses
      });

      // Auto-push answers to features-grid
      const projectName = questionnaire?.title || "Untitled";
      const ver = currentVersion || "";
      for (const response of finalResponses) {
        const currentQ = questions.find(q => String(q._id || q.id) === String(response.questionId));
        if (currentQ && response.answer) {
          let answerText = String(response.answer);
          // For single choice, resolve option text
          if (currentQ.questionType === "SINGLE_CHOISE") {
            const opt = (currentQ.options || []).find(o => String(o._id || o.id) === String(response.answer));
            if (opt) answerText = opt.optionText;
          }
          try {
            await axios.post(FEATURES_API, {
              projectName: projectName,
              version: ver,
              platform: currentQ.platform || "",
              module: currentQ.module || "",
              subModule: currentQ.subModule || "",
              question: currentQ.questionText || "",
              answer: answerText,
              effortsHours: String(response.hours || "")
            });
          } catch (e) {
            console.warn("Failed to push answer to features-grid:", e.message);
          }
        }
      }

      setCompleted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || "Your answers couldn't be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  // --- RENDERING ENGINE ---
  if (loading) return isEmbedded ? <div className="loading-page"><span className="spinner spinner-lg" /> Loading…</div> : <AppLayout title="Loading…"><div className="loading-page"><span className="spinner spinner-lg" /> Loading…</div></AppLayout>;
  if (loadError || !questionnaire) return isEmbedded ? <div><div className="alert alert-error">{loadError || "Not found."}</div></div> : <AppLayout title="Questionnaire"><div className="alert alert-error">{loadError || "Not found."}</div></AppLayout>;

  const content = (
    <div className="take-shell" style={{ minHeight: "auto", padding: "8px 0 32px" }}>
      {completed ? (
        <div className="card take-complete" style={{ maxWidth: 560, width: "100%" }}>
          <div className="take-complete-mark">✓</div>
          <h2>{isEmbedded ? "Preview Submission Successful" : "Questionnaire Completed"}</h2>
          <p className="text-muted" style={{ marginTop: 10 }}>Thanks for your responses — they've been saved.</p>
          {isEmbedded ? (
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: 22 }}>Reset Preview & Attend Again</button>
          ) : (
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 22 }}>Back to dashboard</Link>
          )}
        </div>
      ) : currentQuestion ? (
        <div className="card take-card">
          {(currentQuestion.platform || currentQuestion.module) && (
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", background: "#f8fafc", padding: "6px 10px", borderRadius: "4px", display: "inline-block" }}>
              <strong>Context: </strong> {currentQuestion.platform} {currentQuestion.module && `> ${currentQuestion.module}`} {currentQuestion.subModule && `> ${currentQuestion.subModule}`}
            </div>
          )}

          <div className="take-question-text">{currentQuestion.questionText}</div>

          {validationError && <div className="alert alert-error">{validationError}</div>}
          {submitError && <div className="alert alert-error">{submitError}</div>}

          {currentQuestion.questionType === "SINGLE_CHOISE" &&
            [...(currentQuestion.options ?? [])]
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
              .map((opt, index) => {
                const optId = opt._id || opt.id || `fallback-${index}`;
                return (
                  <label key={optId} className={`take-option ${String(singleSelected) === String(optId) ? "selected" : ""}`} style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", marginBottom: "8px" }}>
                    <input type="radio" checked={String(singleSelected) === String(optId)} onChange={() => setSingleSelected(optId)} className="form-radio" />
                    <span style={{ fontWeight: "500", color: "#333" }}>{opt.optionText}</span>
                  </label>
                );
              })}

          {/* NEW COMPLEXITY DROPDOWN */}
          {currentQuestion.questionType === "COMPLEXITY" && (
            <select
              className="select"
              value={complexitySelected}
              onChange={(e) => handleComplexityChange(e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: "10px" }}
            >
              <option value="">Select Complexity...</option>
              <option value="High">High (Default: 8 Hours)</option>
              <option value="Medium">Medium (Default: 4 Hours)</option>
              <option value="Low">Low (Default: 2 Hours)</option>
            </select>
          )}

          {currentQuestion.questionType === "TEXT" && (
            <input className="input" value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Type your answer…" autoFocus />
          )}

          {currentQuestion.questionType === "NUMBER" && (
            <input className="input" type="number" value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Enter a number…" autoFocus />
          )}

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#334155" }}>Hours spent on this item:</label>
            <input className="input" type="number" min="0" step="0.5" value={currentHours} onChange={(e) => setCurrentHours(e.target.value)} placeholder="e.g. 1.5" style={{ maxWidth: "150px" }} />
          </div>

          <div className="take-actions" style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
            <button className="btn btn-secondary" onClick={handleBack} disabled={submitting || history.length <= 1} style={{ visibility: history.length <= 1 ? "hidden" : "visible" }}>← Back</button>
            {(() => {
              let peekAnswer = textValue;
              if (currentQuestion.questionType === "SINGLE_CHOISE") peekAnswer = singleSelected;
              else if (currentQuestion.questionType === "COMPLEXITY") peekAnswer = complexitySelected;
              const isLastQuestion = resolveNextQuestionId(currentQuestion, questions, peekAnswer) === "SUBMIT";
              return (
                <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : (isLastQuestion ? "Submit Assessment" : "Next →")}
                </button>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="card empty-state" style={{ maxWidth: 560, width: "100%" }}>
          <h3>No start question configured</h3>
          <p>This questionnaire doesn't have a start question set yet.</p>
        </div>
      )}
    </div>
  );

  return isEmbedded ? content : <AppLayout title={questionnaire.title}>{content}</AppLayout>;
}