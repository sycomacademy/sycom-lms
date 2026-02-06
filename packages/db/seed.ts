/**
 * Seed script — run with: bun run db:seed
 *
 * Populates the Neon database with initial data migrated from mock-db/.
 * Safe to re-run: uses ON CONFLICT DO NOTHING so existing rows are skipped.
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { author, blogPost } from "./schema/blog";
import {
  course,
  courseLesson,
  courseModule,
  courseReview,
  courseSection,
} from "./schema/course";
import { faq } from "./schema/faq";
import { feature } from "./schema/feature";
import { instructor } from "./schema/instructor";
import { pathway, pathwayCourse } from "./schema/pathway";
import { testimonial } from "./schema/testimonial";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const instructorData = [
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

const courseData = [
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
    price: 99_900,
    duration: 2400,
    instructorId: "1",
    thumbnailUrl: "/images/comptia-security.webp",
    rating: "4.80",
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
        userName: "Alex Thompson",
        rating: 5,
        comment: "Excellent course! Passed my Security+ exam on the first try.",
        createdAt: new Date("2024-01-15T10:00:00Z"),
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
    price: 79_900,
    duration: 1800,
    instructorId: "1",
    thumbnailUrl: "/images/landscape.png",
    rating: "4.90",
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
    price: 129_900,
    duration: 3600,
    instructorId: "2",
    thumbnailUrl: "/images/comptia-pentest.webp",
    rating: "4.70",
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
    price: 345_900,
    duration: 4800,
    instructorId: "1",
    thumbnailUrl: "/images/landscape.png",
    rating: "4.90",
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
    price: 99_900,
    duration: 2100,
    instructorId: "3",
    thumbnailUrl: "/images/comptia-network.webp",
    rating: "4.70",
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

const pathwayData = [
  {
    id: "1",
    title: "Cybersecurity Fundamentals Pathway",
    slug: "cybersecurity-fundamentals",
    description:
      "Start your cybersecurity career with this comprehensive pathway covering the essential skills and knowledge needed to enter the field. This pathway takes you from complete beginner to certified cybersecurity professional, preparing you for entry-level positions and industry-recognized certifications.",
    shortDescription:
      "Start your cybersecurity career with essential skills and certifications.",
    estimatedDuration: 4200,
    level: "beginner",
    certifications: ["ISC2 CC", "CompTIA Security+"],
    courseIds: ["2", "1"],
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
    estimatedDuration: 4500,
    level: "beginner",
    certifications: ["CompTIA Network+", "CompTIA Security+"],
    courseIds: ["5", "1"],
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
    estimatedDuration: 4800,
    level: "advanced",
    certifications: ["CISSP"],
    courseIds: ["4"],
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
    estimatedDuration: 6000,
    level: "intermediate",
    certifications: ["CompTIA Security+", "CompTIA PenTest+"],
    courseIds: ["1", "3"],
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

const authorData = [
  {
    id: "1",
    name: "Sarah Johnson",
    bio: "Cybersecurity expert with 15+ years of experience",
    photoUrl: "/images/authors/sarah-johnson.jpg",
  },
  {
    id: "2",
    name: "Michael Chen",
    bio: "Career transition specialist and cybersecurity consultant",
    photoUrl: "/images/authors/michael-chen.jpg",
  },
  {
    id: "3",
    name: "David Martinez",
    bio: "Security architect and consultant",
    photoUrl: "/images/authors/david-martinez.jpg",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    bio: "AI and cybersecurity researcher",
    photoUrl: "/images/authors/emily-rodriguez.jpg",
  },
];

const blogPostData = [
  {
    id: "1",
    title: "What About Cybersecurity Training Programs?",
    slug: "what-about-cybersecurity-training-programs",
    excerpt:
      "Explore the importance of comprehensive cybersecurity training programs and how they prepare professionals for real-world security challenges.",
    content:
      "# What About Cybersecurity Training Programs?\n\nCybersecurity training programs have become essential in today's digital landscape. As threats evolve, organizations need skilled professionals who can protect their systems and data.\n\n## The Growing Need for Cybersecurity Skills\n\nThe demand for cybersecurity professionals continues to grow exponentially. With cyber attacks becoming more sophisticated, companies are investing heavily in training their teams.\n\n## Key Components of Effective Training\n\n1. **Hands-on Labs**: Practical experience with real-world scenarios\n2. **Certification Prep**: Preparation for industry-recognized certifications\n3. **Expert Instruction**: Learning from experienced professionals\n4. **Continuous Updates**: Keeping pace with evolving threats\n\n## Benefits of Structured Training Programs\n\n- Improved security posture\n- Career advancement opportunities\n- Industry recognition through certifications\n- Practical skills applicable immediately\n\n## Conclusion\n\nInvesting in cybersecurity training is not just beneficial\u2014it's necessary. Whether you're starting your career or advancing it, structured training programs provide the foundation for success.",
    authorId: "1",
    featuredImageUrl: "/images/landscape.png",
    publishedAt: new Date("2024-08-01T10:00:00Z"),
    category: "Training",
    tags: ["training", "cybersecurity", "career"],
    readingTime: 5,
  },
  {
    id: "2",
    title: "Transitioning into Cybersecurity",
    slug: "transitioning-into-cybersecurity",
    excerpt:
      "A comprehensive guide for professionals looking to transition into cybersecurity from other IT fields or completely different industries.",
    content:
      "# Transitioning into Cybersecurity\n\nMaking a career transition into cybersecurity can seem daunting, but with the right approach, it's entirely achievable.\n\n## Why Transition to Cybersecurity?\n\nThe cybersecurity field offers:\n- High demand and job security\n- Competitive salaries\n- Continuous learning opportunities\n- Impactful work protecting organizations\n\n## Steps to Transition\n\n### 1. Assess Your Current Skills\nIdentify transferable skills from your current role that apply to cybersecurity.\n\n### 2. Choose Your Path\n- Security Analyst\n- Penetration Tester\n- Security Architect\n- Compliance Specialist\n\n### 3. Get Certified\nIndustry certifications validate your knowledge:\n- CompTIA Security+\n- CISSP\n- CEH\n- GSEC\n\n### 4. Gain Practical Experience\n- Hands-on labs\n- Capture the Flag (CTF) competitions\n- Personal projects\n- Internships\n\n## Common Challenges\n\nTransitioning careers comes with challenges:\n- Learning new technical skills\n- Building a professional network\n- Gaining experience\n- Staying motivated\n\n## Success Stories\n\nMany professionals have successfully transitioned into cybersecurity. With dedication and the right training, you can too.\n\n## Next Steps\n\n1. Research certification paths\n2. Enroll in training programs\n3. Join cybersecurity communities\n4. Start building your portfolio",
    authorId: "2",
    featuredImageUrl: "/images/landscape.png",
    publishedAt: new Date("2024-08-20T14:30:00Z"),
    category: "Career",
    tags: ["career", "transition", "certification"],
    readingTime: 8,
  },
  {
    id: "3",
    title: "How To Start Your Cybersecurity Journey",
    slug: "how-to-start-your-cybersecurity-journey",
    excerpt:
      "A beginner's guide to starting a career in cybersecurity, covering essential first steps, recommended certifications, and learning resources.",
    content:
      "# How To Start Your Cybersecurity Journey\n\nStarting a career in cybersecurity is exciting and rewarding. Here's your roadmap to success.\n\n## Understanding Cybersecurity\n\nCybersecurity involves protecting systems, networks, and data from digital attacks. It's a diverse field with many specializations.\n\n## Essential First Steps\n\n### 1. Build a Foundation\n- Learn networking basics\n- Understand operating systems\n- Study security fundamentals\n\n### 2. Choose Your Focus Area\n- Network Security\n- Application Security\n- Cloud Security\n- Incident Response\n\n### 3. Get Hands-On Experience\n- Set up a home lab\n- Practice with virtual machines\n- Try online platforms like TryHackMe or HackTheBox\n\n## Recommended Certifications for Beginners\n\n1. **CompTIA Security+**: Entry-level certification covering security fundamentals\n2. **CompTIA Network+**: Networking knowledge essential for security\n3. **ISC2 CC**: Certified in Cybersecurity - perfect starting point\n\n## Conclusion\n\nStarting your cybersecurity journey requires dedication, but the rewards are significant. Begin with the fundamentals, practice consistently, and never stop learning.",
    authorId: "1",
    featuredImageUrl: "/images/landscape.png",
    publishedAt: new Date("2024-08-22T09:15:00Z"),
    category: "Beginner",
    tags: ["beginner", "getting-started", "certification"],
    readingTime: 10,
  },
  {
    id: "4",
    title: "10 Essential Cybersecurity Practices for 2024",
    slug: "10-essential-cybersecurity-practices-2024",
    excerpt:
      "Stay ahead of threats with these proven security strategies that every organization should implement in 2024.",
    content:
      "# 10 Essential Cybersecurity Practices for 2024\n\nAs cyber threats evolve, organizations must adopt comprehensive security practices. Here are the essential strategies for 2024.\n\n## 1. Multi-Factor Authentication (MFA)\n\nImplement MFA across all systems and applications.\n\n## 2. Regular Security Training\n\nEducate employees about phishing, social engineering, and security best practices.\n\n## 3. Zero Trust Architecture\n\nAdopt a zero trust model: never trust, always verify.\n\n## 4. Patch Management\n\nKeep all systems updated with the latest security patches.\n\n## 5. Network Segmentation\n\nDivide networks into segments to limit lateral movement.\n\n## 6. Incident Response Plan\n\nDevelop and regularly test an incident response plan.\n\n## 7. Data Encryption\n\nEncrypt sensitive data both at rest and in transit.\n\n## 8. Security Monitoring\n\nImplement continuous monitoring and logging.\n\n## 9. Backup and Recovery\n\nMaintain regular backups and test recovery procedures.\n\n## 10. Vendor Risk Management\n\nAssess and monitor third-party vendors.\n\n## Conclusion\n\nImplementing these practices creates a strong security foundation.",
    authorId: "3",
    featuredImageUrl: "/images/landscape.png",
    publishedAt: new Date("2024-01-15T11:00:00Z"),
    category: "Security",
    tags: ["security", "best-practices", "enterprise"],
    readingTime: 7,
  },
  {
    id: "5",
    title: "Understanding Zero Trust Architecture",
    slug: "understanding-zero-trust-architecture",
    excerpt:
      "A deep dive into the zero trust security model and how to implement it in your organization.",
    content:
      '# Understanding Zero Trust Architecture\n\nZero Trust is a security model that assumes no implicit trust based on location or network. Every access request must be verified.\n\n## What is Zero Trust?\n\nZero Trust operates on the principle: "Never trust, always verify."\n\n## Core Principles\n\n1. **Verify Explicitly**: Always authenticate and authorize based on available data\n2. **Use Least Privilege**: Limit user access with Just-In-Time and Just-Enough-Access\n3. **Assume Breach**: Minimize blast radius and segment access\n\n## Conclusion\n\nZero Trust is not a product but a strategy. Start with high-value assets and expand gradually.',
    authorId: "3",
    featuredImageUrl: "/images/landscape.png",
    publishedAt: new Date("2024-01-10T09:00:00Z"),
    category: "Infrastructure",
    tags: ["zero-trust", "architecture", "security"],
    readingTime: 9,
  },
  {
    id: "6",
    title: "The Rise of AI-Powered Threat Detection",
    slug: "ai-powered-threat-detection",
    excerpt:
      "How artificial intelligence is revolutionizing the way we detect and respond to cyber threats.",
    content:
      "# The Rise of AI-Powered Threat Detection\n\nArtificial intelligence is transforming cybersecurity, enabling faster and more accurate threat detection.\n\n## The AI Revolution in Security\n\nAI and machine learning are becoming essential tools in the cybersecurity arsenal.\n\n## How AI Enhances Threat Detection\n\n### Pattern Recognition\nAI systems can identify patterns in vast amounts of data that humans would miss.\n\n### Behavioral Analysis\nMachine learning models learn normal behavior and flag anomalies.\n\n### Real-Time Processing\nAI can analyze data in real-time, enabling immediate response to threats.\n\n## Conclusion\n\nAI-powered threat detection is no longer optional\u2014it's essential.",
    authorId: "4",
    featuredImageUrl: "/images/landscape.png",
    publishedAt: new Date("2024-01-05T13:00:00Z"),
    category: "AI & ML",
    tags: ["ai", "machine-learning", "threat-detection"],
    readingTime: 6,
  },
];

const faqData = [
  {
    id: "1",
    question: "What certifications do you offer?",
    answer:
      "We offer preparation courses for various industry-recognized certifications including CompTIA Security+, Network+, PenTest+, ISC2 Certified in Cybersecurity (CC), CISSP, and more. Our courses are designed to help you pass these certification exams.",
    category: "Certifications",
  },
  {
    id: "2",
    question: "Do I need prior experience to start?",
    answer:
      "No prior experience is required for our beginner-level courses. We have pathways designed for complete beginners, as well as intermediate and advanced courses for experienced professionals. Each course clearly indicates its prerequisites.",
    category: "Getting Started",
  },
  {
    id: "3",
    question: "How long do I have access to course materials?",
    answer:
      "Once enrolled, you have lifetime access to course materials, including any updates. This means you can review content at your own pace and return to materials whenever you need a refresher.",
    category: "Access",
  },
  {
    id: "4",
    question: "Are the courses self-paced or scheduled?",
    answer:
      "All our courses are self-paced, allowing you to learn on your own schedule. You can complete courses as quickly or slowly as you need, fitting your learning around your work and personal commitments.",
    category: "Learning Format",
  },
  {
    id: "5",
    question: "What support is available if I have questions?",
    answer:
      "We provide multiple support channels including course forums where you can ask questions and interact with instructors and other students. Our support team is also available to help with technical issues or course-related questions.",
    category: "Support",
  },
  {
    id: "6",
    question: "Do you offer hands-on practice?",
    answer:
      "Yes! Our courses include interactive labs and hands-on exercises that allow you to practice skills in a safe, virtual environment. These labs simulate real-world scenarios you'll encounter in your cybersecurity career.",
    category: "Learning Format",
  },
  {
    id: "7",
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied with your course within the first 30 days, you can request a full refund, no questions asked.",
    category: "Pricing",
  },
  {
    id: "8",
    question: "How do pathways differ from individual courses?",
    answer:
      "Pathways are structured learning journeys that combine multiple courses in a logical sequence. They're designed to take you from beginner to certified professional, often including multiple certifications. Individual courses focus on specific topics or certifications.",
    category: "Courses",
  },
];

const featureData = [
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

const testimonialData = [
  {
    id: "1",
    quote:
      "The CompTIA Security+ course exceeded my expectations. The hands-on labs and expert instruction helped me pass the exam on my first attempt. I've already recommended it to several colleagues.",
    name: "Alex Thompson",
    role: "IT Security Analyst",
    company: "TechCorp Solutions",
    photoUrl: "/images/testimonials/alex-thompson.jpg",
    rating: 5,
    courseId: "1",
  },
  {
    id: "2",
    quote:
      "As someone transitioning from IT support to cybersecurity, the Cybersecurity Fundamentals Pathway was perfect. The structured approach and comprehensive content gave me the confidence to make the career change.",
    name: "Maria Garcia",
    role: "Cybersecurity Specialist",
    company: "SecureNet Inc",
    photoUrl: "/images/testimonials/maria-garcia.jpg",
    rating: 5,
    pathwayId: "1",
  },
  {
    id: "3",
    quote:
      "The CISSP Masterclass is outstanding. The depth of coverage and quality of instruction is unmatched. I passed the CISSP exam and immediately saw new career opportunities open up.",
    name: "David Kim",
    role: "Security Manager",
    company: "Global Finance Corp",
    photoUrl: "/images/testimonials/david-kim.jpg",
    rating: 5,
    courseId: "4",
  },
  {
    id: "4",
    quote:
      "The Penetration Testing Pathway gave me the practical skills I needed to advance my career. The hands-on labs were incredibly valuable, and I use the techniques I learned daily in my work.",
    name: "Sarah Johnson",
    role: "Penetration Tester",
    company: "SecurityFirst Consulting",
    photoUrl: "/images/testimonials/sarah-johnson.jpg",
    rating: 5,
    pathwayId: "4",
  },
  {
    id: "5",
    quote:
      "Excellent platform with high-quality courses. The instructors are knowledgeable, and the course materials are well-structured. The ISC2 CC course was a great starting point for my cybersecurity journey.",
    name: "James Wilson",
    role: "Network Administrator",
    company: "DataCore Systems",
    photoUrl: "/images/testimonials/james-wilson.jpg",
    rating: 5,
    courseId: "2",
  },
  {
    id: "6",
    quote:
      "The Network Security Specialist Pathway perfectly combined networking and security. I now have both Network+ and Security+ certifications, which has significantly boosted my career prospects.",
    name: "Emily Chen",
    role: "Network Security Engineer",
    company: "CloudTech Solutions",
    photoUrl: "/images/testimonials/emily-chen.jpg",
    rating: 5,
    pathwayId: "2",
  },
];

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Seeding database...\n");

  // 1. Instructors
  console.log("  Inserting instructors...");
  await db.insert(instructor).values(instructorData).onConflictDoNothing();

  // 2. Courses (flat data only)
  console.log("  Inserting courses...");
  for (const c of courseData) {
    const { modules: _m, reviews: _r, ...courseRow } = c;
    await db.insert(course).values(courseRow).onConflictDoNothing();
  }

  // 3. Modules, sections, lessons, reviews
  console.log("  Inserting modules, sections, lessons, reviews...");
  for (const c of courseData) {
    for (const mod of c.modules) {
      await db
        .insert(courseModule)
        .values({
          id: mod.id,
          courseId: c.id,
          title: mod.title,
          order: mod.order,
        })
        .onConflictDoNothing();

      for (const sec of mod.sections) {
        await db
          .insert(courseSection)
          .values({
            id: sec.id,
            moduleId: mod.id,
            title: sec.title,
            order: sec.order,
          })
          .onConflictDoNothing();

        for (const les of sec.lessons) {
          await db
            .insert(courseLesson)
            .values({
              id: les.id,
              sectionId: sec.id,
              title: les.title,
              order: les.order,
              type: les.type,
              duration: les.duration,
              content: undefined,
              videoUrl: les.videoUrl,
            })
            .onConflictDoNothing();
        }
      }
    }

    for (const rev of c.reviews) {
      await db
        .insert(courseReview)
        .values({
          id: rev.id,
          courseId: c.id,
          userName: rev.userName,
          rating: rev.rating,
          comment: rev.comment,
          createdAt: rev.createdAt,
        })
        .onConflictDoNothing();
    }
  }

  // 4. Pathways
  console.log("  Inserting pathways...");
  for (const p of pathwayData) {
    const { courseIds: _ci, ...pathwayRow } = p;
    await db.insert(pathway).values(pathwayRow).onConflictDoNothing();
  }

  // 5. Pathway courses (junction table)
  console.log("  Inserting pathway-course links...");
  for (const p of pathwayData) {
    for (let i = 0; i < p.courseIds.length; i++) {
      await db
        .insert(pathwayCourse)
        .values({
          id: `pc-${p.id}-${p.courseIds[i]}`,
          pathwayId: p.id,
          courseId: p.courseIds[i],
          courseOrder: i + 1,
        })
        .onConflictDoNothing();
    }
  }

  // 6. Authors
  console.log("  Inserting authors...");
  await db.insert(author).values(authorData).onConflictDoNothing();

  // 7. Blog posts
  console.log("  Inserting blog posts...");
  await db.insert(blogPost).values(blogPostData).onConflictDoNothing();

  // 8. FAQs
  console.log("  Inserting FAQs...");
  await db.insert(faq).values(faqData).onConflictDoNothing();

  // 9. Features
  console.log("  Inserting features...");
  await db.insert(feature).values(featureData).onConflictDoNothing();

  // 10. Testimonials
  console.log("  Inserting testimonials...");
  await db.insert(testimonial).values(testimonialData).onConflictDoNothing();

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
