export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  photoUrl?: string;
  rating?: number;
  courseId?: string; // if testimonial is course-specific
  pathwayId?: string; // if testimonial is pathway-specific
}

export const testimonials: Testimonial[] = [
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
