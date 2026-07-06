// Civic education lesson catalog. This same content seeds the lessons table
// once Supabase is wired up (scripts/seed-geo.ts); until then the static site
// renders it directly.

export interface LessonSection {
  heading?: string;
  paragraphs: string[];
}

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  orderIndex: number;
  minutes: number;
  sections: LessonSection[];
}

export const lessons: Lesson[] = [
  {
    slug: "getting-your-pvc",
    title: "Getting Your PVC",
    summary:
      "Your Permanent Voter's Card is your entry ticket to the 2027 elections. Here is how to get one.",
    orderIndex: 1,
    minutes: 4,
    sections: [
      {
        paragraphs: [
          "The Permanent Voter's Card (PVC) is the only document that lets you vote in a Nigerian election. No PVC, no vote — it is that simple.",
        ],
      },
      {
        heading: "Registering for the first time",
        paragraphs: [
          "INEC runs Continuous Voter Registration (CVR) between election cycles. You can start your registration online at the INEC voter registration portal (cvr.inecnigeria.org) and complete the biometric capture in person at your state or local government INEC office.",
          "Bring a form of identification: a birth certificate, national ID (NIN slip), driver's licence, or international passport.",
          "Registration is completely free. Anyone asking you to pay is not INEC.",
        ],
      },
      {
        heading: "Already registered?",
        paragraphs: [
          "Check your registration status on the INEC voter verification portal. If you registered but never collected your card, it is waiting at the INEC office of the LGA where you registered.",
          "If you have moved, you can apply to transfer your registration to your new location during a CVR window — do not wait until election season.",
        ],
      },
      {
        heading: "What to do next",
        paragraphs: [
          "Once you hold your PVC, find your polling unit (the next lesson shows you how) and note the details. Encourage two friends to check their own registration this week — participation multiplies.",
        ],
      },
    ],
  },
  {
    slug: "how-elections-work",
    title: "How INEC Elections Work",
    summary:
      "From ballot to final collation: the journey of your vote through Nigeria's electoral system.",
    orderIndex: 2,
    minutes: 5,
    sections: [
      {
        paragraphs: [
          "The Independent National Electoral Commission (INEC) organises federal and state elections: presidential, National Assembly, governorship, and state assembly contests.",
        ],
      },
      {
        heading: "The chain of an election",
        paragraphs: [
          "Voting happens at polling units — over 176,000 of them nationwide. After voting closes, results are counted openly at each polling unit and recorded on Form EC8A.",
          "Results then move up the ladder: polling unit → ward collation centre → LGA collation centre → state collation centre — and for presidential elections, the national collation centre in Abuja.",
          "At every step, party agents and accredited observers can watch and obtain copies of result sheets. Openness at each rung is what keeps the ladder honest.",
        ],
      },
      {
        heading: "The legal framework",
        paragraphs: [
          "The Electoral Act 2022 governs how elections run. Notable provisions include electronic accreditation of voters (BVAS) and the electronic transmission of polling unit result images to the INEC Result Viewing portal (IReV), where any citizen can view them.",
        ],
      },
    ],
  },
  {
    slug: "your-polling-unit-explained",
    title: "Your Polling Unit, Explained",
    summary:
      "The polling unit is the smallest, most powerful unit of Nigerian democracy — and it is yours.",
    orderIndex: 3,
    minutes: 3,
    sections: [
      {
        paragraphs: [
          "A polling unit (PU) is where you are registered to vote. Each PU has a unique code in the format State-LGA-Ward-PU (for example, 04-05-08-012).",
        ],
      },
      {
        heading: "Finding yours",
        paragraphs: [
          "Your PU details are printed on your PVC. You can also look them up on INEC's polling unit locator using your state, LGA, and ward.",
          "Visit your polling unit location before election day. Knowing exactly where to go — and how long it takes to get there — removes one more excuse on the day.",
        ],
      },
      {
        heading: "Why it matters beyond voting",
        paragraphs: [
          "Elections are won and lost at polling units, one neighbourhood at a time. Neighbours who know each other, share accurate information, and show up together are the strongest civic force in the country. That is why OK2027 organises community spaces around polling units.",
        ],
      },
    ],
  },
  {
    slug: "how-to-vote-on-election-day",
    title: "How to Vote on Election Day",
    summary:
      "A calm, step-by-step walkthrough of election day: accreditation, ballot, and what to expect.",
    orderIndex: 4,
    minutes: 4,
    sections: [
      {
        heading: "Before you leave home",
        paragraphs: [
          "Bring your PVC. Eat, hydrate, and plan to arrive early — accreditation and voting run within fixed hours, and queues are shortest at opening.",
          "Leave party clothing and materials at home; campaigning at a polling unit is prohibited on election day.",
        ],
      },
      {
        heading: "At the polling unit",
        paragraphs: [
          "Join the queue and present your PVC to the INEC official. The BVAS device verifies your fingerprint or face against the voter register — this is accreditation.",
          "Once accredited, you receive your ballot paper(s), stamped and signed. In the voting cubicle, mark your choice by thumbprinting inside the box of your preferred party. One clear thumbprint — an unclear mark can void the ballot.",
          "Fold the ballot as instructed and drop it in the ballot box in open view. That's it — your vote is cast.",
        ],
      },
      {
        heading: "After voting",
        paragraphs: [
          "You may stay within the vicinity to peacefully witness counting if you wish — it is your right. Counting happens openly at the unit, and the presiding officer announces the result aloud before recording it.",
        ],
      },
    ],
  },
  {
    slug: "understanding-bvas-and-results",
    title: "Understanding BVAS and Result Verification",
    summary:
      "What the BVAS device does, what IReV shows, and how to read a polling unit result sheet.",
    orderIndex: 5,
    minutes: 5,
    sections: [
      {
        heading: "BVAS: one person, one accreditation",
        paragraphs: [
          "The Bimodal Voter Accreditation System (BVAS) verifies each voter's fingerprint or face before they can collect a ballot. It replaced the old incident-form loopholes and makes over-voting detectable: if votes cast exceed BVAS accreditations at a unit, that result is questionable on its face.",
        ],
      },
      {
        heading: "Form EC8A and IReV",
        paragraphs: [
          "Form EC8A is the polling unit result sheet — the single most important document in the election. It records registered voters, accredited voters, votes per party, and rejected ballots, signed by officials and party agents.",
          "After counting, the presiding officer photographs the EC8A with the BVAS and uploads it to the INEC Result Viewing portal (IReV). Any citizen with the internet can view these images.",
        ],
      },
      {
        heading: "Reading a result sheet",
        paragraphs: [
          "Check three things: (1) accredited voters should not exceed registered voters, (2) total votes cast should not exceed accredited voters, and (3) the arithmetic of party votes plus rejected ballots should equal total votes cast. Those three checks catch most irregularities.",
        ],
      },
    ],
  },
  {
    slug: "peaceful-observation",
    title: "Peaceful Observation: What You Can (and Can't) Do",
    summary:
      "How ordinary citizens can lawfully witness and document their polling unit's process — calmly and safely.",
    orderIndex: 6,
    minutes: 4,
    sections: [
      {
        paragraphs: [
          "Nigerian law allows voters to remain in the vicinity of their polling unit to peacefully witness proceedings. Documentation by ordinary citizens — done calmly and lawfully — strengthens everyone's confidence in the process.",
        ],
      },
      {
        heading: "You can",
        paragraphs: [
          "Observe counting from the permitted area. Note the announced figures for your unit. Photograph the publicly posted result where permitted. Record the time and place of anything unusual, factually and without commentary.",
        ],
      },
      {
        heading: "You should never",
        paragraphs: [
          "Confront, argue with, or obstruct officials, security personnel, party agents, or other voters. Never touch election materials. Never interfere with a queue or a count. If a situation becomes tense, step away — no document is worth your safety.",
          "OK2027's purpose is participation and documentation, never confrontation. Anything that escalates a situation works against the community, not for it.",
        ],
      },
      {
        heading: "If you witness an irregularity",
        paragraphs: [
          "Record what, where, and when. Report through lawful channels: accredited observer groups, party agents at the unit, or INEC's official complaint channels. Share facts, not rumours — unverified claims travel fast and damage trust.",
        ],
      },
    ],
  },
  {
    slug: "organizing-your-ward",
    title: "Organizing Your Ward: From Chat to Action",
    summary:
      "Practical steps to turn neighbours into an organised, informed civic community.",
    orderIndex: 7,
    minutes: 4,
    sections: [
      {
        paragraphs: [
          "A ward is a cluster of polling units — small enough that neighbours can genuinely know one another, big enough to matter. Organised wards are how movements become results.",
        ],
      },
      {
        heading: "Start with what's easy",
        paragraphs: [
          "Find the registered voters around you: family, colleagues, market associations, religious groups. Help unregistered neighbours start their PVC journey — lesson one of this series is shareable for exactly that reason.",
          "Meet in person when you can. A short weekend meetup at a neutral venue builds more trust than a hundred forwarded messages.",
        ],
      },
      {
        heading: "Keep it constructive",
        paragraphs: [
          "Share verified information only — resist forwarding claims you cannot trace to a source. Welcome newcomers regardless of which candidate brought them in. Focus energy on turnout, education, and logistics: who needs a ride on election day, who can look after children while parents vote, who knows the ward's polling units best.",
        ],
      },
    ],
  },
  {
    slug: "election-day-safety",
    title: "Election Day Safety and De-escalation",
    summary:
      "Staying safe is the first duty of every voter. How to read situations, avoid risk, and de-escalate.",
    orderIndex: 8,
    minutes: 4,
    sections: [
      {
        paragraphs: [
          "Nothing on election day — not a queue position, not an argument, not even a result sheet — is worth physical harm. Every plan should start with safety.",
        ],
      },
      {
        heading: "Before and during",
        paragraphs: [
          "Vote with people you know, and agree on a check-in plan with family. Keep your phone charged and airtime loaded. Know two routes home from your polling unit.",
          "Stay alert to the mood around you. If a crowd's tone shifts — raised voices, sudden movements, people leaving quickly — trust the signal and create distance early.",
        ],
      },
      {
        heading: "De-escalation basics",
        paragraphs: [
          "Lower your voice instead of raising it. Give people an exit from an argument rather than a corner. Never respond to provocation — provocateurs at polling units want a reaction on camera. Walking away is a civic skill, not a defeat.",
        ],
      },
      {
        heading: "If things go wrong",
        paragraphs: [
          "Leave first, document later, from a safe distance. Call trusted contacts before posting anything publicly. Report threats to security personnel present, and through your community's coordinators.",
        ],
      },
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
