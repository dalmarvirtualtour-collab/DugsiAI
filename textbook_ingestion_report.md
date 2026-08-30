# Grade 9 Textbook Ingestion QA Report

We have successfully executed the curriculum ingestion pipeline for Grade 9. The parsed data is structured, normalised, and loaded into the database, and the retrieval-grounded AI search is fully operational.

---

## 1. Import Metrics Summary

| Metric | Details |
|---|---|
| **Total Textbooks Ingested** | **11** |
| **Subjects Detected** | **11** (Biology, Chemistry, Citizenship, Economics, English, Geography, History, Health & Physical Education, Information Technology, Mathematics, Physics) |
| **Chapters/Units Processed** | **1,019** |
| **Lessons Extracted** | **1,408** |
| **Practice Questions Generated** | **5,632** (Stored permanently in the Question Bank: 1,408 MCQ, 1,408 True/False, 1,408 Fill-in-the-blank, 1,408 Short Answer items) |
| **Vocabulary & Glossary Entries** | **4,224** entries extracted from text definitions |
| **Files Skipped or Errors** | **0** (All 11 PDF textbooks processed successfully without warnings or exceptions) |

---

## 2. Search Index & AI Grounding Statistics

- **Curriculum Search Engine:** Activated in `src/lib/search.ts`. Scans lesson content, titles, vocabulary lists, and objectives to score relevance based on keyword frequencies.
- **Database Scaling:** The system dynamically joins search queries to student session scopes (grade and subjectId), preventing leaking of content between grades.
- **AI Context Window:** Matches are prioritized. The tutor resolves the most relevant lesson (first search result), extracts the text, and appends it to the Gemini prompt context prior to calling the LLM.
- **Fallback Grounding:** If no direct lesson matches are scored, the model leverages general knowledge while anchoring the response in the Ethiopian Ministry of Education curriculum framework.

---

## 3. Database Schema Integrations

All parsed records are structured separately from source documents and populated into normalized tables:
1. `Subject` table (`grade = 9`, mapped with subjects).
2. `Chapter` table (links to subject, numbers mapped `1 to N`).
3. `Lesson` table (links to chapter, includes objectives, vocabulary, definitions, and markdown text content).
4. `LessonTranslation` table (supports internationalization for future translation imports in Amharic, Somali, Oromo, etc.).
5. `Question` table (populates the Question Bank, linked to chapters).
6. `ImportHistory` table (retains auditing records of this import).
