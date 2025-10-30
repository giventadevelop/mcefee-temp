import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schools | Institutions | MOSC',
  description: 'Catholicate and M D Schools operated by the Malankara Orthodox Syrian Church, providing quality education from primary to higher secondary levels.',
};

export default function SchoolsPage() {
  const higherSecondarySchools = [
    { name: 'M.D. Seminary Higher Secondary School', location: 'Kottayam', phone: '0481 – 2563949' },
    { name: 'M.G.M Higher Secondary School', location: 'Thiruvalla', phone: '0469 – 2602425, 2630902' },
    { name: 'Catholicate Higher Secondary School', location: 'Pathanamthitta', phone: '0468 – 2222294' },
    { name: 'J.M. Higher Secondary School', location: 'Vakathanam', phone: '0481 – 2462356, 2465556' },
    { name: 'M.G. Higher Secondary School', location: 'Thumpamon', phone: '04734 – 266802, 268234' },
    { name: 'Metropolitan Higher Secondary School', location: 'Puthencavu, Chengannur', phone: '0479 – 2452991, 2458690' },
    { name: 'St. Behanan\'s Higher Secondary School', location: 'Vennikulam, Thiruvalla – 689544', phone: '0469 -2650555, 2650772' },
    { name: 'R.M. Higher Secondary School', location: 'Vadavucode, Puthencruz, Eranakulam- 682310', phone: '0484 – 2731109, 0484-2734909' },
    { name: 'M.P.M. Higher Secondary School', location: 'Chungathara, Malappuram – 679 334', phone: '04931 230374' },
  ];

  const highSchools = [
    { name: 'M.G.D. High School', location: 'Puthussery, Kallooppara', phone: '0469 – 2782175' },
    { name: 'M.G.D. High School for Boys', location: 'Kundara, Kollam – 691501', phone: '0474-2522616' },
    { name: 'M.G.D. High School for Girls', location: 'Kundara, Kollam – 691501', phone: '0474 – 2523008' },
    { name: 'St. Thomas High School', location: 'Karthigappally – 690516', phone: '0479 – 2485488' },
    { name: 'M.S.S. High School', location: 'Thazhakara, Mavelikara – 690102', phone: '0479-2301545' },
    { name: 'St. Pauls High School', location: 'Pulickakavala, Vazhoor – 686515', phone: '0481 -2456310' },
    { name: 'M.G.M. High School', location: 'Engapuzha, Puduppady, Kozhikode – 673586', phone: '0495 – 2235035' },
    { name: 'St. George\'s High School', location: 'Kizhavalloor, Konni – 689703', phone: '0468-2341108' },
    { name: 'L.M. High School', location: 'Venmony, Chengannur', phone: '0479 – 2352225' },
    { name: 'J.M. High School', location: 'Kodukulanji, Chengannur', phone: '0479-2368738' },
  ];

  const upperPrimarySchools = [
    { name: 'St. George U.P. School', location: 'Chathannoor P.O., Kollam' },
    { name: 'T.M.U U.P. School', location: 'Meenadam, Kottayam' },
    { name: 'M.G. U.P. School', location: 'Thumpamon, Pandalam' },
    { name: 'Mar Philexenos Memorial U.P School', location: 'Puthencavu P.O, Chengannur-689123' },
    { name: 'M.D. U.P. School', location: 'Vellaramemala, Vennikulam – 689544' },
    { name: 'M.D. U.P. School', location: 'Vakathanam, Puthenchantha P.O. Vakathanam – 686538' },
    { name: 'U.P. School', location: 'Vakathanam – 686538' },
    { name: 'St. John\'s U.P. School', location: 'Ulanad, Kulanada, Pandalam – 689503' },
    { name: 'M.G.M. U.P. School', location: 'Kottamala P.O, Nileshwar – 671314', phone: '0467 – 2245083' },
    { name: 'U.P. School', location: 'Pongamthanam, Vakathanam Kottayam – 686538' },
    { name: 'St. Mary\'s U.P. School', location: 'Kollad, Kottayam – 686029' },
    { name: 'St. Thomas U.P. School', location: 'Eravinallor, Kottayam' },
  ];

  const lowerPrimarySchools = [
    { name: 'St. Peter\'s L.P.S', location: 'Pulikakavala, Vazhoor – 686515' },
    { name: 'M.D.S L.P. School', location: 'Kottayam – 686001' },
    { name: 'M.D.L.P. School', location: 'Pampady, Pallivathukal, Pampady – 686502' },
    { name: 'M.D.L.P. School', location: 'Thazhathangadi, Kottayam – West' },
    { name: 'M.D.L.P. School', location: 'Perumkannary, Melpadom P.O., Mannar' },
    { name: 'M.D.L.P. School', location: 'Pavukkara, Mannar Thiruvalla – 689622' },
    { name: 'St. George\'s L.P. School', location: 'Theyyappara, Kodencherry, Kozhikode – 673580' },
    { name: 'M.D.L.P. School', location: 'Mannamthottuvazhy, Niranam Thiruvalla-689621' },
    { name: 'M.D.L.P. School', location: 'Valanjavattom East Thiruvalla – 689104' },
    { name: 'Parumala Seminary L.P. School', location: 'Parumala, Mannar' },
    { name: 'M.D.L.P. School', location: 'Kottayil, Kizhakkumbhagam P.O Niranam – 689628' },
    { name: 'M.D.L.P. School', location: 'Kallumkal P.O, Thiruvalla' },
    { name: 'M.D.L.P. School', location: 'Pathicad, Mallappally West – 689586' },
    { name: 'M.D.L.P. School', location: 'Vennikulam, Vennikulam P.O, Thiruvalla – 689544' },
    { name: 'St. Kuriakose L.P. School', location: 'Kundara Kollam-691501' },
    { name: 'M.G.M.LP. School', location: 'Thiruvalla – 689101' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc/institutions" className="hover:text-primary reverent-transition">Institutions</Link>
            <span>/</span>
            <span className="text-foreground">Schools</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/institutions/raj.jpg" alt="Schools" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">Schools</h1>
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-2">Catholicate and M D Schools</h2>
                <p className="font-body text-muted-foreground">
                  <span className="font-medium text-foreground">Manager:</span> H.G. Dr. Gabriel Mar Gregorios Metropolitan
                </p>
              </div>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                A comprehensive network of schools providing quality education rooted in Christian values and academic excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Higher Secondary Schools */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            Higher Secondary Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {higherSecondarySchools.map((school, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">{school.name}</h3>
                <div className="space-y-2 font-body text-sm text-muted-foreground">
                  <p>{school.location}</p>
                  {school.phone && <p className="font-medium text-foreground">Ph: {school.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High Schools */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            High Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highSchools.map((school, index) => (
              <div key={index} className="bg-card rounded-lg p-6 sacred-shadow-sm hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">{school.name}</h3>
                <div className="space-y-2 font-body text-sm text-muted-foreground">
                  <p>{school.location}</p>
                  {school.phone && <p className="font-medium text-foreground">Ph: {school.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upper Primary Schools */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            Upper Primary Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upperPrimarySchools.map((school, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">{school.name}</h3>
                <div className="space-y-2 font-body text-sm text-muted-foreground">
                  <p>{school.location}</p>
                  {school.phone && <p className="font-medium text-foreground">Ph: {school.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lower Primary Schools */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            Lower Primary Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lowerPrimarySchools.map((school, index) => (
              <div key={index} className="bg-card rounded-lg p-6 sacred-shadow-sm hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-base text-foreground mb-2">{school.name}</h3>
                <p className="font-body text-sm text-muted-foreground">{school.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-muted to-background rounded-lg sacred-shadow p-8 text-center">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              Educational Excellence with Spiritual Foundation
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Our schools are dedicated to nurturing young minds with quality education while instilling Christian values, preparing students to become responsible citizens and faithful members of the Church.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc/institutions" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Institutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


