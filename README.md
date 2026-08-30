# Manovritti - Privacy-First AI Mind Journal

An enterprise-grade, privacy-first cognitive journaling application and mood intelligence system built with **React (Vite)**, **Web Crypto API (AES-GCM 256-bit)**, **Cloud Firestore**, and **Gemini 3.6 Flash** via `@google/genai`.

---

## 1. Threat Summary & Security Architecture

| Threat Zone | Identified Risk | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Input Surfaces** | Prompt injection or malicious payloads in journal text | Strict input validation, plain text parameterization, schema enforcement |
| **Planning & Reasoning** | Hallucinations or malformed structured data | JSON Schema Structured Outputs via `@google/genai` with fallback ladder |
| **Tool Execution & APIs** | Server-side credential leak or SSRF | Server-side Express API proxy, zero exposure of `GEMINI_API_KEY` to browser |
| **Memory & Database State** | Cross-user data snooping or database compromise | **Client-Side AES-256 GCM**: Text encrypted in browser before write to Firestore; owner-bound rules |
| **Authentication** | Password credential stuffing or weak session auth | Strict Google Sign-In (Firebase Auth), zero custom password storage |

---

## 2. Cloud Firestore Security Rules

Deploy these rules to guarantee strict owner-bound data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/syntheses/{synthesisId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/settings/{settingId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 3. Secret Manager Setup (Google Cloud)

Store your Gemini API key in Google Cloud Secret Manager:

```bash
# Create and populate secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Cloud Run Deployment Flow

```bash
# Build and deploy container to Google Cloud Run
gcloud run deploy manovritti-ai-journal \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000

# Apply mandatory campaign verification label
gcloud run services update manovritti-ai-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 5. Key Application Capabilities

1. **Client-Side AES-GCM Zero-Knowledge Encryption**: Uses native `window.crypto.subtle` with 256-bit keys and random 12-byte initialization vectors per record. Plain journal text never touches the database unencrypted.
2. **Gemini 3.6 Flash Structured Intelligence**:
   - Cognitive reflection & empathetic guidance
   - Sentiment evaluation (`moodScore` 1-10 & `moodLabel`)
   - 2-5 Smart category tags
   - Context-aware next prompts
3. **Bilingual English & Marathi Localization (`i18next`)**:
   - Instant language switcher between English and Marathi (`मराठी`)
   - Native Marathi Web Speech recognition (`mr-IN` voice typing)
   - Dynamic Devanagari AI system prompting
4. **Interactive Analytics & Longitudinal Mood Trajectory**:
   - Recharts area/line charts mapping mood scores over time
   - Tag frequency cloud with interactive timeline filtering
   - Journaling streak and average sentiment metrics
5. **7-Day Weekly Cognitive Synthesis**:
   - Client decrypts entries from past 7 days
   - Synthesizes dominant themes, average mood score, and actionable cognitive insights
   - Encrypts and archives weekly reports
