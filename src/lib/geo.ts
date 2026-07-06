import pilotData from "../../data/inec-pilot.json";

export interface Zone {
  name: string;
  code: string;
  states: string[];
}

// The six geopolitical zones plus the diaspora community.
export const zones: Zone[] = [
  {
    name: "North Central",
    code: "NC",
    states: [
      "Benue",
      "Kogi",
      "Kwara",
      "Nasarawa",
      "Niger",
      "Plateau",
      "Federal Capital Territory",
    ],
  },
  {
    name: "North East",
    code: "NE",
    states: ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
  },
  {
    name: "North West",
    code: "NW",
    states: ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
  },
  {
    name: "South East",
    code: "SE",
    states: ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  },
  {
    name: "South South",
    code: "SS",
    states: ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  },
  {
    name: "South West",
    code: "SW",
    states: ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"],
  },
  {
    name: "Diaspora",
    code: "DIASPORA",
    states: [],
  },
];

export interface PilotWard {
  name: string;
  code: string;
  placeholder?: boolean;
}

export interface PilotLga {
  name: string;
  code: string;
  wards: PilotWard[];
}

export interface PilotState {
  name: string;
  code: string;
  lgas: PilotLga[];
}

export const pilotStates: PilotState[] = pilotData.states;

export const pilotMeta = pilotData._meta;
