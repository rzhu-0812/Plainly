export interface Checklist {
  task: string;
  done: boolean;
}

export interface Summary {
  subject: string;
  translation: string;
  urgency: "High" | "Medium" | "Low" | "No";
  deadline: string;
  checklist: Checklist[];
  legalTip: string;
}
