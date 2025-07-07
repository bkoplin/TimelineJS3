/**
 * English language definitions
 */
export const english = {
  name: "English",
  lang: "en",
  direction: "ltr",
  
  // DateTime formatting
  messages: {
    loading: "Loading",
    error: "Error",
    contract_timeline: "Contract Timeline",
    expand_timeline: "Expand Timeline",
    return_to_title: "Return to Title",
    go_to_end: "Go to End",
    loading_timeline: "Loading Timeline...",
    zoom_in: "Zoom In",
    zoom_out: "Zoom Out"
  },
  
  // Date formatting
  date: {
    month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    month_abbr: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
    day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    day_abbr: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
  },
  
  // ARIA labels
  aria_label_timeline: "Timeline",
  aria_label_timeline_content: "Timeline content"
} as const
