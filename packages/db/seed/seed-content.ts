/**
 * Markdown strings for CISSP, Network+, and Security Principles lessons.
 * Converted to Plate-compatible JSON in the seed script.
 */

export const cisspWelcomeContent = `# Welcome to the CISSP Masterclass

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

The CISSP is one of the most respected certifications in information security. It demonstrates your expertise in designing, implementing, and managing a best-in-class cybersecurity program.`;

export const cisspCiaTriadContent = `# The CIA Triad

The **CIA Triad** is the foundational model for information security. It stands for:

## Confidentiality

Confidentiality ensures that sensitive information is accessed only by authorized individuals. Key mechanisms include encryption, access controls, and data classification.

## Integrity

Integrity ensures that data remains accurate, complete, and unaltered except by authorized means. Key mechanisms include hashing, digital signatures, and version control.

## Availability

Availability ensures that information and systems are accessible when needed by authorized users. Key mechanisms include redundancy, load balancing, and disaster recovery.`;

export const cisspRiskContent = `# Risk Assessment Fundamentals

Risk assessment is a critical component of any security program. It helps organizations identify, analyze, and evaluate risks to their information assets.

## Key Risk Terminology

- **Asset** - Anything of value to the organization (data, systems, people)
- **Threat** - A potential cause of an unwanted event
- **Vulnerability** - A weakness that can be exploited by a threat
- **Risk** - The likelihood that a threat will exploit a vulnerability and cause harm
- **Impact** - The magnitude of harm caused by a risk event

## Risk Response Strategies

| Strategy | Description |
|----------|-------------|
| **Avoidance** | Eliminate the risk entirely |
| **Mitigation** | Reduce the likelihood or impact |
| **Transfer** | Shift the risk to a third party (e.g. insurance) |
| **Acceptance** | Acknowledge and accept the risk |`;

export const cisspRiskQuizContent = `# Risk Management Review

Test your understanding of the CIA Triad and Risk Management concepts covered in this module. Answer the questions to complete this lesson.`;

export const cisspDataClassContent = `# Data Classification Levels

Data classification is the process of organizing data into categories based on its sensitivity and the impact of unauthorized disclosure.

## Commercial Classification Levels

| Level | Description |
|-------|-------------|
| **Confidential/Proprietary** | Trade secrets, financial data |
| **Private** | Personal information (PII) |
| **Sensitive** | Internal use only |
| **Public** | No restrictions on disclosure |

## Data Classification Process

1. Define classification levels relevant to your organization
2. Assign data owners
3. Classify existing data
4. Apply security controls based on classification
5. Train personnel on handling requirements`;

export const cisspHandlingDataContent = `# Handling Sensitive Data

Data exists in three states, each requiring different protections:

## Data at Rest

Data stored on media: use Full Disk Encryption (FDE), database encryption, or file-level encryption.

## Data in Transit

Data moving across a network: use TLS/SSL, VPN, and SSH for secure transmission.

## Data in Use

Data being processed in memory: use secure enclaves and follow least-privilege principles.`;

export const cisspDataLifecycleContent = `# Data Lifecycle Management

The data lifecycle includes: Create, Store, Use, Share, Archive, and Destroy. Data should be protected at every phase with controls appropriate to its classification level.`;

export const cisspAssetQuizContent = `# Asset Security Review

Test your knowledge of data classification and the data lifecycle. Key areas: government vs. commercial classification levels, the six phases of the data lifecycle, and data handling requirements.`;

export const networkOsiContent = `# The OSI Model

The **Open Systems Interconnection (OSI)** model is a conceptual framework that standardizes the functions of a networking system into **seven layers**.

Remember: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing

| Layer | Name | Function |
|-------|------|----------|
| 7 | Application | User interface and network services |
| 6 | Presentation | Data formatting, encryption |
| 5 | Session | Manages sessions between applications |
| 4 | Transport | End-to-end delivery (TCP, UDP) |
| 3 | Network | Routing and logical addressing |
| 2 | Data Link | Physical addressing and framing |
| 1 | Physical | Bits on the wire |`;

export const networkTcpIpContent = `# TCP/IP Model

The **TCP/IP model** has **4 layers** compared to the OSI model's 7: Application, Transport, Internet, and Network Access. TCP is connection-oriented and reliable; UDP is connectionless with lower overhead.`;

export const networkModelsQuizContent = `# Network Models Quiz

Test your understanding of the OSI and TCP/IP networking models. Review the 7 layers of the OSI model and the 4 layers of the TCP/IP model.`;

export const networkIpv4Content = `# IPv4 Addressing

An IPv4 address is a **32-bit** number in **dotted decimal notation** (e.g. 192.168.1.100). Address classes: A (1-126), B (128-191), C (192-223). Private ranges per RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.`;

export const networkSubnettingContent = `# Subnetting Basics

Subnetting divides a network into smaller sub-networks for security, performance, and organization. The subnet mask separates the network portion from the host portion of an IP address.`;

export const networkRoutersContent = `# How Routers Work

A **router** is a Layer 3 device that forwards packets between different networks using a routing table. It receives a frame, strips Layer 2, looks up the destination IP, and forwards out the appropriate interface.`;

export const networkVlansContent = `# VLANs and Trunking

A **VLAN** is a logical grouping of devices on the same broadcast domain. Trunk ports carry traffic for multiple VLANs between switches using 802.1Q tagging. VLANs improve security and reduce broadcast domains.`;

export const networkWifiContent = `# Wi-Fi Standards

Wireless networking uses the **IEEE 802.11** family. Wi-Fi 4 (802.11n), Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax). Always use WPA2 or WPA3 for security; never WEP or open networks.`;

export const networkReviewQuizContent = `# Network+ Module Review

Test your knowledge of networking fundamentals: IP addressing, subnet masks, VLANs, routing and switching, and Wi-Fi standards and security.`;

export const securityWhatIsContent = `# Security Principles

Understanding security principles is the foundation of any cybersecurity practice.

## The CIA Triad

1. **Confidentiality** - Ensuring information is accessible only to authorized users
2. **Integrity** - Maintaining accuracy and completeness of data
3. **Availability** - Ensuring systems are accessible when needed

## Defense in Depth

A layered approach: Physical (locks, guards), Technical (firewalls, encryption), Administrative (policies, training).

## Least Privilege

Users should have only the minimum level of access needed to perform their job functions.`;

export const securityPlusWelcomeContent = `# Welcome to CompTIA Security+

This course prepares you for the CompTIA Security+ certification exam. You will cover threats, attacks, and vulnerabilities; architecture and design; implementation; operations and incident response; and governance, risk, and compliance.`;
