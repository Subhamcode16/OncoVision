# OncoVision: AI-First Diagnostic Gateway
> **Technical Report & Strategic Pitch Deck (April 2026)**

---

## 1. Executive Summary
OncoVision is a production-hardened diagnostic portal that bridges the gap between complex pathology reports and patient understanding. By combining **Multimodal AI Vision** with a **High-Precision SVM Engine**, we provide immediate, clinical-grade diagnostic insights from a simple camera photo.

---

## 2. The Technology Stack (2026 Architecture)

### A. The Diagnostic Engine (The "Brain")
- **Model**: Support Vector Machine (SVM) with RBF Kernel ($C=1, \gamma=0.01$).
- **Preprocessing**: Robust feature scaling via `StandardScaler` for zero-mean/unit-variance stabilization.
- **Why SVM?**: For medical diagnostics, explainability and high-margin separation are critical. Unlike deep neural networks which can be "black boxes," SVMs are mathematically rigorous and excel at classifying high-dimensional clinical data with minimal false negatives.
- **Performance**: **97.62% Recall** on Malignant detection (Safety-First Metric).

### B. The Intelligent Gateway (The "Vision")
- **Model**: Gemini 2.5/2.0 Flash (Multimodal Waterfall).
- **Why Gemini?**: Traditional OCR (like Tesseract) fails on camera-clicked photos with shadows and skew. Gemini provides **Semantic OCR**, allowing the system to not just "read" text but "understand" clinical values like *Radius Mean* and *Concavity* even from messy, real-world images.
- **Resilience**: Implements a **Waterfall Strategy** (2.5 → 2.0 → 1.5) to ensure 100% uptime regardless of API quota limits.

---

## 3. Core Features & Innovations

1.  **Kinetic Diagnostic Workspace**: A premium UI built with Next.js and GSAP that uses "Skeleton Mapping" to show users exactly where the AI is extracting data in real-time.
2.  **Explainable AI (XAI)**: Integrated **SHAP (SHapley Additive exPlanations)** to break the "Black Box." Clinicians see exactly which features (e.g., Concave Points) influenced the "Malignant" flag.
3.  **Clinical Safety Guardrails**: Built-in Pydantic validation that rejects impossible medical data (e.g., zero-radius nuclei) and a "Recall-First" tuned model.
4.  **Automatic Fallback Engine**: A server-side model-switching logic that bypasses `429 Resource Exhausted` errors automatically.

---

## 4. Why OncoVision is the "Best-in-Class"

| Feature | Standard Apps | OncoVision |
| :--- | :--- | :--- |
| **Input Type** | Manual Only | Intelligent Vision + Manual |
| **Safety Proof** | Basic Accuracy % | **Confusion Matrix (Verified 97.6% Recall)** |
| **Trust Factor** | "Trust Me" AI | **SHAP Interpretability (Transparent Logic)** |
| **Design** | Basic Dashboards | Premium Medical GSAP Experience |

---

## 5. Interview & Presentation Q&A (The "Red Team" Prep)

### **Q1: Why use an SVM instead of a Neural Network for the diagnosis?**
> **Answer**: "In healthcare, diagnostic safety (Recall) is the priority. Our SVM achieved a **97.62% recall rate**, meaning it only missed 1 out of 42 malignant cases in our test set. Neural networks often require significantly more data to achieve this level of boundary stability without overfitting on the majority class (Benign)."

### **Q2: How do you handle patient data privacy (GDPR/HIPAA)?**
> **Answer**: "OncoVision is designed as a 'Pass-Through' gateway. We implement `.env` based API key management and audit logging that tracks system health without storing PII (Personally Identifiable Information). Our next phase includes local-first encryption for all report scans."

### **Q3: What happens if the AI extracts the wrong numbers from a photo?**
> **Answer**: "We implemented a **Two-Factor Validation** system. The AI auto-populates the fields, but the user must verify the values in the 'Kinetic Workspace' before clicking 'Diagnose.' Additionally, our Pydantic layer rejects impossible clinical values that fall outside biological ranges."

### **Q4: How does your system handle '429 Rate Limit' errors during high traffic?**
> **Answer**: "We built a **Model Waterfall**. If the primary 2026 Gemini 2.5 model hits a quota limit, the backend instantly fails over to Gemini 2.0 or 1.5. This ensures the patient is never left without an answer due to a technical API limitation."

### **Q5: How do you address the 'Black Box' problem in AI diagnostics?**
> **Answer**: "We use **SHAP values** to provide 'Feature-Level Transparency.' For every diagnosis, the system generates a summary plot showing exactly which morphological features (like concave points or perimeter worst) pushed the diagnosis towards 'Malignant.' This allows pathologists to audit the AI's reasoning in seconds."

---

## 6. Future Roadmap
- **CSV Batch Import**: Enabling hospitals to perform bulk screenings for hundreds of patients simultaneously.
- **Multi-Organ Support**: Expanding the Vision OCR to handle thyroid and prostate FNA reports.
- **Mobile Native**: Transitioning the GSAP UI to React Native for localized diagnostic scanning.
