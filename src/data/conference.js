export const conference = {
  name: "ICTIM'26",
  fullName:
    "The 8th International Conference on Information Technology and Modeling",
  edition: 8,
  tagline:
    "Innovation and Trends in Computer Science and Modeling: Bridging Theory, Practice, and the Power of AI",
  description:
    "The 8th edition of the International Conference on Information Technology and Modeling (ICTIM'26), organized by the TIM Laboratory at the Faculty of Sciences Ben M'Sik. Join us to discover the future of AI and digital transformation, and be part of the conversation shaping the next frontier of technology.",
  location: "Faculty of Sciences Ben M'Sik, Hassan II University",
  city: "Casablanca, Morocco",
  venue: "Faculty of Sciences Ben M'Sik | Casablanca - Morocco",
  dates: "November 26 – 28, 2026",
  publication:
    "Proceedings published in Springer's CCIS series. Extended versions of selected papers submitted to Scopus-indexed journals.",
  templateNote:
    "English is the language of the conference and all submissions. Manuscripts should be prepared using the A4 IEEE template.",
  templateUrl:
    "https://www.springer.com/gp/computer-science/lncs/conference-proceedings-guidelines",
  registrationUrl: "https://www.conference-tim.com/",
  websiteUrl: "https://www.conference-tim.com/",
  contact: {
    emails: ["tim24fsbm@gmail.com", "omar.zahour@univh2c.ma"],
    phone: "+212 660-082091",
    address:
      "Faculty of Sciences Ben M'Sik, University Hassan II, Casablanca, Morocco",
  },
  organizer: "TIM Laboratory — LTIM",
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Committee", href: "#committees" },
  { label: "Topics", href: "#topics" },
  { label: "Program", href: "#important-dates" },
  { label: "Contact", href: "#contact" },
];

export const heroImages = {
  src: "",
  alt: "ICTIM conference venue — information technology and modeling",
};

export const heroHighlights = [
  { value: "Scopus", label: "Indexed Journals", enabled: true },
  { value: "10+", label: "Research Topics", enabled: true },
  { value: "6+", label: "Keynote Speakers", enabled: true },
  { value: "8th", label: "Edition", enabled: true },
];

export const submissionGuidelines = {
  pillars: [
    {
      id: "platform",
      pill: "Conference Portal",
      pillHref: "https://www.conference-tim.com/",
      icon: "platform",
      title: "Submission Platform",
      items: [
        "Easy manuscript upload",
        "Real-time status tracking",
      ],
    },
    {
      id: "format",
      pill: "A4 IEEE Template",
      pillHref:
        "https://www.springer.com/gp/computer-science/lncs/conference-proceedings-guidelines",
      icon: "format",
      title: "Paper Format",
      items: [
        "Available in Word & LaTeX",
        "Springer CCIS proceedings format",
        "Includes references",
      ],
    },
    {
      id: "requirements",
      pill: "Submission Policy",
      pillHref: "#call-for-papers",
      icon: "requirements",
      title: "Key Requirements",
      items: [
        "Original & unpublished work",
        "English language required",
        "Peer-reviewed submissions",
      ],
    },
  ],
  evaluationCriteria: [
    "Novelty & originality of contributions",
    "Technical soundness & methodology",
    "Significance & impact on field",
    "Clarity & presentation quality",
    "Relevance to ICTIM scope",
  ],
  plagiarismIntegrity: [
    "Mandatory plagiarism screening",
    "Original work only required",
    "Double-blind review process",
    "Conflict-of-interest management",
    "Springer publication standards",
  ],
};

export const registrationPricing = {
  plans: [
    {
      id: "in-person",
      badge: "Best Plan",
      title: "In-Person",
      price: 600,
      currency: "MAD",
      enabled: true,
      features: [
        "Communication Certificate",
        "Certificate of Participation",
        "Conference Materials",
        "Access to Exhibitions",
        "Lunch and Tea/Coffee Breaks",
        "Conference Documents",
        "Briefcase | Proceedings Report",
        "Notebook | Pen",
        "Badge | Brochure | Program",
      ],
    },
    {
      id: "virtual",
      badge: "Remote",
      title: "Virtual",
      price: 350,
      currency: "MAD",
      enabled: true,
      features: [
        "Certificate of Participation",
        "Digital Conference Materials",
        "Online session access",
        "Conference documents (PDF)",
      ],
    },
  ],
};

/** Global homepage section visibility toggles (managed from dashboard). */
export const sectionSettings = {
  workshops: { enabled: true },
  sponsors: { enabled: true },
  callForPapers: { enabled: true },
  submissionGuidelines: { enabled: true },
  registrationFees: { enabled: true },
  committees: { enabled: true },
};

export const workshops = [
  {
    id: 1,
    number: 1,
    title: "Generative AI for Scientific Research",
    subtitle: "Practical Workshop 1 — ICTIM'26",
    description:
      "Explore how large language models and generative AI tools can accelerate literature review, hypothesis generation, and data analysis in academic research workflows.",
    facilitator: {
      name: "Pr. Anderson Rocha",
      credentials: "Full Professor of AI & Digital Forensics, University of Campinas (Unicamp)",
    },
    objectives: [
      "Understand LLM capabilities for research assistance",
      "Apply prompt engineering for academic tasks",
      "Evaluate ethical considerations in AI-assisted research",
    ],
    duration: "2:00",
    price: 300,
    currency: "DH",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  },
  {
    id: 2,
    number: 2,
    title: "From Text to Video: AI Video Generation",
    subtitle: "Practical Workshop 2 — ICTIM'26",
    description:
      "A hands-on session covering the foundations of text-to-video generation, current challenges, and practical applications of AI-powered multimedia content creation.",
    facilitator: {
      name: "Pr. El Habib Benlahmar",
      credentials:
        "Professor, Faculty of Sciences Ben M'Sik, Hassan II University of Casablanca",
    },
    objectives: [
      "Learn text-to-video pipeline fundamentals",
      "Identify key challenges in AI video generation",
      "Build a simple generative multimedia prototype",
    ],
    duration: "2:00",
    price: 300,
    currency: "DH",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
  },
  {
    id: 3,
    number: 3,
    title: "Data Modeling & Predictive Analytics",
    subtitle: "Practical Workshop 3 — ICTIM'26",
    description:
      "Master modern data modeling techniques and predictive analytics workflows using industry-standard tools for real-world decision-making applications.",
    facilitator: {
      name: "Pr. Sanaa El Filali",
      credentials:
        "Professor, Faculty of Sciences Ben M'Sik, Hassan II University of Casablanca",
    },
    objectives: [
      "Design robust data models for analytics",
      "Apply predictive modeling techniques",
      "Interpret and communicate analytical results",
    ],
    duration: "2:00",
    price: 300,
    currency: "DH",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
];

export const callForPapers = {
  intro:
    "ICTIM'26 invites original and unpublished research contributions in Information Technology and Modeling. Submissions must present novel scientific results and be written in English.",
  publication: [
    "Peer-reviewed proceedings in Springer's CCIS series",
    "Extended papers submitted to Scopus-indexed journals",
    "Springer LNCS format compliance required",
  ],
  requirements: [
    "A4 IEEE template (Word/LaTeX guidelines)",
    "English language for all submissions",
    "Original, unpublished research contributions",
    "Manuscripts must include references",
  ],
  cta: {
    label: "Submit Your Research",
    href: "https://www.conference-tim.com/",
  },
};

export const quickLinks = [
  {
    id: 1,
    title: "Call for Papers",
    description: "Topics, scope, and guidelines for your submission.",
    href: "#call-for-papers",
    icon: "document",
  },
  {
    id: 2,
    title: "Important Dates",
    description: "Paper deadlines, notifications, and conference dates.",
    href: "#important-dates",
    icon: "calendar",
  },
  {
    id: 3,
    title: "Submit Paper",
    description: "Platform, format, and key submission requirements.",
    href: "#submission-guidelines",
    icon: "submit",
  },
  {
    id: 4,
    title: "Committees",
    description: "Organizing, program, and scientific committee members.",
    href: "#committees",
    icon: "users",
  },
];

export const participationSteps = [
  {
    id: 1,
    step: "01",
    title: "Start of Submission",
    date: "July 1, 2026",
    description:
      "Authors may begin submitting full papers and proposals through the official conference portal. Early submissions are encouraged.",
    icon: "search",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  },
  {
    id: 2,
    step: "02",
    title: "Submission Deadline",
    date: "September 30, 2026",
    description:
      "Final deadline for all paper submissions. Ensure your manuscript follows the A4 IEEE template and English language requirements.",
    icon: "document",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
  },
  {
    id: 3,
    step: "03",
    title: "Notification of Acceptance",
    date: "October 15, 2026",
    description:
      "Authors receive notification regarding the acceptance status of their submissions after peer review.",
    icon: "check",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  },
  {
    id: 4,
    step: "04",
    title: "Final Manuscript Due",
    date: "October 30, 2026",
    description:
      "Accepted authors must submit their final camera-ready manuscripts incorporating reviewer feedback.",
    icon: "edit",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    id: 5,
    step: "05",
    title: "Date of the Conference",
    date: "November 26 – 28, 2026",
    description:
      "Join us at the Faculty of Sciences Ben M'Sik in Casablanca for two days of keynotes, sessions, and networking.",
    icon: "calendar",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
];

export const previousEditions = [
  {
    id: 1,
    name: "TIM'14",
    category: "1st Edition",
    date: "2014",
    location: "Casablanca, Morocco",
    attendees: "TIM Laboratory",
    price: "Archive",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f298cdae?w=800&q=80",
    href: "https://www.conference-tim.com/",
  },
  {
    id: 2,
    name: "TIM'15",
    category: "2nd Edition",
    date: "2015",
    location: "Casablanca, Morocco",
    attendees: "TIM Laboratory",
    price: "Archive",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    href: "https://www.conference-tim.com/",
  },
  {
    id: 3,
    name: "TIM'16",
    category: "3rd Edition",
    date: "2016",
    location: "Casablanca, Morocco",
    attendees: "TIM Laboratory",
    price: "Archive",
    image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    href: "https://www.conference-tim.com/",
  },
  {
    id: 4,
    name: "TIM'22",
    category: "6th Edition",
    date: "2022",
    location: "Casablanca, Morocco",
    attendees: "TIM Laboratory",
    price: "Archive",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    href: "https://www.conference-tim.com/",
  },
  {
    id: 5,
    name: "ICTIM'24",
    category: "7th Edition",
    date: "November 26–27, 2024",
    location: "Casablanca, Morocco",
    attendees: "Faculty of Sciences Ben M'Sik",
    price: "Latest Edition",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    href: "https://www.conference-tim.com/",
  },
];

export const editionsDropdown = {
  label: "Previous Editions",
  items: previousEditions.map((edition) => ({
    label: edition.name,
    subtitle: edition.category,
    href: edition.href,
  })),
};

export const partners = [
  { id: 1, name: "Springer", logo: "https://cdn.simpleicons.org/springer/94A3B8" },
  { id: 2, name: "IEEE", logo: "https://cdn.simpleicons.org/ieee/94A3B8" },
  { id: 3, name: "Hassan II University", logo: "https://cdn.simpleicons.org/googlecloud/94A3B8" },
  { id: 4, name: "TIM Laboratory", logo: "https://cdn.simpleicons.org/researchgate/94A3B8" },
  { id: 5, name: "Scopus", logo: "https://cdn.simpleicons.org/elsevier/94A3B8" },
  { id: 6, name: "CCIS", logo: "https://cdn.simpleicons.org/springer/94A3B8" },
];

export const footerLinks = {
  "Practical Links": [
    { label: "Registration", href: "#register-pricing" },
    { label: "Committee", href: "#committees" },
    { label: "Topics", href: "#topics" },
    { label: "Program", href: "#important-dates" },
  ],
  Editions: [
    { label: "TIM'14", href: "https://www.conference-tim.com/" },
    { label: "TIM'15", href: "https://www.conference-tim.com/" },
    { label: "TIM'16", href: "https://www.conference-tim.com/" },
    { label: "TIM'22", href: "https://www.conference-tim.com/" },
    { label: "ICTIM'24", href: "https://www.conference-tim.com/" },
  ],
  Resources: [
    {
      label: "IEEE Template",
      href: "https://www.springer.com/gp/computer-science/lncs/conference-proceedings-guidelines",
    },
    { label: "Submission Guidelines", href: "#submission-guidelines" },
    { label: "Official Website", href: "https://www.conference-tim.com/" },
    { label: "TIM Laboratory", href: "#committees" },
  ],
};
