import { db, migrate } from "./db";
import { hashPassword } from "./auth";

// ============================================================================
// LYCEUM GLOBAL HOLDINGS — real sector & company data.
// Source: https://lyceumglobal.co/sectors/ (and lyceumglobal.co home page)
// HQ: 10 Raymond Rd, Nugegoda 10250, Sri Lanka. Founded 2022.
// Visionary leader: Mr. Nikitha Grero.
// Mission: "Transforming Lives, Transforming Communities."
// ============================================================================

interface SeedSector {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
}

interface SeedCompany {
  sector: string;
  slug: string;
  name: string;
  legal_name: string;
  tagline: string;
  overview: string;
  mission: string;
  products: string[];
  founded_year: number | null;
  headquarters: string;
  country: string;
  employees: string;
  revenue: string;
  website: string;
  email: string;
  phone: string;
  ceo: string;
  status: string;
  featured: boolean;
}

const SRI_LANKA_HQ = "Colombo, Sri Lanka";
const HOLDING_HQ = "10 Raymond Rd, Nugegoda, Sri Lanka";

const SECTORS: SeedSector[] = [
  {
    slug: "education",
    name: "Lyceum Education Holdings",
    tagline: "Transforming lives through comprehensive education",
    description:
      "A consortium of companies united in transforming lives through comprehensive educational solutions — spanning international schooling, early years, higher education, placements, assessments, and academic publishing.",
    icon: "🎓",
    accent: "#2563eb",
  },
  {
    slug: "speed",
    name: "NCG Speed Holdings",
    tagline: "Mobility · Excellence · Sustainability · Adaptability",
    description:
      "Our mobility platform pursues a mission of acquiring excellence in automotive solutions, fleet management, spare parts and last-mile delivery — keeping people, goods and journeys moving across Sri Lanka.",
    icon: "🚗",
    accent: "#dc2626",
  },
  {
    slug: "read",
    name: "NCG Read Holdings",
    tagline: "A universe of knowledge",
    description:
      "Offers a universe of knowledge to students, readers and institutions — through curated retail bookstores and next-generation library solutions designed for the modern learner.",
    icon: "📚",
    accent: "#ca8a04",
  },
  {
    slug: "build",
    name: "NCG Build Holdings",
    tagline: "Innovation, sustainability and excellence in the built world",
    description:
      "A leading conglomerate committed to innovation, sustainability and excellence — building, securing, powering and managing the spaces in which people live, learn and work.",
    icon: "🏗️",
    accent: "#475569",
  },
  {
    slug: "tech",
    name: "NCG Tech Holdings",
    tagline: "Tech, media and digital experiences",
    description:
      "Specialises in services within the technology and digital spheres — engineering software, producing rich media and staging live experiences that bring brands and ideas to life.",
    icon: "💻",
    accent: "#7c3aed",
  },
  {
    slug: "kit",
    name: "NCG Kit Holdings",
    tagline: "Souvenirs, uniforms and sportswear",
    description:
      "Offers unique souvenirs and gears up communities for success with high-quality uniforms and sportswear — outfitting students, professionals and athletes with kit they can rely on.",
    icon: "👕",
    accent: "#ea580c",
  },
  {
    slug: "heracle",
    name: "Heracle Holdings",
    tagline: "Sports, nutrition and wellness",
    description:
      "A leading specialist in sports, nutrition and wellness — operating gymnasiums, sports academies, nutrition kitchens and adventure experiences to power healthier lives.",
    icon: "🏆",
    accent: "#16a34a",
  },
  {
    slug: "corporate-services",
    name: "Corporate Services",
    tagline: "Finance, talent and research",
    description:
      "Group-wide corporate services that support every Lyceum business — finance and consulting, recruitment and talent management, and market research that informs better decisions.",
    icon: "🏛️",
    accent: "#0891b2",
  },
];

const COMPANIES: SeedCompany[] = [
  // ---------- Lyceum Education Holdings ----------
  {
    sector: "education",
    slug: "lyceum-international-school",
    name: "Lyceum International School",
    legal_name: "Lyceum International School (Pvt) Ltd",
    tagline: "Sri Lanka's leading international school network",
    overview:
      "Lyceum International School is one of Sri Lanka's most respected international school networks, delivering British curriculum education from foundation through advanced level across multiple campuses island-wide.",
    mission: "To transform lives by nurturing every child into a confident, principled, global citizen.",
    products: [
      "British curriculum primary",
      "British curriculum secondary",
      "Cambridge IGCSE & A-Level",
      "Co-curricular & sports programmes",
    ],
    founded_year: 1993,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "2,500–5,000",
    revenue: "Undisclosed",
    website: "https://www.lyceum.lk/",
    email: "info@lyceum.lk",
    phone: "+94 11 769 3693",
    ceo: "Nikitha Grero",
    status: "active",
    featured: true,
  },
  {
    sector: "education",
    slug: "lyceum-leaf-school",
    name: "Lyceum Leaf School",
    legal_name: "Lyceum Leaf School (Pvt) Ltd",
    tagline: "A nurturing primary years experience",
    overview:
      "Lyceum Leaf delivers the early and primary years of the Lyceum experience — a play-rich, inquiry-led foundation designed to set young learners up for lifelong curiosity.",
    mission: "To give every young child a joyful, rigorous and caring start to their learning journey.",
    products: ["Early years", "Primary curriculum", "Co-curricular discovery", "Parent partnership"],
    founded_year: 2018,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "100–250",
    revenue: "Undisclosed",
    website: "https://www.lyceum.lk/leafs/",
    email: "leaf@lyceum.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "education",
    slug: "lyceum-day-care",
    name: "Lyceum Day Care",
    legal_name: "Lyceum Day Care (Pvt) Ltd",
    tagline: "Safe, stimulating day care for growing minds",
    overview:
      "Lyceum Day Care offers a safe, stimulating and caring environment for the youngest learners — built on the Lyceum philosophy of holistic child development.",
    mission: "To create a warm, secure environment where every child thrives.",
    products: ["Infant care", "Toddler programmes", "Pre-school enrichment", "Working-parent support"],
    founded_year: 2019,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "50–100",
    revenue: "Undisclosed",
    website: "https://www.lyceum.lk/daycare/",
    email: "daycare@lyceum.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "education",
    slug: "lyceum-campus",
    name: "Lyceum Campus",
    legal_name: "Lyceum Campus (Pvt) Ltd",
    tagline: "Higher education with global pathways",
    overview:
      "Lyceum Campus is the group's higher-education arm, offering university foundation, undergraduate and professional programmes — many in partnership with international universities — that unlock global career pathways.",
    mission: "To deliver world-class higher education that opens doors at home and abroad.",
    products: ["Foundation programmes", "Undergraduate degrees", "Professional qualifications", "International pathways"],
    founded_year: 2019,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "100–250",
    revenue: "Undisclosed",
    website: "https://lyceumcampus.lk/",
    email: "info@lyceumcampus.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: true,
  },
  {
    sector: "education",
    slug: "lyceum-placements",
    name: "Lyceum Placements",
    legal_name: "Lyceum Placements (Pvt) Ltd",
    tagline: "Connecting graduates to global opportunity",
    overview:
      "Lyceum Placements supports students and graduates with study-abroad guidance, scholarship support, internships and placements that turn ambition into outcomes.",
    mission: "To open international study and career pathways for every ambitious learner.",
    products: ["Study-abroad counselling", "Scholarship advisory", "Internships", "Career placement"],
    founded_year: 2020,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://www.lyceumplacements.com/",
    email: "hello@lyceumplacements.com",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "education",
    slug: "lyceum-assessments",
    name: "Lyceum Assessments",
    legal_name: "Lyceum Assessments (Pvt) Ltd",
    tagline: "Rigorous, fair, technology-enabled assessment",
    overview:
      "Lyceum Assessments designs and administers rigorous, fair and modern assessments for schools and learners — combining academic best practice with secure technology.",
    mission: "To raise standards through assessments that are credible, accessible and insightful.",
    products: ["Diagnostic testing", "End-of-stage assessments", "Online proctoring", "Analytics for educators"],
    founded_year: 2021,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://www.lyceumassessments.lk/",
    email: "info@lyceumassessments.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },
  {
    sector: "education",
    slug: "lyceum-academy",
    name: "Lyceum Academy",
    legal_name: "Lyceum Academy (Pvt) Ltd",
    tagline: "Skills, tuition and lifelong learning",
    overview:
      "Lyceum Academy delivers tuition, skills development and lifelong-learning programmes for learners of every age — supplementing formal education with focused, high-impact courses.",
    mission: "To make purposeful learning accessible to every learner, beyond the classroom.",
    products: ["Exam tuition", "Skills workshops", "Adult learning", "Online courses"],
    founded_year: 2020,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "50–100",
    revenue: "Undisclosed",
    website: "https://web.facebook.com/lyceumaca/",
    email: "academy@lyceum.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "education",
    slug: "nextgen-publications",
    name: "Nextgen Publications",
    legal_name: "Nextgen Publications (Pvt) Ltd",
    tagline: "Modern academic and children's publishing",
    overview:
      "Nextgen Publications creates contemporary textbooks, workbooks and children's titles aligned with modern curricula — supporting both Lyceum schools and the wider education market.",
    mission: "To publish books that genuinely help learners learn.",
    products: ["Curriculum textbooks", "Workbooks", "Children's titles", "Digital learning resources"],
    founded_year: 2021,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://nextgen.pub/about",
    email: "hello@nextgen.pub",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },

  // ---------- NCG Speed Holdings ----------
  {
    sector: "speed",
    slug: "ncg-automotive-solutions",
    name: "NCG Automotive Solutions",
    legal_name: "NCG Automotive Solutions (Pvt) Ltd",
    tagline: "Vehicle solutions for individuals and fleets",
    overview:
      "NCG Automotive Solutions delivers vehicle sales, service and bespoke automotive solutions — for private owners and commercial fleets that need reliability on every journey.",
    mission: "To keep our customers moving with quality, integrity and care.",
    products: ["Vehicle sales", "Authorised service", "Bodywork & repair", "Custom fitouts"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "100–250",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#speed",
    email: "info@ncgspeed.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: true,
  },
  {
    sector: "speed",
    slug: "ncg-express",
    name: "NCG Express",
    legal_name: "NCG Express (Pvt) Ltd",
    tagline: "Fast, reliable last-mile delivery",
    overview:
      "NCG Express operates a nationwide courier and last-mile delivery network — connecting senders and recipients with speed, traceability and care.",
    mission: "To deliver every parcel as if it were our own.",
    products: ["Courier services", "Same-day delivery", "Bulk distribution", "Cash-on-delivery"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "100–250",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#speed",
    email: "hello@ncgexpress.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "speed",
    slug: "ncg-fleet-management",
    name: "NCG Fleet Management",
    legal_name: "NCG Fleet Management (Pvt) Ltd",
    tagline: "Professionally-managed corporate fleets",
    overview:
      "NCG Fleet Management runs corporate transport and managed fleet services — vehicles, drivers, maintenance and reporting under one accountable team.",
    mission: "To take fleet operations off our clients' plates so they can focus on their business.",
    products: ["Managed fleet leasing", "Corporate transport", "Driver management", "Telematics & reporting"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "50–100",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#speed",
    email: "fleet@ncgspeed.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "speed",
    slug: "ncg-spare-parts",
    name: "NCG Spare Parts",
    legal_name: "NCG Spare Parts (Pvt) Ltd",
    tagline: "Genuine spare parts, distributed fast",
    overview:
      "NCG Spare Parts sources and distributes genuine and quality-equivalent automotive parts — keeping garages, fleets and individual owners on the road.",
    mission: "To make the right part available in the right place at the right time.",
    products: ["OEM spare parts", "Quality alternatives", "Workshop supply", "Distribution"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#speed",
    email: "parts@ncgspeed.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "speed",
    slug: "journey-by-design",
    name: "Journey by Design",
    legal_name: "Journey by Design (Pvt) Ltd",
    tagline: "Curated travel and chauffeur experiences",
    overview:
      "Journey by Design crafts curated chauffeur-driven travel and tour experiences — combining premium vehicles with thoughtful itineraries across Sri Lanka.",
    mission: "To make every journey itself a memorable part of the destination.",
    products: ["Chauffeur services", "Tailored tours", "Airport transfers", "Corporate travel"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#speed",
    email: "hello@journeybydesign.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },

  // ---------- NCG Read Holdings ----------
  {
    sector: "read",
    slug: "the-book-studio",
    name: "The Book Studio",
    legal_name: "The Book Studio (Pvt) Ltd",
    tagline: "A curated bookstore for curious minds",
    overview:
      "The Book Studio is a modern, curated bookstore that brings together fiction, non-fiction, academic and children's titles — celebrating the joy of reading in beautifully-designed spaces.",
    mission: "To put the right book into the right reader's hands.",
    products: ["Curated retail", "Children's section", "Academic supply", "Author events"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://bookstudio.lk/about-us/",
    email: "hello@bookstudio.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: true,
  },
  {
    sector: "read",
    slug: "nextgen-library-solutions",
    name: "Nextgen Library Solutions",
    legal_name: "Nextgen Library Solutions (Pvt) Ltd",
    tagline: "Modern libraries, digitally enabled",
    overview:
      "Nextgen Library Solutions designs, equips and digitally enables modern libraries for schools, universities and institutions — from physical fit-out to library management software.",
    mission: "To make libraries irresistible places to learn and discover.",
    products: ["Library fit-out", "Catalogue digitisation", "Library management software", "Reader programmes"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#read",
    email: "hello@nextgenlibraries.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },

  // ---------- NCG Build Holdings ----------
  {
    sector: "build",
    slug: "vebuild-innovations",
    name: "Vebuild Innovations by NCG",
    legal_name: "Vebuild Innovations by NCG (Pvt) Ltd",
    tagline: "Construction and design innovation",
    overview:
      "Vebuild Innovations delivers design-led construction and fit-out — combining engineering rigour, sustainable materials and innovative approaches to build better spaces.",
    mission: "To build with quality, sustainability and lasting value.",
    products: ["Design & build", "Commercial fit-out", "Refurbishment", "Sustainable construction"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "100–250",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#build",
    email: "info@vebuild.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: true,
  },
  {
    sector: "build",
    slug: "ncg-green-energy",
    name: "NCG Green Energy",
    legal_name: "NCG Green Energy (Pvt) Ltd",
    tagline: "Solar and clean-energy solutions",
    overview:
      "NCG Green Energy designs and installs solar power and clean-energy solutions for homes, businesses and institutions — reducing energy bills and carbon emissions.",
    mission: "To accelerate the clean-energy transition, one rooftop at a time.",
    products: ["Rooftop solar", "Battery storage", "Energy audits", "Grid-connected systems"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#build",
    email: "hello@ncggreenenergy.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },
  {
    sector: "build",
    slug: "nextgen-shield",
    name: "Nextgen Shield",
    legal_name: "Nextgen Shield (Pvt) Ltd",
    tagline: "Professional security services",
    overview:
      "Nextgen Shield delivers professional manned security, electronic security and security consultancy — protecting people, assets and operations across the group's sites and beyond.",
    mission: "To protect what matters with vigilance, integrity and modern technology.",
    products: ["Manned security", "CCTV & alarms", "Event security", "Security consultancy"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "250–500",
    revenue: "Undisclosed",
    website: "https://nextgenshield.lk/",
    email: "info@nextgenshield.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "build",
    slug: "nextgen-facility-management",
    name: "Nextgen Facility Management",
    legal_name: "Nextgen Facility Management (Pvt) Ltd",
    tagline: "Integrated facility management",
    overview:
      "Nextgen Facility Management provides integrated facility management — cleaning, maintenance, landscaping and operations — keeping every facility safe, clean and running smoothly.",
    mission: "To run our clients' facilities like our own.",
    products: ["Cleaning services", "Mechanical & electrical maintenance", "Landscaping", "Pest control"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "250–500",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#build",
    email: "fm@nextgenfm.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "build",
    slug: "ncg-warehouse-solutions",
    name: "NCG Warehouse Solutions",
    legal_name: "NCG Warehouse Solutions (Pvt) Ltd",
    tagline: "Warehousing and storage at scale",
    overview:
      "NCG Warehouse Solutions operates warehousing, storage and inventory services — supporting Lyceum businesses and third-party customers with secure, scalable space.",
    mission: "To make warehousing simple, secure and scalable.",
    products: ["Bulk storage", "Pick & pack", "Inventory management", "Cross-docking"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "50–100",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#build",
    email: "warehouse@ncg.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },
  {
    sector: "build",
    slug: "serengetti-property-management",
    name: "Serengetti Property Management",
    legal_name: "Serengetti Property Management (Pvt) Ltd",
    tagline: "Property management, end to end",
    overview:
      "Serengetti Property Management looks after residential and commercial properties — leasing, maintenance, tenant management and reporting handled by one professional team.",
    mission: "To unlock the full value of every property we manage.",
    products: ["Residential management", "Commercial management", "Leasing", "Property maintenance"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#build",
    email: "hello@serengetti.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },

  // ---------- NCG Tech Holdings ----------
  {
    sector: "tech",
    slug: "zuse-technologies",
    name: "Zuse Technologies",
    legal_name: "Zuse Technologies (Pvt) Ltd",
    tagline: "Software engineering for ambitious businesses",
    overview:
      "Zuse Technologies builds custom software, web platforms and enterprise applications for ambitious local and international clients — modern engineering, delivered.",
    mission: "To build software that actually moves the business forward.",
    products: ["Custom software", "Web platforms", "Enterprise applications", "Cloud & DevOps"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "50–100",
    revenue: "Undisclosed",
    website: "https://zuse.lk",
    email: "hello@zuse.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: true,
  },
  {
    sector: "tech",
    slug: "dreamteam-media",
    name: "Dreamteam Media",
    legal_name: "Dreamteam Media (Pvt) Ltd",
    tagline: "Creative content and digital media",
    overview:
      "Dreamteam Media is a creative content and digital marketing studio — producing video, branding, design and social campaigns for brands that want to stand out.",
    mission: "To turn ideas into media that audiences actually love.",
    products: ["Video production", "Branding & design", "Social media", "Performance marketing"],
    founded_year: 2018,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://www.dreamteam.lk",
    email: "hello@dreamteam.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "tech",
    slug: "dreamteam-events",
    name: "Dreamteam Events",
    legal_name: "Dreamteam Events (Pvt) Ltd",
    tagline: "Live experiences and events",
    overview:
      "Dreamteam Events designs and produces live experiences — corporate events, brand activations, conferences and concerts — that bring brands and audiences together.",
    mission: "To create live moments that audiences remember.",
    products: ["Corporate events", "Brand activations", "Conferences", "Concerts"],
    founded_year: 2019,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://www.dreamteam.lk",
    email: "events@dreamteam.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },

  // ---------- NCG Kit Holdings ----------
  {
    sector: "kit",
    slug: "lyceum-collection",
    name: "Lyceum Collection",
    legal_name: "Lyceum Collection (Pvt) Ltd",
    tagline: "Souvenirs, gifts and merchandise",
    overview:
      "Lyceum Collection offers unique souvenirs, gifts and branded merchandise — celebrating the Lyceum community and producing quality kit for schools, events and corporates.",
    mission: "To make memorable, well-made keepsakes that people are proud to own.",
    products: ["School souvenirs", "Branded merchandise", "Corporate gifts", "Custom apparel"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#kit",
    email: "hello@lyceumcollection.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "kit",
    slug: "the-uniform-hub",
    name: "The Uniform Hub",
    legal_name: "The Uniform Hub (Pvt) Ltd",
    tagline: "Uniforms and sportswear, made better",
    overview:
      "The Uniform Hub designs, manufactures and supplies school uniforms, corporate uniforms and sportswear — built for durability, comfort and consistency at scale.",
    mission: "To give every team uniforms they're proud to wear.",
    products: ["School uniforms", "Sportswear", "Corporate uniforms", "Embroidery & printing"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "50–100",
    revenue: "Undisclosed",
    website: "https://theuniformhub.lk/",
    email: "hello@theuniformhub.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: true,
  },

  // ---------- Heracle Holdings ----------
  {
    sector: "heracle",
    slug: "lyfe-kitchen",
    name: "Lyfe Kitchen",
    legal_name: "Lyfe Kitchen (Pvt) Ltd",
    tagline: "Nutrition-led food for healthier lives",
    overview:
      "Lyfe Kitchen produces and delivers nutrition-led, chef-prepared meals — supporting athletes, schools and busy professionals to eat well without compromise.",
    mission: "To make eating well the easiest choice.",
    products: ["Daily meal plans", "Sports nutrition", "School meals", "Corporate catering"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#heracle",
    email: "hello@lyfekitchen.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: true,
  },
  {
    sector: "heracle",
    slug: "zeus-gymnasium",
    name: "Zeus Gymnasium and Rehabilitation",
    legal_name: "Zeus Gymnasium and Rehabilitation (Pvt) Ltd",
    tagline: "Strength, fitness and recovery",
    overview:
      "Zeus Gymnasium and Rehabilitation operates fitness facilities and rehabilitation services — combining strength training, conditioning and physio under one roof.",
    mission: "To help every member get stronger, healthier and pain-free.",
    products: ["Gym membership", "Personal training", "Physiotherapy", "Sports rehabilitation"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "50–100",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#heracle",
    email: "hello@zeusgym.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "heracle",
    slug: "heracle-sports",
    name: "Heracle Sports",
    legal_name: "Heracle Sports (Pvt) Ltd",
    tagline: "Sports academies and coaching",
    overview:
      "Heracle Sports runs sports academies, coaching programmes and competitive squads across multiple disciplines — developing the next generation of Sri Lankan athletes.",
    mission: "To nurture athletic talent at every level.",
    products: ["Sports academies", "Coaching programmes", "Holiday camps", "Competition squads"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#heracle",
    email: "hello@heraclesports.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },
  {
    sector: "heracle",
    slug: "ncg-earth",
    name: "NCG Earth",
    legal_name: "NCG Earth (Pvt) Ltd",
    tagline: "Outdoor and earth-rooted experiences",
    overview:
      "NCG Earth designs outdoor, ecological and earth-rooted programmes — combining nature, adventure and sustainability for schools, families and corporates.",
    mission: "To reconnect people with the natural world.",
    products: ["Outdoor education", "Eco programmes", "Corporate retreats", "Sustainability initiatives"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#heracle",
    email: "hello@ncgearth.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "incubating",
    featured: false,
  },
  {
    sector: "heracle",
    slug: "heracle-care-wellness",
    name: "Heracle Care & Wellness",
    legal_name: "Heracle Care & Wellness (Pvt) Ltd",
    tagline: "Wellness services for healthier lives",
    overview:
      "Heracle Care & Wellness delivers preventative wellness services — health screenings, nutrition consults, physiotherapy and lifestyle coaching — focused on long-term wellbeing.",
    mission: "To help people live longer, healthier and better.",
    products: ["Health screenings", "Nutrition consults", "Physiotherapy", "Wellness coaching"],
    founded_year: 2023,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#heracle",
    email: "hello@heraclewellness.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "growth",
    featured: false,
  },
  {
    sector: "heracle",
    slug: "heracle-adventure",
    name: "Heracle Adventure",
    legal_name: "Heracle Adventure (Pvt) Ltd",
    tagline: "Adventure experiences and challenges",
    overview:
      "Heracle Adventure designs adventure experiences — outdoor expeditions, leadership challenges and team-build adventures — that push participants beyond their comfort zones.",
    mission: "To turn challenge into growth.",
    products: ["Outdoor expeditions", "Leadership challenges", "School adventure programmes", "Corporate team-building"],
    founded_year: 2023,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#heracle",
    email: "hello@heracleadventure.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "incubating",
    featured: false,
  },

  // ---------- Corporate Services ----------
  {
    sector: "corporate-services",
    slug: "ledgerwall",
    name: "Ledgerwall",
    legal_name: "Ledgerwall (Pvt) Ltd",
    tagline: "Financial guidance and consulting",
    overview:
      "Ledgerwall provides financial guidance, accounting and consulting services — supporting Lyceum group companies and third-party clients with clean numbers and clear advice.",
    mission: "To give every business the financial clarity it needs to grow.",
    products: ["Accounting", "Financial advisory", "Tax & compliance", "Management reporting"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://ledgerwall.lk",
    email: "hello@ledgerwall.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "corporate-services",
    slug: "nextgen-human-capital",
    name: "Nextgen Human Capital Solutions",
    legal_name: "Nextgen Human Capital Solutions (Pvt) Ltd",
    tagline: "Recruitment and talent management",
    overview:
      "Nextgen Human Capital Solutions handles recruitment, training and talent management for the group and for external clients — making sure great people find the right roles.",
    mission: "To match great people with the right opportunities.",
    products: ["Recruitment", "Executive search", "Training & development", "HR consulting"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "https://lyceumglobal.co/sectors/#corporate",
    email: "hello@nextgenhc.lk",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
  {
    sector: "corporate-services",
    slug: "bitrock",
    name: "Bitrock",
    legal_name: "Bitrock (Pvt) Ltd",
    tagline: "Professional services and market research",
    overview:
      "Bitrock delivers professional services and market research — helping organisations understand markets, audiences and opportunities through rigorous, actionable research.",
    mission: "To turn data into decisions.",
    products: ["Market research", "Consumer insights", "Strategy consulting", "Data analytics"],
    founded_year: 2022,
    headquarters: SRI_LANKA_HQ,
    country: "Sri Lanka",
    employees: "10–50",
    revenue: "Undisclosed",
    website: "http://www.thisisbitrock.com",
    email: "hello@thisisbitrock.com",
    phone: "+94 11 769 3693",
    ceo: "—",
    status: "active",
    featured: false,
  },
];

// Real company logos mirrored from lyceumglobal.co into /public/logos/<slug>.png
// (see scripts/download-logos.ts). Any slug not listed here uses the generated
// LogoMark fallback.
const LOGOS: Record<string, string> = {
  "lyceum-international-school": "/logos/lyceum-international-school.png",
  "lyceum-leaf-school": "/logos/lyceum-leaf-school.png",
  "lyceum-day-care": "/logos/lyceum-day-care.png",
  "lyceum-campus": "/logos/lyceum-campus.png",
  "lyceum-placements": "/logos/lyceum-placements.png",
  "lyceum-assessments": "/logos/lyceum-assessments.png",
  "lyceum-academy": "/logos/lyceum-academy.png",
  "nextgen-publications": "/logos/nextgen-publications.png",
  "ncg-automotive-solutions": "/logos/ncg-automotive-solutions.png",
  "ncg-express": "/logos/ncg-express.png",
  "ncg-fleet-management": "/logos/ncg-fleet-management.png",
  "ncg-spare-parts": "/logos/ncg-spare-parts.png",
  "the-book-studio": "/logos/the-book-studio.png",
  "nextgen-library-solutions": "/logos/nextgen-library-solutions.png",
  "vebuild-innovations": "/logos/vebuild-innovations.png",
  "ncg-green-energy": "/logos/ncg-green-energy.png",
  "nextgen-shield": "/logos/nextgen-shield.png",
  "nextgen-facility-management": "/logos/nextgen-facility-management.png",
  "ncg-warehouse-solutions": "/logos/ncg-warehouse-solutions.png",
  "serengetti-property-management": "/logos/serengetti-property-management.png",
  "lyceum-collection": "/logos/lyceum-collection.png",
  "the-uniform-hub": "/logos/the-uniform-hub.png",
  "lyfe-kitchen": "/logos/lyfe-kitchen.png",
  "zeus-gymnasium": "/logos/zeus-gymnasium.png",
  "heracle-sports": "/logos/heracle-sports.png",
  "ncg-earth": "/logos/ncg-earth.png",
  "heracle-care-wellness": "/logos/heracle-care-wellness.png",
};

// Connected applications each company uses. Real, plausible enterprise tools.
const APPLICATIONS: Record<string, { name: string; url: string; category: string }[]> = {
  "lyceum-international-school": [
    { name: "Cambridge Assessment International", url: "https://www.cambridgeinternational.org", category: "Curriculum" },
    { name: "Pearson Edexcel", url: "https://qualifications.pearson.com", category: "Curriculum" },
    { name: "Google Workspace for Education", url: "https://edu.google.com", category: "Productivity" },
    { name: "Microsoft Teams for Education", url: "https://www.microsoft.com/en/education", category: "Communication" },
  ],
  "lyceum-leaf-school": [
    { name: "Google Workspace", url: "https://workspace.google.com", category: "Productivity" },
    { name: "ClassDojo", url: "https://www.classdojo.com", category: "Parent communication" },
  ],
  "lyceum-day-care": [
    { name: "Famly", url: "https://www.famly.co", category: "Day-care management" },
    { name: "WhatsApp Business", url: "https://business.whatsapp.com", category: "Parent comms" },
  ],
  "lyceum-campus": [
    { name: "Moodle", url: "https://moodle.org", category: "LMS" },
    { name: "Zoom", url: "https://zoom.us", category: "Live classes" },
    { name: "Microsoft 365", url: "https://www.microsoft.com/microsoft-365", category: "Productivity" },
  ],
  "lyceum-placements": [
    { name: "HubSpot CRM", url: "https://www.hubspot.com", category: "CRM" },
    { name: "Calendly", url: "https://calendly.com", category: "Scheduling" },
    { name: "British Council", url: "https://www.britishcouncil.org", category: "Partner" },
  ],
  "lyceum-assessments": [
    { name: "ExamSoft", url: "https://examsoft.com", category: "Online proctoring" },
    { name: "Power BI", url: "https://powerbi.microsoft.com", category: "Analytics" },
  ],
  "lyceum-academy": [
    { name: "Zoom", url: "https://zoom.us", category: "Live classes" },
    { name: "Mailchimp", url: "https://mailchimp.com", category: "Marketing" },
  ],
  "nextgen-publications": [
    { name: "Adobe InDesign", url: "https://www.adobe.com", category: "DTP" },
    { name: "Shopify", url: "https://www.shopify.com", category: "E-commerce" },
  ],

  "ncg-automotive-solutions": [
    { name: "Autoline", url: "https://autolinegroup.com", category: "DMS" },
    { name: "Sage 300", url: "https://www.sage.com", category: "ERP" },
  ],
  "ncg-express": [
    { name: "Onfleet", url: "https://onfleet.com", category: "Last-mile" },
    { name: "Twilio", url: "https://www.twilio.com", category: "SMS notifications" },
  ],
  "ncg-fleet-management": [
    { name: "Geotab", url: "https://www.geotab.com", category: "Telematics" },
    { name: "Fleetio", url: "https://www.fleetio.com", category: "Fleet management" },
  ],
  "ncg-spare-parts": [
    { name: "Odoo", url: "https://www.odoo.com", category: "ERP" },
    { name: "Shopify", url: "https://www.shopify.com", category: "E-commerce" },
  ],
  "journey-by-design": [
    { name: "Booking.com", url: "https://www.booking.com", category: "Distribution" },
    { name: "TripAdvisor", url: "https://www.tripadvisor.com", category: "Distribution" },
    { name: "WhatsApp Business", url: "https://business.whatsapp.com", category: "Guest comms" },
  ],

  "the-book-studio": [
    { name: "Shopify", url: "https://www.shopify.com", category: "E-commerce" },
    { name: "Square POS", url: "https://squareup.com", category: "POS" },
  ],
  "nextgen-library-solutions": [
    { name: "Koha ILS", url: "https://koha-community.org", category: "Library management" },
    { name: "WorldCat", url: "https://www.worldcat.org", category: "Catalogue" },
  ],

  "vebuild-innovations": [
    { name: "Autodesk Revit", url: "https://www.autodesk.com", category: "BIM" },
    { name: "Procore", url: "https://www.procore.com", category: "Construction mgmt" },
    { name: "Asana", url: "https://asana.com", category: "Project mgmt" },
  ],
  "ncg-green-energy": [
    { name: "Solar-Log", url: "https://www.solar-log.com", category: "Monitoring" },
    { name: "Helioscope", url: "https://www.helioscope.com", category: "Design" },
  ],
  "nextgen-shield": [
    { name: "Verkada", url: "https://www.verkada.com", category: "Surveillance" },
    { name: "Salto KS", url: "https://saltoks.com", category: "Access control" },
  ],
  "nextgen-facility-management": [
    { name: "Planon", url: "https://planonsoftware.com", category: "FM software" },
    { name: "Microsoft Teams", url: "https://www.microsoft.com/microsoft-teams", category: "Comms" },
  ],
  "ncg-warehouse-solutions": [
    { name: "SAP Business One", url: "https://www.sap.com", category: "ERP" },
    { name: "Manhattan Active WMS", url: "https://www.manh.com", category: "WMS" },
  ],
  "serengetti-property-management": [
    { name: "Buildium", url: "https://www.buildium.com", category: "Property mgmt" },
    { name: "Xero", url: "https://www.xero.com", category: "Accounting" },
  ],

  "zuse-technologies": [
    { name: "GitHub", url: "https://github.com", category: "Source" },
    { name: "Linear", url: "https://linear.app", category: "Product" },
    { name: "Vercel", url: "https://vercel.com", category: "Hosting" },
    { name: "Figma", url: "https://www.figma.com", category: "Design" },
  ],
  "dreamteam-media": [
    { name: "Adobe Creative Cloud", url: "https://www.adobe.com", category: "Production" },
    { name: "Meta Business Suite", url: "https://business.facebook.com", category: "Social" },
    { name: "YouTube Studio", url: "https://studio.youtube.com", category: "Video" },
  ],
  "dreamteam-events": [
    { name: "Eventbrite", url: "https://www.eventbrite.com", category: "Ticketing" },
    { name: "Cvent", url: "https://www.cvent.com", category: "Event mgmt" },
    { name: "Asana", url: "https://asana.com", category: "Project mgmt" },
  ],

  "lyceum-collection": [
    { name: "Shopify", url: "https://www.shopify.com", category: "E-commerce" },
    { name: "Canva", url: "https://www.canva.com", category: "Design" },
  ],
  "the-uniform-hub": [
    { name: "Shopify", url: "https://www.shopify.com", category: "E-commerce" },
    { name: "WooCommerce", url: "https://woocommerce.com", category: "E-commerce" },
    { name: "Sage", url: "https://www.sage.com", category: "Accounting" },
  ],

  "lyfe-kitchen": [
    { name: "Toast POS", url: "https://pos.toasttab.com", category: "POS" },
    { name: "UberEats", url: "https://www.ubereats.com", category: "Delivery" },
  ],
  "zeus-gymnasium": [
    { name: "Mindbody", url: "https://www.mindbodyonline.com", category: "Member mgmt" },
    { name: "Stripe", url: "https://stripe.com", category: "Payments" },
  ],
  "heracle-sports": [
    { name: "TeamSnap", url: "https://www.teamsnap.com", category: "Team mgmt" },
    { name: "Hudl", url: "https://www.hudl.com", category: "Performance" },
  ],
  "ncg-earth": [
    { name: "Eventbrite", url: "https://www.eventbrite.com", category: "Bookings" },
    { name: "AllTrails", url: "https://www.alltrails.com", category: "Routing" },
  ],
  "heracle-care-wellness": [
    { name: "Calendly", url: "https://calendly.com", category: "Scheduling" },
    { name: "Stripe", url: "https://stripe.com", category: "Payments" },
  ],
  "heracle-adventure": [
    { name: "Eventbrite", url: "https://www.eventbrite.com", category: "Bookings" },
    { name: "WhatsApp Business", url: "https://business.whatsapp.com", category: "Comms" },
  ],

  "ledgerwall": [
    { name: "QuickBooks", url: "https://quickbooks.intuit.com", category: "Accounting" },
    { name: "Xero", url: "https://www.xero.com", category: "Accounting" },
    { name: "Microsoft Excel", url: "https://www.microsoft.com/excel", category: "Modelling" },
  ],
  "nextgen-human-capital": [
    { name: "LinkedIn Recruiter", url: "https://business.linkedin.com/talent-solutions", category: "Recruitment" },
    { name: "Greenhouse", url: "https://www.greenhouse.io", category: "ATS" },
  ],
  "bitrock": [
    { name: "SurveyMonkey", url: "https://www.surveymonkey.com", category: "Surveys" },
    { name: "Tableau", url: "https://www.tableau.com", category: "Analytics" },
    { name: "Google Trends", url: "https://trends.google.com", category: "Market signals" },
  ],
};

async function run() {
  migrate();

  const existing = db.query("SELECT COUNT(*) AS c FROM sectors").get() as {
    c: number;
  };
  if (existing.c > 0 && !process.argv.includes("--force")) {
    console.log("Database already seeded. Use --force to reseed.");
    return;
  }

  if (process.argv.includes("--force")) {
    db.exec("DELETE FROM applications; DELETE FROM companies; DELETE FROM sectors; DELETE FROM users;");
    console.log("Cleared existing data (--force).");
  }

  const insertSector = db.prepare(
    `INSERT INTO sectors (slug, name, tagline, description, icon, accent, sort_order)
     VALUES ($slug, $name, $tagline, $description, $icon, $accent, $order)`,
  );
  const sectorIds = new Map<string, number>();
  SECTORS.forEach((s, i) => {
    const res = insertSector.run({
      $slug: s.slug,
      $name: s.name,
      $tagline: s.tagline,
      $description: s.description,
      $icon: s.icon,
      $accent: s.accent,
      $order: i,
    });
    sectorIds.set(s.slug, Number(res.lastInsertRowid));
  });

  const insertCompany = db.prepare(
    `INSERT INTO companies
       (slug, name, sector_id, legal_name, tagline, overview, mission, products,
        founded_year, headquarters, country, employees, revenue, website, email,
        phone, ceo, status, featured, logo_seed, logo)
     VALUES
       ($slug, $name, $sector_id, $legal_name, $tagline, $overview, $mission, $products,
        $founded_year, $headquarters, $country, $employees, $revenue, $website, $email,
        $phone, $ceo, $status, $featured, $logo_seed, $logo)`,
  );
  const insertApp = db.prepare(
    `INSERT INTO applications (company_id, name, url, description, category, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  let appCount = 0;
  for (const c of COMPANIES) {
    const sectorId = sectorIds.get(c.sector);
    if (!sectorId) throw new Error(`Unknown sector for company ${c.slug}`);
    const res = insertCompany.run({
      $slug: c.slug,
      $name: c.name,
      $sector_id: sectorId,
      $legal_name: c.legal_name,
      $tagline: c.tagline,
      $overview: c.overview,
      $mission: c.mission,
      $products: JSON.stringify(c.products),
      $founded_year: c.founded_year,
      $headquarters: c.headquarters,
      $country: c.country,
      $employees: c.employees,
      $revenue: c.revenue,
      $website: c.website,
      $email: c.email,
      $phone: c.phone,
      $ceo: c.ceo,
      $status: c.status,
      $featured: c.featured ? 1 : 0,
      $logo_seed: c.slug,
      $logo: LOGOS[c.slug] ?? "",
    });
    const companyId = Number(res.lastInsertRowid);
    (APPLICATIONS[c.slug] ?? []).forEach((a, i) => {
      insertApp.run(companyId, a.name, a.url, "", a.category, i);
      appCount++;
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@lyceumglobal.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe!2026";
  const hash = await hashPassword(adminPassword);
  db.prepare(
    `INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')`,
  ).run(adminEmail, "Portal Administrator", hash);

  // Suppress unused-warning for HOLDING_HQ which is reserved for future use.
  void HOLDING_HQ;

  console.log(
    `Seeded ${SECTORS.length} sectors, ${COMPANIES.length} companies, ${appCount} applications.`,
  );
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

await run();
