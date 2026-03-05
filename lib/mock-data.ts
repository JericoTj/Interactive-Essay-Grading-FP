import type { GradeResult, EssayFile, StoredFile } from "./types";

export const MOCK_RESULT: GradeResult = {
  aiScore: 12,
  grade: 84,
  letter: "B+",
  summary:
    "This essay presents a well-structured argument with a clear thesis. The evidence is relevant and properly cited in most sections. Grammar is generally strong, though passive voice appears frequently in Section 2. The conclusion would benefit from a stronger synthesis rather than restating the introduction. Overall a solid submission with targeted improvements needed.",
  criteria: [
    {
      name: "Thesis & Argument",
      score: 88,
      max: 100,
      feedback:
        "Clear and well-maintained throughout. Consider deepening the counterargument section.",
    },
    {
      name: "Evidence & Analysis",
      score: 80,
      max: 100,
      feedback: "Sources are solid; watch for over-quoting in paragraph 3.",
    },
    {
      name: "Structure",
      score: 90,
      max: 100,
      feedback:
        "Excellent paragraph transitions. Introduction can be tightened by one sentence.",
    },
    {
      name: "Grammar & Style",
      score: 82,
      max: 100,
      feedback:
        "7 instances of passive voice found. 'However' overused as a transitional device.",
    },
    {
      name: "Citations",
      score: 78,
      max: 100,
      feedback: "References 4 and 9 are missing publication dates.",
    },
  ],
};

export const MOCK_ESSAYS: EssayFile[] = [
  { id: 1, name: "Essay_John_Unit1.pdf", score: 84 },
  { id: 2, name: "Essay_Maria_Unit1.docx", score: 91 },
  { id: 3, name: "Essay_Kevin_Unit1.pdf", score: 73 },
  { id: 4, name: "Essay_Priya_Unit1.docx", score: 88 },
  { id: 5, name: "Essay_Luca_Unit1.pdf", score: 67 },
];

export const MOCK_FILES: StoredFile[] = [
  { name: "Rubric_Unit1.pdf", type: "Rubric", date: "2025-03-01", size: "128 KB" },
  { name: "Essay_John_Unit1.pdf", type: "Essay", date: "2025-03-02", size: "245 KB" },
  { name: "Essay_Maria_Unit1.docx", type: "Essay", date: "2025-03-02", size: "189 KB" },
  { name: "Rubric_Midterm.docx", type: "Rubric", date: "2025-02-20", size: "98 KB" },
  { name: "Essay_Kevin_Unit1.pdf", type: "Essay", date: "2025-03-03", size: "201 KB" },
];
