import type { User, EduItem, Baby, LogEntry } from "./types"

export const SEED_NURSES: User[] = [
  {
    id: "nurse-acc-001",
    username: "nurse1",
    password: "nurse1",
    name: "Midwife Adwoa",
    role: "nurse",
    facility: "Korle Bu General",
    locale: "en",
    createdAt: new Date().toISOString(),
  },
  {
    id: "nurse-acc-002",
    username: "nurse2",
    password: "nurse2",
    name: "Nurse Akosua",
    role: "nurse",
    facility: "Greater Accra Clinic",
    locale: "en",
    createdAt: new Date().toISOString(),
  },
  {
    id: "nurse-acc-003",
    username: "nurse3",
    password: "nurse3",
    name: "Midwife Abena",
    role: "nurse",
    facility: "Tamale Regional",
    locale: "en",
    createdAt: new Date().toISOString(),
  },
  {
    id: "nurse-acc-004",
    username: "nurse4",
    password: "nurse4",
    name: "Nurse Ama",
    role: "nurse",
    facility: "Kumasi Maternity",
    locale: "en",
    createdAt: new Date().toISOString(),
  },
]

export const SEED_ADMIN: User = {
  id: "admin-acc-001",
  username: "admin",
  password: "admin",
  name: "Ward Administrator",
  role: "admin",
  facility: "Korle Bu General",
  locale: "en",
  createdAt: new Date().toISOString(),
}

export const DEMO_PARENT: User = {
  id: "user-demo-mom-001",
  username: "mom",
  password: "mom",
  name: "Demo Mama",
  role: "parent",
  locale: "en",
  createdAt: new Date().toISOString(),
}

export const DEMO_BABY: Baby = {
  id: "baby-demo-001",
  babyName: "Baby Kofi",
  dob: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  gender: "male",
  gestationalAgeWeeks: 32,
  birthWeightGrams: 1800,
  currentWeightGrams: 1950,
  birthLengthCm: 42,
  currentLengthCm: 43,
  birthHeadCircumferenceCm: 28,
  currentHeadCircumferenceCm: 29,
  motherUserId: "user-demo-mom-001",
  assignedNurseId: "nurse-acc-001",
  status: "assigned",
  facility: "Korle Bu General",
  language: "en",
  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  photoUrl: null,
  colorTag: "purple",
  claimCode: null, // Already claimed by mom
  motherName: "Demo Mama",
  motherPhone: "0241234567",
  admissionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  admissionWeightGrams: 1800,
  referralSource: "Labor Ward",
}

export const DEMO_REFERRED_BABY: Baby = {
  id: "baby-demo-002",
  babyName: "Baby Ama",
  dob: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  gender: "female",
  gestationalAgeWeeks: 30,
  birthWeightGrams: 1400,
  currentWeightGrams: 1380,
  birthLengthCm: 38,
  currentLengthCm: 38,
  birthHeadCircumferenceCm: 26,
  currentHeadCircumferenceCm: 26,
  motherUserId: null, // Not claimed yet
  assignedNurseId: null,
  status: "referred",
  facility: "Korle Bu General",
  language: "en",
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  photoUrl: null,
  colorTag: "white",
  claimCode: "KMC-A3X7", // For parent to claim later
  motherName: "Akua Mensah",
  motherPhone: "0209876543",
  admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  admissionWeightGrams: 1400,
  referralSource: "Neonatal Unit",
}

export const DEMO_LOGS: LogEntry[] = [
  {
    id: "log-demo-001",
    babyId: "baby-demo-001",
    authorUserId: "user-demo-mom-001",
    authorRole: "parent" as const,
    type: "kmc_session" as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nurseComment: null,
    immutable: true,
    data: {
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 120,
      position: "chest-to-chest" as const,
      notes: "Baby was calm and peaceful",
    },
  },
  {
    id: "log-demo-002",
    babyId: "baby-demo-001",
    authorUserId: "user-demo-mom-001",
    authorRole: "parent" as const,
    type: "feeding" as const,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    nurseComment: null,
    immutable: true,
    data: {
      dateTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      type: "breast" as const,
      route: "PO" as const,
      amountMl: null,
      notes: "",
    },
  },
  {
    id: "log-demo-003",
    babyId: "baby-demo-001",
    authorUserId: "user-demo-mom-001",
    authorRole: "parent" as const,
    type: "kmc_session" as const,
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    nurseComment: null,
    immutable: true,
    data: {
      startTime: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 120,
      position: "upright-wrap" as const,
      notes: "",
    },
  },
  {
    id: "log-demo-004",
    babyId: "baby-demo-001",
    authorUserId: "nurse-acc-001",
    authorRole: "nurse" as const,
    type: "weight" as const,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nurseComment: null,
    immutable: false,
    data: {
      dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      weightGrams: 1920,
      lengthCm: 42.5,
      headCircumferenceCm: 28.5,
      notes: "Good weight gain",
    },
  },
  {
    id: "log-demo-005",
    babyId: "baby-demo-001",
    authorUserId: "nurse-acc-001",
    authorRole: "nurse" as const,
    type: "vitals" as const,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    nurseComment: null,
    immutable: false,
    data: {
      dateTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      temperature: 36.8,
      heartRate: 142,
      respiratoryRate: 48,
      oxygenSaturation: 96,
      breathingSupport: "Room air",
      bloodPressureSystolic: null,
      bloodPressureDiastolic: null,
      bloodPressureMAP: null,
      glucose: 4.2,
      bilirubin: null,
      phototherapyGiven: false,
      painScore: 0,
      notes: "Stable",
    },
  },
  {
    id: "log-demo-006",
    babyId: "baby-demo-001",
    authorUserId: "nurse-acc-001",
    authorRole: "nurse" as const,
    type: "discharge_readiness" as const,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nurseComment: null,
    immutable: false,
    data: {
      dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      day: 13,
      socioEconomicSupport: 2,
      milkProduction: 1,
      positioningAttachment: 2,
      sucklingAbility: 1,
      motherConfidence: 2,
      weightGainGramsPerDay: 18,
      weightGainScore: 2,
      totalScore: 10,
      breastfeedingStarted: true,
      kmcStarted: true,
      notes: "Making good progress",
    },
  },
]

export const SEED_EDU_CONTENT: EduItem[] = [
  // KMC Basics
  {
    id: "edu-kmc-001",
    category: "KMC Basics",
    title: "What is Kangaroo Mother Care?",
    contentType: "text",
    content:
      "Kangaroo Mother Care (KMC) is a proven method of caring for preterm babies. It involves skin-to-skin contact between parent and baby, keeping baby warm on your chest like a kangaroo keeps its joey in its pouch. KMC helps regulate baby's temperature, heart rate, and breathing while promoting bonding and breastfeeding.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  {
    id: "edu-kmc-002",
    category: "KMC Basics",
    title: "How to Position Your Baby",
    contentType: "text",
    content:
      "Place your baby upright on your bare chest, between your breasts. Baby should be in a frog-like position with legs tucked up. Turn baby's head to one side so breathing is not blocked. Secure baby with a wrap or binder. Baby should only wear a diaper and hat during KMC.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  {
    id: "edu-kmc-003",
    category: "KMC Basics",
    title: "How Long Should KMC Sessions Be?",
    contentType: "text",
    content:
      "Start with sessions of at least 1 hour. As you and baby get comfortable, aim for longer sessions - ideally continuous KMC throughout the day and night. The more skin-to-skin time, the better for your baby's growth and development. Even 30 minutes is beneficial if that's what you can manage.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  // Breastfeeding
  {
    id: "edu-bf-001",
    category: "Breastfeeding",
    title: "Breastfeeding Your Preterm Baby",
    contentType: "text",
    content:
      "Your breastmilk is specially designed for your preterm baby. It has extra protein and antibodies your baby needs. Start expressing milk within 6 hours of birth, even if baby cannot feed yet. Express 8-12 times per day to build your supply.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  {
    id: "edu-bf-002",
    category: "Breastfeeding",
    title: "Expressing Breastmilk",
    contentType: "text",
    content:
      "Hand expression or pumping helps establish your milk supply. Massage your breast before expressing. Aim to express for 15-20 minutes per breast. Store milk in clean containers in the fridge (use within 24 hours) or freezer (use within 3 months).",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  // Hygiene
  {
    id: "edu-hyg-001",
    category: "Hygiene",
    title: "Handwashing Before KMC",
    contentType: "text",
    content:
      "Always wash your hands with soap and water before touching your baby. Wash for at least 20 seconds, cleaning between fingers and under nails. This protects your baby from infections. Ask visitors to wash hands too.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  {
    id: "edu-hyg-002",
    category: "Hygiene",
    title: "Keeping Baby Clean",
    contentType: "text",
    content:
      "Preterm babies do not need daily baths. Clean baby's face, neck folds, and diaper area daily with warm water. Full baths can wait until baby is stable. Keep the umbilical cord clean and dry.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  // Support
  {
    id: "edu-sup-001",
    category: "Support",
    title: "Taking Care of Yourself",
    contentType: "text",
    content:
      "Caring for a preterm baby is emotionally and physically demanding. Rest when baby rests. Accept help from family and friends. Eat nutritious foods and drink plenty of water. Talk about your feelings - it's normal to feel worried, sad, or overwhelmed.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  {
    id: "edu-sup-002",
    category: "Support",
    title: "Building Your Support Network",
    contentType: "text",
    content:
      "You don't have to do this alone. Connect with other NICU parents who understand your journey. Ask your nurse about parent support groups. Let family members take turns with KMC if possible. Accept meals and help with household tasks.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  // Safety
  {
    id: "edu-saf-001",
    category: "Safety",
    title: "Safe Sleep for Preterm Babies",
    contentType: "text",
    content:
      "When not doing KMC, place baby on their back to sleep. Use a firm, flat mattress with no pillows, blankets, or toys. Keep baby's face uncovered. Room-sharing (not bed-sharing) is safest for the first 6 months.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  {
    id: "edu-saf-002",
    category: "Safety",
    title: "Warning Signs to Watch For",
    contentType: "text",
    content:
      "Call your nurse or doctor immediately if baby: stops breathing or has long pauses, turns blue around lips, has difficulty breathing, refuses to feed, has a temperature above 37.5°C or below 36°C, is unusually floppy or irritable.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  // Dads Corner
  {
    id: "edu-dad-001",
    category: "Dads Corner",
    title: "Dads Can Do KMC Too!",
    contentType: "text",
    content:
      "Fathers play a vital role in Kangaroo Care. Your chest is just as warm and comforting for baby. Doing KMC helps you bond with your baby and gives mom a break. Remove your shirt, place baby on your chest, and enjoy this special time together.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
  {
    id: "edu-dad-002",
    category: "Dads Corner",
    title: "Supporting Your Partner",
    contentType: "text",
    content:
      "Your partner needs your support now more than ever. Help with expressing and storing breastmilk. Take turns with night feeds when possible. Listen without trying to fix everything. Celebrate small victories together.",
    audioFiles: { en: null, tw: null, ga: null, ew: null },
  },
]
