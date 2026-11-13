/* Static content for the portfolio: projects, certificates, filter labels. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  const IMG = "assets/images/";
  const CERT = "assets/certificates/";

  PF.filters = Object.freeze([
    { id: "all", label: "All" },
    { id: "health", label: "Healthcare AI" },
    { id: "genai", label: "GenAI & RAG" },
    { id: "ml", label: "Classical ML" },
    { id: "cv", label: "Computer Vision" },
    { id: "mobile", label: "Mobile & Telemetry" }
  ]);

  PF.projects = Object.freeze([
    {
      id: "summaryz",
      wide: true,
      cats: ["health", "genai"],
      kicker: "Lifosys Digital Systems | Healthcare AI",
      label: "Healthcare AI · Browser extension",
      title: "SummaryZ HIS Bridge - Browser Extension",
      role: "Design and development of the extension, its HIS adapters, and the backend integration.",
      blurb: "Browser extension that connects Lifosys' AI discharge-summary product to hospital information systems without vendor integration or database access.",
      image: IMG + "projects/summaryz-architecture.svg",
      imageAlt: "Diagram: the HIS Bridge extension sits between a hospital system and SummaryZ",
      images: [IMG + "projects/summaryz-architecture.svg"],
      cardTags: ["TypeScript", "WXT (MV3)", "FastAPI", "Gemini"],
      summary: "SummaryZ is Lifosys' AI discharge-summary product. The HIS Bridge is a browser extension that links it to a hospital's web-based information system: it reads the inpatient record, hands it to SummaryZ, and after the doctor signs, fills the summary back into the discharge form. It works through the browser, so the hospital needs no vendor integration and gives no database access.",
      tags: ["TypeScript", "WXT (Manifest V3)", "React", "FastAPI", "pdf-lib", "Gemini API", "Vitest"],
      features: [
        "Per-HIS adapter packs, built and tested against OpenMRS, Bahmni, and OpenEMR.",
        "Checks two patient identifiers before anything is written back.",
        "Reads the saved fields back to verify the write, and leaves the final save to a person.",
        "An alternate print-bridge approach captures records as PDFs and drives the summary wizard through a queued agent."
      ],
      required: [
        "A way to work with many different hospital systems without changing any of them.",
        "Safety rules suited to clinical data: identity checks, verification, and human sign-off.",
        "An adapter format general enough to cover very different HIS interfaces.",
        "A test suite that runs without a live hospital system."
      ],
      engineering: [
        "Navigation is deterministic at runtime rather than decided by an LLM, because clinical writes need to be repeatable.",
        "Built a fully autonomous Gemini function-calling agent as a comparison, to show the trade-off between the two approaches.",
        "Unit-tested with Vitest."
      ],
      impact: [
        "Lets a hospital use SummaryZ with no integration work on the HIS side.",
        "Built at Lifosys Digital Systems; source code and screenshots are private."
      ],
      github: "",
      privateNote: "Source is private: built at Lifosys Digital Systems."
    },
    {
      id: "oxzygen",
      wide: true,
      cats: ["health", "genai"],
      kicker: "Lifosys Digital Systems | Healthcare Platform",
      label: "Healthcare AI · Full stack",
      title: "Oxzygen - Hospital Operating System",
      role: "Primary developer on the platform rebuild: database, web app, and AI features.",
      blurb: "Multi-tenant hospital and clinic platform with AI assistance across the patient journey, from reception and kiosk to doctor and pharmacy. In active development.",
      image: IMG + "projects/oxzygen-architecture.svg",
      imageAlt: "Diagram: Oxzygen patient-journey modules on a web app, database and AI layer",
      images: [IMG + "projects/oxzygen-architecture.svg"],
      cardTags: ["Next.js", "PostgreSQL", "Gemini", "Local LLMs"],
      summary: "Oxzygen is Lifosys' operating system for hospitals and clinics. I work on its rebuild: a multi-tenant web app covering hospital onboarding, reception, entrance kiosk, doctor, and pharmacy flows, with AI used wherever it reduces staff effort. It is in active development.",
      tags: ["Next.js 14", "TypeScript", "PostgreSQL (Supabase)", "Row-Level Security", "Gemini API", "Gemini Live", "Ollama (MedGemma)", "Vitest", "Docker"],
      features: [
        "Hospital-specific rules are configured per hospital at onboarding rather than hard-coded.",
        "Reception flow with duplicate-patient checks while typing and a live queue.",
        "Entrance kiosk and doctor screen, with voice input where it saves time.",
        "Medicine safety checks: allergy and interaction rules, backed by local models.",
        "A separate voice-agent service for phone calls, built on Gemini Live."
      ],
      required: [
        "Strict separation of each hospital's data in a shared database.",
        "AI features that stay accurate and need few approval clicks from staff.",
        "Local models for most AI tasks, so patient data stays inside the hospital's control.",
        "Tests that run against a real database schema."
      ],
      engineering: [
        "Tenant isolation is enforced in the database with row-level security, not only in application code.",
        "Local-first AI: local models were benchmarked for accuracy and speed, and rule-based checks stay authoritative.",
        "API inputs are schema-validated, and tests run against a throwaway Postgres built from the migrations."
      ],
      impact: [
        "A real product being built for hospitals, covering the full outpatient journey.",
        "Built at Lifosys Digital Systems; source code and screenshots are private."
      ],
      github: "",
      privateNote: "Source is private: built at Lifosys Digital Systems."
    },
    {
      id: "agrivision",
      wide: true,
      cats: ["cv", "genai"],
      kicker: "National Hackathon | Computer Vision + Farmer Advisory",
      label: "Computer Vision · Hackathon",
      title: "AgriVision - Multimodal Crop Disease Detection",
      role: "Model fine-tuning, FastAPI backend, and the LLM advisory pipeline.",
      blurb: "Placed 4th at a national-level hackathon. Farmer advisory app: leaf disease detection, severity, LLM treatment plans, weather-aware spray timing, GPS validation, and voice guidance.",
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
        "Placed 4th at Matrix Fusion 4.0, a national-level hackathon.",
        "Brings ML, backend, product thinking, and real user constraints together in one system."
      ],
      github: "https://github.com/Afeef-Ismail/agrivision-MF4.0"
    },
    {
      id: "traxio",
      wide: true,
      cats: ["mobile"],
      kicker: "NIT Calicut | KSRTC Telematics",
      label: "Mobile · Telemetry · R&D",
      title: "Traxio - KSRTC Driver Benchmarking App",
      role: "Flutter app development with a co-developer; implemented an existing research study's features and scoring on-device.",
      blurb: "Flutter Android app built at NIT Calicut for KSRTC driver-behaviour research: 10 Hz GPS and motion capture, 100 m route segments, and on-device scoring against an existing study's master-driver profiles.",
      image: IMG + "projects/traxio-showcase.jpg",
      imageAlt: "Traxio mobile app screenshots showcase",
      images: ["traxio-dashboard.png", "traxio-live-trip.png", "traxio-map-route.png", "traxio-trip-summary.png", "traxio-history.png"].map((f) => IMG + "projects/" + f),
      cardTags: ["Flutter", "Sensors", "SQLite", "Telemetry"],
      summary: "Traxio is a Flutter Android app for transport researchers, built during an R&D internship at CoE-AI, NIT Calicut. It collects vehicle motion data from phone sensors and implements driver benchmarking from an existing NIT Calicut PhD study: the study's 120 features are extracted on the phone for every 100-metre segment and scored against its master-driver profiles. The benchmarking research and the profiles come from that study; my work was the app.",
      tags: ["Flutter", "Dart", "sensors_plus", "geolocator", "SQLite", "Flutter Map", "Provider", "FFT (scidart)"],
      features: [
        "Samples accelerometer, gyroscope, and GPS data at 10 Hz, with angle-aware sensor calibration before a trip.",
        "Segments routes into 100-metre windows using Haversine distance accumulation.",
        "Extracts the study's 120 time-domain and frequency-domain features on-device: 8 driving attributes with 15 features each.",
        "Classifies terrain as plain, uphill, or downhill, then scores each segment against the study's terrain-specific master-driver profiles.",
        "Lets researchers collect new driving data with CSV export and add newly found behaviour clusters through an admin panel.",
        "Offline rule-based coaching in English, Malayalam, and Hindi, plus trip history, live dashboard, route trail, and a demo mode."
      ],
      required: [
        "A mobile app capable of sensor permissions, live GPS tracking, map rendering, and offline trip persistence.",
        "Signal processing logic for smoothing, FFT, statistical feature extraction, terrain classification, and scoring.",
        "Benchmark tables holding the study's master-driver reference profiles.",
        "A usable flow for real devices plus an emulator-friendly demo route for testing."
      ],
      engineering: [
        "Signal processing runs on the phone in Dart: smoothing, FFT, and statistical feature extraction, covered by unit tests.",
        "Modular structure: sensor service, segmentation, terrain service, analytics, database, providers, and UI screens are separated.",
        "Trip data is stored locally in an encrypted (AES-256) SQLite database."
      ],
      impact: [
        "Turns existing research into a field tool that researchers can use to collect driving data.",
        "Built for a real transport domain through NIT Calicut and KSRTC."
      ],
      github: "",
      privateNote: "Repository is private."
    },
    {
      id: "learnova",
      cats: ["genai"],
      kicker: "AI Product | Local-first LMS",
      label: "GenAI · RAG · Full stack",
      title: "Learnova AI - Local-first AI LMS",
      role: "Backend, RAG pipeline, async workers, and frontend integration.",
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
      role: "End to end: data preparation, modelling, tuning, and deployment.",
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
      cats: ["health", "genai"],
      kicker: "GenAI Healthcare Assistant | Team Project",
      label: "GenAI · Healthcare · Team project",
      title: "HealthAssist - Medical Chatbot",
      role: "AI and backend development, as part of a team.",
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
      role: "RAG pipeline, deterministic numeric layer, and evaluation.",
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
      role: "All notebooks, experiments, and reports.",
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
