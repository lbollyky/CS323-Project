/**
 * Named, specific user stories. Modeled after the Airbnb review pattern:
 * real first name, age, primary complaint, timeline, and a measurable
 * outcome. Replace anonymous "many users find this helpful" social proof.
 */
export interface Testimonial {
  id: string;
  initials: string;
  name: string;
  age: number;
  occupation: string;
  product_id: string;
  product_short: string;
  complaint: string;
  weeks: number;
  outcome: string;
  metric?: string;
  hue: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "anya",
    initials: "AR",
    name: "Anya R.",
    age: 41,
    occupation: "Architect",
    product_id: "epitalon",
    product_short: "epitalON",
    complaint: "Waking at 3 a.m., couldn't get back down.",
    weeks: 6,
    outcome: "Sleeping through the night again. Stopped second-guessing my evenings.",
    metric: "Oura sleep score 62 → 81",
    hue: 260,
  },
  {
    id: "marcus",
    initials: "MO",
    name: "Marcus O.",
    age: 47,
    occupation: "Founder",
    product_id: "pinealon",
    product_short: "pinealON",
    complaint: "Word-finding misses in board meetings. Felt 10 years older.",
    weeks: 8,
    outcome: "Clarity is back without a stimulant. Cut my afternoon coffee.",
    metric: "Self-reported focus 4/10 → 8/10",
    hue: 220,
  },
  {
    id: "priya",
    initials: "PS",
    name: "Priya S.",
    age: 38,
    occupation: "Physical therapist",
    product_id: "restore-bpc",
    product_short: "Restore BPC",
    complaint: "Achilles tendinopathy that wouldn't quit after 9 months.",
    weeks: 5,
    outcome: "Pain-free on stairs by week three. Back to running by week five.",
    metric: "Pain 7/10 → 1/10",
    hue: 175,
  },
];
