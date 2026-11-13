/* Static content for the portfolio: projects, certificates, filter labels. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  const IMG = "assets/images/";
  const CERT = "assets/certificates/";

  PF.filters = Object.freeze([
    { id: "all", label: "All" },
    { id: "genai", label: "GenAI & RAG" },
    { id: "ml", label: "Classical ML" },
    { id: "cv", label: "Computer Vision" },
    { id: "mobile", label: "Mobile & Telemetry" }
  ]);

  PF.projects = Object.freeze([
    {
      id: "agrivision",
      wide: true,
      cats: ["cv", "genai"],
      kicker: "National Hackathon | Computer Vision + Farmer Advisory",
      label: "Computer Vision · Hackathon",
      title: "AgriVision - Multimodal Crop Disease Detection",
      blurb: "Hackathon-winning farmer advisory app: leaf disease detection, severity, LLM treatment plans, weather-aware spray timing, GPS validation, and voice guidance.",
      image: IMG + "agrivision.jpg",
      imageAlt: "Leaf image used for crop disease detection",
      cardTags: ["EfficientNet-B3", "FastAPI", "Groq", "Computer Vision"],
      summary: "AgriVision is a practical farmer-facing system that starts from a leaf image and ends with an understandable treatment plan. It combines image classification, severity mapping, LLM-generated recommendations, weather checks, voice output, GPS validation, and treatment video discovery.",
      tags: ["EfficientNet-B3", "TensorFlow/Keras", "FastAPI", "Groq Llama 3.1", "OpenWeatherMap", "gTTS", "PlantVillage"],
      features: [
        "Detects diseases across tomato, apple, and grape leaf images with confidence scoring across 18 classes.",
        "Maps results into Green, Yellow, or Red severity so non-technical users immediately understand urgency.",
        "Generates structured treatment plans in organic or chemical mode using Groq LLM responses.",
        "Produces voice advisory in 11 Indian languages and includes weather-aware spray timing guidance.",
        "Checks EXIF GPS information to validate whether the crop/farm context is plausible."
      ],
      required: [
        "A trained EfficientNet-B3 model and class-index mapping for plant disease recognition.",
        "A FastAPI prediction pipeline with blur checks, confidence gates, model inference, and JSON responses.",
        "API-key configuration for Groq and OpenWeatherMap, with graceful fallback when keys are missing.",
        "Frontend upload flow, result rendering, voice playback, and farmer-friendly explanation design."
      ],
      engineering: [
        "Kept inference real rather than hardcoded: uploaded images pass through validation and model prediction.",
        "Separated disease info, severity, weather, GPS, LLM, and voice modules so the app is easier to debug.",
        "Used structured JSON from the LLM to keep recommendations machine-readable and frontend-friendly."
      ],
      impact: [
        "Placed 4th nationally at Matrix Fusion 4.0.",
        "Brings ML, backend, product thinking, and real user constraints together in one system."
      ],
      github: "https://github.com/Afeef-Ismail/agrivision-MF4.0"
    },
    {
      id: "traxio",
      wide: true,
      cats: ["mobile", "ml"],
      kicker: "NIT Calicut | KSRTC Telematics",
      label: "Mobile · Telemetry · R&D",
      title: "Traxio - KSRTC Driver Benchmarking App",
      blurb: "Flutter telematics app developed at NIT Calicut for KSRTC driver behavior benchmarking using phone sensors, GPS segmentation, terrain detection, and scoring.",
      image: IMG + "projects/traxio-showcase.jpg",
      imageAlt: "Traxio mobile app screenshots showcase",
      images: ["traxio-dashboard.png", "traxio-live-trip.png", "traxio-map-route.png", "traxio-trip-summary.png", "traxio-history.png"].map((f) => IMG + "projects/" + f),
      cardTags: ["Flutter", "Sensors", "SQLite", "Telemetry"],
      summary: "Traxio is a Flutter Android app built for smartphone-based bus driver benchmarking. It captures sensor and GPS data, breaks trips into 100-meter route windows, extracts a 120-feature signal profile, classifies terrain, and scores segments against master-driver benchmark patterns.",
      tags: ["Flutter", "Dart", "sensors_plus", "geolocator", "SQLite", "Flutter Map", "Python backend", "scikit-learn"],
      features: [
        "Samples accelerometer, gyroscope, and GPS data at 10 Hz with calibration before trip capture.",
        "Segments routes into 100-meter windows using Haversine distance accumulation.",
        "Extracts 120 time-domain and frequency-domain features from speed, acceleration, yaw rate, jerk, vertical velocity, and turning radius.",
        "Classifies terrain as plain, uphill, or downhill before scoring against terrain-specific benchmarks.",
        "Stores trip history locally and provides segment drill-down, live dashboard, route trail, and demo mode."
      ],
      required: [
        "A mobile app capable of sensor permissions, live GPS tracking, map rendering, and offline trip persistence.",
        "Signal processing logic for smoothing, FFT, statistical feature extraction, terrain classification, and scoring.",
        "Benchmark tables or clustering backend to represent master-driver reference behavior.",
        "A usable flow for real devices plus an emulator-friendly demo route for testing."
      ],
      engineering: [
        "Research translated into a usable field app.",
        "Modular structure: sensor service, segmentation, terrain service, analytics, database, providers, and UI screens are separated.",
        "An understandable scoring method: feature extraction, terrain matching, benchmark lookup, deviation calculation, and 0-100 normalization."
      ],
      impact: [
        "Combines mobile, data capture, signal processing, and applied analytics in one build.",
        "Connects directly to a real transport domain through NIT Calicut and KSRTC."
      ],
      github: "https://github.com/Afeef-Ismail/Traxio_Tracking_App"
    },
    {
      id: "learnova",
      cats: ["genai"],
      kicker: "AI Product | Local-first LMS",
      label: "GenAI · RAG · Full stack",
      title: "Learnova AI - Local-first AI LMS",
      blurb: "Private AI learning platform with RAG chat, summaries, MCQs, flashcards, YouTube ingest, auth, workers, vector search, and local Ollama models.",
      image: IMG + "projects/learnova-home.png",
      imageAlt: "Learnova AI home page screenshot",
      images: ["learnova-home.png", "learnova-material-upload.png", "learnova-youtube-inline.png", "learnova-rag-chat.png", "learnova-flashcards.png"].map((f) => IMG + "projects/" + f),
      cardTags: ["FastAPI", "Next.js", "Qdrant", "Ollama"],
      summary: "Learnova is a private, local-first AI LMS where the full stack runs on the user's machine. It supports course uploads, retrieval-augmented chat, summaries, MCQ generation, flashcards, YouTube ingestion, authentication, and async workers without depending on cloud LLM calls.",
      tags: ["FastAPI", "Next.js 14", "PostgreSQL", "Qdrant", "RabbitMQ", "Celery", "Ollama", "Docker Compose"],
      features: [
        "Lets users upload learning materials and chat with them through a RAG workflow.",
        "Generates summaries, MCQs, flashcards, and study support from course content.",
        "Supports YouTube ingest as another learning source.",
        "Runs backend, frontend, database, vector database, queue, workers, and local LLMs through Compose.",
        "Includes auth flows through signup, login, Google identity configuration, and JWT handling."
      ],
      required: [
        "Backend APIs for auth, file handling, learning features, and AI orchestration.",
        "Document ingestion, embeddings, vector storage, retrieval, and local LLM generation.",
        "Worker architecture with RabbitMQ and Celery for long-running tasks.",
        "Frontend UX for login, uploads, chat, generated study assets, and API integration."
      ],
      engineering: [
        "Local-first architecture is the core idea: privacy, reproducibility, and lower external dependency.",
        "Separate services instead of a single script demo: API, frontend, database, vector store, queue, and workers."
      ],
      impact: [
        "Shows product-building ability beyond model notebooks.",
        "Backend and AI application engineering in one system."
      ],
      github: "https://github.com/Afeef-Ismail/Learnova.AI_An-AI-based-LMS"
    },
    {
      id: "fraud",
      cats: ["ml"],
      kicker: "Applied ML | Financial Risk",
      label: "Classical ML · Risk",
      title: "Fraud Detection in Financial Transactions",
      blurb: "Production-style fraud detection workflow on 590k+ IEEE-CIS transactions with imbalance handling, clustering, XGBoost tuning, and Streamlit inference.",
      image: IMG + "projects/fraud-streamlit-1.jpg",
      imageAlt: "Fraud Detection Streamlit dashboard screenshot",
      images: [1, 2, 3, 4, 5].map((n) => IMG + "projects/fraud-streamlit-" + n + ".jpg"),
      cardTags: ["XGBoost", "Optuna", "Streamlit", "AUC 0.93"],
      summary: "A production-style machine learning pipeline for detecting rare fraud cases in a large transaction dataset. The project focuses on the hard parts of fraud modelling: imbalance, feature quality, evaluation beyond accuracy, model tuning, and deployable inference.",
      tags: ["Python", "Pandas", "SMOTE", "KMeans", "XGBoost", "Optuna", "Streamlit", "ROC-AUC 0.93"],
      features: [
        "Processes 590k+ IEEE-CIS style transactions with around 3.5% fraud prevalence.",
        "Uses preprocessing, feature engineering, imbalance handling, and behavioral clustering.",
        "Compares models and tunes XGBoost using Optuna for stronger fraud recall and ranking performance.",
        "Provides Streamlit-based live scoring so the model can be tested like an application, not just a notebook."
      ],
      required: [
        "Clean train/test splitting and careful metric selection because fraud is highly imbalanced.",
        "Feature engineering for transaction, identity, and behavioral signals.",
        "Resampling or class-weighting strategy, plus validation that does not inflate performance.",
        "Model serialization and a minimal web/API surface for inference."
      ],
      engineering: [
        "Evaluation is framed around tradeoffs: recall, precision, F1, ROC-AUC, and false positives rather than accuracy.",
        "Published with the notebook, Streamlit app, saved model artifacts, and setup docs."
      ],
      impact: [
        "ROC-AUC around 0.93 and F1 around 0.63 on a heavily imbalanced detection task.",
        "Bridges academic ML and business-facing risk systems."
      ],
      github: "https://github.com/Afeef-Ismail/fraud-detection-ml-pipeline"
    },
    {
      id: "healthassist",
      cats: ["genai"],
      kicker: "GenAI Healthcare Assistant",
      label: "GenAI · Healthcare",
      title: "HealthAssist - Medical Chatbot",
      blurb: "Gemini-powered healthcare assistant for general health questions, consultation-style support, emergency guidance, and medical report summaries.",
      image: IMG + "projects/healthassist-chat.jpg",
      imageAlt: "HealthAssist chatbot screenshot",
      images: [IMG + "projects/healthassist-chat.jpg", IMG + "projects/healthassist-report.jpg"],
      cardTags: ["Gemini", "Python", "AI Chatbot", "Reports"],
      summary: "HealthAssist is an AI health assistant powered by Google's Gemini model. It is designed to make basic medical information more accessible through chat, consultation-style guidance, emergency advice, and report summarization.",
      tags: ["Gemini", "Python", "AI Assistant", "Medical Reports", "Chatbot"],
      features: [
        "Answers general health questions in a simple conversational interface.",
        "Supports deeper consultation-style interaction for structured health assessment.",
        "Summarizes medical reports so users can understand complex documents more easily.",
        "Can provide emergency-oriented guidance and downloadable consultation/report summaries."
      ],
      required: [
        "A Gemini API integration with careful prompting and response handling.",
        "Input flows for general chat, consultation mode, and report summarization.",
        "Guardrails and disclaimers so users understand it is support, not a doctor replacement.",
        "A readable UI that makes sensitive medical information less intimidating."
      ],
      engineering: [
        "Problem framing centres on healthcare access, rural users, and low medical literacy.",
        "Separate flows for general chat, consultation mode, and report summarization."
      ],
      impact: [
        "A practical GenAI project built around empathy and natural-language application design."
      ],
      github: "https://github.com/salifmulla/HealthAssist"
    },
    {
      id: "accident",
      wide: true,
      cats: ["genai"],
      kicker: "RAG + Analytics | NITC Accident Data",
      label: "RAG · Private research",
      title: "NITC Accident Analysis Chatbot",
      blurb: "Private internal RAG analytics system for accident-data question answering. Source code, screenshots, and data are withheld because the dataset is sensitive.",
      visual: { icon: "fa-solid fa-lock", text: "PRIVATE RAG" },
      cardTags: ["RAG", "FAISS", "Ollama", "Evaluation"],
      summary: "A private internal retrieval-augmented chatbot for querying sensitive accident data. The project combines semantic retrieval with deterministic numeric handling, while keeping source code, screenshots, and data private for confidentiality.",
      tags: ["Python", "FAISS", "Ollama", "RAG", "BLEU", "ROUGE", "BERTScore", "RAGAS"],
      features: [
        "Indexes accident records for retrieval using FAISS and semantic search.",
        "Uses deterministic handlers for numeric or count-style questions where exactness matters.",
        "Combines retrieved context with an Ollama LLM for natural language answers.",
        "Evaluates responses with multiple metrics including BLEU, ROUGE, BERTScore, SBERT, EntityEM, and RAGAS-style checks."
      ],
      required: [
        "A cleaned accident dataset with fields suitable for both retrieval and exact analytics.",
        "Embedding generation, vector indexing, and prompt construction for RAG answers.",
        "Rules or functions for numeric queries so counts and aggregations remain reliable.",
        "Evaluation scripts to compare answer quality across retrieval and generation settings."
      ],
      engineering: [
        "Does not treat RAG as magic: retrieval and generation are both evaluated.",
        "A deterministic numeric layer keeps counts and aggregations exact."
      ],
      impact: [
        "Addresses reliability problems in LLM systems directly.",
        "Kept confidential: code, screenshots, and data stay private because the dataset is sensitive."
      ],
      github: ""
    },
    {
      id: "mlfoundations",
      wide: true,
      cats: ["ml"],
      kicker: "Notebook Collection | Core ML Practice",
      label: "Classical ML · Notebooks",
      title: "ML Foundations Projects",
      blurb: "A clean notebook collection covering classification, regression, random forests, feature importance, ROC curves, and SOM-based unsupervised learning.",
      visual: { icon: "fa-solid fa-flask-vial", text: "ML LAB" },
      cardTags: ["Scikit-learn", "Jupyter", "MiniSom", "Reports"],
      summary: "A single GitHub repository collecting foundational machine learning notebooks and reports: complete ML workflows, proper model evaluation, and documented experiments.",
      tags: ["Jupyter", "Scikit-learn", "Pandas", "Matplotlib", "Seaborn", "MiniSom"],
      features: [
        "Classification workflow with preprocessing, metrics, confusion matrix, ROC curve, and report.",
        "Regression workflow on concrete strength data with Linear Regression and Random Forest evaluation.",
        "Random Forest ensemble project on Adult Census Income with feature importance and pipeline-style preprocessing.",
        "Self Organizing Map project on Parkinson's data with U-Matrix, component maps, PCA, quantization error, and topographic error."
      ],
      required: [
        "Clean notebooks with reproducible dependencies and datasets or dataset instructions.",
        "Metric reporting for classification, regression, and unsupervised learning workflows.",
        "Visualizations that explain model behavior and data structure.",
        "README organization so the repository is quick to understand."
      ],
      engineering: [
        "Breadth in one place: supervised, ensemble, regression, and unsupervised learning."
      ],
      impact: [
        "Evidence of ML fundamentals alongside the larger product and research projects.",
        "Notebooks and reports packaged as one clean repository."
      ],
      github: "https://github.com/Afeef-Ismail/ml-foundations-projects"
    }
  ]);

  const cert = (title, note, img, pdf) => ({ title, note, img: CERT + img, pdf: CERT + pdf });

  PF.certs = Object.freeze([
    cert("TCS iON x IIT Kharagpur - AI Cohort", "Course completion certificate for Hands-on AI for Real-World Applications.", "tcsion-certificate.png", "TcsIon certificate.pdf"),
    cert("Microsoft Azure Fundamentals", "Microsoft Azure Fundamentals certificate.", "azure-fundamentals.png", "Azure Fundamentals.pdf"),
    cert("Machine Learning with Python", "CognitiveClass / IBM certificate for machine learning with Python.", "cognitiveai-ml-certificate.png", "cognitiveai ML Certificate.pdf"),
    cert("Deep Learning with TensorFlow", "CognitiveClass / IBM certificate for deep learning with TensorFlow.", "dl-with-tf-cognitiveclass-certificate.png", "DL_with_TF_CognitiveClass_Certificate.pdf"),
    cert("Deep Learning Fundamentals", "CognitiveClass / IBM certificate for deep learning fundamentals.", "dl-cognitiveclass-certificate.png", "DL_CognitiveClass_Certificate.pdf"),
    cert("IBM - Rapid Development for AI Services", "IBM certificate for rapid development using Watson AI services.", "ibm-certificate-afeef.png", "IBM Certificate - Afeef.pdf"),
    cert("Python for Data Science", "CognitiveClass / IBM certificate for Python data science foundations.", "cognitiveai-python-for-ds-certificate.png", "cognitiveai-python_for_DS-certificate.pdf"),
    cert("SQL and Relational Databases 101", "CognitiveClass / IBM certificate for SQL and relational databases.", "cognitiveai-sql-rd-certificate.png", "cognitiveai-SQL_RD-certificate.pdf"),
    cert("Test Driven Development with Python", "CognitiveClass / IBM certificate for TDD practices in Python.", "cognitiveai-tdd-python-certificate.png", "cognitiveai-TDD_Python-certificate.pdf"),
    cert("Introduction to MongoDB", "MongoDB proof of completion for Introduction to MongoDB.", "afeef-ismail-80cb3520-8929-468d-8021-5e1bd668977d-certificate.png", "afeef-ismail-80cb3520-8929-468d-8021-5e1bd668977d-certificate.pdf"),
    cert("IBM SkillBuild", "IBM SkillsBuild credential from the learning program.", "ibm-skillbuild-afeef.png", "IBM SkillBuild Afeef.pdf"),
    cert("IIT Bombay Spoken Tutorial - Git", "Spoken Tutorial certificate for Git.", "iitb-git.png", "IITB - Git.pdf"),
    cert("IIT Bombay Spoken Tutorial - Java", "Spoken Tutorial certificate for Java.", "iitb-java.png", "IITB - Java.pdf"),
    cert("IIT Bombay Spoken Tutorial - JavaScript", "Spoken Tutorial certificate for JavaScript.", "iitb-javascript.png", "IITB - JavaScript.pdf"),
    cert("IIT Bombay Spoken Tutorial - R", "Spoken Tutorial certificate for R programming.", "iitb-r.png", "IITB - R.pdf"),
    cert("Jira Scrum Management", "Coursera project certificate for creating and managing a Scrum workflow in Jira.", "scrum-certi.png", "SCRUM Certi.pdf"),
    cert("Agile Project in Miro", "Coursera project certificate for agile planning and workflow design in Miro.", "agile-project-certi.png", "Agile Project Certi.pdf"),
    cert("Academor - Data Science Internship", "Early-college Data Science and Python internship completion certificate.", "afeef-ismailacm23-557-1.png", "Afeef IsmailACM23-557 (1).pdf")
  ]);

  PF.typedPhrases = Object.freeze([
    "I build AI systems that ship",
    "I design models that perform",
    "I connect ML with real products",
    "I turn data into useful systems"
  ]);

  PF.contact = Object.freeze({
    email: "afeefismail07@gmail.com",
    github: "https://github.com/Afeef-Ismail",
    linkedin: "https://linkedin.com/in/afeef-ismail",
    resume: "assets/resume/Afeef_Ismail_Resume.pdf"
  });
})();
