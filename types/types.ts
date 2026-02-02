export interface Summary {
  subject: string;
  translation: string;
  urgency: "High" | "Medium" | "Low" | "No";
  deadline: string;
  checklist: string[];
  legalTip: string;
}
