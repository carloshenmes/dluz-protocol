import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AmazonSection } from "@/components/AmazonSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TokensSection } from "@/components/TokensSection";
import { EnergySection } from "@/components/EnergySection";
import { CarbonMarketSection } from "@/components/CarbonMarketSection";
import { PartnersSection } from "@/components/PartnersSection";
import { Dashboard } from "@/components/Dashboard";
import { SwapPreview } from "@/components/SwapPreview";
import { TeamSection } from "@/components/TeamSection";
import { BlogSection } from "@/components/BlogSection";
import { FAQSection } from "@/components/FAQSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />
      <HeroSection />
      <AmazonSection />
      <HowItWorks />
      <TokensSection />
      <EnergySection />
      <CarbonMarketSection />
      <PartnersSection />
      <Dashboard />
      <SwapPreview />
      <TeamSection />
      <BlogSection />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
