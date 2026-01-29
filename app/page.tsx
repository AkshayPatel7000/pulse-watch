"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Activity,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Clock,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AuthModal } from "./components/auth/AuthModal";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as any;
      if (user.onboarded) {
        router.push(`/${user.tenantId}/dashboard`);
      } else {
        router.push("/onboarding");
      }
    }
  }, [status, session, router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <header
        className={`px-4 lg:px-8 h-20 flex items-center border-b sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-md border-white/5 h-16"
            : "bg-transparent border-transparent"
        }`}
      >
        <Link className="flex items-center justify-center gap-3 group" href="/">
          <div className="p-2 rounded-lg bg-blue-600 group-hover:rotate-12 transition-transform">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight hidden sm:inline-block">
            Ping<span className="text-blue-500">lyfy</span>
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            href="/external"
          >
            Explore Status Pages
          </Link>
          {status === "authenticated" ? (
            <Link
              href={
                (session?.user as any).onboarded
                  ? `/${(session?.user as any).tenantId}/dashboard`
                  : "/onboarding"
              }
            >
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Button
              className="bg-white text-black hover:bg-gray-200"
              size="sm"
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
            >
              Sign In
            </Button>
          )}
        </nav>
      </header>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultMode={authMode}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-20 md:pt-32 pb-16 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-blue-600/20 blur-[120px] -z-10 rounded-full" />

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Monitoring 5,000+ Endpoints Daily
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Never miss a <br />
              <span className="text-blue-500 italic">service outage</span>{" "}
              again.
            </h1>

            <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              One dashboard. Infinite monitoring. Get alerted before your
              customers even notice something is wrong. Setup in 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 mb-20">
              <Button
                size="lg"
                className="h-14 text-lg bg-blue-600 hover:bg-blue-700 sm:w-72"
                onClick={() => {
                  if (status === "authenticated") {
                    router.push("/onboarding");
                  } else {
                    setAuthMode("register");
                    setShowAuthModal(true);
                  }
                }}
              >
                Start Monitoring Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/external" className=" sm:w-72">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 text-lg  text-gray-300 border border-blue-600 hover:text-blue-600"
                >
                  Explore Status Pages
                </Button>
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="relative mx-auto max-w-[1100px] rounded-2xl border border-white/10 bg-black/50 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <Image
                src="/landing-mockup.png"
                alt="Pinglyfy Dashboard Mockup"
                width={1100}
                height={700}
                className="w-full h-auto opacity-90 hover:scale-[1.01] transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-24 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                How it works
              </h2>
              <p className="text-gray-400 text-lg">
                Setting up Pinglyfy is surprisingly simple.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Lines (Desktop) */}
              <div className="hidden md:block absolute top-[60px] left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -z-10" />

              {[
                {
                  step: "01",
                  title: "Add Your Services",
                  desc: "Connect your APIs, websites, or microservices in seconds. No code required.",
                  icon: <Zap className="h-8 w-8 text-yellow-500" />,
                },
                {
                  step: "02",
                  title: "Global Probes",
                  desc: "We check your services from 5 global regions every 1 to 10 minutes.",
                  icon: <Globe className="h-8 w-8 text-blue-500" />,
                },
                {
                  step: "03",
                  title: "Instant Alerts",
                  desc: "Get notified via Slack, Email, or Webhooks the millisecond a service goes down.",
                  icon: <Bell className="h-8 w-8 text-red-500" />,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="text-blue-500 font-mono text-xl mb-4 opacity-50">
                    {item.step}
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 mb-6 font-bold">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="w-full py-24 ">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
                  Features built for <br />
                  <span className="text-blue-500">production reliability.</span>
                </h2>
                <div className="space-y-8">
                  {[
                    {
                      title: "Public Status Pages",
                      desc: "Keep your users updated without manual intervention. Automated incident reporting.",
                      icon: <Globe className="h-6 w-6" />,
                    },
                    {
                      title: "Multi-Region Verification",
                      desc: "Confirm outages from different corners of the world to avoid false positives.",
                      icon: <Shield className="h-6 w-6" />,
                    },
                    {
                      title: "Latency Monitoring",
                      desc: "Track response times and get alerted on performance degradation before total failure.",
                      icon: <Clock className="h-6 w-6" />,
                    },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="mt-1 h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-blue-600/10 border border-blue-600/20">
                        {feat.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{feat.title}</h4>
                        <p className="text-gray-400 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-8 rounded-3xl bg-blue-600/10 border border-blue-600/20 aspect-square flex flex-col justify-end">
                    <span className="text-4xl font-bold mb-2">99.9%</span>
                    <span className="text-gray-400">Reliability Target</span>
                  </div>
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4">
                    <Activity className="h-12 w-12 text-blue-500" />
                    <span className="font-semibold italic">Real-time</span>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 aspect-[3/4] flex flex-col justify-center gap-4">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                    </div>
                    <span className="text-lg font-bold">
                      Automatic Incident Detection
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="w-full py-24 px-4">
          <div className="container mx-auto">
            <div className="relative p-12 md:p-24 rounded-3xl bg-blue-600 overflow-hidden text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">
                Ready to stop worrying about downtime?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                Join our private beta and get your first 3 services monitored
                for free, forever.
              </p>

              <Button
                size="lg"
                // variant="outline"
                className="h-14 px-12 text-lg bg-white text-blue-600 hover:bg-blue-100 border-none relative z-10"
                onClick={() => {
                  if (status === "authenticated") {
                    router.push("/onboarding");
                  } else {
                    setAuthMode("register");
                    setShowAuthModal(true);
                  }
                }}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 px-4 border-t border-white/5 bg-black/40">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">Pinglyfy</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Pinglyfy Inc. Built for high-availability.
          </p>
          <div className="flex gap-8">
            <Link
              className="text-sm text-gray-500 hover:text-white transition-colors"
              href="#"
            >
              Terms
            </Link>
            <Link
              className="text-sm text-gray-500 hover:text-white transition-colors"
              href="#"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
