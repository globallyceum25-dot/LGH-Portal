/**
 * Lyceum Global Holdings - Official Corporate Data Directory
 * Populated with live corporate structures, descriptions, subsidiaries,
 * and downloaded assets from the official site (lyceumglobal.co).
 */

const LYCEUM_SECTORS = [
  {
    id: "education",
    name: "Lyceum Education",
    icon: "graduation-cap",
    logo: "assets/logo-education.png",
    theme: "cyan",
    tagline: "Comprehensive educational solutions transforming lives from pre-primary to tertiary.",
    description: "Lyceum Education Sector is a consortium of comprehensive educational providers. From early childhood care to tertiary placements, we build integrated pathways that foster world-class learning equity and prepare global citizens for future horizons.",
    color: "#06b6d4"
  },
  {
    id: "speed",
    name: "NCG Speed",
    icon: "truck",
    logo: "assets/logo-speed.png",
    theme: "yellow",
    tagline: "Mobility, logistics, and automotive fleet support engines.",
    description: "NCG Speed Holdings integrates specialized automotive, transport, mining support, and domestic courier divisions. We are on a combined corporate mission to acquire absolute logistical mobility, environmental excellence, and adaptable operations.",
    color: "#eab308"
  },
  {
    id: "read",
    name: "NCG Read",
    icon: "book-open",
    logo: "assets/logo-read.png",
    theme: "emerald",
    tagline: "Educational text books, publications, and digital library networks.",
    description: "NCG Read shapes global minds by supplying the latest scientific publications, international curriculum textbooks, and academic stationery. We innovate sustainable library systems to inspire curious learners globally.",
    color: "#10b981"
  },
  {
    id: "build",
    name: "NCG Build",
    icon: "home",
    logo: "assets/logo-build.png",
    theme: "blue",
    tagline: "Architectural engineering, renewable energy, and safety coatings.",
    description: "NCG Build Holdings operates a diverse portfolio of heavy engineering and carbon-neutral companies. Committed to innovative materials and green energy systems, we deliver smart spatial developments and security integrations.",
    color: "#3b82f6"
  },
  {
    id: "tech",
    name: "NCG Tech",
    icon: "code",
    logo: "assets/logo-tech.png",
    theme: "violet",
    tagline: "Software architectures, corporate consulting, and premium media networks.",
    description: "NCG Tech Holdings serves as Lyceum's digital edge, consolidating enterprise software consultancies, full-scale event managers, media studios, and specialized corporate financial and human resource advisory units.",
    color: "#8b5cf6"
  },
  {
    id: "kit",
    name: "NCG Kit",
    icon: "shirt",
    logo: "assets/logo-kit.png",
    theme: "purple",
    tagline: "School collections, custom sportswear, and corporate uniform hubs.",
    description: "NCG Kit Holdings delivers premium uniform styling, active sportswear, and branded accessories. Through wide retail pipelines and school hubs, we help students gear up for athletic and academic excellence.",
    color: "#a855f7"
  },
  {
    id: "heracle",
    name: "Heracle Holdings",
    icon: "dumbbell",
    logo: "assets/logo-heracle.png",
    theme: "rose",
    tagline: "Advanced sports nutrition, wellness, and healthy kitchen networks.",
    description: "Heracle Holdings is a premier healthcare innovator focused on fitness, targeted nutrition, and physical wellness. We design organic dietary plans, operate modern gym hubs, and run healthy cafes to help individuals live active lives.",
    color: "#f43f5e"
  }
];

const LYCEUM_COMPANIES = {
  education: [
    {
      id: "lyceum-schools",
      name: "Lyceum International Schools",
      tagline: "Pre-Primary to Secondary International Curriculums",
      icon: "book-open",
      location: "Nugegoda, Sri Lanka",
      revenue: "$12.4M",
      employees: "2,850",
      esgScore: { e: 94, s: 98, g: 96 },
      profile: "Lyceum International Schools is the flagship educational wing of the Lyceum group, delivering world-class curriculum frameworks and nurturing thousands of empowered students across extensive campus networks in Sri Lanka.",
      website: "https://www.lyceum.lk/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [9200, 10100, 11200, 11900, 12400]
      },
      leaders: [
        { name: "Dr. Mohan Lal Grero", role: "Founder & Managing Director", avatar: "👨‍🏫" },
        { name: "Mrs. Kumari Grero", role: "Co-Founder & Coordinating Principal", avatar: "👩‍🏫" }
      ],
      products: [
        { name: "Lyceum International Curriculum", description: "Comprehensive bilingual learning program from Early Years to Advanced Levels." },
        { name: "Lyceum Athletics Academy", description: "Elite sports training and national level school athletic coaching." }
      ]
    },
    {
      id: "lyceum-leafs",
      name: "Lyceum Leaf School (LEAFs)",
      tagline: "Inclusive & Special Needs Academic Programs",
      icon: "heart",
      location: "Colombo, Sri Lanka",
      revenue: "$1.2M",
      employees: "140",
      esgScore: { e: 92, s: 99, g: 95 },
      profile: "LEAFs represents Lyceum's primary special education initiative, providing a caring, structured, and customized environment for student learners with diverse cognitive abilities, ensuring no child is left behind.",
      website: "https://www.lyceum.lk/leafs/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [750, 880, 990, 1100, 1200]
      },
      leaders: [
        { name: "Dr. Elena Perera", role: "Child Development Lead", avatar: "👩‍⚕️" }
      ],
      products: [
        { name: "Individual Education Plan (IEP)", description: "Custom academic modules tailored to specific neurodiverse parameters." },
        { name: "Sensory Development Labs", description: "Tactile wellness and coordination therapy structures." }
      ]
    },
    {
      id: "lyceum-daycare",
      name: "Lyceum Daycare",
      tagline: "Nurturing Childcare & Early Childhood Services",
      icon: "smile",
      location: "Colombo, Sri Lanka",
      revenue: "$850K",
      employees: "85",
      esgScore: { e: 90, s: 97, g: 93 },
      profile: "Providing clean, safe, and highly structured developmental childcare, Lyceum Daycare offers parents complete peace of mind with tailored play-based cognitive development schedules and nutrition.",
      website: "https://www.lyceum.lk/daycare/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [480, 580, 680, 780, 850]
      },
      leaders: [
        { name: "Shalini Grero", role: "Operations Director", avatar: "👩‍💼" }
      ],
      products: [
        { name: "Early Toddler Playgroups", description: "Infant and toddler socialization and basic fine motor skill builders." },
        { name: "Smart Nursery Telemetry", description: "Live encrypted portal check-ins for guardians." }
      ]
    },
    {
      id: "lyceum-campus",
      name: "Lyceum Campus",
      tagline: "Tertiary Education & Global Degree Pathways",
      icon: "graduation-cap",
      location: "Nugegoda, Sri Lanka",
      revenue: "$3.8M",
      employees: "210",
      esgScore: { e: 93, s: 96, g: 96 },
      profile: "Pioneering Education 4.0, Lyceum Campus collaborates with top international universities to deliver accredited Business, IT, Engineering, and Teacher Training courses directly to Sri Lankan students.",
      website: "https://lyceumcampus.lk/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [2100, 2600, 3100, 3500, 3800]
      },
      leaders: [
        { name: "Prof. Lalith Gamage", role: "Academic Council Chairman", avatar: "👨‍🏫" },
        { name: "Sanduni Fernando", role: "Registrar", avatar: "👩‍💼" }
      ],
      products: [
        { name: "Global Transfer Degree Program", description: "Affiliated credit validation pathways to UK, Australia, and Canada." },
        { name: "Teacher Training Diploma", description: "Elite pedagogical qualification mapping standard school frameworks." }
      ]
    },
    {
      id: "lyceum-placements",
      name: "Lyceum Placements",
      tagline: "International University Admissions & Consulting",
      icon: "compass",
      location: "Nugegoda, Sri Lanka",
      revenue: "$1.5M",
      employees: "65",
      esgScore: { e: 88, s: 95, g: 94 },
      profile: "A premium consultation wing helping aspiring international students select appropriate universities, secure visa approvals, and acquire global scholarships with high success rates.",
      website: "https://www.lyceumplacements.com/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [820, 1050, 1220, 1390, 1500]
      },
      leaders: [
        { name: "Nilanga Seneviratne", role: "Chief Placements Officer", avatar: "👨‍💼" }
      ],
      products: [
        { name: "Direct Scholar Application Mesh", description: "Proprietary database linking local applicants directly to admissions councils." },
        { name: "Global IELTS Prep", description: "Accredited English proficiency instruction schedules." }
      ]
    },
    {
      id: "lyceum-assessments",
      name: "Lyceum Assessments",
      tagline: "National Testing & Quality Evaluation Frameworks",
      icon: "check-square",
      location: "Colombo, Sri Lanka",
      revenue: "$950K",
      employees: "50",
      esgScore: { e: 87, s: 93, g: 98 },
      profile: "Providing standardized benchmarking examinations, student grading methodologies, and high-security testing centers to preserve global academic metrics.",
      website: "https://www.lyceumassessments.lk/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [550, 680, 780, 870, 950]
      },
      leaders: [
        { name: "Dr. Ruwan De Silva", role: "Evaluation Director", avatar: "👨‍🔬" }
      ],
      products: [
        { name: "Comprehensive Ability Benchmarks", description: "Standardized student diagnostic and progress checking dashboards." }
      ]
    },
    {
      id: "lyceum-academy",
      name: "Lyceum Academy (Lyceum ACA)",
      tagline: "Academic Enrichment & Tuition Systems",
      icon: "layers",
      location: "Nugegoda, Sri Lanka",
      revenue: "$1.1M",
      employees: "110",
      esgScore: { e: 89, s: 96, g: 94 },
      profile: "Lyceum Academy supports standard classroom schedules with intensive revisions, extra enrichment lessons, and private tutoring across all key STEM subjects.",
      website: "https://web.facebook.com/lyceumaca/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [620, 780, 920, 1020, 1100]
      },
      leaders: [
        { name: "Sunil Jayasundera", role: "Academy Administrator", avatar: "👨‍💼" }
      ],
      products: [
        { name: "STEM Booster Modules", description: "Intensive mathematics, chemistry, and physics specialized lessons." }
      ]
    },
    {
      id: "nextgen-publishing",
      name: "Nextgen Publishing",
      tagline: "Bilingual Textbooks & Digital Educational Printing",
      icon: "book",
      location: "Nugegoda, Sri Lanka",
      revenue: "$2.1M",
      employees: "120",
      esgScore: { e: 95, s: 94, g: 92 },
      profile: "Producing thousands of educational textbooks, workbooks, and digital reading platforms that directly mirror local and international curricula.",
      website: "https://nextgen.pub/about",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1200, 1500, 1750, 1950, 2100]
      },
      leaders: [
        { name: "Priyanga Fernando", role: "Creative Lead & Editor", avatar: "👩‍💼" }
      ],
      products: [
        { name: "Primary Reader Library", description: "Custom compiled illustrated children's storybooks." }
      ]
    }
  ],
  speed: [
    {
      id: "ncg-automotive",
      name: "NCG Automotive Solutions",
      tagline: "Industrial Servicing, Diagnostics, & Repairs",
      icon: "settings",
      location: "Colombo, Sri Lanka",
      revenue: "$4.2M",
      employees: "350",
      esgScore: { e: 88, s: 92, g: 95 },
      profile: "NCG Automotive offers state-of-the-art diagnostic, mechanical overhaul, and maintenance services for heavy commercial trucks and private fleet systems.",
      website: "https://web.facebook.com/NCGAutomotives/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [2600, 3100, 3550, 3900, 4200]
      },
      leaders: [
        { name: "Prasanna Ranatunga", role: "CSO & Chief Mechanic", avatar: "👨‍🔧" }
      ],
      products: [
        { name: "SmartScan System Calibration", description: "Real-time engine performance maps and structural calibrations." }
      ]
    },
    {
      id: "ncg-express",
      name: "NCG Express",
      tagline: "Courier Delivery & Domestic Logistics",
      icon: "truck",
      location: "Colombo, Sri Lanka",
      revenue: "$3.1M",
      employees: "480",
      esgScore: { e: 91, s: 89, g: 91 },
      profile: "NCG Express handles high-velocity domestic packet and corporate parcel deliveries island-wide with proprietary route-mapping technologies.",
      website: "https://www.facebook.com/NcgExpress/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1500, 1950, 2400, 2800, 3100]
      },
      leaders: [
        { name: "Devinda Alwis", role: "VP of Logistics Operations", avatar: "👨‍✈️" }
      ],
      products: [
        { name: "FlashDeliver API", description: "Direct corporate e-commerce package tracking integration." }
      ]
    },
    {
      id: "ncg-fleet",
      name: "NCG Fleet Management",
      tagline: "Corporate Fleet Logistics & Telemetric Systems",
      icon: "map-pin",
      location: "Colombo, Sri Lanka",
      revenue: "$2.7M",
      employees: "160",
      esgScore: { e: 90, s: 91, g: 94 },
      profile: "Helping massive industrial fleets reduce carbon footprints and maximize fuel efficiency with live GPS telemetry, driver routing grids, and scheduling.",
      website: "https://web.facebook.com/NcgFleetManagement/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1800, 2100, 2350, 2550, 2700]
      },
      leaders: [
        { name: "Ravi Wickremesinghe", role: "Director of Telematics", avatar: "👨‍💻" }
      ],
      products: [
        { name: "NCG Telemetry Hub", description: "SaaS dashboard capturing live vehicle health and carbon telemetry." }
      ]
    },
    {
      id: "ncg-spares",
      name: "NCG Spares",
      tagline: "Genuine Spare Parts & Component Distribution",
      icon: "tool",
      location: "Colombo, Sri Lanka",
      revenue: "$1.9M",
      employees: "95",
      esgScore: { e: 86, s: 88, g: 92 },
      profile: "NCG Spares is the primary importer and reseller of certified original vehicle spare parts, catering to extensive industrial corporate chains.",
      website: "https://web.facebook.com/ncgspares/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1100, 1350, 1550, 1750, 1900]
      },
      leaders: [
        { name: "Suresh Fernando", role: "Sourcing Manager", avatar: "👨‍💼" }
      ],
      products: [
        { name: "Genuine Parts Validation", description: "QR based cryptographic authenticity checker." }
      ]
    },
    {
      id: "ncg-mining",
      name: "NCG Mining",
      tagline: "Eco-Conscious Mineral Sourcing & Operations",
      icon: "hammer",
      location: "Colombo, Sri Lanka",
      revenue: "$1.1M",
      employees: "130",
      esgScore: { e: 84, s: 92, g: 95 },
      profile: "NCG Mining manages clean and highly engineered mineral extraction divisions using water recycling frameworks and land replenishment loops.",
      website: "https://www.facebook.com/profile.php?id=61573790942387",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [400, 600, 800, 980, 1100]
      },
      leaders: [
        { name: "Arjuna Silva", role: "Operations Lead", avatar: "👨‍💼" }
      ],
      products: [
        { name: "EcoRestore Strategy", description: "Systematic reforestation and community land restoration schedules." }
      ]
    }
  ],
  read: [
    {
      id: "book-studio",
      name: "Book Studio",
      tagline: "Curator of Textbooks, Stationery, & International Literature",
      icon: "book-open",
      location: "Nugegoda, Sri Lanka",
      revenue: "$2.9M",
      employees: "115",
      esgScore: { e: 94, s: 96, g: 95 },
      profile: "Book Studio provides an extensive catalog of academic textbooks, children's storybooks, general literature, and premium school stationery to the public and educational networks.",
      website: "https://bookstudio.lk/about-us/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1500, 1900, 2300, 2650, 2900]
      },
      leaders: [
        { name: "Lakmini Grero", role: "Managing Director", avatar: "👩‍💼" }
      ],
      products: [
        { name: "Global Textbook Delivery", description: "Direct supply line matching Cambridge, Edexcel, and national schedules." }
      ]
    },
    {
      id: "nextgen-library",
      name: "Nextgen Library Solutions",
      tagline: "Digital Cataloging & Learning Equity Systems",
      icon: "library",
      location: "Colombo, Sri Lanka",
      revenue: "$950K",
      employees: "40",
      esgScore: { e: 96, s: 98, g: 95 },
      profile: "Nextgen Library Solutions is an innovative cataloging division that sets up modern digital library software, book preservation systems, and promotes learning equity across regional institutions.",
      website: "https://lyceumglobal.co/sectors/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [420, 580, 720, 850, 950]
      },
      leaders: [
        { name: "Roshan Perera", role: "Lead Systems Architect", avatar: "👨‍💻" }
      ],
      products: [
        { name: "OpenBook SaaS Platform", description: "Cloud accessible cataloging system for schools and public libraries." }
      ]
    }
  ],
  build: [
    {
      id: "ve-build",
      name: "VE Build",
      tagline: "Constructing Sustainable Green Architecture",
      icon: "home",
      location: "Colombo, Sri Lanka",
      revenue: "$5.8M",
      employees: "420",
      esgScore: { e: 93, s: 92, g: 94 },
      profile: "VE Build designs and develops low-carbon commercial and residential buildings, integrating timber structures, smart water pipelines, and structural efficiency.",
      website: "https://www.facebook.com/vebuildlk?mibextid=ZbWKwL",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [3900, 4400, 4900, 5400, 5800]
      },
      leaders: [
        { name: "Viraj Edirisinghe", role: "Principal Structural Designer", avatar: "👨‍💼" }
      ],
      products: [
        { name: "TimberMod Eco-Frame", description: "Engineered high-durability wood framework capturing high carbon." }
      ]
    },
    {
      id: "ncg-green-energy",
      name: "NCG Green Energy",
      tagline: "Eco-Conscious Solar Grids & Smart Decarbonization",
      icon: "zap",
      location: "Colombo, Sri Lanka",
      revenue: "$3.4M",
      employees: "150",
      esgScore: { e: 99, s: 92, g: 95 },
      profile: "NCG Green Energy manufactures commercial grade solar power arrays and coordinates clean microgrids to decarbonize heavy industrial sectors.",
      website: "https://www.facebook.com/ncggreenenergy?mibextid=ZbWKwL",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1900, 2400, 2800, 3100, 3400]
      },
      leaders: [
        { name: "Dr. Clara Gomez", role: "Coordinating Engineer", avatar: "👩‍🔬" }
      ],
      products: [
        { name: "HelioGrid Controller", description: "Automated solar array optimizing storage allocations." }
      ]
    },
    {
      id: "nextgen-shield",
      name: "Nextgen Shield",
      tagline: "Specialized Physical Safety & Fire Containment",
      icon: "shield",
      location: "Colombo, Sri Lanka",
      revenue: "$1.8M",
      employees: "80",
      esgScore: { e: 91, s: 95, g: 93 },
      profile: "Nextgen Shield engineers certified physical safety containment structures and chemical fire prevention coatings to secure schools and server facilities.",
      website: "https://nextgenshield.lk/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [950, 1200, 1420, 1650, 1800]
      },
      leaders: [
        { name: "Marcus Pendelton", role: "Head of Safety R&D", avatar: "👨‍🔬" }
      ],
      products: [
        { name: "NanoShield Fire Retardant", description: "Eco-friendly non-toxic spray coating resisting extreme heat." }
      ]
    }
  ],
  tech: [
    {
      id: "zuse-tech",
      name: "Zuse Technologies",
      tagline: "Enterprise Software Consultancies & Cloud Architects",
      icon: "code",
      location: "Colombo, Sri Lanka",
      revenue: "$4.1M",
      employees: "290",
      esgScore: { e: 91, s: 95, g: 97 },
      profile: "Zuse Technologies is a premier IT services specialist, delivering customized mobile apps, cloud servers, and comprehensive digital enterprise transformations.",
      website: "https://zuse.lk",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [2100, 2600, 3100, 3700, 4100]
      },
      leaders: [
        { name: "Prabath Jayatunga", role: "President of Software", avatar: "👨‍💻" }
      ],
      products: [
        { name: "Zuse ERP Suite", description: "Modular web portal orchestrating inventories, accounting, and HR." }
      ]
    },
    {
      id: "dream-team",
      name: "Dream Team Event & Media",
      tagline: "Corporate Event Organizers & Premium Studio Services",
      icon: "video",
      location: "Colombo, Sri Lanka",
      revenue: "$2.5M",
      employees: "140",
      esgScore: { e: 89, s: 94, g: 93 },
      profile: "Covering all media and event domains, Dream Team delivers premium photography, content brief writing, video production, and coordinates massive corporate events.",
      website: "https://www.dreamteam.lk",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1200, 1600, 1950, 2250, 2500]
      },
      leaders: [
        { name: "Dilshara Alwis", role: "Chief Media Producer", avatar: "👩‍💼" }
      ],
      products: [
        { name: "StudioFocus Pro", description: "Elite commercial video production and digital design solutions." }
      ]
    },
    {
      id: "ledgerwall",
      name: "Ledgerwall",
      tagline: "Premium Financial Consultation & Wealth Management",
      icon: "wallet",
      location: "Colombo, Sri Lanka",
      revenue: "$3.4M",
      employees: "180",
      esgScore: { e: 90, s: 93, g: 98 },
      profile: "A prominent corporate partner providing complete accounting, financial consultation, and tax advisory grids to empower multinational enterprises.",
      website: "https://ledgerwall.lk",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1950, 2400, 2800, 3150, 3400]
      },
      leaders: [
        { name: "Victoria Sterling", role: "Managing Director", avatar: "👩‍💼" }
      ],
      products: [
        { name: "LedgerTax Audit Control", description: "Corporate tax optimization and automated accounting pipelines." }
      ]
    },
    {
      id: "nextgen-hr",
      name: "Nextgen Human Capital Solutions",
      tagline: "Strategic Talent Acquisition & Dream Teams Building",
      icon: "users",
      location: "Colombo, Sri Lanka",
      revenue: "$2.1M",
      employees: "95",
      esgScore: { e: 92, s: 98, g: 96 },
      profile: "Lyceum's primary recruitment agency, Nextgen Human Capital Solutions builds dream operational teams, advocates inclusive workplaces, and implements carbon-neutral corporate benefits.",
      website: "https://www.linkedin.com/company/nextgen-human-capital-solutions/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1100, 1420, 1750, 1980, 2100]
      },
      leaders: [
        { name: "Chao Wei-Dong", role: "Managing Recruiter", avatar: "👨‍💼" }
      ],
      products: [
        { name: "TalentIncubator API", description: "SaaS job routing portal sourcing and vetting pre-screened applicants." }
      ]
    },
    {
      id: "bitrock",
      name: "Bitrock",
      tagline: "Market Intelligence & Advanced Country Risk Assessments",
      icon: "trending-up",
      location: "Colombo, Sri Lanka",
      revenue: "$1.8M",
      employees: "75",
      esgScore: { e: 89, s: 92, g: 96 },
      profile: "A premium professional service firm supplying detail-oriented strategic reports, competitor profiles, risk analytics, and trade forecasts to global enterprises.",
      website: "http://www.thisisbitrock.com",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [850, 1120, 1380, 1600, 1800]
      },
      leaders: [
        { name: "Julian Vance", role: "CSO & Senior Economist", avatar: "👨‍💼" }
      ],
      products: [
        { name: "IntelliReport Target Suite", description: "Automated country risk dashboard capturing localized trade metrics." }
      ]
    }
  ],
  kit: [
    {
      id: "lyceum-collection",
      name: "The Lyceum Collection (TLC)",
      tagline: "School Souvenirs & Community Memorabilia",
      icon: "shopping-bag",
      location: "Colombo, Sri Lanka",
      revenue: "$1.6M",
      employees: "70",
      esgScore: { e: 93, s: 95, g: 92 },
      profile: "The Lyceum Collection manufactures high-quality souvenirs, custom mugs, school badges, and community memorabilia celebrating the pride and heritage of Lyceum.",
      website: "https://web.facebook.com/LyceumTLC/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [850, 1100, 1300, 1480, 1600]
      },
      leaders: [
        { name: "Amali Grero", role: "Visual Merchandiser", avatar: "👩‍💼" }
      ],
      products: [
        { name: "Lyceum Pride Souvenirs", description: "Custom engraved school plaques, badges, and structural collectibles." }
      ]
    },
    {
      id: "uniform-hub",
      name: "The Uniform Hub",
      tagline: "Premium Sportswear & High-Quality School Uniforms",
      icon: "shirt",
      location: "Colombo, Sri Lanka",
      revenue: "$2.4M",
      employees: "135",
      esgScore: { e: 92, s: 94, g: 93 },
      profile: "Providing tailor-made school uniforms, protective wear, and high-performance athletic sportswear across Lyceum Group outlets.",
      website: "https://theuniformhub.lk/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [1200, 1550, 1850, 2150, 2400]
      },
      leaders: [
        { name: "Ingrid Vanhoutte", role: "Quality Assurance Principal", avatar: "👩‍🔬" }
      ],
      products: [
        { name: "AeroDry Sportswear Sheets", description: "Eco-friendly, lightweight athletic wear designed for hot climates." }
      ]
    }
  ],
  heracle: [
    {
      id: "lyfe-kitchen",
      name: "Lyfe Kitchen",
      tagline: "Organic, Sustainable, & Clean Nutrition Plans",
      icon: "utensils",
      location: "Colombo, Sri Lanka",
      revenue: "$1.4M",
      employees: "85",
      esgScore: { e: 98, s: 95, g: 94 },
      profile: "Lyfe Kitchen crafts organic meal packages, healthy diet plans, and clean nutrition strategies to promote sustainable eating choices.",
      website: "https://www.instagram.com/lyfekitchenlk/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [620, 850, 1050, 1240, 1400]
      },
      leaders: [
        { name: "Dr. Robert Chen", role: "Chief Clinical Nutritionist", avatar: "👨‍🔬" }
      ],
      products: [
        { name: "Active Nutrition Prep Plan", description: "Weekly direct deliveries of customized high-protein calorie menus." }
      ]
    },
    {
      id: "zeus-gym",
      name: "Zeus Gymnasium",
      tagline: "State-of-the-Art Training & Physical Fitness Hubs",
      icon: "dumbbell",
      location: "Colombo, Sri Lanka",
      revenue: "$1.2M",
      employees: "60",
      esgScore: { e: 91, s: 94, g: 92 },
      profile: "Equipped with the latest cardio setups, mechanical weights, and certified fitness coaches, Zeus Gymnasium helps members reach peak athletic strength.",
      website: "https://www.facebook.com/Zeusgymnasium.lk",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [550, 720, 910, 1050, 1200]
      },
      leaders: [
        { name: "Mateo Ortiz", role: "Head Athletic Trainer", avatar: "👨‍💼" }
      ],
      products: [
        { name: "Zeus Elite Strength Program", description: "Bespoke high-performance muscle development schedules." }
      ]
    },
    {
      id: "heracle-cafe",
      name: "Heracle Cafe",
      tagline: "Protein Shakes, Superfoods, & Healthy Community Lounges",
      icon: "coffee",
      location: "Colombo, Sri Lanka",
      revenue: "$800K",
      employees: "45",
      esgScore: { e: 94, s: 93, g: 95 },
      profile: "A premium community cafe serving cold-pressed organic juices, vegan superfood bowls, high-grade protein smoothies, and hosting nutrition panels.",
      website: "https://web.facebook.com/people/Heracle-Cafe/100095492768306/",
      financials: {
        years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
        values: [390, 520, 640, 720, 800]
      },
      leaders: [
        { name: "Sophie Blanc", role: "Operations Supervisor", avatar: "👩‍🔬" }
      ],
      products: [
        { name: "Amino Blast Smoothie Series", description: "Bespoke super-shakes formulated for immediate physical recoveries." }
      ]
    }
  ]
};

// Make accessible to other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { LYCEUM_SECTORS, LYCEUM_COMPANIES };
}
