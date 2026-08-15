export type Subject = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  live: boolean;
  flagship?: boolean;
  wide?: boolean;
  color: string;
};

export const SUBJECTS: Subject[] = [
  { id: "crypto", name: "Crypto & Web3", emoji: "⛓️", desc: "From wallets to GenLayer. The flagship subject.", live: true, flagship: true, color: "#a78bfa" },
  { id: "finance", name: "Finance & Banking", emoji: "🏦", desc: "How money, credit, and capital markets really work.", live: true, color: "#f59e0b" },
  { id: "personal-finance", name: "Personal Finance & Investing", emoji: "💰", desc: "Budgeting, investing, and building long term wealth.", live: true, color: "#34d399" },
  { id: "real-estate", name: "Real Estate", emoji: "🏠", desc: "Property ownership, mortgages, and tokenized assets.", live: true, color: "#60a5fa" },
  { id: "ai", name: "Artificial Intelligence", emoji: "🤖", desc: "From machine learning to intelligent contracts.", live: true, color: "#22d3ee" },
  { id: "cybersecurity", name: "Technology & Cybersecurity", emoji: "🔐", desc: "Cryptography, networks, and digital defense.", live: true, color: "#fb923c" },
  { id: "law", name: "Law & Governance", emoji: "⚖️", desc: "Legal systems, DAOs, and smart contracts as law.", live: true, color: "#fbbf24" },
  { id: "health", name: "Healthcare & Medicine", emoji: "🏥", desc: "Health systems, data privacy, and onchain records.", live: true, color: "#fb7185" },
  { id: "climate", name: "Climate & Sustainability", emoji: "🌱", desc: "Carbon markets, ESG, and onchain climate finance.", live: true, color: "#4ade80" },
  { id: "business", name: "Entrepreneurship & Business", emoji: "🚀", desc: "Business models, fundraising, and Web3 ventures.", live: true, color: "#818cf8" },
  { id: "marketing", name: "Marketing & Growth", emoji: "📣", desc: "Brand, community, and onchain reputation.", live: true, color: "#f472b6" },
  { id: "career", name: "Career Development", emoji: "🎯", desc: "Skills, identity, and the future of work onchain.", live: true, color: "#38bdf8" },
  { id: "philosophy", name: "Religion, Philosophy & Ethics", emoji: "🕊️", desc: "World religions, philosophical traditions, ethical frameworks, and the moral questions intelligent contracts raise.", live: true, color: "#a78bfa", wide: true },
];
