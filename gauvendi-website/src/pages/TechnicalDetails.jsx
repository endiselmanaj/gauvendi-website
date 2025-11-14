import React, { useState } from 'react';

const TechnicalDetails = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-neutral-50 border-b-2 border-gray-100">
        <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-900 mb-6 tracking-tight leading-none">
              Technical
              <span className="block text-accent-vibrant mt-2">Implementation</span>
            </h1>
            <div className="w-24 h-1.5 bg-accent-vibrant mx-auto my-8 rounded-full"></div>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Detailed specifications for building the GauVendi ChatGPT app, from database design to interactive components.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-8 py-12 max-w-7xl prose-custom">
        {/* Table of Contents */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-10 rounded-2xl border-2 border-gray-200 mb-16">
          <h2 className="text-3xl mb-8">Table of Contents</h2>
          <ol className="space-y-3 text-lg">
            <li><a href="#introduction" className="text-accent-electric hover:text-accent-vibrant font-semibold transition-colors">Introduction</a></li>
            <li><a href="#database" className="text-accent-electric hover:text-accent-vibrant font-semibold transition-colors">Database Schema Specification</a></li>
            <li><a href="#mcp-server" className="text-accent-electric hover:text-accent-vibrant font-semibold transition-colors">MCP Server Implementation</a></li>
            <li><a href="#web-component" className="text-accent-electric hover:text-accent-vibrant font-semibold transition-colors">Web Component Specifications</a></li>
            <li><a href="#data-flow" className="text-accent-electric hover:text-accent-vibrant font-semibold transition-colors">Data Flow & Integration</a></li>
            <li><a href="#error-handling" className="text-accent-electric hover:text-accent-vibrant font-semibold transition-colors">Error Handling & Validation</a></li>
            <li><a href="#appendices" className="text-accent-electric hover:text-accent-vibrant font-semibold transition-colors">Appendices</a></li>
          </ol>
        </div>

        {/* Section 1: Introduction */}
        <section id="introduction" className="mb-20 scroll-mt-24">
          <h2>1. Introduction</h2>

          <h3>1.1 Purpose and Scope</h3>
          <p className="text-xl">
            This document provides detailed technical specifications for implementing the GauVendi ChatGPT app. It covers database
            schema design, MCP server tool configurations, web component specifications, and integration patterns. This document is
            intended for development teams, technical stakeholders, and system architects.
          </p>

          <h3>1.2 Architecture Overview Recap</h3>
          <p>The system consists of three primary components:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="card-bold text-center">
              <div className="text-4xl mb-3">🗄️</div>
              <h4 className="text-lg mb-2">Attribute-Based Database</h4>
              <p className="text-sm">SQL database modeling physical rooms, features, and dynamic packages</p>
            </div>
            <div className="card-bold text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h4 className="text-lg mb-2">MCP Server</h4>
              <p className="text-sm">Model Context Protocol server exposing recommendation and booking tools</p>
            </div>
            <div className="card-bold text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h4 className="text-lg mb-2">Interactive Web Component</h4>
              <p className="text-sm">React-based UI rendered within ChatGPT using the Skybridge framework</p>
            </div>
          </div>

          <h3>1.3 Key Design Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="flex gap-3 items-start">
              <div className="bg-accent-electric w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-neutral-900">Attribute-Based Selling:</strong> Rooms are defined by features, not rigid "room types"
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-accent-vibrant w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-neutral-900">Recommendation-First:</strong> AI curates options based on intent, not simple search filters
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-accent-energy w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-neutral-900">Stateless MCP Tools:</strong> Each tool invocation is independent and idempotent
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-accent-bold w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-neutral-900">Dual Payload Pattern:</strong> Concise structuredContent for AI, rich _meta for UI
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Database Schema */}
        <section id="database" className="mb-20 scroll-mt-24">
          <h2>2. Database Schema Specification</h2>

          <h3>2.1 Entity Relationship Overview</h3>
          <div className="bg-neutral-900 p-8 md:p-10 rounded-2xl border-l-4 border-accent-vibrant my-8">
            <pre className="text-accent-electric overflow-x-auto text-sm md:text-base font-mono">
{`physical_rooms ──┐
                 ├──< room_features >──┤
                 │                      features ──< feature_media
                 │                         │
                 ├──< availability         │
                 │                         │
                 └──< bookings ───────────┤
                                          │
stay_packages ──────< package_required_features >──┘
     │
     └──< rates`}
            </pre>
          </div>

          <h3>2.2 Table Definitions</h3>

          {/* Physical Rooms Table */}
          <div className="mb-10">
            <h4>2.2.1 physical_rooms</h4>
            <p>Represents actual hotel room units.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Column</th>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Type</th>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Constraints</th>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">id</td>
                    <td className="border border-gray-300 px-4 py-2">VARCHAR(50)</td>
                    <td className="border border-gray-300 px-4 py-2">PRIMARY KEY</td>
                    <td className="border border-gray-300 px-4 py-2">Unique room identifier (e.g., "room_101")</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">room_number</td>
                    <td className="border border-gray-300 px-4 py-2">VARCHAR(10)</td>
                    <td className="border border-gray-300 px-4 py-2">NOT NULL</td>
                    <td className="border border-gray-300 px-4 py-2">Display number (e.g., "101")</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">room_name</td>
                    <td className="border border-gray-300 px-4 py-2">VARCHAR(100)</td>
                    <td className="border border-gray-300 px-4 py-2">-</td>
                    <td className="border border-gray-300 px-4 py-2">Optional descriptive name</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">floor</td>
                    <td className="border border-gray-300 px-4 py-2">INTEGER</td>
                    <td className="border border-gray-300 px-4 py-2">NOT NULL</td>
                    <td className="border border-gray-300 px-4 py-2">Floor number</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">base_capacity</td>
                    <td className="border border-gray-300 px-4 py-2">INTEGER</td>
                    <td className="border border-gray-300 px-4 py-2">NOT NULL</td>
                    <td className="border border-gray-300 px-4 py-2">Maximum guests without extra beds</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Features Table */}
          <div className="mb-6">
            <h4>2.2.2 features</h4>
            <p>Master catalog of all room attributes.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Column</th>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Type</th>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Constraints</th>
                    <th className="bg-blue-600 text-white px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">id</td>
                    <td className="border border-gray-300 px-4 py-2">VARCHAR(50)</td>
                    <td className="border border-gray-300 px-4 py-2">PRIMARY KEY</td>
                    <td className="border border-gray-300 px-4 py-2">Unique feature identifier</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">feature_code</td>
                    <td className="border border-gray-300 px-4 py-2">VARCHAR(50)</td>
                    <td className="border border-gray-300 px-4 py-2">UNIQUE, NOT NULL</td>
                    <td className="border border-gray-300 px-4 py-2">Machine-readable code (e.g., "OCEAN_VIEW")</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">name</td>
                    <td className="border border-gray-300 px-4 py-2">VARCHAR(100)</td>
                    <td className="border border-gray-300 px-4 py-2">NOT NULL</td>
                    <td className="border border-gray-300 px-4 py-2">Display name (e.g., "Ocean View")</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">description</td>
                    <td className="border border-gray-300 px-4 py-2">TEXT</td>
                    <td className="border border-gray-300 px-4 py-2">-</td>
                    <td className="border border-gray-300 px-4 py-2">Detailed description for merchandising</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">type</td>
                    <td className="border border-gray-300 px-4 py-2">ENUM</td>
                    <td className="border border-gray-300 px-4 py-2">NOT NULL</td>
                    <td className="border border-gray-300 px-4 py-2">Category: 'view', 'amenity', 'bedding', 'tech', 'intangible', 'location'</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">surcharge</td>
                    <td className="border border-gray-300 px-4 py-2">DECIMAL(10,2)</td>
                    <td className="border border-gray-300 px-4 py-2">DEFAULT 0</td>
                    <td className="border border-gray-300 px-4 py-2">Additional cost per night for this feature</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3>2.3 Sample Data Examples</h3>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4>Sample Physical Rooms</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="bg-blue-600 text-white px-2 py-1 text-left">ID</th>
                    <th className="bg-blue-600 text-white px-2 py-1 text-left">Number</th>
                    <th className="bg-blue-600 text-white px-2 py-1 text-left">Name</th>
                    <th className="bg-blue-600 text-white px-2 py-1 text-left">Floor</th>
                    <th className="bg-blue-600 text-white px-2 py-1 text-left">Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">room_101</td>
                    <td className="border border-gray-300 px-2 py-1">101</td>
                    <td className="border border-gray-300 px-2 py-1">The Mariner Suite</td>
                    <td className="border border-gray-300 px-2 py-1">1</td>
                    <td className="border border-gray-300 px-2 py-1">2</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">room_201</td>
                    <td className="border border-gray-300 px-2 py-1">201</td>
                    <td className="border border-gray-300 px-2 py-1">Serenity Suite</td>
                    <td className="border border-gray-300 px-2 py-1">2</td>
                    <td className="border border-gray-300 px-2 py-1">2</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">room_401</td>
                    <td className="border border-gray-300 px-2 py-1">401</td>
                    <td className="border border-gray-300 px-2 py-1">Romantic Escape</td>
                    <td className="border border-gray-300 px-2 py-1">4</td>
                    <td className="border border-gray-300 px-2 py-1">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h4>Sample Features</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="bg-green-600 text-white px-2 py-1 text-left">Code</th>
                    <th className="bg-green-600 text-white px-2 py-1 text-left">Name</th>
                    <th className="bg-green-600 text-white px-2 py-1 text-left">Type</th>
                    <th className="bg-green-600 text-white px-2 py-1 text-left">Surcharge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">OCEAN_VIEW</td>
                    <td className="border border-gray-300 px-2 py-1">Ocean View</td>
                    <td className="border border-gray-300 px-2 py-1">view</td>
                    <td className="border border-gray-300 px-2 py-1">$50.00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">BALCONY</td>
                    <td className="border border-gray-300 px-2 py-1">Private Balcony</td>
                    <td className="border border-gray-300 px-2 py-1">amenity</td>
                    <td className="border border-gray-300 px-2 py-1">$40.00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">FIREPLACE</td>
                    <td className="border border-gray-300 px-2 py-1">In-Room Fireplace</td>
                    <td className="border border-gray-300 px-2 py-1">amenity</td>
                    <td className="border border-gray-300 px-2 py-1">$60.00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">QUIET_FLOOR</td>
                    <td className="border border-gray-300 px-2 py-1">Quiet Floor Location</td>
                    <td className="border border-gray-300 px-2 py-1">intangible</td>
                    <td className="border border-gray-300 px-2 py-1">$25.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4>Key Insight: Multi-Package Qualification</h4>
            <p>
              <strong>room_401 (Romantic Escape)</strong> qualifies for MULTIPLE packages:
            </p>
            <ul>
              <li>✓ pkg_romantic (has FIREPLACE, LARGE_BATHTUB, OCEAN_VIEW, BALCONY)</li>
              <li>✓ pkg_oceanfront (has OCEAN_VIEW, BALCONY)</li>
              <li>✓ pkg_luxury (has OCEAN_VIEW, HIGH_FLOOR, FIREPLACE, BALCONY, KING_BED)</li>
            </ul>
            <p className="mt-2">
              This demonstrates the core GauVendi philosophy: <strong>one physical room can be merchandised as multiple products.</strong>
            </p>
          </div>
        </section>

        {/* Section 3: MCP Server */}
        <section id="mcp-server" className="mb-20 scroll-mt-24">
          <h2>3. MCP Server Implementation</h2>

          <h3>3.1 Server Configuration Overview</h3>
          <p>The MCP server is initialized with:</p>
          <ul>
            <li><strong>Server name and version:</strong> Identifies the app to ChatGPT</li>
            <li><strong>Transport layer:</strong> Streamable HTTP (recommended) or SSE</li>
            <li><strong>Resource registration:</strong> HTML widget templates</li>
            <li><strong>Tool registration:</strong> find_stay_options and create_booking</li>
            <li><strong>Security settings:</strong> CORS, OAuth endpoints (if authenticated)</li>
          </ul>

          <h3>3.2 Tool Specifications</h3>

          {/* find_stay_options Tool */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg mb-6">
            <h4>3.2.1 find_stay_options Tool</h4>
            <p><strong>Purpose:</strong> Recommendation engine that translates natural language intent into curated stay options.</p>

            <div className="mt-4">
              <h5 className="font-semibold text-lg mb-2">Input Schema:</h5>
              <div className="bg-white p-4 rounded">
                <pre className="text-sm">{`{
  arrival: string (ISO 8601 date, e.g., "2025-03-15"),
  departure: string (ISO 8601 date),
  numberOfAdults: integer (positive, required),
  numberOfChildren: integer (non-negative, default: 0),
  featurePriorities: array of strings (optional, e.g., ["OCEAN_VIEW", "BALCONY"])
}`}</pre>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-semibold text-lg mb-2">Validation Rules:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>arrival must be ≥ today's date</li>
                <li>departure must be &gt; arrival</li>
                <li>Date range must be ≤ 30 days</li>
                <li>numberOfAdults must be ≥ 1</li>
                <li>Total guests (adults + children) must be ≤ 6</li>
              </ul>
            </div>

            <div className="mt-4">
              <h5 className="font-semibold text-lg mb-2">Scoring Algorithm:</h5>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Feature Matching Score (0-100 scale):</strong>
                  <ul className="ml-6 mt-1">
                    <li>Each matched feature from featurePriorities: +10 points</li>
                    <li>Partial match (related features): +5 points</li>
                    <li>Base room features (WiFi, TV): +1 point each</li>
                  </ul>
                </li>
                <li><strong>Availability Bonus:</strong> Fully available for entire date range: +10 points</li>
                <li><strong>Price Efficiency Score:</strong> Calculate price-per-matched-feature ratio</li>
                <li><strong>Final Ranking:</strong> Sort by Feature Matching Score → Price Efficiency → Room ID</li>
              </ol>
            </div>

            <div className="mt-4">
              <h5 className="font-semibold text-lg mb-2">Recommendation Labels Logic:</h5>
              <ul className="space-y-1">
                <li><strong>"Best Match For You":</strong> Highest feature matching score (top result)</li>
                <li><strong>"Great Value":</strong> Highest price efficiency score with ≥ 70% feature match</li>
                <li><strong>"Luxury Premium":</strong> Room with luxury package AND ≥ 80% feature match</li>
                <li><strong>"Available Now":</strong> Good availability with ≥ 60% feature match</li>
              </ul>
            </div>
          </div>

          {/* create_booking Tool */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg mb-6">
            <h4>3.2.2 create_booking Tool</h4>
            <p><strong>Purpose:</strong> Finalize a booking for a selected stay option.</p>

            <div className="mt-4">
              <h5 className="font-semibold text-lg mb-2">Input Schema:</h5>
              <div className="bg-white p-4 rounded">
                <pre className="text-sm">{`{
  recommendationId: string (e.g., "pkg_romantic_room201"),
  packageId: string (e.g., "pkg_romantic"),
  roomId: string (e.g., "room_201"),
  arrival: string (ISO 8601 date),
  departure: string (ISO 8601 date),
  guestDetails: {
    firstName: string (max 50 chars),
    lastName: string (max 50 chars),
    email: string (valid email format),
    phone: string (E.164 format recommended),
    numberOfAdults: integer,
    numberOfChildren: integer,
    specialRequests: string (optional, max 500 chars)
  }
}`}</pre>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-semibold text-lg mb-2">Transaction Flow:</h5>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Validation Phase:</strong> Validate all input fields, check guest count matches room capacity</li>
                <li><strong>Availability Check:</strong> Query availability table, ensure all dates show is_booked = false, use database transaction lock</li>
                <li><strong>Price Calculation:</strong> Fetch base rate, add feature surcharges, apply package modifier, calculate taxes</li>
                <li><strong>Booking Creation:</strong> Generate unique confirmation number, insert record into bookings table, update availability table</li>
                <li><strong>Confirmation:</strong> Return booking confirmation (Future: Trigger email/SMS notification)</li>
              </ol>
            </div>
          </div>

          <h3>3.3 Feature Mapping Logic</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-purple-600 text-white px-3 py-2 text-left">User Intent Keywords</th>
                  <th className="bg-purple-600 text-white px-3 py-2 text-left">Maps to Feature Codes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">"ocean view", "sea view", "waterfront"</td>
                  <td className="border border-gray-300 px-3 py-2">OCEAN_VIEW</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">"balcony", "terrace", "patio"</td>
                  <td className="border border-gray-300 px-3 py-2">BALCONY</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">"quiet", "peaceful", "silent"</td>
                  <td className="border border-gray-300 px-3 py-2">QUIET_FLOOR</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">"romantic", "anniversary", "honeymoon"</td>
                  <td className="border border-gray-300 px-3 py-2">FIREPLACE, LARGE_BATHTUB, OCEAN_VIEW</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">"business", "work", "corporate"</td>
                  <td className="border border-gray-300 px-3 py-2">WORK_DESK, QUIET_FLOOR, HIGH_SPEED_WIFI</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">"family", "kids", "children"</td>
                  <td className="border border-gray-300 px-3 py-2">SOFA_BED, CONNECTING_ROOM, KITCHENETTE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Web Component */}
        <section id="web-component" className="mb-20 scroll-mt-24">
          <h2>4. Web Component Specifications</h2>

          <h3>4.1 Component Architecture Overview</h3>
          <p>The web component is a React application that:</p>
          <ul>
            <li>Renders inside a sandboxed iframe in ChatGPT</li>
            <li>Reads data from window.openai.toolOutput and window.openai.toolResponseMetadata</li>
            <li>Persists UI state via window.openai.setWidgetState</li>
            <li>Calls MCP tools via window.openai.callTool</li>
          </ul>

          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h4>Technology Stack:</h4>
            <ul>
              <li>React 18+</li>
              <li>CSS-in-JS or Tailwind CSS for styling</li>
              <li>Bundled with esbuild or Vite</li>
              <li>No external state management library needed (use window.openai)</li>
            </ul>
          </div>

          <h3>4.2 Screen Definitions</h3>

          <div className="space-y-6">
            {/* Recommendation List View */}
            <div className="border-l-4 border-blue-600 pl-4">
              <h4>4.2.1 Recommendation List View (Primary Screen)</h4>
              <p><strong>Purpose:</strong> Display curated stay options as interactive cards.</p>

              <div className="bg-gray-100 p-4 rounded mt-2">
                <strong>Card Components:</strong>
                <ul className="mt-2">
                  <li><strong>Recommendation Label:</strong> Badge showing "Best Match", "Great Value", etc.</li>
                  <li><strong>Package Name:</strong> Display name combining package + room name</li>
                  <li><strong>Feature Tags:</strong> Visual chips/badges for each matching feature (✓ icon + feature name)</li>
                  <li><strong>Pricing:</strong> Price per night, total nights, total price</li>
                  <li><strong>Action Buttons:</strong> "View Details" (expands card), "Book Now" (calls create_booking)</li>
                </ul>
              </div>
            </div>

            {/* Expanded Package Detail View */}
            <div className="border-l-4 border-green-600 pl-4">
              <h4>4.2.2 Expanded Package Detail View</h4>
              <p><strong>Purpose:</strong> Show comprehensive information about a selected stay option.</p>

              <div className="bg-gray-100 p-4 rounded mt-2">
                <strong>Components:</strong>
                <ul className="mt-2">
                  <li><strong>Image Gallery:</strong> Carousel or grid showing room photos</li>
                  <li><strong>Feature List:</strong> All features with icons/images</li>
                  <li><strong>Price Breakdown:</strong> Itemized pricing (base rate, surcharges, taxes, total)</li>
                  <li><strong>Room Details:</strong> Capacity, floor, policies</li>
                </ul>
              </div>
            </div>

            {/* Booking Form */}
            <div className="border-l-4 border-purple-600 pl-4">
              <h4>4.2.3 Booking Form / Confirmation View</h4>
              <p><strong>Purpose:</strong> Collect guest details and finalize booking.</p>

              <div className="bg-gray-100 p-4 rounded mt-2">
                <strong>Interaction Flow:</strong>
                <ol className="mt-2 space-y-1">
                  <li>1. User fills form fields</li>
                  <li>2. Click "Confirm Booking"</li>
                  <li>3. Form validation (client-side)</li>
                  <li>4. Call window.openai.callTool('create_booking', payload)</li>
                  <li>5. Show loading state ("Confirming your booking...")</li>
                  <li>6. On success: transition to Confirmation Success View</li>
                  <li>7. On error: show error message inline</li>
                </ol>
              </div>
            </div>
          </div>

          <h3>4.3 Data Contracts</h3>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4>window.openai.toolOutput Structure (from find_stay_options):</h4>
            <pre className="text-xs bg-white p-3 rounded mt-2 overflow-x-auto">{`{
  recommendations: [{
    id: string,                    // e.g., "pkg_romantic_room201"
    packageId: string,             // e.g., "pkg_romantic"
    roomId: string,                // e.g., "room_201"
    name: string,                  // Display name
    label: string,                 // "Best Match For You", "Great Value", etc.
    price: number,                 // Total price for stay
    pricePerNight: number,         // Price per night
    matchingFeaturesCount: number, // Number of matched features
    summary: string                // 1-2 sentence explanation
  }]
}`}</pre>
          </div>
        </section>

        {/* Section 5: Data Flow */}
        <section id="data-flow" className="mb-20 scroll-mt-24">
          <h2>5. Data Flow & Integration</h2>

          <h3>5.1 Request-Response Cycles</h3>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
            <h4>Cycle 1: Initial Recommendation Request</h4>
            <ol className="space-y-2 mt-3">
              <li><strong>1. User:</strong> "Find me a romantic room with ocean view for March 15-17"</li>
              <li><strong>2. ChatGPT Model:</strong> Parses intent: romantic → [FIREPLACE, LARGE_BATHTUB, OCEAN_VIEW]</li>
              <li><strong>3. ChatGPT calls MCP Tool:</strong> find_stay_options with extracted parameters</li>
              <li><strong>4. MCP Server:</strong> Queries database, scores rooms, ranks results, generates recommendations</li>
              <li><strong>5. MCP Server Response:</strong> Returns structuredContent and _meta</li>
              <li><strong>6. ChatGPT:</strong> Renders widget, narrates results</li>
              <li><strong>7. Widget:</strong> Reads window.openai.toolOutput, renders Recommendation List View</li>
            </ol>
          </div>

          <h3 className="mt-6">5.2 State Management Patterns</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4>Key Principles:</h4>
            <ul className="space-y-2">
              <li><strong>Server data is authoritative:</strong> toolOutput is source of truth for recommendations and bookings</li>
              <li><strong>UI state is ephemeral:</strong> widgetState stores only UI preferences (expanded card, view mode)</li>
              <li><strong>Sensitive data never in widgetState:</strong> Guest details, payment info stay in local component state</li>
              <li><strong>Rehydration on load:</strong> Component reads widgetState on mount to restore UI state</li>
            </ul>
          </div>
        </section>

        {/* Section 6: Error Handling */}
        <section id="error-handling" className="mb-20 scroll-mt-24">
          <h2>6. Error Handling & Validation</h2>

          <h3>6.1 Input Validation Rules</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-red-600 text-white px-3 py-2 text-left">Field</th>
                  <th className="bg-red-600 text-white px-3 py-2 text-left">Rule</th>
                  <th className="bg-red-600 text-white px-3 py-2 text-left">Error Message</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">arrival</td>
                  <td className="border border-gray-300 px-3 py-2">Must be ISO 8601 date</td>
                  <td className="border border-gray-300 px-3 py-2">"Invalid date format. Use YYYY-MM-DD"</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">arrival</td>
                  <td className="border border-gray-300 px-3 py-2">Must be ≥ today</td>
                  <td className="border border-gray-300 px-3 py-2">"Arrival date must be today or in the future"</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">departure</td>
                  <td className="border border-gray-300 px-3 py-2">Must be &gt; arrival</td>
                  <td className="border border-gray-300 px-3 py-2">"Departure must be after arrival"</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">email</td>
                  <td className="border border-gray-300 px-3 py-2">Valid email format</td>
                  <td className="border border-gray-300 px-3 py-2">"Please enter a valid email address"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6">6.2 Error Message Catalog</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-orange-600 text-white px-3 py-2 text-left">Error Code</th>
                  <th className="bg-orange-600 text-white px-3 py-2 text-left">Category</th>
                  <th className="bg-orange-600 text-white px-3 py-2 text-left">User Message</th>
                  <th className="bg-orange-600 text-white px-3 py-2 text-left">Recovery Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">ERR_NETWORK_FAILURE</td>
                  <td className="border border-gray-300 px-3 py-2">Network</td>
                  <td className="border border-gray-300 px-3 py-2">"Connection lost. Check internet and try again."</td>
                  <td className="border border-gray-300 px-3 py-2">Retry button</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">ERR_NO_AVAILABILITY</td>
                  <td className="border border-gray-300 px-3 py-2">Business</td>
                  <td className="border border-gray-300 px-3 py-2">"No rooms available for selected dates."</td>
                  <td className="border border-gray-300 px-3 py-2">Suggest different dates</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">ERR_ROOM_BOOKED</td>
                  <td className="border border-gray-300 px-3 py-2">Conflict</td>
                  <td className="border border-gray-300 px-3 py-2">"This room was just booked. Please choose another."</td>
                  <td className="border border-gray-300 px-3 py-2">Return to results</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">ERR_INVALID_EMAIL</td>
                  <td className="border border-gray-300 px-3 py-2">Validation</td>
                  <td className="border border-gray-300 px-3 py-2">"Invalid email format."</td>
                  <td className="border border-gray-300 px-3 py-2">Fix inline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: Appendices */}
        <section id="appendices" className="mb-20 scroll-mt-24">
          <h2>7. Appendices</h2>

          <h3>Appendix A: Complete Feature Code Master List</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-indigo-600 text-white px-3 py-2 text-left">Feature Code</th>
                  <th className="bg-indigo-600 text-white px-3 py-2 text-left">Name</th>
                  <th className="bg-indigo-600 text-white px-3 py-2 text-left">Type</th>
                  <th className="bg-indigo-600 text-white px-3 py-2 text-left">Surcharge</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-3 py-2">OCEAN_VIEW</td><td className="border px-3 py-2">Ocean View</td><td className="border px-3 py-2">view</td><td className="border px-3 py-2">$50.00</td></tr>
                <tr><td className="border px-3 py-2">CITY_VIEW</td><td className="border px-3 py-2">City View</td><td className="border px-3 py-2">view</td><td className="border px-3 py-2">$20.00</td></tr>
                <tr><td className="border px-3 py-2">BALCONY</td><td className="border px-3 py-2">Private Balcony</td><td className="border px-3 py-2">amenity</td><td className="border px-3 py-2">$40.00</td></tr>
                <tr><td className="border px-3 py-2">FIREPLACE</td><td className="border px-3 py-2">In-Room Fireplace</td><td className="border px-3 py-2">amenity</td><td className="border px-3 py-2">$60.00</td></tr>
                <tr><td className="border px-3 py-2">LARGE_BATHTUB</td><td className="border px-3 py-2">Luxury Bathtub</td><td className="border px-3 py-2">amenity</td><td className="border px-3 py-2">$35.00</td></tr>
                <tr><td className="border px-3 py-2">QUIET_FLOOR</td><td className="border px-3 py-2">Quiet Floor Location</td><td className="border px-3 py-2">intangible</td><td className="border px-3 py-2">$25.00</td></tr>
                <tr><td className="border px-3 py-2">PET_FRIENDLY</td><td className="border px-3 py-2">Pet-Friendly Room</td><td className="border px-3 py-2">intangible</td><td className="border px-3 py-2">$30.00</td></tr>
                <tr><td className="border px-3 py-2">HIGH_SPEED_WIFI</td><td className="border px-3 py-2">High-Speed WiFi</td><td className="border px-3 py-2">tech</td><td className="border px-3 py-2">$0.00</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6">Appendix D: Glossary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-gray-700 text-white px-3 py-2 text-left">Term</th>
                  <th className="bg-gray-700 text-white px-3 py-2 text-left">Definition</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2 font-semibold">Attribute-Based Selling</td>
                  <td className="border px-3 py-2">Marketing approach where products are sold by individual features rather than fixed categories</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-semibold">MCP (Model Context Protocol)</td>
                  <td className="border px-3 py-2">Open standard for connecting AI models to external tools and services</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-semibold">Skybridge</td>
                  <td className="border px-3 py-2">ChatGPT's widget sandboxing framework for rendering third-party UI components</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-semibold">structuredContent</td>
                  <td className="border px-3 py-2">JSON payload visible to both AI model and UI component</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-semibold">_meta</td>
                  <td className="border px-3 py-2">JSON payload visible only to UI component, hidden from AI model</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-semibold">widgetState</td>
                  <td className="border px-3 py-2">Persisted UI state scoped to a specific widget instance</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-semibold">Stay Package</td>
                  <td className="border px-3 py-2">Sellable product defined by a combination of room features</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg text-center mt-8">
          <p className="text-lg font-bold">
            End of Technical Implementation Documentation
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDetails;
