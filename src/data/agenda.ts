export type AgendaItem = {
  start: string;
  end: string;
  title: string;
  description: string;
};
const times = [
  ["07:00", "08:30"],
  ["08:30", "10:10"],
  ["10:10", "10:30"],
  ["10:30", "12:10"],
  ["12:10", "12:50"],
  ["12:50", "14:30"],
  ["14:30", "14:50"],
  ["14:50", "16:30"],
  ["16:30", "18:30"],
  ["18:30", "21:00"],
];
const saturday = [
  "Saturday Morning - Hotel Breakfast",
  "Session 1 — Lukas Opacic Lecture Part A — Introduction to Classical Liberalism",
  "Saturday - Morning Tea",
  "Session 2 — Michael Brennan Economics Lecture Part A",
  "Saturday - Lunch",
  "Session 3 — Joshua Forrester Law Lecture Part A",
  "Saturday - Afternoon Tea",
  "Session 4 — Peter Kurtis Lecture Part A",
  "Saturday - After Sessions Break",
  "Dinner & Moderated Discussion",
];
const sunday = [
  "Sunday Morning - Hotel Breakfast",
  "Session 1 — Joshua Forrester Law Lecture Part B",
  "Sunday - Morning Tea",
  "Session 2 — Michael Brennan Economics Lecture Part B",
  "Sunday - Lunch",
  "Session 3 — Parnell McGuinness Law Lecture Part A",
  "Sunday - Afternoon Tea",
  "TBC",
];
export const agenda: Record<string, AgendaItem[]> = {
  "20260522": [
    { start: "15:00", end: "18:00", title: "Hotel Check In", description: "" },
    {
      start: "18:00",
      end: "19:00",
      title: "Pre-dinner registration",
      description: "",
    },
    {
      start: "18:30",
      end: "22:00",
      title: "Opening Dinner (Friday)",
      description:
        "Panel dinner moderated by Michael Stutchbury, featuring all four lecturers in conversation.",
    },
  ],
  "20260523": saturday.map((title, i) => ({
    start: times[i][0],
    end: times[i][1],
    title,
    description:
      i === 1
        ? "An introduction to the philosophical and historical foundations of classical liberalism, exploring limited government, individual autonomy, and the emerging challenges posed by artificial intelligence."
        : [3, 5, 7].includes(i)
          ? "TBC"
          : "",
  })),
  "20260524": sunday.map((title, i) => ({
    start: times[i][0],
    end: times[i][1],
    title,
    description: [1, 3, 5, 7].includes(i) ? "TBC" : "",
  })),
};
