import { nanoid } from 'nanoid';

export interface Resume {
  basics: Basics;
  work: Work[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  awards: Award[];
  meta: Meta;
}

export interface Basics {
  name: string;
  label: string;
  image?: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: {
    address: string;
    postalCode: string;
    city: string;
    countryCode: string;
    region: string;
  };
  profiles: Profile[];
}

export interface Profile {
  id: string;
  network: string;
  username: string;
  url: string;
}

export interface Work {
  id: string;
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[]; // Stored as array, edited as newline-separated string
}

export interface Education {
  id: string;
  institution: string;
  url: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score: string;
  courses: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: string;
  keywords: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  highlights: string[];
  keywords: string[];
  startDate: string;
  endDate: string;
  url: string;
  roles: string[];
  entity: string;
  type: string;
}

export interface Award {
  id: string;
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

export interface Meta {
  template: 'seoul' | 'tokyo' | 'newYork';
  theme: 'slate' | 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber';
  font: 'sans' | 'serif' | 'mono';
}

export const createEmptyResume = (): Resume => ({
  basics: {
    name: '',
    label: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: {
      address: '',
      postalCode: '',
      city: '',
      countryCode: '',
      region: ''
    },
    profiles: []
  },
  work: [],
  education: [],
  skills: [],
  projects: [],
  awards: [],
  meta: {
    template: 'seoul',
    theme: 'slate',
    font: 'sans'
  }
});

export const createWork = (): Work => ({
  id: nanoid(),
  name: '',
  position: '',
  url: '',
  startDate: '',
  endDate: '',
  summary: '',
  highlights: []
});

export const createEducation = (): Education => ({
  id: nanoid(),
  institution: '',
  url: '',
  area: '',
  studyType: '',
  startDate: '',
  endDate: '',
  score: '',
  courses: []
});

export const createSkill = (): Skill => ({
  id: nanoid(),
  name: '',
  level: '',
  keywords: []
});

export const createProject = (): Project => ({
  id: nanoid(),
  name: '',
  description: '',
  highlights: [],
  keywords: [],
  startDate: '',
  endDate: '',
  url: '',
  roles: [],
  entity: '',
  type: ''
});

export const createAward = (): Award => ({
  id: nanoid(),
  title: '',
  date: '',
  awarder: '',
  summary: ''
});

export const createProfile = (): Profile => ({
    id: nanoid(),
    network: '',
    username: '',
    url: ''
});
