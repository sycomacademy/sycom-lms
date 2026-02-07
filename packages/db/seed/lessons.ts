/**
 * Seed lessons: CISSP and Network+ course content, quiz questions.
 *
 * Idempotent: uses ON CONFLICT DO NOTHING; UPDATE only where content IS NULL.
 */
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(
  process.env.DATABASE_URL ??
    (() => {
      throw new Error("DATABASE_URL is required");
    })()
);

export async function seedLessons() {
  console.log("  [lessons] Seeding CISSP and Network+ content...");

  // ─── Course 4: CISSP Masterclass ─────────────────────
  const cissp = "4";

  await sql`INSERT INTO course_module (id, course_id, title, "order") VALUES
    ('cm-cissp-1', ${cissp}, 'Security and Risk Management', 1),
    ('cm-cissp-2', ${cissp}, 'Asset Security', 2)
  ON CONFLICT (id) DO NOTHING`;

  await sql`INSERT INTO course_section (id, module_id, title, "order") VALUES
    ('cs-cissp-1-1', 'cm-cissp-1', 'Introduction', 1),
    ('cs-cissp-1-2', 'cm-cissp-1', 'Risk Concepts', 2),
    ('cs-cissp-2-1', 'cm-cissp-2', 'Data Classification', 1),
    ('cs-cissp-2-2', 'cm-cissp-2', 'Data Lifecycle', 2)
  ON CONFLICT (id) DO NOTHING`;

  await sql`INSERT INTO course_lesson (id, section_id, title, "order", type, duration, content, video_url) VALUES
    ('cl-cissp-1', 'cs-cissp-1-1', 'Welcome to CISSP', 1, 'article', 5, ${cisspWelcomeContent}, NULL),
    ('cl-cissp-2', 'cs-cissp-1-1', 'CIA Triad Overview', 2, 'article', 10, ${cisspCiaTriadContent}, NULL),
    ('cl-cissp-3', 'cs-cissp-1-2', 'Risk Assessment Fundamentals', 1, 'article', 15, ${cisspRiskContent}, NULL),
    ('cl-cissp-4', 'cs-cissp-1-2', 'Risk Management Quiz', 2, 'mixed', 10, ${cisspRiskQuizContent}, NULL),
    ('cl-cissp-5', 'cs-cissp-2-1', 'Data Classification Levels', 1, 'article', 12, ${cisspDataClassContent}, NULL),
    ('cl-cissp-6', 'cs-cissp-2-1', 'Handling Sensitive Data', 2, 'article', 10, ${cisspHandlingDataContent}, NULL),
    ('cl-cissp-7', 'cs-cissp-2-2', 'Data Lifecycle Management', 1, 'article', 15, ${cisspDataLifecycleContent}, NULL),
    ('cl-cissp-8', 'cs-cissp-2-2', 'Asset Security Quiz', 2, 'mixed', 10, ${cisspAssetQuizContent}, NULL)
  ON CONFLICT (id) DO NOTHING`;

  await sql`INSERT INTO quiz_question (id, lesson_id, question_text, type, options, hint, "order") VALUES
    ('qq-cissp-1', 'cl-cissp-4', 'What does the "C" in CIA triad stand for?', 'multiple_choice', ${JSON.stringify(
      [
        { id: "a", label: "Cybersecurity", isCorrect: false },
        { id: "b", label: "Confidentiality", isCorrect: true },
        { id: "c", label: "Compliance", isCorrect: false },
        { id: "d", label: "Continuity", isCorrect: false },
      ]
    )}, 'Think about the three core principles of information security.', 1),
    ('qq-cissp-2', 'cl-cissp-4', 'Which of the following are types of risk response?', 'multiselect', ${JSON.stringify(
      [
        { id: "a", label: "Risk Avoidance", isCorrect: true },
        { id: "b", label: "Risk Mitigation", isCorrect: true },
        { id: "c", label: "Risk Amplification", isCorrect: false },
        { id: "d", label: "Risk Transfer", isCorrect: true },
        { id: "e", label: "Risk Acceptance", isCorrect: true },
      ]
    )}, 'There are four standard risk response strategies.', 2),
    ('qq-cissp-3', 'cl-cissp-8', 'What is the primary purpose of data classification?', 'multiple_choice', ${JSON.stringify(
      [
        { id: "a", label: "To encrypt all data", isCorrect: false },
        {
          id: "b",
          label: "To determine the level of protection data requires",
          isCorrect: true,
        },
        { id: "c", label: "To delete unnecessary data", isCorrect: false },
        { id: "d", label: "To compress data for storage", isCorrect: false },
      ]
    )}, 'Consider why organizations label data as confidential, internal, or public.', 1),
    ('qq-cissp-4', 'cl-cissp-8', 'Which phases are part of the data lifecycle? (Select all that apply)', 'multiselect', ${JSON.stringify(
      [
        { id: "a", label: "Create", isCorrect: true },
        { id: "b", label: "Store", isCorrect: true },
        { id: "c", label: "Amplify", isCorrect: false },
        { id: "d", label: "Archive", isCorrect: true },
        { id: "e", label: "Destroy", isCorrect: true },
      ]
    )}, 'Think about data from the moment it is created to when it is no longer needed.', 2)
  ON CONFLICT (id) DO NOTHING`;

  // ─── Course 5: CompTIA Network+ ──────────────────────
  const network = "5";

  await sql`INSERT INTO course_module (id, course_id, title, "order") VALUES
    ('cm-net-1', ${network}, 'Networking Fundamentals', 1),
    ('cm-net-2', ${network}, 'Network Implementation', 2)
  ON CONFLICT (id) DO NOTHING`;

  await sql`INSERT INTO course_section (id, module_id, title, "order") VALUES
    ('cs-net-1-1', 'cm-net-1', 'Network Models', 1),
    ('cs-net-1-2', 'cm-net-1', 'IP Addressing', 2),
    ('cs-net-2-1', 'cm-net-2', 'Routing and Switching', 1),
    ('cs-net-2-2', 'cm-net-2', 'Wireless Networking', 2)
  ON CONFLICT (id) DO NOTHING`;

  await sql`INSERT INTO course_lesson (id, section_id, title, "order", type, duration, content, video_url) VALUES
    ('cl-net-1', 'cs-net-1-1', 'The OSI Model', 1, 'article', 15, ${networkOsiContent}, NULL),
    ('cl-net-2', 'cs-net-1-1', 'TCP/IP Model', 2, 'article', 12, ${networkTcpIpContent}, NULL),
    ('cl-net-3', 'cs-net-1-1', 'Network Models Quiz', 3, 'mixed', 8, ${networkModelsQuizContent}, NULL),
    ('cl-net-4', 'cs-net-1-2', 'IPv4 Addressing', 1, 'article', 15, ${networkIpv4Content}, NULL),
    ('cl-net-5', 'cs-net-1-2', 'Subnetting Basics', 2, 'article', 20, ${networkSubnettingContent}, NULL),
    ('cl-net-6', 'cs-net-2-1', 'How Routers Work', 1, 'article', 12, ${networkRoutersContent}, NULL),
    ('cl-net-7', 'cs-net-2-1', 'VLANs and Trunking', 2, 'article', 15, ${networkVlansContent}, NULL),
    ('cl-net-8', 'cs-net-2-2', 'Wi-Fi Standards', 1, 'article', 10, ${networkWifiContent}, NULL),
    ('cl-net-9', 'cs-net-2-2', 'Network+ Review Quiz', 2, 'mixed', 10, ${networkReviewQuizContent}, NULL)
  ON CONFLICT (id) DO NOTHING`;

  await sql`INSERT INTO quiz_question (id, lesson_id, question_text, type, options, hint, "order") VALUES
    ('qq-net-1', 'cl-net-3', 'How many layers does the OSI model have?', 'multiple_choice', ${JSON.stringify(
      [
        { id: "a", label: "4", isCorrect: false },
        { id: "b", label: "5", isCorrect: false },
        { id: "c", label: "7", isCorrect: true },
        { id: "d", label: "10", isCorrect: false },
      ]
    )}, 'Think: "All People Seem To Need Data Processing"', 1),
    ('qq-net-2', 'cl-net-3', 'Which layers are in the TCP/IP model? (Select all that apply)', 'multiselect', ${JSON.stringify(
      [
        { id: "a", label: "Application", isCorrect: true },
        { id: "b", label: "Transport", isCorrect: true },
        { id: "c", label: "Session", isCorrect: false },
        { id: "d", label: "Internet", isCorrect: true },
        { id: "e", label: "Network Access", isCorrect: true },
      ]
    )}, 'The TCP/IP model has 4 layers.', 2),
    ('qq-net-3', 'cl-net-9', 'What is the default subnet mask for a Class C network?', 'multiple_choice', ${JSON.stringify(
      [
        { id: "a", label: "255.0.0.0", isCorrect: false },
        { id: "b", label: "255.255.0.0", isCorrect: false },
        { id: "c", label: "255.255.255.0", isCorrect: true },
        { id: "d", label: "255.255.255.255", isCorrect: false },
      ]
    )}, 'Class C addresses start with 192-223 in the first octet.', 1),
    ('qq-net-4', 'cl-net-9', 'Which of the following are advantages of VLANs? (Select all that apply)', 'multiselect', ${JSON.stringify(
      [
        {
          id: "a",
          label: "Improved security through segmentation",
          isCorrect: true,
        },
        { id: "b", label: "Reduced broadcast domains", isCorrect: true },
        { id: "c", label: "Increased cable length", isCorrect: false },
        { id: "d", label: "Better network performance", isCorrect: true },
      ]
    )}, 'VLANs logically segment the network.', 2)
  ON CONFLICT (id) DO NOTHING`;

  // Update existing comptia-security lesson content (only if null)
  await sql`UPDATE course_lesson SET content = ${securityWhatIsContent} WHERE id = 'l2' AND content IS NULL`;
}

// ─── Markdown Content ───────────────────────────────────

const cisspWelcomeContent = `# Welcome to the CISSP Masterclass

Welcome to this comprehensive preparation course for the **Certified Information Systems Security Professional (CISSP)** certification.

## What You'll Learn

This course covers all **8 domains** of the CISSP Common Body of Knowledge (CBK):

1. Security and Risk Management
2. Asset Security
3. Security Architecture and Engineering
4. Communication and Network Security
5. Identity and Access Management (IAM)
6. Security Assessment and Testing
7. Security Operations
8. Software Development Security

## About the CISSP Certification

The CISSP is one of the most respected certifications in information security. It demonstrates your expertise in designing, implementing, and managing a best-in-class cybersecurity program.

### Prerequisites

Before pursuing the CISSP, you should have:

- **5 years** of cumulative, paid work experience in 2 or more of the 8 domains
- A strong understanding of fundamental security concepts
- Familiarity with risk management frameworks

> **Note:** You can take the exam before meeting the experience requirement and become an Associate of (ISC)².

## Course Structure

Each module in this course includes:
- **Articles** explaining key concepts
- **Quizzes** to test your understanding
- **Real-world scenarios** to apply your knowledge

Let's begin your CISSP journey!`;

const cisspCiaTriadContent = `# The CIA Triad

The **CIA Triad** is the foundational model for information security. It stands for:

## Confidentiality

Confidentiality ensures that sensitive information is accessed only by authorized individuals. Key mechanisms include:

- **Encryption** - Transforming data into an unreadable format
- **Access Controls** - Restricting who can view or modify data
- **Data Classification** - Categorizing data based on sensitivity levels

### Real-World Example
A hospital restricts access to patient records so only treating physicians and nurses can view them.

## Integrity

Integrity ensures that data remains accurate, complete, and unaltered except by authorized means.

- **Hashing** - Creating a unique fingerprint of data to detect changes
- **Digital Signatures** - Proving the authenticity and integrity of a message
- **Version Control** - Tracking changes to data over time

### Real-World Example
A bank uses checksums to verify that financial transactions are not altered during transmission.

## Availability

Availability ensures that information and systems are accessible when needed by authorized users.

- **Redundancy** - Having backup systems and data
- **Load Balancing** - Distributing traffic across multiple servers
- **Disaster Recovery** - Plans for restoring operations after a disruption

### Real-World Example
An e-commerce site uses multiple data centers to ensure the website stays online even if one center fails.

---

## Beyond the CIA Triad

Some security professionals extend the triad to include:

| Principle | Description |
|-----------|-------------|
| **Authenticity** | Verifying the identity of users and systems |
| **Non-repudiation** | Ensuring actions cannot be denied later |
| **Accountability** | Tracking actions to specific individuals |`;

const cisspRiskContent = `# Risk Assessment Fundamentals

Risk assessment is a critical component of any security program. It helps organizations identify, analyze, and evaluate risks to their information assets.

## Key Risk Terminology

Before diving into risk assessment, let's define the key terms:

- **Asset** - Anything of value to the organization (data, systems, people)
- **Threat** - A potential cause of an unwanted event
- **Vulnerability** - A weakness that can be exploited by a threat
- **Risk** - The likelihood that a threat will exploit a vulnerability and cause harm
- **Impact** - The magnitude of harm caused by a risk event

> **Risk = Threat × Vulnerability × Impact**

## Risk Assessment Process

### 1. Asset Identification
Identify and value the assets you need to protect:
- Hardware and software
- Data and intellectual property
- Personnel and facilities

### 2. Threat Identification
Identify potential threats:
- **Natural** - Earthquakes, floods, fires
- **Human** - Hackers, insider threats, social engineering
- **Technical** - Hardware failures, software bugs, power outages

### 3. Vulnerability Assessment
Identify weaknesses in your defenses:
- \`nmap\` scans for open ports
- Penetration testing
- Code reviews
- Configuration audits

### 4. Risk Analysis

#### Quantitative Analysis
Uses numerical values:
\`\`\`
Single Loss Expectancy (SLE) = Asset Value × Exposure Factor
Annualized Loss Expectancy (ALE) = SLE × Annual Rate of Occurrence
\`\`\`

#### Qualitative Analysis
Uses descriptive categories (High, Medium, Low) based on expert judgment.

## Risk Response Strategies

| Strategy | Description | Example |
|----------|-------------|---------|
| **Avoidance** | Eliminate the risk entirely | Don't store credit card data |
| **Mitigation** | Reduce the likelihood or impact | Install firewalls, train staff |
| **Transfer** | Shift the risk to a third party | Purchase cyber insurance |
| **Acceptance** | Acknowledge and accept the risk | Accept minor data loss risk |`;

const cisspRiskQuizContent = `# Risk Management Review

Now let's test your understanding of the CIA Triad and Risk Management concepts covered in this module.

Review the key concepts:
- The three pillars of the CIA Triad
- The four risk response strategies
- Risk assessment terminology

Answer the questions below to complete this lesson.`;

const cisspDataClassContent = `# Data Classification Levels

Data classification is the process of organizing data into categories based on its sensitivity and the impact of unauthorized disclosure.

## Government Classification Levels

| Level | Description |
|-------|-------------|
| **Top Secret** | Exceptionally grave damage to national security |
| **Secret** | Serious damage to national security |
| **Confidential** | Damage to national security |
| **Unclassified** | No damage to national security |

## Commercial Classification Levels

| Level | Description |
|-------|-------------|
| **Confidential/Proprietary** | Trade secrets, financial data |
| **Private** | Personal information (PII) |
| **Sensitive** | Internal use only, above public |
| **Public** | No restrictions on disclosure |

## Data Classification Process

1. **Define classification levels** - Establish categories relevant to your organization
2. **Assign data owners** - Identify who is responsible for classifying data
3. **Classify existing data** - Apply labels to current data assets
4. **Apply security controls** - Implement protections based on classification
5. **Train personnel** - Ensure staff understand how to handle classified data

## Handling Requirements

Each classification level should have clear handling requirements:

- **Storage** - How and where data is stored
- **Transmission** - Encryption requirements for data in transit
- **Disposal** - How to securely destroy data when no longer needed
- **Access** - Who can access data at each level`;

const cisspHandlingDataContent = `# Handling Sensitive Data

Properly handling sensitive data is essential for maintaining confidentiality and meeting regulatory requirements.

## Data States

Data exists in three states, each requiring different protections:

### Data at Rest
Data stored on media (hard drives, SSDs, tapes):
- **Full Disk Encryption (FDE)** - Encrypts the entire drive
- **Database Encryption** - Encrypts specific fields or tables
- **File-level Encryption** - Encrypts individual files

### Data in Transit
Data moving across a network:
- **TLS/SSL** - Encrypts web traffic
- **VPN** - Creates encrypted tunnels between networks
- **SSH** - Secure remote access

### Data in Use
Data being processed in memory:
- **Secure enclaves** - Isolated processing environments
- **Homomorphic encryption** - Process encrypted data without decrypting

## Data Retention and Disposal

### Retention Policies
- Define how long data must be kept
- Consider legal and regulatory requirements (GDPR, HIPAA, SOX)
- Regularly review and update retention schedules

### Secure Disposal Methods

| Method | Media Type | Description |
|--------|-----------|-------------|
| **Overwriting** | HDDs | Writing patterns over data |
| **Degaussing** | Magnetic media | Using strong magnetic fields |
| **Shredding** | Physical media | Physically destroying the media |
| **Cryptographic erasure** | Encrypted data | Destroying the encryption keys |`;

const cisspDataLifecycleContent = `# Data Lifecycle Management

Understanding the data lifecycle helps organizations manage data effectively from creation to destruction.

## Data Lifecycle Phases

### 1. Create
Data is generated or collected:
- User input and forms
- System-generated logs
- Data collection from sensors or APIs
- Import from external sources

### 2. Store
Data is placed in a storage system:
- Apply appropriate classification labels
- Implement access controls
- Enable encryption for sensitive data
- Configure backup procedures

### 3. Use
Data is accessed and processed:
- Enforce least privilege access
- Monitor data access patterns
- Implement DLP (Data Loss Prevention) controls
- Log all access for audit trails

### 4. Share
Data is distributed to authorized parties:
- Use secure transmission methods
- Verify recipient authorization
- Apply DRM (Digital Rights Management) when needed
- Track sharing activities

### 5. Archive
Data is moved to long-term storage:
- Move to cost-effective storage tiers
- Maintain accessibility as required by policy
- Preserve data integrity over time
- Document archive locations

### 6. Destroy
Data is permanently and securely eliminated:
- Follow approved destruction methods
- Verify destruction is complete
- Document the destruction process
- Update data inventories

## Key Principle

> **Data should be protected at every phase of its lifecycle, with controls appropriate to its classification level.**`;

const cisspAssetQuizContent = `# Asset Security Review

Test your knowledge of data classification and the data lifecycle.

Key areas to review:
- Government vs. commercial classification levels
- The six phases of the data lifecycle
- Data handling requirements at each state

Answer the questions below to complete this module.`;

const networkOsiContent = `# The OSI Model

The **Open Systems Interconnection (OSI)** model is a conceptual framework that standardizes the functions of a networking system into **seven layers**.

## The 7 Layers

Remember: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing

| Layer | Name | Function | Protocols/Examples |
|-------|------|----------|--------------------|
| 7 | **Application** | User interface and network services | HTTP, FTP, SMTP, DNS |
| 6 | **Presentation** | Data formatting, encryption, compression | SSL/TLS, JPEG, ASCII |
| 5 | **Session** | Manages sessions between applications | NetBIOS, RPC |
| 4 | **Transport** | End-to-end delivery, flow control | TCP, UDP |
| 3 | **Network** | Routing and logical addressing | IP, ICMP, OSPF |
| 2 | **Data Link** | Physical addressing and framing | Ethernet, Wi-Fi, ARP |
| 1 | **Physical** | Bits on the wire | Cables, hubs, signals |

## Encapsulation

As data moves down the OSI layers, each layer adds its own header (and sometimes trailer):

1. **Data** → Application, Presentation, Session
2. **Segment** → Transport layer adds port numbers
3. **Packet** → Network layer adds IP addresses
4. **Frame** → Data Link layer adds MAC addresses
5. **Bits** → Physical layer transmits signals`;

const networkTcpIpContent = `# TCP/IP Model

The **TCP/IP model** is the practical networking model used on the internet. It has **4 layers** compared to the OSI model's 7.

## TCP/IP vs OSI Comparison

| TCP/IP Layer | OSI Equivalent | Protocols |
|-------------|----------------|-----------|
| **Application** | Application + Presentation + Session | HTTP, DNS, SMTP, FTP |
| **Transport** | Transport | TCP, UDP |
| **Internet** | Network | IP, ICMP, ARP |
| **Network Access** | Data Link + Physical | Ethernet, Wi-Fi |

## Key Protocols

### TCP (Transmission Control Protocol)
- Connection-oriented (three-way handshake)
- Reliable delivery with acknowledgments
- Flow control and congestion management

### UDP (User Datagram Protocol)
- Connectionless
- No delivery guarantee
- Lower overhead, faster
- Used for: DNS queries, streaming, gaming`;

const networkModelsQuizContent = `# Network Models Quiz

Test your understanding of the OSI and TCP/IP networking models.

Review:
- The 7 layers of the OSI model and their functions
- The 4 layers of the TCP/IP model
- How the two models compare`;

const networkIpv4Content = `# IPv4 Addressing

An IPv4 address is a **32-bit** number, typically written in **dotted decimal notation**.

## Format

\`\`\`
192.168.1.100
\`\`\`

Each octet is 8 bits (0-255), giving 4 octets × 8 bits = 32 bits total.

## Address Classes

| Class | First Octet Range | Default Mask | Networks |
|-------|-------------------|--------------|----------|
| A | 1-126 | 255.0.0.0 (/8) | Large organizations |
| B | 128-191 | 255.255.0.0 (/16) | Medium organizations |
| C | 192-223 | 255.255.255.0 (/24) | Small organizations |
| D | 224-239 | N/A | Multicast |
| E | 240-255 | N/A | Reserved/Experimental |

> **Note:** 127.x.x.x is reserved for loopback (localhost).

## Private IP Ranges (RFC 1918)

These addresses are **not routable** on the public internet:

| Class | Range | CIDR |
|-------|-------|------|
| A | 10.0.0.0 - 10.255.255.255 | 10.0.0.0/8 |
| B | 172.16.0.0 - 172.31.255.255 | 172.16.0.0/12 |
| C | 192.168.0.0 - 192.168.255.255 | 192.168.0.0/16 |`;

const networkSubnettingContent = `# Subnetting Basics

Subnetting divides a network into smaller, more manageable sub-networks.

## Why Subnet?

- **Security** - Isolate network segments
- **Performance** - Reduce broadcast traffic
- **Organization** - Logical network structure
- **Efficiency** - Better use of IP addresses

## Subnet Mask

A subnet mask separates the **network** portion from the **host** portion of an IP address.

\`\`\`
IP Address:    192.168.1.100
Subnet Mask:   255.255.255.0
Network:       192.168.1.0
Host:          .100
Broadcast:     192.168.1.255
\`\`\``;

const networkRoutersContent = `# How Routers Work

A **router** is a Layer 3 (Network) device that forwards packets between different networks.

## Key Concepts

### Routing Table
Every router maintains a routing table that maps destination networks to interfaces or next-hop addresses.

### How a Router Forwards a Packet

1. Receives a frame on an interface
2. Strips the Layer 2 header to get the IP packet
3. Looks up the destination IP in the routing table
4. Finds the best match (longest prefix)
5. Creates a new Layer 2 frame for the outgoing interface
6. Forwards the frame out the appropriate interface`;

const networkVlansContent = `# VLANs and Trunking

A **VLAN (Virtual Local Area Network)** is a logical grouping of devices on the same broadcast domain, regardless of physical location.

## Why Use VLANs?

- **Security** - Isolate sensitive traffic (e.g., finance VLAN, HR VLAN)
- **Performance** - Reduce broadcast domains
- **Flexibility** - Group users by function, not location
- **Cost** - Reduce the need for additional hardware

## Trunk Ports

Trunk ports carry traffic for **multiple VLANs** between switches using **802.1Q tagging**.`;

const networkWifiContent = `# Wi-Fi Standards

Wireless networking uses the **IEEE 802.11** family of standards.

## Wi-Fi Generations

| Standard | Wi-Fi Gen | Frequency | Max Speed | Range |
|----------|-----------|-----------|-----------|-------|
| 802.11n | Wi-Fi 4 | 2.4/5 GHz | 600 Mbps | ~70m |
| 802.11ac | Wi-Fi 5 | 5 GHz | 6.9 Gbps | ~35m |
| 802.11ax | Wi-Fi 6 | 2.4/5 GHz | 9.6 Gbps | ~35m |

## Wireless Security

| Protocol | Encryption | Status |
|----------|-----------|--------|
| **WEP** | RC4 | Deprecated - easily cracked |
| **WPA** | TKIP | Legacy - vulnerabilities known |
| **WPA2** | AES-CCMP | Current standard |
| **WPA3** | SAE + AES | Latest, strongest |

> **Always use WPA2 or WPA3.** Never use WEP or open networks for sensitive data.`;

const networkReviewQuizContent = `# Network+ Module Review

Test your knowledge of networking fundamentals covered in this module.

Topics covered:
- IP addressing and subnet masks
- VLANs and their benefits
- Routing and switching concepts
- Wi-Fi standards and security`;

const securityWhatIsContent = `# Security Principles

Understanding security principles is the foundation of any cybersecurity practice. These principles guide how we protect information systems and data from threats.

## The CIA Triad

The three core principles of information security:

1. **Confidentiality** - Ensuring information is accessible only to authorized users
2. **Integrity** - Maintaining accuracy and completeness of data
3. **Availability** - Ensuring systems are accessible when needed

## Defense in Depth

A layered approach to security:

- **Physical** - Locks, guards, cameras
- **Technical** - Firewalls, encryption, IDS/IPS
- **Administrative** - Policies, procedures, training

## Least Privilege

Users should have only the minimum level of access needed to perform their job functions.`;
