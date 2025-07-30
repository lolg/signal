import { useEffect, useState } from "react";
import "./App.css";

function getTokenFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

const importanceOptions = [
  "Not important",
  "Somewhat important",
  "Important",
  "Very important",
  "Extremely important"
];

const satisfactionOptions = [
  "Not satisfied",
  "Somewhat satisfied",
  "Satisfied",
  "Very satisfied",
  "Extremely satisfied"
];

export default function App() {
  const token = getTokenFromURL();
  const [tokenError, setTokenError] = useState("");
  const [surveyMeta, setSurveyMeta] = useState({ title: "", subtitle: "" });
  const [strings, setStrings] = useState({});
  const [questionsByCategory, setQuestionsByCategory] = useState({});
  const [categories, setCategories] = useState({});
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [ratings, setRatings] = useState({});
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [respondentName, setRespondentName] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  const t = (key) => strings[key] || `[${key}]`;

  useEffect(() => {
    if (!token) {
      setTokenError("Missing or invalid link. Please check your survey invitation.");
      return;
    }

    Promise.all([
      fetch("/api/survey").then(res => res.json()),
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/survey-meta").then(res => res.json()),
      fetch("/api/strings").then(res => res.json())
    ])
      .then(([survey, cats, meta, stringsData]) => {
        const grouped = {};
        let count = 0;
        survey.questions.forEach(q => {
          if (!grouped[q.category]) grouped[q.category] = [];
          grouped[q.category].push(q);
          count += 1;
        });
        setQuestionsByCategory(grouped);
        setCategoryOrder(Object.keys(grouped));
        setCategories(cats);
        setSurveyMeta(meta);
        setQuestionCount(count);
        setStrings(stringsData);
      });

    fetch("/api/respondent", {
      headers: { "X-Token": token }
    })
      .then(res => res.json())
      .then(res => {
        if (res.name) setRespondentName(res.name);
      });
  }, []);

  const setRating = (questionId, type, value) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [type]: value
      }
    }));
  };

  const currentCategory = categoryOrder[currentPage];
  const currentQuestions = questionsByCategory[currentCategory] || [];

  const validatePage = () => {
    return currentQuestions.every(q => {
      const r = ratings[q.id];
      return r && r.importance && r.satisfaction;
    });
  };

  const handleNext = () => {
    if (!validatePage()) {
      setStatus("Please complete all questions on this page.");
      return;
    }
    setStatus("");
    setCurrentPage((p) => {
      const nextPage = p + 1;
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      return nextPage;
    });
  };
  
  const handlePrevious = () => {
    setStatus("");
    setCurrentPage((p) => {
      const prevPage = p - 1;
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      return prevPage;
    });
  };

  const handleSubmit = () => {
    if (!validatePage()) {
      setStatus("Please complete all questions on this page.");
      return;
    }

    const response = Object.entries(ratings).map(([questionId, data]) => ({
      questionId,
      importance: data.importance,
      satisfaction: data.satisfaction
    }));

    fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": token
      },
      body: JSON.stringify({ answers: response })
    })
      .then(res => res.json())
      .then((res) => {
        if (res.status === "saved") {
          if (res.name) setRespondentName(res.name);
          setIsSubmitted(true);
        } else {
          setStatus("Error: " + (res.error || "unknown"));
        }
      })
      .catch(() => setStatus("Failed to save."));
  };

  if (tokenError) {
    return (
      <div className="odi-container">
      <div style={{ height: "60px" }}></div> 
        <h2>{t("accessErrorTitle")}</h2>
        <p className="error-message">{t("accessErrorMessage")}</p>
      </div>
    );
  }

  if (!isStarted) {
    const estimatedMinutes = Math.max(1, Math.ceil((questionCount * 10) / 60));
    return (
      <div className="odi-container welcome-screen">
        <h2>{surveyMeta.title || t("surveyTitleFallback")}</h2>
        {respondentName && <p className="survey-subtitle">Welcome, {respondentName}.</p>}
        {surveyMeta.subtitle && <p className="survey-subtitle">{surveyMeta.subtitle}</p>}
        {!surveyMeta.subtitle && <p className="survey-subtitle">{t("welcomeSubtitleFallback")}</p>}
        <p>
          {t("estimatedTimeLine")
            .replace("{count}", questionCount)
            .replace("{minutes}", estimatedMinutes)
            .replace("{plural}", estimatedMinutes !== 1 ? "s" : "")}
        </p>
        <button className="primary-button" onClick={() => setIsStarted(true)}>
          {t("startButton")}
        </button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="odi-container final-screen">
        <h2>{t("thankYouTitle")}</h2>
        {respondentName && (
          <p className="final-subtitle">
            {t("thankYouNameLine").replace("{name}", respondentName)}
          </p>
        )}
        {!respondentName && (
          <p className="final-subtitle">{t("thankYouAnonLine")}</p>
        )}
        <p>{t("thankYouMessage")}</p>
      </div>
    );
  }

  return (
    <div className="odi-container">
      <h2>{surveyMeta.title || t("surveyTitleFallback")}</h2>
      {currentPage === 0 && surveyMeta.subtitle && (
        <p className="survey-subtitle">{surveyMeta.subtitle}</p>
      )}

      {currentCategory && categories[currentCategory] && (
        <div className="category-header">
          <h3>{categories[currentCategory].title}</h3>
          <p>{categories[currentCategory].subtitle}</p>
        </div>
      )}

      <div className="stacked-questions">
        {currentQuestions.map((q) => (
          <div key={q.id} className="question-card">
            <div className="scale-pair">
              <div className="scale-group">
                <label className="framed-prompt">{t("importancePrompt")}</label>
                <div className="question-text">{q.text}</div>
                <div className="scale-options">
                  {importanceOptions.map((label, idx) => (
                    <span key={`imp-${q.id}-${idx}`}>
                      <input
                        type="radio"
                        name={`importance-${q.id}`}
                        id={`imp-${q.id}-${idx}`}
                        checked={ratings[q.id]?.importance === idx + 1}
                        onChange={() => setRating(q.id, "importance", idx + 1)}
                      />
                      <label htmlFor={`imp-${q.id}-${idx}`}>{label}</label>
                    </span>
                  ))}
                </div>
              </div>

              <div className="scale-group">
                <label className="framed-prompt">{t("satisfactionPrompt")}</label>
                <div className="question-text">{q.text}</div>
                <div className="scale-options">
                  {satisfactionOptions.map((label, idx) => (
                    <span key={`sat-${q.id}-${idx}`}>
                      <input
                        type="radio"
                        name={`satisfaction-${q.id}`}
                        id={`sat-${q.id}-${idx}`}
                        checked={ratings[q.id]?.satisfaction === idx + 1}
                        onChange={() => setRating(q.id, "satisfaction", idx + 1)}
                      />
                      <label htmlFor={`sat-${q.id}-${idx}`}>{label}</label>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="submit-bar">
        {currentPage > 0 && (
          <button className="primary-button" onClick={handlePrevious}>
            {t("previousButton")}
          </button>
        )}
        {currentPage < categoryOrder.length - 1 ? (
          <button className="primary-button" onClick={handleNext}>
            {t("nextButton")}
          </button>
        ) : (
          <button className="primary-button" onClick={handleSubmit}>
            {t("submitButton")}
          </button>
        )}
        <span className="status">{status}</span>
      </div>

      <div className="progress-fixed">
        <div className="progress-text">
          Page {currentPage + 1} of {categoryOrder.length}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentPage + 1) / categoryOrder.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}