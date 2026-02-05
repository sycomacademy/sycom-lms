export interface Instructor {
  id: string;
  name: string;
  bio: string;
  photoUrl?: string;
  credentials: string[];
  experience: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  sections: CourseSection[];
}

export interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  order: number;
  type: "article" | "video" | "image" | "quiz" | "mixed";
  duration: number; // minutes
  content?: string;
  videoUrl?: string;
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  price: number; // in pence/cents
  duration: number; // total minutes
  instructorId: string;
  thumbnailUrl?: string;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  whatYoullLearn: string[];
  prerequisites: string[];
  whoIsThisFor: string[];
  highlights: string[];
  modules: CourseModule[];
  reviews: CourseReview[];
}

export const instructors: Instructor[] = [
  {
    id: "1",
    name: "Dr. James Wilson",
    bio: "Dr. Wilson is a cybersecurity expert with over 20 years of experience in information security. He holds multiple certifications including CISSP, CISM, and CEH. He has worked with Fortune 500 companies and government agencies.",
    photoUrl: "/images/instructors/james-wilson.jpg",
    credentials: ["CISSP", "CISM", "CEH", "PhD in Computer Science"],
    experience: "20+ years",
  },
  {
    id: "2",
    name: "Sarah Chen",
    bio: "Sarah is a penetration testing specialist and ethical hacker. She has discovered vulnerabilities in major platforms and is a regular speaker at security conferences worldwide.",
    photoUrl: "/images/instructors/sarah-chen.jpg",
    credentials: ["OSCP", "GPEN", "CEH", "CISSP"],
    experience: "15+ years",
  },
  {
    id: "3",
    name: "Michael Torres",
    bio: "Michael specializes in cloud security and DevSecOps. He has helped numerous organizations secure their cloud infrastructure and implement security in their development pipelines.",
    photoUrl: "/images/instructors/michael-torres.jpg",
    credentials: ["CCSP", "AWS Security", "Azure Security", "CISSP"],
    experience: "12+ years",
  },
];

export const courses: Course[] = [
  {
    id: "1",
    title: "CompTIA Security+",
    slug: "comptia-security",
    description:
      "Master the fundamentals of cybersecurity and prepare for the CompTIA Security+ certification exam. This comprehensive course covers all domains tested on the exam, including threats, attacks, and vulnerabilities, architecture and design, implementation, operations and incident response, and governance, risk, and compliance.",
    shortDescription:
      "Master the fundamentals of cybersecurity and prepare for the Security+ certification exam.",
    category: "CompTIA",
    level: "beginner",
    price: 99_900, // £999.00
    duration: 2400, // 40 hours
    instructorId: "1",
    thumbnailUrl: "/images/comptia-security.webp",
    rating: 4.8,
    reviewCount: 245,
    enrolledCount: 1250,
    whatYoullLearn: [
      "Identify and mitigate security threats and vulnerabilities",
      "Implement secure network architecture and design",
      "Manage identity and access controls",
      "Understand risk management and compliance",
      "Respond to security incidents",
    ],
    prerequisites: [
      "Basic understanding of computer networks",
      "Familiarity with operating systems",
      "No prior security experience required",
    ],
    whoIsThisFor: [
      "IT professionals entering cybersecurity",
      "Network administrators",
      "Security analysts",
      "Anyone preparing for Security+ exam",
    ],
    highlights: [
      "Covers all Security+ exam objectives",
      "Hands-on labs and practical exercises",
      "Practice exams included",
      "Lifetime access to course materials",
    ],
    modules: [
      {
        id: "m1",
        title: "Introduction to Security",
        order: 1,
        sections: [
          {
            id: "s1",
            title: "Security Fundamentals",
            order: 1,
            lessons: [
              {
                id: "l1",
                title: "What is Cybersecurity?",
                order: 1,
                type: "video",
                duration: 15,
                videoUrl: "/videos/security-fundamentals.mp4",
              },
              {
                id: "l2",
                title: "Security Principles",
                order: 2,
                type: "article",
                duration: 20,
              },
            ],
          },
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        userId: "u1",
        userName: "Alex Thompson",
        rating: 5,
        comment: "Excellent course! Passed my Security+ exam on the first try.",
        createdAt: "2024-01-15T10:00:00Z",
      },
    ],
  },
  {
    id: "2",
    title: "ISC2 Certified in Cybersecurity",
    slug: "isc2-cc",
    description:
      "The ISC2 Certified in Cybersecurity (CC) certification is an entry-level credential that demonstrates your knowledge of cybersecurity fundamentals. This course prepares you for the CC exam and provides a solid foundation for your cybersecurity career.",
    shortDescription:
      "Build a strong foundation in cybersecurity with the ISC2 CC certification.",
    category: "ISC2",
    level: "beginner",
    price: 79_900, // £799.00
    duration: 1800, // 30 hours
    instructorId: "1",
    thumbnailUrl: "/images/landscape.png",
    rating: 4.9,
    reviewCount: 189,
    enrolledCount: 890,
    whatYoullLearn: [
      "Cybersecurity fundamentals and concepts",
      "Security principles and practices",
      "Risk management basics",
      "Security controls and countermeasures",
      "Incident response fundamentals",
    ],
    prerequisites: [
      "Basic computer literacy",
      "No prior experience required",
      "Willingness to learn",
    ],
    whoIsThisFor: [
      "Career changers entering cybersecurity",
      "IT professionals new to security",
      "Students interested in cybersecurity",
      "Anyone starting their security journey",
    ],
    highlights: [
      "Entry-level certification prep",
      "Comprehensive coverage of CC domains",
      "Real-world examples and scenarios",
      "Exam voucher included",
    ],
    modules: [],
    reviews: [],
  },
  {
    id: "3",
    title: "CompTIA PenTest+",
    slug: "comptia-pentest",
    description:
      "Learn penetration testing and vulnerability assessment skills. This course covers all aspects of penetration testing including planning, scoping, information gathering, vulnerability identification, exploitation, and reporting.",
    shortDescription:
      "Master penetration testing skills and prepare for the PenTest+ certification.",
    category: "CompTIA",
    level: "intermediate",
    price: 129_900, // £1,299.00
    duration: 3600, // 60 hours
    instructorId: "2",
    thumbnailUrl: "/images/comptia-pentest.webp",
    rating: 4.7,
    reviewCount: 156,
    enrolledCount: 567,
    whatYoullLearn: [
      "Penetration testing methodology",
      "Vulnerability scanning and assessment",
      "Exploitation techniques",
      "Post-exploitation activities",
      "Reporting and communication",
    ],
    prerequisites: [
      "CompTIA Security+ or equivalent knowledge",
      "Understanding of networking concepts",
      "Basic scripting knowledge helpful",
    ],
    whoIsThisFor: [
      "Security professionals",
      "Penetration testers",
      "Ethical hackers",
      "Security consultants",
    ],
    highlights: [
      "Hands-on penetration testing labs",
      "Real-world scenarios",
      "Tools and techniques coverage",
      "Practice exam questions",
    ],
    modules: [],
    reviews: [],
  },
  {
    id: "4",
    title: "CISSP Masterclass",
    slug: "cissp-masterclass",
    description:
      "The Official ISC2 CISSP CBK Training Masterclass. Advance your cybersecurity career with the most prestigious certification in information security. This comprehensive course covers all eight domains of the CISSP Common Body of Knowledge.",
    shortDescription:
      "The Official ISC2 CISSP CBK Training Masterclass. Advance your cybersecurity career.",
    category: "ISC2",
    level: "advanced",
    price: 345_900, // £3,459.00
    duration: 4800, // 80 hours
    instructorId: "1",
    thumbnailUrl: "/images/landscape.png",
    rating: 4.9,
    reviewCount: 312,
    enrolledCount: 1234,
    whatYoullLearn: [
      "Security and risk management",
      "Asset security",
      "Security architecture and engineering",
      "Communication and network security",
      "Identity and access management",
      "Security assessment and testing",
      "Security operations",
      "Software development security",
    ],
    prerequisites: [
      "5 years of cumulative work experience in 2+ CISSP domains",
      "Or 4 years with a relevant degree/certification",
      "Strong understanding of security concepts",
    ],
    whoIsThisFor: [
      "Experienced security professionals",
      "Security managers",
      "Security architects",
      "IT professionals seeking CISSP",
    ],
    highlights: [
      "Covers all 8 CISSP domains",
      "Official ISC2 training materials",
      "Practice questions and exams",
      "Exam voucher included",
    ],
    modules: [],
    reviews: [],
  },
  {
    id: "5",
    title: "CompTIA Network+",
    slug: "comptia-network",
    description:
      "Learn networking fundamentals and prepare for the CompTIA Network+ certification. This course covers network architecture, operations, security, troubleshooting, and industry standards and practices.",
    shortDescription:
      "Learn networking fundamentals and prepare for the Network+ certification.",
    category: "CompTIA",
    level: "beginner",
    price: 99_900, // £999.00
    duration: 2100, // 35 hours
    instructorId: "3",
    thumbnailUrl: "/images/comptia-network.webp",
    rating: 4.7,
    reviewCount: 198,
    enrolledCount: 987,
    whatYoullLearn: [
      "Network architecture and design",
      "Network operations and troubleshooting",
      "Network security fundamentals",
      "Network infrastructure",
      "Cloud and virtualization concepts",
    ],
    prerequisites: [
      "Basic computer skills",
      "No prior networking experience required",
      "CompTIA A+ recommended but not required",
    ],
    whoIsThisFor: [
      "Network administrators",
      "IT support specialists",
      "Network technicians",
      "Anyone starting in networking",
    ],
    highlights: [
      "Comprehensive Network+ coverage",
      "Hands-on networking labs",
      "Real-world scenarios",
      "Practice exams included",
    ],
    modules: [],
    reviews: [],
  },
];
