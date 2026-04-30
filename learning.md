# Project Journal: OncoVision AI Implementation

## Date: April 29, 2026

### 🚀 Key Accomplishments
1.  **Real-Time Colab Bridge:** Established a FastAPI `live_logger.py` and Cloudflare tunnel to stream training logs from Google Colab to the local terminal. This bypassed the "blind" coding issue and allowed real-time pipeline monitoring.
2.  **High-Precision Training:** Executed a full ML pipeline comparing SVM, Random Forest, XGBoost, and ANN. 
3.  **Model Optimization:** Tuned hyperparameters with a focus on **Recall (Malignant)**. Achieved ~97.6% recall with a Tuned SVM (C=1, gamma=0.01, kernel='rbf').
4.  **SHAP Integration:** Successfully generated SHAP KernelExplainability reports. Overcame `AssertionError` in Colab by correctly slicing the 3D SHAP matrix `[:, :, 0]` for binary classification.
5.  **Full-Stack Diagnostic Dashboard:** Built a Next.js (Light Mode) dashboard and a FastAPI backend.
6.  **Patient-Centric UI/UX:** Pivoted the UI from technical jargon (e.g., "Mean Perimeter") to patient-friendly language (e.g., "Boundary Length") with helpful tooltips and risk assessment summaries.
7.  **Partial Input Logic:** Solved a critical "bias" bug where padding missing features with `0` caused every prediction to be Benign. Implemented "Mean Padding" logic in the backend using dataset averages to maintain neutral weight for missing data.

### 🧠 Lessons Learned
- **Emoji Encoding:** Standard Windows terminals still struggle with Unicode emojis in Python prints. Avoid emojis in `live_logger.py` to prevent `UnicodeEncodeError`.
- **SHAP Versions:** SHAP's output format (list vs array) varies significantly between versions. Always use explicit shape checks (`len(shap_values.shape)`) to ensure robustness.
- **StandardScaler Sensitivity:** When testing a model with partial features, never pad with `0` unless the mean is `0`. Use the actual dataset means to keep the model balanced.

---

## Date: April 30, 2026

### 🚀 Key Accomplishments
1.  **Intelligent Report Gateway:** Built a vision-capable diagnostic entry point that allows patients to upload PDF/Image reports.
2.  **Medical-to-Data Mapping:** Developed a sophisticated system prompt that translates descriptive medical text (e.g., *"Pleomorphic nuclei with irregular chromatin"*) into normalized numerical inputs for the SVM model.
3.  **SDK Migration:** Successfully migrated from the legacy `google-generativeai` library to the modern **`google-genai`** unified SDK.
4.  **Oncology Safety Filter:** Implemented a backend guardrail that uses AI to verify if an uploaded report is oncology-related before processing, preventing "junk data" injection.
5.  **Side-by-Side UX:** Re-architected the frontend to support both "Manual Pro Mode" and "AI Auto-Scan" simultaneously, ensuring flexibility for both doctors and patients.
6.  **Interactive Wizard:** Transformed the sidebar into a reactive guide that explains AI findings in layman's terms after a scan.

### 🧠 Lessons Learned
- **Prompt Engineering for Precision:** When extracting features for a specific ML model, standardizing the "Typical Ranges" in the prompt is critical. Without them, the AI might return values outside the model's training distribution.
- **SDK Stability:** The new `google-genai` Client pattern is significantly more robust for multi-threaded FastAPI environments compared to the global `configure` method.
- **Model Waterfall Strategy:** Discovered that **Gemini 2.5 Flash** is the current production standard, bypassing the limitations and upcoming deprecation of the 2.0 experimental branch.
- **Rate Limiting Security:** Learned that AI-powered endpoints must be strictly rate-limited (`slowapi`) to prevent rapid credit depletion during high-traffic production events.

---

## Date: May 1, 2026

### 🚀 Key Accomplishments
1.  **Pathology Layout Engine:** Integrated the **`pretext`** skill to handle clinical report text with precise, sub-pixel accurate line-breaking and kerning, bypassing standard DOM layout limitations.
2.  **Kinetic SVG Underlining:** Implemented a "hand-drawn scribble" underline for the section headers using GSAP `ScrollTrigger`. This provides a bespoke, human-centric feel to the high-tech interface.
3.  **Medical Glass Refinement:** Developed a unified `medical-glass` styling language in `globals.css` that balances readability with premium transparency effects.
4.  **GSAP Lifecycle Hardening:** Mastered the `gsap.context()` pattern for Next.js, ensuring zero memory leaks and proper animation cleanup during component unmounting.
5.  **Fluid UI Polish:** Refined animation easings (`expo.out`) and durations to achieve a "graceful" clinical flow that doesn't feel rushed or mechanical.

### 🧠 Lessons Learned
- **Pre-Layout Synchronization:** Discovered that complex layout engines like `pretext` must finish their calculations before GSAP `ScrollTrigger` measures the DOM, otherwise triggers will fire at incorrect scroll positions.
- **SVG Stroke Scaling:** When using `preserveAspectRatio="none"` on an SVG, the `strokeWidth` can become distorted if the container is stretched. Learned to use `vector-effect: non-scaling-stroke` or carefully fixed aspect ratios for consistent line weights.
- **User-Centric Refinement:** Learned that "graceful" usually means slower deceleration (`expo.out`) and slightly longer durations (1.0s+) compared to the snappy defaults used in generic SaaS apps.
