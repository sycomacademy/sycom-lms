export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string; // icon name or component
}

export const features: Feature[] = [
  {
    id: "1",
    title: "Interactive Labs",
    description:
      "Get hands-on experience with real-world cybersecurity scenarios in our virtual lab environment. Practice skills safely before applying them in production.",
    icon: "FlaskConical",
  },
  {
    id: "2",
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with years of real-world experience. Our instructors hold top certifications and bring practical insights to every lesson.",
    icon: "Users",
  },
  {
    id: "3",
    title: "Certification Paths",
    description:
      "Follow structured learning pathways designed to prepare you for industry-recognized certifications like CompTIA, ISC2, and more.",
    icon: "Award",
  },
];
