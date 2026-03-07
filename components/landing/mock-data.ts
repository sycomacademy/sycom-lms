interface MockCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: string;
  imageUrl: string;
  category: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  instructor: {
    name: string;
    role: string;
    avatarUrl: string;
  };
}

interface MockBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
}

export const mockCourses: MockCourse[] = [
  {
    id: "course-1",
    title: "CISSP Certification Prep",
    slug: "cissp-certification-prep",
    description:
      "Comprehensive preparation for the Certified Information Systems Security Professional exam covering all eight domains.",
    summary:
      "Master the eight domains of CISSP with hands-on labs, practice exams, and expert-led video lessons.",
    difficulty: "advanced",
    estimatedDuration: "80 hours",
    imageUrl: "/images/courses/cissp.jpg",
    category: "Certification Prep",
    lessonsCount: 64,
    studentsCount: 2340,
    rating: 4.9,
    instructor: {
      name: "Dr. Sarah Mitchell",
      role: "Lead Security Architect",
      avatarUrl: "/images/instructors/sarah.jpg",
    },
  },
  {
    id: "course-2",
    title: "CompTIA Security+ Bootcamp",
    slug: "comptia-security-plus-bootcamp",
    description:
      "Fast-track your cybersecurity career with this intensive Security+ certification bootcamp covering threats, attacks, and vulnerabilities.",
    summary:
      "Everything you need to pass the SY0-701 exam on your first attempt.",
    difficulty: "beginner",
    estimatedDuration: "40 hours",
    imageUrl: "/images/courses/security-plus.jpg",
    category: "Certification Prep",
    lessonsCount: 42,
    studentsCount: 5120,
    rating: 4.8,
    instructor: {
      name: "James Parker",
      role: "Cybersecurity Instructor",
      avatarUrl: "/images/instructors/james.jpg",
    },
  },
  {
    id: "course-3",
    title: "Ethical Hacking & Penetration Testing",
    slug: "ethical-hacking-penetration-testing",
    description:
      "Learn to think like an attacker. Master reconnaissance, exploitation, and reporting with real-world lab environments.",
    summary:
      "Hands-on penetration testing from network scanning to post-exploitation.",
    difficulty: "intermediate",
    estimatedDuration: "60 hours",
    imageUrl: "/images/courses/ethical-hacking.jpg",
    category: "Offensive Security",
    lessonsCount: 48,
    studentsCount: 3890,
    rating: 4.9,
    instructor: {
      name: "Aisha Patel",
      role: "Senior Penetration Tester",
      avatarUrl: "/images/instructors/aisha.jpg",
    },
  },
  {
    id: "course-4",
    title: "Cloud Security Fundamentals",
    slug: "cloud-security-fundamentals",
    description:
      "Secure AWS, Azure, and GCP environments. Learn identity management, encryption, network security, and compliance frameworks.",
    summary:
      "Protect multi-cloud infrastructure with industry-standard frameworks.",
    difficulty: "intermediate",
    estimatedDuration: "35 hours",
    imageUrl: "/images/courses/cloud-security.jpg",
    category: "Cloud Security",
    lessonsCount: 36,
    studentsCount: 1870,
    rating: 4.7,
    instructor: {
      name: "Marcus Williams",
      role: "Cloud Security Engineer",
      avatarUrl: "/images/instructors/marcus.jpg",
    },
  },
  {
    id: "course-5",
    title: "Incident Response & Forensics",
    slug: "incident-response-forensics",
    description:
      "Build an end-to-end incident response capability. From detection through containment, eradication, and lessons learned.",
    summary:
      "Real-world incident response scenarios with forensic analysis tools.",
    difficulty: "advanced",
    estimatedDuration: "50 hours",
    imageUrl: "/images/courses/incident-response.jpg",
    category: "Blue Team",
    lessonsCount: 38,
    studentsCount: 1540,
    rating: 4.8,
    instructor: {
      name: "Dr. Sarah Mitchell",
      role: "Lead Security Architect",
      avatarUrl: "/images/instructors/sarah.jpg",
    },
  },
  {
    id: "course-6",
    title: "Network Security Essentials",
    slug: "network-security-essentials",
    description:
      "Master firewalls, IDS/IPS, VPNs, and network monitoring. Protect enterprise infrastructure from the ground up.",
    summary: "From network fundamentals to advanced defence techniques.",
    difficulty: "beginner",
    estimatedDuration: "30 hours",
    imageUrl: "/images/courses/network-security.jpg",
    category: "Network Security",
    lessonsCount: 32,
    studentsCount: 4210,
    rating: 4.7,
    instructor: {
      name: "James Parker",
      role: "Cybersecurity Instructor",
      avatarUrl: "/images/instructors/james.jpg",
    },
  },
];

export const mockBlogPosts: MockBlogPost[] = [
  {
    id: "post-1",
    title: "The Rise of AI-Powered Cyber Threats in 2026",
    slug: "ai-powered-cyber-threats-2026",
    excerpt:
      "Artificial intelligence is reshaping the threat landscape. Here's what security teams need to know about AI-driven attacks and how to defend against them.",
    content: `Artificial intelligence has become a double-edged sword in cybersecurity. While defenders leverage AI for threat detection and automated response, adversaries are weaponising the same technology to launch more sophisticated attacks.
  ## The New Threat Landscape
  AI-powered attacks represent a fundamental shift in how threat actors operate. Unlike traditional attacks that rely on known signatures and patterns, AI-driven threats can adapt in real-time, evading detection systems that haven't evolved to match.
  ### Key AI-Powered Threats
  **Deepfake Social Engineering** — Attackers are using generative AI to create convincing voice and video deepfakes for business email compromise (BEC) and vishing attacks. In Q1 2026 alone, deepfake-assisted fraud losses exceeded $2 billion globally.
  **Adaptive Malware** — Machine learning models are being used to generate polymorphic malware that mutates its code to bypass signature-based detection. These variants can also learn from sandboxed environments, detecting and evading analysis tools.
  **Automated Vulnerability Discovery** — AI-powered fuzzing tools can discover zero-day vulnerabilities at a pace that far outstrips human researchers. While many of these tools are used legitimately, criminal organisations have developed private versions.
  ## How to Defend Against AI Threats
  1. **Deploy AI-native detection** — Traditional rule-based SIEM systems are no longer sufficient. Invest in ML-powered detection that can identify anomalous behaviour rather than just known signatures.
  2. **Zero Trust Architecture** — Implement strict identity verification for every person and device attempting to access resources, regardless of whether they are inside or outside the network perimeter.
  3. **Continuous security training** — Your team needs to understand AI-powered social engineering. Regular phishing simulations that include AI-generated content are essential.
  4. **Red team with AI** — Use AI-powered penetration testing tools to identify vulnerabilities before attackers do. If your red team isn't using AI, they're not testing against realistic threats.
  ## Looking Ahead
  The arms race between AI-powered attack and defence is accelerating. Organisations that invest in AI-native security tools and continuous training will be best positioned to weather this evolution.
  The key takeaway: AI isn't replacing cybersecurity professionals — it's making their work more critical than ever. The human element of security strategy, ethical judgement, and creative problem-solving remains irreplaceable.`,
    category: "Threat Intelligence",
    imageUrl: "/images/blog/ai-threats.jpg",
    publishedAt: "2026-02-28",
    readTime: "8 min read",
    author: {
      name: "Dr. Sarah Mitchell",
      role: "Lead Security Architect",
      avatarUrl: "/images/instructors/sarah.jpg",
    },
  },
  {
    id: "post-2",
    title: "Zero Trust Architecture: A Practical Implementation Guide",
    slug: "zero-trust-architecture-implementation-guide",
    excerpt:
      "Zero Trust isn't just a buzzword — it's the foundation of modern security. This guide walks through a phased implementation approach for organisations of any size.",
    content: `Zero Trust Architecture (ZTA) has moved from theoretical framework to business necessity. With the dissolution of traditional network perimeters and the rise of remote work, the "never trust, always verify" principle is more relevant than ever.
  ## What Zero Trust Actually Means
  At its core, Zero Trust operates on a simple principle: no user, device, or network should be trusted by default, regardless of their location relative to the network perimeter.
  ### The Five Pillars of Zero Trust
  1. **Identity** — Strong authentication and continuous verification of all users and services.
  2. **Devices** — Continuous assessment of device health and compliance.
  3. **Network** — Micro-segmentation and encrypted communications.
  4. **Applications** — Secure access to applications regardless of location.
  5. **Data** — Classification, encryption, and access controls for all data.
  ## Phase 1: Identity Foundation (Months 1-3)
  Start with identity — it's the most impactful and least disruptive pillar.
  - Deploy multi-factor authentication (MFA) for all users
  - Implement single sign-on (SSO) across all applications
  - Establish role-based access control (RBAC) with least privilege
  - Set up continuous session monitoring
  ## Phase 2: Device Trust (Months 3-6)
  Once identity is solid, extend trust decisions to include device posture.
  - Deploy endpoint detection and response (EDR) on all managed devices
  - Create device compliance policies
  - Implement conditional access based on device health
  - Establish a BYOD security policy with mobile device management
  ## Phase 3: Network Segmentation (Months 6-12)
  With identity and device trust in place, segment your network.
  - Map all network flows between applications and services
  - Implement micro-segmentation starting with critical assets
  - Deploy network detection and response (NDR) tools
  - Encrypt all internal communications
  ## Measuring Success
  Track these metrics to evaluate your Zero Trust maturity:
  - Mean time to detect (MTTD) lateral movement
  - Percentage of applications behind ZTA controls
  - Reduction in standing privileges
  - Number of micro-segments implemented
  Zero Trust is a journey, not a destination. Start small, measure rigorously, and iterate continuously.`,
    category: "Architecture",
    imageUrl: "/images/blog/zero-trust.jpg",
    publishedAt: "2026-02-20",
    readTime: "12 min read",
    author: {
      name: "Marcus Williams",
      role: "Cloud Security Engineer",
      avatarUrl: "/images/instructors/marcus.jpg",
    },
  },
  {
    id: "post-3",
    title: "Top 10 Cybersecurity Certifications for 2026",
    slug: "top-cybersecurity-certifications-2026",
    excerpt:
      "Planning your certification path? We break down the most valuable cybersecurity certifications based on salary data, demand, and career impact.",
    content: `Choosing the right certification can accelerate your cybersecurity career significantly. Based on 2026 salary data, employer demand, and career trajectory analysis, here are the certifications that deliver the highest return on investment.
  ## 1. CISSP — Certified Information Systems Security Professional
  **Average salary premium:** +28% | **Demand rank:** #1
  The gold standard for security leadership. CISSP validates deep technical and managerial security knowledge across eight domains. Best suited for professionals with 5+ years of experience.
  ## 2. CompTIA Security+
  **Average salary premium:** +15% | **Demand rank:** #2
  The most popular entry-level security certification. Security+ covers foundational security concepts and is DoD 8570 compliant. Ideal starting point for career changers.
  ## 3. OSCP — Offensive Security Certified Professional
  **Average salary premium:** +35% | **Demand rank:** #4
  The premier penetration testing certification. OSCP requires passing a gruelling 24-hour practical exam. Highly valued by red teams and security consultancies.
  ## 4. CCSP — Certified Cloud Security Professional
  **Average salary premium:** +25% | **Demand rank:** #3
  As organisations accelerate cloud adoption, CCSP validates the ability to secure cloud infrastructure. Strong complement to CISSP for cloud-focused roles.
  ## 5. CISM — Certified Information Security Manager
  **Average salary premium:** +26% | **Demand rank:** #5
  Focused on security management and governance. CISM is preferred for CISO and security director roles, emphasising programme development over technical depth.
  ## 6-10: Honourable Mentions
  - **CEH** — Certified Ethical Hacker: Good stepping stone to OSCP
  - **CRISC** — Certified in Risk and Information Systems Control: Risk management focused
  - **AWS Security Specialty** — Cloud-native security for AWS environments
  - **GIAC GSEC** — SANS-affiliated broad security certification
  - **CySA+** — CompTIA's security analyst certification, bridging Security+ and advanced certs
  ## Building Your Certification Path
  **Entry level:** Security+ → CySA+ → CEH
  **Management track:** Security+ → CISSP → CISM
  **Technical track:** Security+ → OSCP → GIAC specialisations
  **Cloud track:** Security+ → CCSP → AWS/Azure Security Specialty
  Remember: certifications open doors, but hands-on experience keeps them open. Pair every certification with practical lab work and real-world projects.`,
    category: "Career",
    imageUrl: "/images/blog/certifications.jpg",
    publishedAt: "2026-02-14",
    readTime: "10 min read",
    author: {
      name: "James Parker",
      role: "Cybersecurity Instructor",
      avatarUrl: "/images/instructors/james.jpg",
    },
  },
  {
    id: "post-4",
    title: "Building a Home Lab for Cybersecurity Practice",
    slug: "building-home-lab-cybersecurity",
    excerpt:
      "A dedicated practice environment is essential for developing real-world security skills. Here's how to build an effective home lab on any budget.",
    content: `Every cybersecurity professional needs a safe environment to practice offensive and defensive techniques. A home lab gives you the freedom to experiment, break things, and learn from mistakes without risking production systems.
  ## Why You Need a Home Lab
  Certifications teach theory. Labs teach reality. The gap between knowing a concept and executing it under pressure is where home labs prove their worth.
  ## Budget Tier: Free to £100
  **Virtualisation:** Use VirtualBox (free) on your existing hardware. 16GB RAM minimum recommended.
  **Vulnerable machines:** Download intentionally vulnerable VMs:
  - DVWA (Damn Vulnerable Web Application)
  - Metasploitable 2 and 3
  - VulnHub machines
  - HackTheBox starting point
  **Network tools:** Wireshark, Nmap, Burp Suite Community Edition — all free.
  ## Mid Tier: £100-500
  **Hardware:** A refurbished enterprise mini-PC (Dell OptiPlex Micro, HP EliteDesk Mini) with 32GB RAM and an SSD. These run nearly silent and consume minimal power.
  **Virtualisation:** Proxmox VE (free, enterprise-grade). Run multiple VMs and containers simultaneously.
  **Additional tools:** pfSense firewall VM, Security Onion for network monitoring, Wazuh for SIEM.
  ## Advanced Tier: £500+
  **Hardware:** A proper server (Dell PowerEdge T340 or similar) with 64GB+ RAM and multiple NICs.
  **Network:** Managed switch with VLAN support, dedicated wireless access point for wireless security testing.
  **Software:** Full Active Directory domain, multiple network segments, automated attack simulation tools.
  ## Essential Lab Scenarios
  1. **Active Directory attacks** — Kerberoasting, Pass-the-Hash, DCSync
  2. **Web application testing** — SQL injection, XSS, SSRF against DVWA/WebGoat
  3. **Network analysis** — Packet capture analysis, IDS rule writing
  4. **Incident response** — Malware analysis in isolated VMs, forensic imaging
  5. **Cloud security** — AWS Free Tier for cloud-native security practice
  Start small, iterate often, and document everything. Your lab is a living project that grows with your skills.`,
    category: "Tutorials",
    imageUrl: "/images/blog/home-lab.jpg",
    publishedAt: "2026-02-07",
    readTime: "9 min read",
    author: {
      name: "Aisha Patel",
      role: "Senior Penetration Tester",
      avatarUrl: "/images/instructors/aisha.jpg",
    },
  },
  {
    id: "post-5",
    title: "Understanding Ransomware: Prevention, Response, and Recovery",
    slug: "understanding-ransomware-prevention-response-recovery",
    excerpt:
      "Ransomware attacks are evolving rapidly. Learn the latest prevention strategies, how to respond to an active incident, and how to recover effectively.",
    content: `Ransomware remains the most financially impactful cyber threat facing organisations in 2026. With average ransom demands exceeding $1.5 million and total recovery costs often reaching 10x that figure, prevention and preparation are non-negotiable.
  ## The Modern Ransomware Landscape
  Today's ransomware operations are sophisticated criminal enterprises. "Big game hunting" — targeting large organisations with customised attacks — has become the dominant model. Key trends include:
  - **Double extortion** — Encrypting data AND threatening to leak it
  - **Triple extortion** — Adding DDoS attacks or targeting customers/partners
  - **Ransomware-as-a-Service (RaaS)** — Lowering the barrier to entry for attackers
  - **Supply chain targeting** — Compromising software vendors to reach downstream victims
  ## Prevention: The First Line of Defence
  ### Patch management
  Unpatched vulnerabilities remain the primary entry vector. Maintain a 72-hour critical patch window and automated patching for everything else.
  ### Email security
  Deploy advanced email filtering with sandboxing. Train users on phishing identification. Implement DMARC, DKIM, and SPF.
  ### Backup strategy
  Follow the 3-2-1-1-0 rule: 3 copies, 2 different media types, 1 offsite, 1 offline/immutable, 0 errors in verification testing.
  ### Network segmentation
  Limit lateral movement with micro-segmentation. If ransomware can't spread, its impact is contained.
  ## Response: When Prevention Fails
  1. **Isolate** — Immediately disconnect affected systems. Don't power them off (you'll lose volatile memory evidence).
  2. **Assess** — Determine the scope. Which systems are affected? What data is at risk?
  3. **Notify** — Alert your incident response team, legal counsel, and (if required) regulators.
  4. **Investigate** — Identify the entry point and initial compromise. This is critical for preventing re-infection.
  5. **Decide** — To pay or not to pay? This is a business decision informed by legal, financial, and operational factors.
  ## Recovery: Getting Back to Normal
  Recovery is a marathon, not a sprint. Expect 2-4 weeks for full recovery even with good backups. Prioritise systems by business criticality and rebuild from known-good images.
  The most important lesson: test your backups regularly. An untested backup is not a backup.`,
    category: "Threat Intelligence",
    imageUrl: "/images/blog/ransomware.jpg",
    publishedAt: "2026-01-30",
    readTime: "11 min read",
    author: {
      name: "Dr. Sarah Mitchell",
      role: "Lead Security Architect",
      avatarUrl: "/images/instructors/sarah.jpg",
    },
  },
  {
    id: "post-6",
    title: "From Help Desk to Penetration Tester: A Career Transition Guide",
    slug: "help-desk-to-penetration-tester",
    excerpt:
      "Thinking about moving from IT support into offensive security? Here is a realistic, step-by-step roadmap for making the transition.",
    content: `The jump from help desk to penetration testing is one of the most common — and most rewarding — career transitions in cybersecurity. Here's how real professionals have made it work.
  ## Why Help Desk Is Actually a Great Starting Point
  Don't underestimate your IT support experience. You understand how organisations actually work: their networks, their users, their pain points. Penetration testers need exactly this knowledge to simulate realistic attacks.
  ## The Transition Roadmap
  ### Year 1: Build the Foundation
  **Certifications:** CompTIA Security+ and Network+. These aren't sexy, but they prove you understand the fundamentals.
  **Skills to develop:**
  - Linux command line fluency
  - Basic scripting (Python and Bash)
  - Networking fundamentals (TCP/IP, DNS, DHCP)
  - Operating system internals
  **Practice:** Set up a home lab. Start with HackTheBox starting point machines and TryHackMe's beginner paths.
  ### Year 2: Go Deeper
  **Certifications:** CEH or eJPT (eLearnSecurity Junior Penetration Tester).
  **Skills to develop:**
  - Web application testing (OWASP Top 10)
  - Network scanning and enumeration
  - Basic exploitation techniques
  - Report writing
  **Practice:** Graduate to harder HackTheBox machines. Participate in CTF competitions. Start a security blog documenting what you learn.
  ### Year 3: Break In
  **Certifications:** OSCP — this is the gatekeeper certification for penetration testing roles.
  **Apply for:** Junior penetration tester, security analyst, vulnerability assessment analyst roles. Your help desk experience + certifications + demonstrable skills make you a strong candidate.
  ## Common Mistakes to Avoid
  - **Waiting until you feel "ready"** — You'll never feel 100% ready. Apply when you meet 60-70% of job requirements.
  - **Ignoring soft skills** — Report writing and client communication are half the job.
  - **Only studying theory** — Employers want to see what you've built and broken, not just what you've read.
  The transition typically takes 2-3 years of dedicated effort. It's not easy, but the cybersecurity skills gap means demand far outstrips supply. Your next role is waiting.`,
    category: "Career",
    imageUrl: "/images/blog/career-transition.jpg",
    publishedAt: "2026-01-22",
    readTime: "7 min read",
    author: {
      name: "James Parker",
      role: "Cybersecurity Instructor",
      avatarUrl: "/images/instructors/james.jpg",
    },
  },
];
