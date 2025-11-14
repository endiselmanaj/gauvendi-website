import React from 'react';

const ArchitectureOverview = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-neutral-50 border-b-2 border-gray-100">
        <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-6xl">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-900 mb-6 tracking-tight leading-none">
              GauVendi ChatGPT
              <span className="block text-accent-electric mt-2">Architecture</span>
            </h1>
            <div className="w-24 h-1.5 bg-accent-electric mx-auto my-8 rounded-full"></div>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              A revolutionary AI-powered hotel booking experience that transforms how guests discover and book accommodations through
              <strong className="text-neutral-900"> conversational intelligence</strong> and
              <strong className="text-neutral-900"> attribute-based selling</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-8 py-12 max-w-6xl prose-custom">
        <section className="mb-20">
          <h2>Executive Summary</h2>
          <p className="text-xl">
            We propose a revolutionary AI-powered hotel booking experience that transforms how guests discover and book accommodations.
            Our ChatGPT app leverages the GauVendi attribute-based selling philosophy to deliver personalized, conversational hotel
            recommendations directly within ChatGPT—turning vague guest desires into curated stay options with frictionless booking.
          </p>
        </section>

        <section className="mb-20">
          <h2>Solution Overview</h2>
          <h3>What the ChatGPT App Does</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="card-bold group">
              <div className="text-accent-electric text-5xl font-extrabold mb-4">01</div>
              <h4 className="text-2xl mb-3">Understands Natural Language</h4>
              <p>
                Guests express their needs conversationally (e.g., "I want a romantic room with an ocean view for my anniversary")—no
                rigid search forms or filter clicking required.
              </p>
            </div>

            <div className="card-bold group">
              <div className="text-accent-vibrant text-5xl font-extrabold mb-4">02</div>
              <h4 className="text-2xl mb-3">Delivers Personalized Recommendations</h4>
              <p>
                Instead of generic room lists, the app presents curated "Stay Packages" ranked by relevance, highlighting why each
                option matches the guest's specific desires.
              </p>
            </div>

            <div className="card-bold group">
              <div className="text-accent-energy text-5xl font-extrabold mb-4">03</div>
              <h4 className="text-2xl mb-3">Interactive Visual Merchandising</h4>
              <p>
                Rich, interactive UI components showcase rooms with images, feature highlights, and pricing—all rendered inline within
                the ChatGPT conversation.
              </p>
            </div>

            <div className="card-bold group">
              <div className="text-accent-bold text-5xl font-extrabold mb-4">04</div>
              <h4 className="text-2xl mb-3">One-Click Booking</h4>
              <p>
                Guests can complete their booking directly from the interactive component without leaving the conversation, eliminating
                friction and increasing conversion.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2>What the MCP Tool Achieves</h2>
          <p className="text-xl mb-12">
            The <strong>Model Context Protocol (MCP)</strong> server acts as the intelligent backend that powers the experience:
          </p>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-accent-electric/5 to-accent-vibrant/5 p-8 rounded-2xl border-l-4 border-accent-electric">
              <h3 className="flex items-center gap-3 mb-6">
                <span className="bg-accent-electric text-white px-4 py-2 rounded-lg font-bold">Tool 1</span>
                Recommendation Engine
              </h3>
              <p className="mb-4"><strong className="text-neutral-900">find_stay_options</strong> - Translate natural language intent into feature-based database queries and return ranked stay options.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <strong className="text-lg text-neutral-900 block mb-2">How it works:</strong>
                  <ul>
                    <li>Receives guest preferences (dates, number of guests, desired features like "ocean view," "balcony," "quiet")</li>
                    <li>Queries the attribute-based inventory database</li>
                    <li>Scores and ranks available rooms based on feature matching</li>
                    <li>Groups rooms into sellable "Stay Packages" (e.g., "Romantic Getaway," "Business Traveler Suite")</li>
                    <li>Returns both concise data for the AI model and rich metadata for the UI component</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <strong className="text-neutral-900">Output:</strong> Personalized recommendations labeled as "Best Match For You," "Great Value," etc., with matching features highlighted.
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-accent-vibrant/5 to-accent-energy/5 p-8 rounded-2xl border-l-4 border-accent-vibrant">
              <h3 className="flex items-center gap-3 mb-6">
                <span className="bg-accent-vibrant text-white px-4 py-2 rounded-lg font-bold">Tool 2</span>
                Booking Action Tool
              </h3>
              <p className="mb-4"><strong className="text-neutral-900">create_booking</strong> - Finalize reservations with a single interaction.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <strong className="text-lg text-neutral-900 block mb-2">How it works:</strong>
                  <ul>
                    <li>Receives booking details (package ID, guest information, dates)</li>
                    <li>Validates availability</li>
                    <li>Creates booking record in the system</li>
                    <li>Returns confirmation with booking reference</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <strong className="text-neutral-900">Output:</strong> Instant booking confirmation displayed in the conversation.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2>Architecture Components</h2>

          <div className="bg-neutral-900 p-8 md:p-12 rounded-2xl mb-12 border-l-4 border-accent-electric">
            <h3 className="text-white text-center mb-8 text-3xl">High-Level Flow</h3>
            <pre className="text-accent-electric text-sm md:text-base overflow-x-auto font-mono">
{`┌─────────────────────┐
│   Guest in ChatGPT  │
│ "Find me a romantic │
│  room with a view"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│        ChatGPT AI Model             │
│  • Parses intent & extracts features │
│  • Calls MCP tool with parameters   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         MCP Server                  │
│  • Recommendation engine logic      │
│  • Queries attribute-based database │
│  • Scores & ranks options           │
│  • Returns structured data + UI     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│    Interactive UI Component         │
│  • Recommendation cards with images │
│  • Feature highlights & pricing     │
│  • One-click booking button         │
└─────────────────────────────────────┘`}
            </pre>
          </div>

          <h3 className="mb-10">Technical Components</h3>

          <div className="space-y-8">
            <div className="card-bold">
              <div className="flex items-start gap-4">
                <div className="bg-accent-electric text-white px-4 py-2 rounded-xl font-bold text-lg flex-shrink-0">01</div>
                <div>
                  <h4 className="text-2xl mb-4">Attribute-Based Database</h4>
                  <ul className="space-y-2">
                    <li><strong>Physical Rooms Table:</strong> Actual hotel rooms with unique identifiers</li>
                    <li><strong>Features Catalog:</strong> All possible room attributes (ocean_view, balcony, fireplace, Nespresso machine, etc.)</li>
                    <li><strong>Room-Feature Mappings:</strong> Links rooms to their features</li>
                    <li><strong>Sellable Packages:</strong> Dynamic product offerings defined by feature combinations</li>
                    <li><strong>Availability & Booking Tables:</strong> Real-time inventory management</li>
                  </ul>
                  <div className="bg-accent-energy/10 border-l-4 border-accent-energy p-4 rounded-lg mt-6">
                    <strong className="text-neutral-900">Key Innovation:</strong> A single physical room can be part of multiple sellable packages, enabling dynamic
                    pricing and targeted merchandising.
                  </div>
                </div>
              </div>
            </div>

            <div className="card-bold">
              <div className="flex items-start gap-4">
                <div className="bg-accent-vibrant text-white px-4 py-2 rounded-xl font-bold text-lg flex-shrink-0">02</div>
                <div>
                  <h4 className="text-2xl mb-4">MCP Server (Recommendation Brain)</h4>
                  <ul className="space-y-2">
                    <li><strong>Tool Registration:</strong> Exposes find_stay_options and create_booking to ChatGPT</li>
                    <li><strong>Feature-Based Scoring:</strong> Matches guest desires to room attributes and ranks results</li>
                    <li><strong>Package Generation:</strong> Creates recommendation tiers (Best Match, Great Value, Premium)</li>
                    <li><strong>Dual Payload Response:</strong>
                      <ul className="ml-6 mt-2">
                        <li>structuredContent: Concise data for the AI model to narrate</li>
                        <li>_meta: Rich data for UI rendering (images, full feature lists, pricing details)</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-bold">
              <div className="flex items-start gap-4">
                <div className="bg-accent-energy text-white px-4 py-2 rounded-xl font-bold text-lg flex-shrink-0">03</div>
                <div>
                  <h4 className="text-2xl mb-4">Interactive Web Component</h4>
                  <ul className="space-y-2">
                    <li><strong>Skybridge Widget:</strong> Sandboxed HTML/JavaScript component rendered in ChatGPT</li>
                    <li><strong>Data Hydration:</strong> Reads recommendation data from window.openai.toolOutput</li>
                    <li><strong>Visual Merchandising:</strong>
                      <ul className="ml-6 mt-2">
                        <li>Card-based layout for each recommendation</li>
                        <li>Feature tags showing matched attributes (✓ Ocean View, ✓ Balcony)</li>
                        <li>High-quality images for features and rooms</li>
                        <li>Clear pricing and recommendation labels</li>
                      </ul>
                    </li>
                    <li><strong>State Management:</strong> Persists UI interactions via window.openai.setWidgetState</li>
                    <li><strong>Direct Actions:</strong> "Book Now" button calls the create_booking tool without requiring another prompt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2>Key Differentiators</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="card-bold bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-xl font-bold mb-4 text-accent-electric">Attribute-Based Selling</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Traditional</div>
                  <p className="text-gray-700">"Standard King" or "Deluxe Queen" with fixed features</p>
                </div>
                <div className="h-px bg-gradient-to-r from-accent-electric/20 to-transparent"></div>
                <div>
                  <div className="text-sm font-bold text-accent-electric uppercase tracking-wide mb-1">GauVendi Approach</div>
                  <p className="text-neutral-900 font-medium">Rooms sold based on individual features guests actually desire, enabling dynamic packaging and upselling</p>
                </div>
              </div>
            </div>

            <div className="card-bold bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-xl font-bold mb-4 text-accent-vibrant">Recommendation-First</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Traditional</div>
                  <p className="text-gray-700">Users filter through lists and compare options manually</p>
                </div>
                <div className="h-px bg-gradient-to-r from-accent-vibrant/20 to-transparent"></div>
                <div>
                  <div className="text-sm font-bold text-accent-vibrant uppercase tracking-wide mb-1">GauVendi Approach</div>
                  <p className="text-neutral-900 font-medium">AI understands intent and presents curated, ranked recommendations with clear rationale</p>
                </div>
              </div>
            </div>

            <div className="card-bold bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-xl font-bold mb-4 text-accent-energy">Interactive Merchandising</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Traditional</div>
                  <p className="text-gray-700">Text-based results with generic descriptions</p>
                </div>
                <div className="h-px bg-gradient-to-r from-accent-energy/20 to-transparent"></div>
                <div>
                  <div className="text-sm font-bold text-accent-energy uppercase tracking-wide mb-1">GauVendi Approach</div>
                  <p className="text-neutral-900 font-medium">Rich visual components that show why each option was recommended, with interactive exploration</p>
                </div>
              </div>
            </div>

            <div className="card-bold bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-xl font-bold mb-4 text-accent-bold">Frictionless Booking</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Traditional</div>
                  <p className="text-gray-700">Redirects to external sites with complex booking flows</p>
                </div>
                <div className="h-px bg-gradient-to-r from-accent-bold/20 to-transparent"></div>
                <div>
                  <div className="text-sm font-bold text-accent-bold uppercase tracking-wide mb-1">GauVendi Approach</div>
                  <p className="text-neutral-900 font-medium">Complete booking in one click without leaving the conversation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2>Business Value</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="flex gap-4 items-start">
              <div className="bg-accent-electric text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-xl">↑</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Increased Conversion Rates</h4>
                <p className="text-gray-700">Removes friction, delivers relevance, guides confident decisions faster</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-accent-vibrant text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-xl">$</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Higher ADR (Average Daily Rate)</h4>
                <p className="text-gray-700">Features and experiences command premium pricing over generic "room types"</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-accent-energy text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-xl">★</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Enhanced Guest Experience</h4>
                <p className="text-gray-700">Modern, AI-first interaction meets tech-savvy traveler expectations</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-accent-bold text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-xl">⚡</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Competitive Differentiation</h4>
                <p className="text-gray-700">Positions GauVendi as an innovation leader in hotel commerce</p>
              </div>
            </div>
            <div className="flex gap-4 items-start md:col-span-2">
              <div className="bg-gradient-to-r from-accent-electric to-accent-vibrant text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-xl">+</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Upselling Opportunities</h4>
                <p className="text-gray-700">Natural feature-based recommendations encourage add-ons and upgrades</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2>Example User Journey</h2>

          <div className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 rounded-2xl border-2 border-gray-200 mt-10">
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-accent-electric to-accent-vibrant text-white rounded-2xl w-14 h-14 flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-lg">1</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 text-neutral-900">Guest Prompt</h4>
                  <p className="text-lg text-gray-700">"I need a quiet room with a great view for a work retreat, March 15-17"</p>
                </div>
              </div>

              <div className="ml-7 h-8 border-l-4 border-dashed border-gray-300"></div>

              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-accent-electric to-accent-vibrant text-white rounded-2xl w-14 h-14 flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-lg">2</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 text-neutral-900">ChatGPT Processing</h4>
                  <p className="text-lg text-gray-700">Extracts dates (Mar 15-17), features (quiet, view), and guest count</p>
                </div>
              </div>

              <div className="ml-7 h-8 border-l-4 border-dashed border-gray-300"></div>

              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-accent-electric to-accent-vibrant text-white rounded-2xl w-14 h-14 flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-lg">3</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 text-neutral-900">MCP Server Action</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>Queries available rooms with "quiet_floor" and "ocean_view" features</li>
                    <li>Ranks results: Option A has both features, Option B has view + balcony at lower price</li>
                    <li>Returns recommendations with rich metadata</li>
                  </ul>
                </div>
              </div>

              <div className="ml-7 h-8 border-l-4 border-dashed border-gray-300"></div>

              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-accent-electric to-accent-vibrant text-white rounded-2xl w-14 h-14 flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-lg">4</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 text-neutral-900">Interactive Display</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>Two recommendation cards appear in the chat</li>
                    <li>"Best Match For You" shows room with ✓ Quiet Floor, ✓ Ocean View</li>
                    <li>"Great Value" shows room with ✓ Ocean View, ✓ Balcony (lower price)</li>
                    <li>Each card shows pricing, images, and full feature list</li>
                  </ul>
                </div>
              </div>

              <div className="ml-7 h-8 border-l-4 border-dashed border-gray-300"></div>

              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-accent-electric to-accent-vibrant text-white rounded-2xl w-14 h-14 flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-lg">5</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 text-neutral-900">Booking</h4>
                  <p className="text-lg text-gray-700">Guest clicks "Book Now" on Best Match → Instant confirmation with reference number</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-accent-energy/10 border-l-4 border-accent-energy p-6 rounded-xl">
              <p className="text-lg font-bold text-neutral-900">⚡ Total time from query to booking: Under 60 seconds, all within ChatGPT</p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2>Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="flex gap-4 items-start p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="bg-accent-electric text-white rounded-lg px-3 py-2 font-bold text-sm flex-shrink-0">UI</div>
              <div>
                <strong className="text-lg text-neutral-900 block mb-1">Frontend</strong>
                <p className="text-gray-700">React-based web component (Skybridge framework)</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="bg-accent-vibrant text-white rounded-lg px-3 py-2 font-bold text-sm flex-shrink-0">API</div>
              <div>
                <strong className="text-lg text-neutral-900 block mb-1">MCP Server</strong>
                <p className="text-gray-700">Node.js with Model Context Protocol SDK</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="bg-accent-energy text-white rounded-lg px-3 py-2 font-bold text-sm flex-shrink-0">DB</div>
              <div>
                <strong className="text-lg text-neutral-900 block mb-1">Database</strong>
                <p className="text-gray-700">SQL with attribute-based schema design</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="bg-accent-bold text-white rounded-lg px-3 py-2 font-bold text-sm flex-shrink-0">OPS</div>
              <div>
                <strong className="text-lg text-neutral-900 block mb-1">Deployment</strong>
                <p className="text-gray-700">HTTPS endpoint (ngrok for development, cloud hosting for production)</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-6 bg-gray-50 rounded-xl border border-gray-200 md:col-span-2">
              <div className="bg-gradient-to-r from-accent-electric to-accent-vibrant text-white rounded-lg px-3 py-2 font-bold text-sm flex-shrink-0">SDK</div>
              <div>
                <strong className="text-lg text-neutral-900 block mb-1">Integration</strong>
                <p className="text-gray-700">ChatGPT Apps SDK with window.openai API bridge</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2>Why This Approach Wins</h2>
          <div className="space-y-5 mt-10">
            <div className="flex gap-4 items-start">
              <div className="bg-accent-electric text-white rounded-xl w-10 h-10 flex items-center justify-center font-extrabold text-lg flex-shrink-0">1</div>
              <div>
                <strong className="text-xl text-neutral-900 block mb-1">Fully Aligned with GauVendi Philosophy</strong>
                <p className="text-gray-700">Attribute-based selling from database to UI</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-accent-vibrant text-white rounded-xl w-10 h-10 flex items-center justify-center font-extrabold text-lg flex-shrink-0">2</div>
              <div>
                <strong className="text-xl text-neutral-900 block mb-1">Leverages Cutting-Edge AI</strong>
                <p className="text-gray-700">ChatGPT's natural language understanding creates intuitive experiences</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-accent-energy text-white rounded-xl w-10 h-10 flex items-center justify-center font-extrabold text-lg flex-shrink-0">3</div>
              <div>
                <strong className="text-xl text-neutral-900 block mb-1">Proven Technology Stack</strong>
                <p className="text-gray-700">Built on OpenAI's official Apps SDK and MCP standards</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-accent-bold text-white rounded-xl w-10 h-10 flex items-center justify-center font-extrabold text-lg flex-shrink-0">4</div>
              <div>
                <strong className="text-xl text-neutral-900 block mb-1">Measurable Business Impact</strong>
                <p className="text-gray-700">Direct line from better UX to higher conversion and ADR</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-gradient-to-r from-accent-electric to-accent-vibrant text-white rounded-xl w-10 h-10 flex items-center justify-center font-extrabold text-lg flex-shrink-0">5</div>
              <div>
                <strong className="text-xl text-neutral-900 block mb-1">Future-Proof Architecture</strong>
                <p className="text-gray-700">Extensible for post-booking services, package builders, and multi-property experiences</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-accent-electric to-accent-vibrant text-white p-10 md:p-16 rounded-2xl text-center shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            Ready to Transform Hotel Booking
          </h3>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
            Let's build the future of hospitality commerce together.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureOverview;
