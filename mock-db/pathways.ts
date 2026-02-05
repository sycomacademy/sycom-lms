export interface Pathway {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  estimatedDuration: number; // total minutes
  level: "beginner" | "intermediate" | "advanced";
  certifications: string[];
  courseIds: string[]; // ordered list of course IDs
  whatYoullAchieve: string[];
  whoIsThisFor: string[];
  prerequisites: string[];
  highlights: string[];
  price?: number; // bundle price in pence/cents (optional, can be sum of courses)
}

export const pathways: Pathway[] = [
  {
    id: "1",
    title: "Cybersecurity Fundamentals Pathway",
    slug: "cybersecurity-fundamentals",
    description:
      "Start your cybersecurity career with this comprehensive pathway covering the essential skills and knowledge needed to enter the field. This pathway takes you from complete beginner to certified cybersecurity professional, preparing you for entry-level positions and industry-recognized certifications.",
    shortDescription:
      "Start your cybersecurity career with essential skills and certifications.",
    estimatedDuration: 4200, // 70 hours
    level: "beginner",
    certifications: ["ISC2 CC", "CompTIA Security+"],
    courseIds: ["2", "1"], // ISC2 CC, then CompTIA Security+
    whatYoullAchieve: [
      "Solid foundation in cybersecurity principles",
      "ISC2 Certified in Cybersecurity (CC) certification",
      "CompTIA Security+ certification",
      "Understanding of security threats and defenses",
      "Practical skills through hands-on labs",
    ],
    whoIsThisFor: [
      "Career changers entering cybersecurity",
      "IT professionals new to security",
      "Students and recent graduates",
      "Anyone starting their cybersecurity journey",
    ],
    prerequisites: [
      "Basic computer literacy",
      "No prior security experience required",
      "Willingness to learn and practice",
    ],
    highlights: [
      "Two industry-recognized certifications",
      "Progressive learning path",
      "Hands-on labs and practical exercises",
      "Career guidance and support",
      "Lifetime access to materials",
    ],
  },
  {
    id: "2",
    title: "Network Security Specialist Pathway",
    slug: "network-security-specialist",
    description:
      "Become a network security specialist by mastering networking fundamentals and security practices. This pathway combines CompTIA Network+ and Security+ certifications to give you comprehensive knowledge of both networking and security.",
    shortDescription:
      "Master networking and security to become a network security specialist.",
    estimatedDuration: 4500, // 75 hours
    level: "beginner",
    certifications: ["CompTIA Network+", "CompTIA Security+"],
    courseIds: ["5", "1"], // Network+, then Security+
    whatYoullAchieve: [
      "Deep understanding of network architecture",
      "CompTIA Network+ certification",
      "CompTIA Security+ certification",
      "Network security implementation skills",
      "Troubleshooting and problem-solving abilities",
    ],
    whoIsThisFor: [
      "Network administrators",
      "IT support professionals",
      "Security analysts",
      "Network technicians",
    ],
    prerequisites: [
      "Basic computer skills",
      "Understanding of IT fundamentals",
      "No prior networking experience required",
    ],
    highlights: [
      "Two complementary certifications",
      "Comprehensive networking coverage",
      "Security-focused networking approach",
      "Real-world scenarios and labs",
    ],
  },
  {
    id: "3",
    title: "Advanced Security Professional Pathway",
    slug: "advanced-security-professional",
    description:
      "Advance your cybersecurity career with this comprehensive pathway designed for experienced professionals. This pathway prepares you for senior security roles and the prestigious CISSP certification, the gold standard in information security.",
    shortDescription:
      "Advance to senior security roles with CISSP certification.",
    estimatedDuration: 4800, // 80 hours
    level: "advanced",
    certifications: ["CISSP"],
    courseIds: ["4"], // CISSP Masterclass
    whatYoullAchieve: [
      "Expert-level security knowledge",
      "CISSP certification",
      "Understanding of all 8 security domains",
      "Senior security management skills",
      "Strategic security thinking",
    ],
    whoIsThisFor: [
      "Experienced security professionals",
      "Security managers and directors",
      "Security architects",
      "IT professionals with 5+ years experience",
    ],
    prerequisites: [
      "5 years of cumulative work experience in 2+ CISSP domains",
      "Or 4 years with relevant degree/certification",
      "Strong foundation in security concepts",
    ],
    highlights: [
      "Most prestigious security certification",
      "Covers all 8 CISSP domains",
      "Official ISC2 training materials",
      "Career advancement opportunities",
    ],
  },
  {
    id: "4",
    title: "Penetration Testing Pathway",
    slug: "penetration-testing",
    description:
      "Master the art of ethical hacking and penetration testing. This pathway takes you from security fundamentals to advanced penetration testing techniques, preparing you for real-world security assessments and the CompTIA PenTest+ certification.",
    shortDescription: "Master ethical hacking and penetration testing skills.",
    estimatedDuration: 6000, // 100 hours
    level: "intermediate",
    certifications: ["CompTIA Security+", "CompTIA PenTest+"],
    courseIds: ["1", "3"], // Security+ first, then PenTest+
    whatYoullAchieve: [
      "Comprehensive security foundation",
      "CompTIA Security+ certification",
      "Penetration testing skills",
      "CompTIA PenTest+ certification",
      "Hands-on exploitation experience",
    ],
    whoIsThisFor: [
      "Security professionals",
      "Ethical hackers",
      "Penetration testers",
      "Security consultants",
    ],
    prerequisites: [
      "Basic understanding of networking",
      "Familiarity with operating systems",
      "Basic scripting knowledge helpful",
    ],
    highlights: [
      "Two security certifications",
      "Extensive hands-on labs",
      "Real-world penetration testing scenarios",
      "Tools and techniques coverage",
    ],
  },
];
