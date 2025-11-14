# GauVendi ChatGPT App - Technical Implementation Documentation

## Table of Contents
1. [Introduction](#1-introduction)
2. [Database Schema Specification](#2-database-schema-specification)
3. [MCP Server Implementation](#3-mcp-server-implementation)
4. [Web Component Specifications](#4-web-component-specifications)
5. [Data Flow & Integration](#5-data-flow--integration)
6. [Error Handling & Validation](#6-error-handling--validation)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose and Scope
This document provides detailed technical specifications for implementing the GauVendi ChatGPT app. It covers database schema design, MCP server tool configurations, web component specifications, and integration patterns. This document is intended for development teams, technical stakeholders, and system architects.

### 1.2 Architecture Overview Recap
The system consists of three primary components:
- **Attribute-Based Database**: SQL database modeling physical rooms, features, and dynamic packages
- **MCP Server**: Model Context Protocol server exposing recommendation and booking tools
- **Interactive Web Component**: React-based UI rendered within ChatGPT using the Skybridge framework

### 1.3 Key Design Principles
- **Attribute-Based Selling**: Rooms are defined by features, not rigid "room types"
- **Recommendation-First**: AI curates options based on intent, not simple search filters
- **Stateless MCP Tools**: Each tool invocation is independent and idempotent
- **Dual Payload Pattern**: Concise `structuredContent` for AI, rich `_meta` for UI

---

## 2. Database Schema Specification

### 2.1 Entity Relationship Overview

```
physical_rooms ──┐
                 ├──< room_features >──┤
                 │                      features ──< feature_media
                 │                         │
                 ├──< availability         │
                 │                         │
                 └──< bookings ───────────┤
                                          │
stay_packages ──────< package_required_features >──┘
     │
     └──< rates
```

### 2.2 Table Definitions

#### 2.2.1 physical_rooms
Represents actual hotel room units.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Unique room identifier (e.g., "room_101") |
| room_number | VARCHAR(10) | NOT NULL | Display number (e.g., "101") |
| room_name | VARCHAR(100) | | Optional descriptive name |
| floor | INTEGER | NOT NULL | Floor number |
| base_capacity | INTEGER | NOT NULL | Maximum guests without extra beds |

#### 2.2.2 features
Master catalog of all room attributes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Unique feature identifier |
| feature_code | VARCHAR(50) | UNIQUE, NOT NULL | Machine-readable code (e.g., "OCEAN_VIEW") |
| name | VARCHAR(100) | NOT NULL | Display name (e.g., "Ocean View") |
| description | TEXT | | Detailed description for merchandising |
| type | ENUM | NOT NULL | Category: 'view', 'amenity', 'bedding', 'tech', 'intangible', 'location' |
| surcharge | DECIMAL(10,2) | DEFAULT 0 | Additional cost per night for this feature |

#### 2.2.3 room_features
Junction table linking rooms to their features.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| room_id | VARCHAR(50) | FOREIGN KEY | References physical_rooms(id) |
| feature_id | VARCHAR(50) | FOREIGN KEY | References features(id) |
| | | PRIMARY KEY (room_id, feature_id) | Composite key prevents duplicates |

#### 2.2.4 stay_packages
Dynamic sellable products defined by feature combinations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Package identifier (e.g., "pkg_romantic") |
| package_code | VARCHAR(50) | UNIQUE, NOT NULL | Machine-readable code |
| name | VARCHAR(100) | NOT NULL | Display name (e.g., "Romantic Getaway") |
| description | TEXT | | Marketing description |
| base_price_modifier | DECIMAL(5,2) | DEFAULT 1.0 | Multiplier applied to base rate (e.g., 1.2 = 20% premium) |

#### 2.2.5 package_required_features
Defines which features constitute each package.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| package_id | VARCHAR(50) | FOREIGN KEY | References stay_packages(id) |
| feature_id | VARCHAR(50) | FOREIGN KEY | References features(id) |
| | | PRIMARY KEY (package_id, feature_id) | Composite key |

#### 2.2.6 feature_media
Visual assets for merchandising features.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Media identifier |
| feature_id | VARCHAR(50) | FOREIGN KEY | References features(id) |
| image_url | VARCHAR(500) | NOT NULL | CDN or asset URL |
| alt_text | VARCHAR(200) | | Accessibility description |

#### 2.2.7 availability
Tracks room booking status by date.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Availability record identifier |
| room_id | VARCHAR(50) | FOREIGN KEY | References physical_rooms(id) |
| date | DATE | NOT NULL | Specific date |
| is_booked | BOOLEAN | DEFAULT FALSE | Booking status |
| | | UNIQUE (room_id, date) | One record per room per date |

#### 2.2.8 bookings
Confirmed reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Booking confirmation number |
| room_id | VARCHAR(50) | FOREIGN KEY | References physical_rooms(id) |
| package_id | VARCHAR(50) | FOREIGN KEY | References stay_packages(id) |
| arrival_date | DATE | NOT NULL | Check-in date |
| departure_date | DATE | NOT NULL | Check-out date |
| guest_details | JSON | NOT NULL | Guest information (see structure below) |
| total_price | DECIMAL(10,2) | NOT NULL | Final booking price |
| created_at | TIMESTAMP | DEFAULT NOW() | Booking creation timestamp |

**guest_details JSON structure:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "numberOfAdults": "integer",
  "numberOfChildren": "integer",
  "specialRequests": "string (optional)"
}
```

#### 2.2.9 rates
Base pricing table (simplified for demo).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Rate identifier |
| package_id | VARCHAR(50) | FOREIGN KEY | References stay_packages(id) |
| date | DATE | NOT NULL | Specific date |
| price | DECIMAL(10,2) | NOT NULL | Base price for that date |

---

### 2.3 Sample Data Examples

#### 2.3.1 Physical Rooms

```
id          | room_number | room_name              | floor | base_capacity
------------|-------------|------------------------|-------|---------------
room_101    | 101         | The Mariner Suite      | 1     | 2
room_102    | 102         | Oceanfront King        | 1     | 2
room_201    | 201         | Serenity Suite         | 2     | 2
room_202    | 202         | Corner Deluxe          | 2     | 3
room_301    | 301         | Penthouse View         | 3     | 4
room_302    | 302         | Quiet Retreat          | 3     | 2
room_303    | 303         | Business Executive     | 3     | 2
room_401    | 401         | Romantic Escape        | 4     | 2
room_402    | 402         | Family Harbor          | 4     | 4
room_403    | 403         | Vista Premium          | 4     | 2
```

#### 2.3.2 Features Catalog

**View Features:**
```
id             | feature_code    | name                  | type  | surcharge
---------------|-----------------|----------------------|-------|----------
feat_001       | OCEAN_VIEW      | Ocean View           | view  | 50.00
feat_002       | CITY_VIEW       | City View            | view  | 20.00
feat_003       | GARDEN_VIEW     | Garden View          | view  | 15.00
feat_004       | CORNER_VIEW     | Corner Room View     | view  | 30.00
```

**Amenity Features:**
```
id             | feature_code        | name                     | type     | surcharge
---------------|---------------------|--------------------------|----------|----------
feat_005       | BALCONY             | Private Balcony          | amenity  | 40.00
feat_006       | FIREPLACE           | In-Room Fireplace        | amenity  | 60.00
feat_007       | LARGE_BATHTUB       | Luxury Bathtub           | amenity  | 35.00
feat_008       | NESPRESSO_MACHINE   | Nespresso Machine        | amenity  | 10.00
feat_009       | MINIBAR             | Premium Minibar          | amenity  | 15.00
feat_010       | WORK_DESK           | Executive Work Desk      | amenity  | 0.00
feat_011       | KITCHENETTE         | Full Kitchenette         | amenity  | 45.00
```

**Bedding Features:**
```
id             | feature_code    | name                  | type     | surcharge
---------------|-----------------|----------------------|----------|----------
feat_012       | KING_BED        | King Size Bed        | bedding  | 0.00
feat_013       | QUEEN_BED       | Queen Size Bed       | bedding  | 0.00
feat_014       | TWIN_BEDS       | Two Twin Beds        | bedding  | 0.00
feat_015       | SOFA_BED        | Sofa Bed             | bedding  | 20.00
```

**Tech Features:**
```
id             | feature_code        | name                     | type  | surcharge
---------------|---------------------|--------------------------|-------|----------
feat_016       | SMART_TV            | 55" Smart TV             | tech  | 0.00
feat_017       | HIGH_SPEED_WIFI     | High-Speed WiFi          | tech  | 0.00
feat_018       | BLUETOOTH_SPEAKER   | Bluetooth Speaker        | tech  | 5.00
feat_019       | USB_CHARGING_PORTS  | Multiple USB Ports       | tech  | 0.00
```

**Intangible/Location Features:**
```
id             | feature_code     | name                    | type        | surcharge
---------------|------------------|-------------------------|-------------|----------
feat_020       | QUIET_FLOOR      | Quiet Floor Location    | intangible  | 25.00
feat_021       | PET_FRIENDLY     | Pet-Friendly Room       | intangible  | 30.00
feat_022       | WHEELCHAIR_ACCESS| Wheelchair Accessible   | intangible  | 0.00
feat_023       | CONNECTING_ROOM  | Connecting Room Avail   | intangible  | 0.00
feat_024       | HIGH_FLOOR       | High Floor (3+)         | location    | 20.00
feat_025       | POOLSIDE         | Near Swimming Pool      | location    | 25.00
```

#### 2.3.3 Room-Feature Mappings (Selected Examples)

**room_101 (The Mariner Suite):**
- OCEAN_VIEW, BALCONY, QUEEN_BED, SMART_TV, HIGH_SPEED_WIFI

**room_201 (Serenity Suite):**
- OCEAN_VIEW, QUIET_FLOOR, FIREPLACE, LARGE_BATHTUB, KING_BED, NESPRESSO_MACHINE, SMART_TV, HIGH_SPEED_WIFI

**room_301 (Penthouse View):**
- OCEAN_VIEW, CORNER_VIEW, BALCONY, HIGH_FLOOR, KING_BED, SOFA_BED, KITCHENETTE, SMART_TV, HIGH_SPEED_WIFI, BLUETOOTH_SPEAKER

**room_302 (Quiet Retreat):**
- GARDEN_VIEW, QUIET_FLOOR, WORK_DESK, QUEEN_BED, SMART_TV, HIGH_SPEED_WIFI, USB_CHARGING_PORTS

**room_401 (Romantic Escape):**
- OCEAN_VIEW, FIREPLACE, LARGE_BATHTUB, BALCONY, HIGH_FLOOR, KING_BED, NESPRESSO_MACHINE, BLUETOOTH_SPEAKER, SMART_TV

**room_402 (Family Harbor):**
- OCEAN_VIEW, KING_BED, SOFA_BED, TWIN_BEDS, CONNECTING_ROOM, KITCHENETTE, SMART_TV, HIGH_SPEED_WIFI

**room_303 (Business Executive):**
- CITY_VIEW, QUIET_FLOOR, WORK_DESK, NESPRESSO_MACHINE, KING_BED, SMART_TV, HIGH_SPEED_WIFI, USB_CHARGING_PORTS

#### 2.3.4 Stay Packages

```
id              | package_code        | name                      | base_price_modifier
----------------|---------------------|---------------------------|--------------------
pkg_romantic    | ROMANTIC_GETAWAY    | Romantic Getaway          | 1.20
pkg_business    | BUSINESS_TRAVELER   | Business Traveler Suite   | 1.10
pkg_family      | FAMILY_EXPERIENCE   | Family Experience         | 1.25
pkg_oceanfront  | OCEANFRONT_RETREAT  | Oceanfront Retreat        | 1.15
pkg_wellness    | WELLNESS_ESCAPE     | Wellness Escape           | 1.30
pkg_value       | GREAT_VALUE         | Great Value Stay          | 1.00
pkg_luxury      | LUXURY_PREMIUM      | Luxury Premium Experience | 1.50
```

#### 2.3.5 Package-Feature Requirements

**pkg_romantic (Romantic Getaway):**
- Required features: FIREPLACE, LARGE_BATHTUB, OCEAN_VIEW or BALCONY

**pkg_business (Business Traveler Suite):**
- Required features: WORK_DESK, QUIET_FLOOR, HIGH_SPEED_WIFI, NESPRESSO_MACHINE

**pkg_family (Family Experience):**
- Required features: SOFA_BED or CONNECTING_ROOM, KITCHENETTE

**pkg_oceanfront (Oceanfront Retreat):**
- Required features: OCEAN_VIEW, BALCONY

**pkg_wellness (Wellness Escape):**
- Required features: QUIET_FLOOR, LARGE_BATHTUB, GARDEN_VIEW or OCEAN_VIEW

**pkg_value (Great Value Stay):**
- Required features: (minimal requirements, focuses on basic room)

**pkg_luxury (Luxury Premium Experience):**
- Required features: OCEAN_VIEW, HIGH_FLOOR, FIREPLACE or BALCONY, KING_BED

**Key Insight:** Notice that room_401 (Romantic Escape) qualifies for MULTIPLE packages:
- pkg_romantic ✓ (has FIREPLACE, LARGE_BATHTUB, OCEAN_VIEW, BALCONY)
- pkg_oceanfront ✓ (has OCEAN_VIEW, BALCONY)
- pkg_luxury ✓ (has OCEAN_VIEW, HIGH_FLOOR, FIREPLACE, BALCONY, KING_BED)

This demonstrates the core GauVendi philosophy: one physical room can be merchandised as multiple products.

#### 2.3.6 Availability Sample (March 2025)

```
room_id    | date       | is_booked
-----------|------------|----------
room_101   | 2025-03-15 | false
room_101   | 2025-03-16 | false
room_101   | 2025-03-17 | true
room_201   | 2025-03-15 | false
room_201   | 2025-03-16 | false
room_201   | 2025-03-17 | false
room_401   | 2025-03-15 | false
room_401   | 2025-03-16 | false
room_401   | 2025-03-17 | false
```

#### 2.3.7 Sample Booking

```json
{
  "id": "BK20250314001",
  "room_id": "room_201",
  "package_id": "pkg_romantic",
  "arrival_date": "2025-03-15",
  "departure_date": "2025-03-17",
  "guest_details": {
    "firstName": "Emma",
    "lastName": "Thompson",
    "email": "emma.thompson@example.com",
    "phone": "+1-555-0123",
    "numberOfAdults": 2,
    "numberOfChildren": 0,
    "specialRequests": "Late check-in, champagne on arrival"
  },
  "total_price": 540.00,
  "created_at": "2025-03-14T10:30:00Z"
}
```

### 2.4 Query Patterns

#### Key Query: Find Available Rooms Matching Features

**High-level logic:**
```
1. Filter physical_rooms by availability for date range
2. Join with room_features to get feature list for each room
3. Score each room by counting matched features from user's priorities
4. Rank rooms by score (descending)
5. Group qualified rooms into stay_packages they can fulfill
6. Return top N recommendations with labels (Best Match, Great Value, etc.)
```

**Indexing recommendations:**
- Index on `availability(date, room_id, is_booked)` for date range queries
- Index on `room_features(feature_id)` for feature filtering
- Index on `bookings(arrival_date, departure_date)` for conflict checking

---

## 3. MCP Server Implementation

### 3.1 Server Configuration Overview

#### 3.1.1 Initialization Structure

The MCP server is initialized with:
- **Server name and version**: Identifies the app to ChatGPT
- **Transport layer**: Streamable HTTP (recommended) or SSE
- **Resource registration**: HTML widget templates
- **Tool registration**: `find_stay_options` and `create_booking`
- **Security settings**: CORS, OAuth endpoints (if authenticated)

**Conceptual structure:**
```
Server Initialization
├── Basic info (name: "gauvendi-hotel", version: "1.0.0")
├── Transport (StreamableHTTPServerTransport, stateless mode)
├── Resources
│   └── Widget template (ui://widget/gauvendi-recommendations.html)
└── Tools
    ├── find_stay_options
    └── create_booking
```

#### 3.1.2 Resource Registration

**Widget Template Registration:**
- **URI**: `ui://widget/gauvendi-recommendations.html`
- **MIME Type**: `text/html+skybridge` (signals to ChatGPT this is a widget)
- **Content**: Bundled HTML/CSS/JavaScript (React component compiled)
- **Metadata**:
  - `openai/widgetPrefersBorder: true` (render with card border)
  - `openai/widgetDescription`: "Interactive hotel stay recommendations"
  - `openai/widgetCSP`: Content Security Policy domains
  - `openai/widgetDomain`: Optional dedicated subdomain

#### 3.1.3 Security & CORS

- **CORS headers**: Allow `Access-Control-Allow-Origin: *` for development, restrict in production
- **MCP session handling**: Stateless mode (no session IDs)
- **Authentication**: OAuth 2.1 flow for production (see Integration section)

---

### 3.2 Tool Specifications

#### 3.2.1 find_stay_options Tool

**Purpose**: Recommendation engine that translates natural language intent into curated stay options.

**Tool Descriptor:**
```
Name: "find_stay_options"
Title: "Find Stay Options"
Description: "Use this tool when a user wants to find hotel accommodations. Extract desired features like 'ocean view', 'quiet', 'balcony', 'romantic', along with dates and guest count. Returns personalized stay recommendations."
```

**Input Schema:**
```javascript
{
  arrival: string (ISO 8601 date, e.g., "2025-03-15"),
  departure: string (ISO 8601 date),
  numberOfAdults: integer (positive, required),
  numberOfChildren: integer (non-negative, default: 0),
  featurePriorities: array of strings (optional, e.g., ["OCEAN_VIEW", "BALCONY", "QUIET_FLOOR"])
}
```

**Validation Rules:**
- `arrival` must be >= today's date
- `departure` must be > `arrival`
- Date range must be <= 30 days
- `numberOfAdults` must be >= 1
- Total guests (adults + children) must be <= 6
- `featurePriorities` array length <= 10

**Metadata (_meta):**
```javascript
{
  "openai/outputTemplate": "ui://widget/gauvendi-recommendations.html",
  "openai/widgetAccessible": false, // Model initiates, not widget
  "openai/toolInvocation/invoking": "Finding the perfect stay for you...",
  "openai/toolInvocation/invoked": "Here are your personalized options"
}
```

**Scoring Algorithm:**

1. **Feature Matching Score** (0-100 scale):
   - Each matched feature from `featurePriorities`: +10 points
   - Partial match (related features): +5 points
   - Base room features (WiFi, TV): +1 point each

2. **Availability Bonus**:
   - Fully available for entire date range: +10 points
   - Partial availability: 0 points (excluded)

3. **Price Efficiency Score**:
   - Calculate price-per-matched-feature ratio
   - Lower ratio = better value = higher score

4. **Final Ranking**:
   - Sort by Feature Matching Score (primary)
   - Tie-break by Price Efficiency Score (secondary)
   - Tie-break by Room ID (tertiary, for stability)

**Recommendation Labels Logic:**
- **"Best Match For You"**: Highest feature matching score (top result)
- **"Great Value"**: Highest price efficiency score with >= 70% feature match
- **"Luxury Premium"**: Room with luxury package AND >= 80% feature match
- **"Available Now"**: Good availability with >= 60% feature match

**Response Structure:**

**structuredContent** (shown to model and UI):
```json
{
  "recommendations": [
    {
      "id": "pkg_romantic_room201",
      "packageId": "pkg_romantic",
      "roomId": "room_201",
      "name": "Romantic Getaway - Serenity Suite",
      "label": "Best Match For You",
      "price": 540.00,
      "pricePerNight": 270.00,
      "matchingFeaturesCount": 5,
      "summary": "Matches your request for ocean view, fireplace, and quiet location."
    },
    {
      "id": "pkg_oceanfront_room101",
      "packageId": "pkg_oceanfront",
      "roomId": "room_101",
      "name": "Oceanfront Retreat - The Mariner Suite",
      "label": "Great Value",
      "price": 460.00,
      "pricePerNight": 230.00,
      "matchingFeaturesCount": 4,
      "summary": "Includes ocean view and private balcony at an excellent price."
    }
  ]
}
```

**_meta** (shown ONLY to UI, not model):
```json
{
  "recommendationsById": {
    "pkg_romantic_room201": {
      "roomDetails": {
        "roomNumber": "201",
        "roomName": "Serenity Suite",
        "floor": 2,
        "capacity": 2
      },
      "matchingFeatures": [
        {
          "code": "OCEAN_VIEW",
          "name": "Ocean View",
          "imageUrl": "https://cdn.example.com/ocean-view.jpg",
          "type": "view"
        },
        {
          "code": "FIREPLACE",
          "name": "In-Room Fireplace",
          "imageUrl": "https://cdn.example.com/fireplace.jpg",
          "type": "amenity"
        },
        {
          "code": "QUIET_FLOOR",
          "name": "Quiet Floor Location",
          "imageUrl": "https://cdn.example.com/quiet-floor.jpg",
          "type": "intangible"
        }
      ],
      "allFeatures": [
        /* ... full feature list with images ... */
      ],
      "priceBreakdown": {
        "basePrice": 200.00,
        "featureSurcharges": 70.00,
        "nights": 2,
        "subtotal": 540.00,
        "taxes": 54.00,
        "total": 594.00
      },
      "images": [
        "https://cdn.example.com/room201-main.jpg",
        "https://cdn.example.com/room201-bathroom.jpg",
        "https://cdn.example.com/room201-view.jpg"
      ]
    },
    "pkg_oceanfront_room101": {
      /* ... similar structure ... */
    }
  },
  "searchContext": {
    "arrival": "2025-03-15",
    "departure": "2025-03-17",
    "guests": 2,
    "requestedFeatures": ["OCEAN_VIEW", "QUIET_FLOOR", "ROMANTIC"]
  }
}
```

**Error Scenarios:**

| Error Condition | HTTP Status | Response |
|----------------|-------------|----------|
| Invalid date format | 400 | `{"error": "Invalid date format. Use ISO 8601 (YYYY-MM-DD)"}` |
| Past date | 400 | `{"error": "Arrival date must be today or in the future"}` |
| No availability | 200 | `{"recommendations": [], "message": "No rooms available for selected dates"}` |
| Database error | 500 | `{"error": "Unable to retrieve recommendations. Please try again."}` |
| Invalid feature code | 200 | Log warning, ignore invalid code, process valid ones |

#### 3.2.2 create_booking Tool

**Purpose**: Finalize a booking for a selected stay option.

**Tool Descriptor:**
```
Name: "create_booking"
Title: "Create Booking"
Description: "Finalizes a hotel booking for the selected stay option. Requires guest details and confirmation."
```

**Input Schema:**
```javascript
{
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
}
```

**Validation Rules:**
- All guest fields required except `specialRequests`
- Email must match pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- Phone must be valid (basic format check)
- Special requests sanitized for XSS

**Metadata (_meta):**
```javascript
{
  "openai/outputTemplate": "ui://widget/gauvendi-recommendations.html",
  "openai/widgetAccessible": true, // Widget can call this directly!
  "openai/toolInvocation/invoking": "Confirming your booking...",
  "openai/toolInvocation/invoked": "Your booking is confirmed!"
}
```

**Transaction Flow:**

1. **Validation Phase**:
   - Validate all input fields
   - Check guest count matches room capacity

2. **Availability Check**:
   - Query `availability` table for room_id and date range
   - Ensure all dates show `is_booked = false`
   - Use database transaction lock to prevent race conditions

3. **Price Calculation**:
   - Fetch base rate from `rates` table
   - Add feature surcharges
   - Apply package modifier
   - Calculate taxes (example: 10%)

4. **Booking Creation**:
   - Generate unique confirmation number (e.g., "BK" + timestamp + random)
   - Insert record into `bookings` table
   - Update `availability` table: set `is_booked = true` for date range

5. **Confirmation**:
   - Return booking confirmation
   - (Future: Trigger email/SMS notification)

**Response Structure:**

**structuredContent** (success):
```json
{
  "bookingConfirmed": true,
  "confirmationNumber": "BK20250314001",
  "message": "Your booking is confirmed!",
  "details": {
    "roomName": "Serenity Suite",
    "packageName": "Romantic Getaway",
    "arrival": "2025-03-15",
    "departure": "2025-03-17",
    "nights": 2,
    "totalPrice": 594.00,
    "guestName": "Emma Thompson"
  }
}
```

**_meta** (success):
```json
{
  "bookingDetails": {
    "confirmationNumber": "BK20250314001",
    "bookingId": "booking_xyz123",
    "checkInTime": "15:00",
    "checkOutTime": "11:00",
    "cancellationPolicy": "Free cancellation until 48 hours before arrival",
    "contactPhone": "+1-555-HOTEL-1",
    "hotelAddress": "123 Ocean Drive, Beachtown, ST 12345"
  },
  "nextSteps": [
    "Check your email for booking confirmation",
    "Save your confirmation number: BK20250314001",
    "Call us at +1-555-HOTEL-1 for any changes"
  ]
}
```

**Error Scenarios:**

| Error Condition | Response |
|----------------|----------|
| Room unavailable | `{"error": "This room is no longer available for the selected dates"}` |
| Invalid guest info | `{"error": "Invalid email address format"}` |
| Booking conflict | `{"error": "Another booking was just created for this room. Please select another option."}` |
| Payment failure (future) | `{"error": "Payment processing failed. Please check your payment method."}` |
| Database error | `{"error": "Unable to complete booking. Please try again or contact support."}` |

---

### 3.3 Feature Mapping Logic

#### 3.3.1 Natural Language to Feature Code Translation

The MCP server (or ChatGPT model) must translate user intent into `featurePriorities` array.

**Mapping Table:**

| User Intent Keywords | Maps to Feature Codes |
|---------------------|----------------------|
| "ocean view", "sea view", "waterfront" | OCEAN_VIEW |
| "balcony", "terrace", "patio" | BALCONY |
| "quiet", "peaceful", "silent" | QUIET_FLOOR |
| "romantic", "anniversary", "honeymoon" | FIREPLACE, LARGE_BATHTUB, OCEAN_VIEW |
| "business", "work", "corporate" | WORK_DESK, QUIET_FLOOR, HIGH_SPEED_WIFI |
| "family", "kids", "children" | SOFA_BED, CONNECTING_ROOM, KITCHENETTE |
| "luxury", "premium", "high-end" | HIGH_FLOOR, FIREPLACE, OCEAN_VIEW, KING_BED |
| "relax", "spa", "wellness" | LARGE_BATHTUB, QUIET_FLOOR, GARDEN_VIEW |
| "wifi", "internet" | HIGH_SPEED_WIFI |
| "workspace", "desk" | WORK_DESK |

**Implementation Note**: ChatGPT's model handles most intent extraction automatically. The MCP server receives already-mapped feature codes in most cases.

#### 3.3.2 Synonym Handling

For robustness, the MCP server can implement fuzzy matching:
- "bathtub" → LARGE_BATHTUB
- "coffee" → NESPRESSO_MACHINE
- "accessible" → WHEELCHAIR_ACCESS
- "pet" → PET_FRIENDLY

---

### 3.4 Authentication Integration Points

**For Production Deployment:**

1. **OAuth 2.1 Flow**:
   - Register OAuth provider in MCP server metadata
   - Provide authorization and token endpoints
   - Handle callback with authorization code
   - Exchange code for access token

2. **Authenticated Tool Calls**:
   - ChatGPT includes access token in MCP request headers
   - Server validates token with OAuth provider
   - Server associates booking with authenticated user

3. **Anonymous Mode** (Demo):
   - Tools marked with `securitySchemes: [{ type: "noauth" }]`
   - No authentication required for testing

**Implementation Note**: This demo uses `noauth` for simplicity. Production requires OAuth integration.

---

### 3.5 Rate Limiting & Caching Strategy

#### Rate Limiting:
- **Per-user limits**: 10 `find_stay_options` calls per minute, 5 `create_booking` per hour
- **Implementation**: Use `_meta["openai/subject"]` (anonymized user ID) for tracking
- **Response on limit**: HTTP 429 with `Retry-After` header

#### Caching:
- **Availability cache**: Cache availability queries for 60 seconds (reduce DB load)
- **Feature catalog cache**: Cache features table (changes infrequently)
- **Invalidation**: Clear cache on booking creation or admin updates

---

## 4. Web Component Specifications

### 4.1 Component Architecture Overview

The web component is a React application that:
- Renders inside a sandboxed iframe in ChatGPT
- Reads data from `window.openai.toolOutput` and `window.openai.toolResponseMetadata`
- Persists UI state via `window.openai.setWidgetState`
- Calls MCP tools via `window.openai.callTool`

**Technology Stack:**
- React 18+
- CSS-in-JS or Tailwind CSS for styling
- Bundled with esbuild or Vite
- No external state management library needed (use window.openai)

---

### 4.2 Screen Definitions

#### 4.2.1 Recommendation List View (Primary Screen)

**Purpose**: Display curated stay options as interactive cards.

**Layout**:
```
┌─────────────────────────────────────────────┐
│  Stay Recommendations for Mar 15-17, 2025  │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │  [Best Match For You]               │   │
│  │  Romantic Getaway - Serenity Suite  │   │
│  │  ✓ Ocean View  ✓ Fireplace          │   │
│  │  ✓ Quiet Floor ✓ Luxury Bathtub     │   │
│  │  $270/night • 2 nights = $540       │   │
│  │  [View Details] [Book Now]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [Great Value]                      │   │
│  │  Oceanfront Retreat - Mariner Suite│   │
│  │  ✓ Ocean View  ✓ Balcony            │   │
│  │  $230/night • 2 nights = $460       │   │
│  │  [View Details] [Book Now]          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Data Source**: `window.openai.toolOutput.recommendations`

**Card Components**:
- **Recommendation Label**: Badge showing "Best Match", "Great Value", etc.
- **Package Name**: Display name combining package + room name
- **Feature Tags**: Visual chips/badges for each matching feature (✓ icon + feature name)
- **Pricing**: Price per night, total nights, total price
- **Action Buttons**: "View Details" (expands card), "Book Now" (calls create_booking)

**Interaction**:
- Clicking "View Details" expands card to show Expanded Package Detail View
- Clicking "Book Now" opens booking form modal or inline form

#### 4.2.2 Expanded Package Detail View

**Purpose**: Show comprehensive information about a selected stay option.

**Layout** (accordion-style expansion):
```
┌─────────────────────────────────────────────┐
│  [Best Match For You] ▼                     │
│  Romantic Getaway - Serenity Suite          │
├─────────────────────────────────────────────┤
│  [Image Gallery: 3 photos]                  │
│  [Main Image: Ocean View from Room 201]     │
│  [Thumbnail 1] [Thumbnail 2] [Thumbnail 3]  │
├─────────────────────────────────────────────┤
│  Room Features:                             │
│  ✓ Ocean View       ✓ Fireplace             │
│  ✓ Quiet Floor      ✓ Luxury Bathtub        │
│  ✓ King Size Bed    ✓ Nespresso Machine     │
│  ✓ Smart TV         ✓ High-Speed WiFi       │
├─────────────────────────────────────────────┤
│  Price Breakdown:                           │
│  Base Rate:         $200/night × 2 = $400   │
│  Feature Surcharges: $70/night × 2 = $140   │
│  Subtotal:                           $540   │
│  Taxes (10%):                         $54   │
│  Total:                              $594   │
├─────────────────────────────────────────────┤
│  Room Details:                              │
│  • Room 201, 2nd Floor                      │
│  • Accommodates 2 guests                    │
│  • Check-in: 3:00 PM, Check-out: 11:00 AM  │
│  • Free cancellation until 48hrs before     │
├─────────────────────────────────────────────┤
│  [Collapse Details] [Book Now]              │
└─────────────────────────────────────────────┘
```

**Data Source**: `window.openai.toolResponseMetadata.recommendationsById[id]`

**Components**:
- **Image Gallery**: Carousel or grid showing room photos (from _meta.images)
- **Feature List**: All features with icons/images (from _meta.allFeatures)
- **Price Breakdown**: Itemized pricing (from _meta.priceBreakdown)
- **Room Details**: Capacity, floor, policies (from _meta.roomDetails)

**Interaction**:
- Clicking "Collapse Details" returns to compact card view
- Clicking "Book Now" opens booking form

**State Management**: Store expanded card ID in `widgetState`:
```javascript
{
  expandedRecommendationId: "pkg_romantic_room201" | null
}
```

#### 4.2.3 Booking Form / Confirmation View

**Purpose**: Collect guest details and finalize booking.

**Layout** (modal or inline form):
```
┌─────────────────────────────────────────────┐
│  Complete Your Booking                      │
├─────────────────────────────────────────────┤
│  Stay Details:                              │
│  Romantic Getaway - Serenity Suite          │
│  Mar 15-17, 2025 (2 nights)                 │
│  Total: $594.00                             │
├─────────────────────────────────────────────┤
│  Guest Information:                         │
│  First Name:  [________________]            │
│  Last Name:   [________________]            │
│  Email:       [________________]            │
│  Phone:       [________________]            │
│  Adults:      [▼ 2]  Children: [▼ 0]       │
│  Special Requests (optional):               │
│  [_________________________________]        │
│  [_________________________________]        │
├─────────────────────────────────────────────┤
│  [Cancel]  [Confirm Booking]                │
└─────────────────────────────────────────────┘
```

**Interaction**:
1. User fills form fields
2. Click "Confirm Booking"
3. Form validation (client-side)
4. Call `window.openai.callTool('create_booking', payload)`
5. Show loading state ("Confirming your booking...")
6. On success: transition to Confirmation Success View
7. On error: show error message inline

**State Management**: Store form data in local component state (not widgetState, sensitive data)

#### 4.2.4 Booking Confirmation Success View

**Purpose**: Confirm successful booking with details and next steps.

**Layout**:
```
┌─────────────────────────────────────────────┐
│  ✓ Booking Confirmed!                       │
├─────────────────────────────────────────────┤
│  Confirmation Number: BK20250314001         │
│  (Save this number for your records)        │
├─────────────────────────────────────────────┤
│  Your Stay:                                 │
│  Romantic Getaway - Serenity Suite          │
│  Room 201, 2nd Floor                        │
│  Mar 15-17, 2025 (2 nights)                 │
│  Guest: Emma Thompson                       │
│  Total Paid: $594.00                        │
├─────────────────────────────────────────────┤
│  Next Steps:                                │
│  • Check your email for confirmation        │
│  • Check-in: 3:00 PM on Mar 15              │
│  • Check-out: 11:00 AM on Mar 17            │
│  • Need help? Call +1-555-HOTEL-1           │
├─────────────────────────────────────────────┤
│  [View Another Stay] [Done]                 │
└─────────────────────────────────────────────┘
```

**Data Source**: `window.openai.toolOutput` (from create_booking response)

**Interaction**:
- "View Another Stay": Reset component to search again (call find_stay_options)
- "Done": User returns to main ChatGPT conversation

#### 4.2.5 Loading State

**Purpose**: Provide feedback while data loads or tools execute.

**Display**:
```
┌─────────────────────────────────────────────┐
│  [Spinner Animation]                        │
│  Finding the perfect stay for you...        │
└─────────────────────────────────────────────┘
```

**Trigger**: When `window.openai.toolOutput === null` initially, or during `callTool` execution.

**Implementation**: Show loading spinner and message from tool metadata (`openai/toolInvocation/invoking`).

#### 4.2.6 Error State

**Purpose**: Handle and display errors gracefully.

**Display**:
```
┌─────────────────────────────────────────────┐
│  ⚠ Unable to Load Recommendations           │
│  We encountered an issue retrieving stay    │
│  options. Please try again or contact       │
│  support at +1-555-HOTEL-1.                 │
│  [Try Again]                                │
└─────────────────────────────────────────────┘
```

**Error Types**:
- **Network Error**: "Connection lost. Check your internet and try again."
- **No Results**: "No rooms available for your dates. Try different dates or adjust your preferences."
- **Booking Failed**: "Unable to complete booking. The room may no longer be available."
- **Invalid Input**: "Please check your guest information and try again."

**Interaction**: "Try Again" button calls `window.openai.callTool` again or refreshes component.

#### 4.2.7 Empty State

**Purpose**: Handle scenario where no recommendations match criteria.

**Display**:
```
┌─────────────────────────────────────────────┐
│  No Rooms Available                         │
│  We couldn't find rooms matching your       │
│  preferences for Mar 15-17, 2025.           │
│                                             │
│  Suggestions:                               │
│  • Try different dates                      │
│  • Adjust your feature preferences          │
│  • Contact us at +1-555-HOTEL-1             │
│  [Search Again]                             │
└─────────────────────────────────────────────┘
```

**Trigger**: When `recommendations` array is empty but no error occurred.

---

### 4.3 User Flow Diagrams

#### 4.3.1 Primary Booking Flow

```
User Prompt
    ↓
ChatGPT calls find_stay_options
    ↓
MCP Server returns recommendations
    ↓
[Screen: Recommendation List View]
    ↓
User clicks "View Details" on a card
    ↓
[Screen: Expanded Package Detail View]
    ↓
User clicks "Book Now"
    ↓
[Screen: Booking Form]
    ↓
User fills form and clicks "Confirm Booking"
    ↓
Component calls window.openai.callTool('create_booking')
    ↓
[Screen: Loading State] "Confirming your booking..."
    ↓
MCP Server processes booking
    ↓
Success?
    ├─ Yes → [Screen: Booking Confirmation Success]
    └─ No → [Screen: Error State] → User retries or cancels
```

#### 4.3.2 Search Refinement Flow (Future Enhancement)

```
[Screen: Recommendation List View]
    ↓
User sees results but wants to refine
    ↓
User clicks "Refine Search" or sends follow-up message
    ↓
ChatGPT calls find_stay_options with updated parameters
    ↓
[Screen: Loading State]
    ↓
[Screen: Recommendation List View] (refreshed with new results)
```

#### 4.3.3 Error Recovery Flow

```
[Screen: Recommendation List View]
    ↓
User clicks "Book Now"
    ↓
[Screen: Booking Form]
    ↓
User submits form
    ↓
create_booking fails (room unavailable)
    ↓
[Screen: Error State] "This room is no longer available"
    ↓
User clicks "View Other Options"
    ↓
[Screen: Recommendation List View] (original results, minus unavailable room)
    ↓
User selects alternate option
```

---

### 4.4 Data Contracts

#### 4.4.1 window.openai.toolOutput Structure

**From find_stay_options:**
```typescript
interface ToolOutputFindStay {
  recommendations: Array<{
    id: string;                    // e.g., "pkg_romantic_room201"
    packageId: string;             // e.g., "pkg_romantic"
    roomId: string;                // e.g., "room_201"
    name: string;                  // Display name
    label: string;                 // "Best Match For You", "Great Value", etc.
    price: number;                 // Total price for stay
    pricePerNight: number;         // Price per night
    matchingFeaturesCount: number; // Number of matched features
    summary: string;               // 1-2 sentence explanation
  }>;
}
```

**From create_booking:**
```typescript
interface ToolOutputBooking {
  bookingConfirmed: boolean;
  confirmationNumber: string;
  message: string;
  details: {
    roomName: string;
    packageName: string;
    arrival: string;         // ISO date
    departure: string;       // ISO date
    nights: number;
    totalPrice: number;
    guestName: string;
  };
}
```

#### 4.4.2 window.openai.toolResponseMetadata Structure

**From find_stay_options (_meta):**
```typescript
interface ToolResponseMetadata {
  recommendationsById: {
    [recommendationId: string]: {
      roomDetails: {
        roomNumber: string;
        roomName: string;
        floor: number;
        capacity: number;
      };
      matchingFeatures: Array<{
        code: string;
        name: string;
        imageUrl: string;
        type: string;
      }>;
      allFeatures: Array<{
        code: string;
        name: string;
        imageUrl: string;
        type: string;
        description: string;
      }>;
      priceBreakdown: {
        basePrice: number;
        featureSurcharges: number;
        nights: number;
        subtotal: number;
        taxes: number;
        total: number;
      };
      images: string[];  // Array of image URLs
    };
  };
  searchContext: {
    arrival: string;
    departure: string;
    guests: number;
    requestedFeatures: string[];
  };
}
```

**From create_booking (_meta):**
```typescript
interface BookingMetadata {
  bookingDetails: {
    confirmationNumber: string;
    bookingId: string;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    contactPhone: string;
    hotelAddress: string;
  };
  nextSteps: string[];
}
```

#### 4.4.3 window.openai.widgetState Schema

```typescript
interface WidgetState {
  // Current UI view state
  expandedRecommendationId: string | null;

  // User selections (not sensitive data)
  selectedPackageId: string | null;
  selectedRoomId: string | null;

  // UI preferences
  viewMode: 'list' | 'grid';  // Future enhancement
  sortBy: 'match' | 'price';   // Future enhancement
}
```

**State Persistence**:
- Call `window.openai.setWidgetState(newState)` after every state-changing interaction
- State is persisted by ChatGPT and rehydrated on widget reload
- State is message-scoped (doesn't carry across new tool calls)

---

### 4.5 Interaction Specifications

#### 4.5.1 Card Expansion/Collapse

**Behavior**: Accordion-style (only one card expanded at a time)

**Implementation**:
1. User clicks "View Details" on a card
2. Component updates `widgetState.expandedRecommendationId = card.id`
3. Calls `window.openai.setWidgetState(updatedState)`
4. Card animates expansion (CSS transition)
5. Other cards remain collapsed

**Collapse**:
1. User clicks "Collapse Details" or clicks another card
2. Component sets `widgetState.expandedRecommendationId = null` (or new card ID)
3. Card animates back to compact view

#### 4.5.2 Feature Tag Display

**Visual Design**:
- Matching features: Green checkmark ✓ + feature name (bold)
- Non-matching features (in expanded view): Gray text + feature name
- Icon or small thumbnail image for each feature (from _meta.images)

**Layout**: Flex wrap layout, tags flow horizontally and wrap to next line

#### 4.5.3 Booking Button Behavior

**"Book Now" Button**:
- **State**: Enabled by default, disabled during booking process
- **Action**: Opens booking form (modal or inline expansion)
- **Loading State**: Button shows spinner and text "Booking..."
- **Success**: Button hidden after successful booking
- **Error**: Button re-enabled, error message displayed above

**"Confirm Booking" Button** (in booking form):
- **Validation**: Client-side validation before calling tool
  - Check all required fields filled
  - Validate email format
  - Validate phone format
- **Action**: Calls `window.openai.callTool('create_booking', formData)`
- **Loading**: Show spinner, disable button, display "Confirming..."
- **Success**: Transition to confirmation screen
- **Error**: Show error message, re-enable button

---

### 4.6 Responsive Design Considerations

**Mobile Layout** (< 640px):
- Single-column card layout
- Stacked buttons (vertical)
- Simplified feature tags (show top 4, "+ X more")
- Collapsed price breakdown by default

**Tablet Layout** (640px - 1024px):
- Two-column card layout (if space allows)
- Full feature tags visible

**Desktop Layout** (> 1024px):
- Two or three-column card layout
- Side-by-side comparison view (future enhancement)
- Larger images in expanded view

**Accessibility**:
- Keyboard navigation support (Tab, Enter, Escape)
- ARIA labels for screen readers
- Sufficient color contrast (WCAG AA)
- Focus indicators on interactive elements

---

## 5. Data Flow & Integration

### 5.1 Request-Response Cycles

#### Cycle 1: Initial Recommendation Request

```
1. User: "Find me a romantic room with ocean view for March 15-17"
   ↓
2. ChatGPT Model:
   - Parses intent: romantic → [FIREPLACE, LARGE_BATHTUB, OCEAN_VIEW]
   - Extracts: arrival=2025-03-15, departure=2025-03-17, guests=2
   ↓
3. ChatGPT calls MCP Tool: find_stay_options
   Request:
   {
     "arrival": "2025-03-15",
     "departure": "2025-03-17",
     "numberOfAdults": 2,
     "featurePriorities": ["OCEAN_VIEW", "FIREPLACE", "LARGE_BATHTUB"]
   }
   ↓
4. MCP Server:
   - Queries database for available rooms
   - Scores rooms by feature matching
   - Ranks results
   - Generates recommendations
   ↓
5. MCP Server Response:
   {
     "structuredContent": { recommendations: [...] },
     "_meta": { recommendationsById: {...}, searchContext: {...} }
   }
   ↓
6. ChatGPT:
   - Renders widget with toolOutput and toolResponseMetadata
   - Narrates: "I found 2 great options for you..."
   ↓
7. Widget:
   - Reads window.openai.toolOutput.recommendations
   - Renders Recommendation List View
   - Displays cards with matching features highlighted
```

#### Cycle 2: Booking Request from Widget

```
1. User: Clicks "Book Now" on a card, fills form, clicks "Confirm"
   ↓
2. Widget:
   - Validates form inputs
   - Calls window.openai.callTool('create_booking', formData)
   ↓
3. ChatGPT forwards call to MCP Server: create_booking
   Request:
   {
     "recommendationId": "pkg_romantic_room201",
     "packageId": "pkg_romantic",
     "roomId": "room_201",
     "arrival": "2025-03-15",
     "departure": "2025-03-17",
     "guestDetails": { firstName: "Emma", ... }
   }
   ↓
4. MCP Server:
   - Validates availability (database transaction)
   - Creates booking record
   - Updates availability table
   - Generates confirmation number
   ↓
5. MCP Server Response:
   {
     "structuredContent": { bookingConfirmed: true, ... },
     "_meta": { bookingDetails: {...}, nextSteps: [...] }
   }
   ↓
6. Widget:
   - Receives response via callTool promise resolution
   - Updates toolOutput (ChatGPT injects new data)
   - Transitions to Booking Confirmation Success View
   ↓
7. ChatGPT:
   - Narrates: "Your booking is confirmed! Confirmation number BK20250314001."
```

---

### 5.2 State Management Patterns

#### Component State Hierarchy

```
┌─────────────────────────────────────────┐
│  window.openai (Host-Managed)           │
│  ├── toolOutput (Server Data)           │
│  ├── toolResponseMetadata (_meta)       │
│  ├── widgetState (Persisted UI State)   │
│  └── theme, locale, displayMode, etc.   │
└─────────────────────────────────────────┘
         ↓ Read by
┌─────────────────────────────────────────┐
│  React Component (Local State)          │
│  ├── Form inputs (ephemeral)            │
│  ├── Loading flags (ephemeral)          │
│  ├── Error messages (ephemeral)         │
│  └── Derived data (computed)            │
└─────────────────────────────────────────┘
         ↓ Write to
┌─────────────────────────────────────────┐
│  window.openai.setWidgetState()         │
│  (Persists expandedCardId, etc.)        │
└─────────────────────────────────────────┘
```

**Key Principles**:
1. **Server data is authoritative**: `toolOutput` is source of truth for recommendations and bookings
2. **UI state is ephemeral**: `widgetState` stores only UI preferences (expanded card, view mode)
3. **Sensitive data never in widgetState**: Guest details, payment info stay in local component state
4. **Rehydration on load**: Component reads `widgetState` on mount to restore UI state

---

### 5.3 Error Propagation

#### Error Handling Layers

**Layer 1: MCP Server**
- Database errors → Return HTTP 500 with generic message
- Business logic errors (no availability) → Return HTTP 200 with empty results
- Validation errors → Return HTTP 400 with specific field errors

**Layer 2: ChatGPT Host**
- Network timeouts → Retry logic (2 retries with exponential backoff)
- MCP server unreachable → Display "Service temporarily unavailable"

**Layer 3: Widget Component**
- Parse response errors → Show "Unable to load data"
- callTool failures → Display error from server response
- Client-side validation → Inline error messages on form fields

#### Error Message Standards

| Error Type | User Message | Technical Log |
|-----------|--------------|---------------|
| Network failure | "Connection lost. Please try again." | `NetworkError: fetch failed to ${url}` |
| No availability | "No rooms available for selected dates. Try different dates." | `BusinessLogic: 0 results for query ${params}` |
| Booking conflict | "This room is no longer available. Please select another." | `ConflictError: Room ${roomId} booked between ${start}-${end}` |
| Invalid input | "Please check your email address." | `ValidationError: Invalid email format` |
| Server error | "Something went wrong. Please contact support." | `ServerError: ${statusCode} ${message}` |

---

### 5.4 Integration with GauVendi Production Systems

#### Integration Points

**1. Inventory Sync**:
- **Approach**: Real-time API integration OR nightly batch sync
- **Direction**: GauVendi → MCP Database (one-way read for demo)
- **API Endpoint**: `GET /api/v1/inventory` (hypothetical)
- **Frequency**: Every 15 minutes (for near-real-time availability)

**2. Booking Creation**:
- **Approach**: MCP Server → GauVendi Booking API
- **Direction**: Bidirectional (create booking, receive confirmation)
- **API Endpoint**: `POST /api/v1/bookings` (hypothetical)
- **Payload**: Booking details + guest info
- **Response**: Confirmation number + booking ID

**3. Payment Processing** (Future):
- **Approach**: MCP Server → Payment Gateway (Stripe, Braintree, etc.)
- **Flow**: Tokenize payment → Charge → Confirm booking
- **Security**: PCI compliance required, use payment gateway SDK

**4. Notification Services**:
- **Email**: SendGrid or AWS SES for confirmation emails
- **SMS**: Twilio for booking confirmations
- **Trigger**: After successful booking creation

---

## 6. Error Handling & Validation

### 6.1 Input Validation Rules

#### find_stay_options Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| arrival | Must be ISO 8601 date | "Invalid date format. Use YYYY-MM-DD" |
| arrival | Must be >= today | "Arrival date must be today or in the future" |
| departure | Must be > arrival | "Departure must be after arrival" |
| departure - arrival | Must be <= 30 days | "Maximum stay duration is 30 days" |
| numberOfAdults | Must be >= 1 | "At least 1 adult required" |
| numberOfAdults + numberOfChildren | Must be <= 6 | "Maximum 6 guests per room" |
| featurePriorities | Array length <= 10 | "Too many feature filters" |

#### create_booking Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| firstName | 1-50 chars, letters only | "First name must be 1-50 letters" |
| lastName | 1-50 chars, letters only | "Last name must be 1-50 letters" |
| email | Valid email format | "Please enter a valid email address" |
| phone | Valid phone format | "Please enter a valid phone number" |
| specialRequests | Max 500 chars | "Special requests too long (max 500 characters)" |

---

### 6.2 Error Message Catalog

| Error Code | Category | User Message | Recovery Action |
|-----------|----------|--------------|----------------|
| ERR_NETWORK_FAILURE | Network | "Connection lost. Check internet and try again." | Retry button |
| ERR_NO_AVAILABILITY | Business | "No rooms available for selected dates." | Suggest different dates |
| ERR_ROOM_BOOKED | Conflict | "This room was just booked. Please choose another." | Return to results |
| ERR_INVALID_EMAIL | Validation | "Invalid email format." | Fix inline |
| ERR_SERVER_ERROR | Server | "Something went wrong. Contact support at +1-555-HOTEL-1." | Contact support |
| ERR_PAYMENT_FAILED | Payment | "Payment processing failed. Check payment method." | Update payment |
| ERR_TIMEOUT | Network | "Request timed out. Please try again." | Retry button |

---

### 6.3 Fallback Strategies

#### Database Unavailable
- **Fallback**: Return cached recommendations (stale data warning)
- **User Message**: "Showing recent results. Availability may have changed."

#### Payment Gateway Down
- **Fallback**: Create "pending" booking, process payment later
- **User Message**: "Booking created. Payment will be processed within 24 hours."

#### No Recommendations Found
- **Fallback**: Suggest nearby dates or relaxed criteria
- **User Message**: "No exact matches. Here are close alternatives..."

---

## 7. Appendices

### Appendix A: Complete Feature Code Master List

| Feature Code | Name | Type | Surcharge |
|-------------|------|------|-----------|
| OCEAN_VIEW | Ocean View | view | $50.00 |
| CITY_VIEW | City View | view | $20.00 |
| GARDEN_VIEW | Garden View | view | $15.00 |
| CORNER_VIEW | Corner Room View | view | $30.00 |
| BALCONY | Private Balcony | amenity | $40.00 |
| FIREPLACE | In-Room Fireplace | amenity | $60.00 |
| LARGE_BATHTUB | Luxury Bathtub | amenity | $35.00 |
| NESPRESSO_MACHINE | Nespresso Machine | amenity | $10.00 |
| MINIBAR | Premium Minibar | amenity | $15.00 |
| WORK_DESK | Executive Work Desk | amenity | $0.00 |
| KITCHENETTE | Full Kitchenette | amenity | $45.00 |
| KING_BED | King Size Bed | bedding | $0.00 |
| QUEEN_BED | Queen Size Bed | bedding | $0.00 |
| TWIN_BEDS | Two Twin Beds | bedding | $0.00 |
| SOFA_BED | Sofa Bed | bedding | $20.00 |
| SMART_TV | 55" Smart TV | tech | $0.00 |
| HIGH_SPEED_WIFI | High-Speed WiFi | tech | $0.00 |
| BLUETOOTH_SPEAKER | Bluetooth Speaker | tech | $5.00 |
| USB_CHARGING_PORTS | Multiple USB Ports | tech | $0.00 |
| QUIET_FLOOR | Quiet Floor Location | intangible | $25.00 |
| PET_FRIENDLY | Pet-Friendly Room | intangible | $30.00 |
| WHEELCHAIR_ACCESS | Wheelchair Accessible | intangible | $0.00 |
| CONNECTING_ROOM | Connecting Room Available | intangible | $0.00 |
| HIGH_FLOOR | High Floor (3+) | location | $20.00 |
| POOLSIDE | Near Swimming Pool | location | $25.00 |

---

### Appendix B: Sample MCP Tool Response (Full JSON)

**find_stay_options Response:**

```json
{
  "structuredContent": {
    "recommendations": [
      {
        "id": "pkg_romantic_room201",
        "packageId": "pkg_romantic",
        "roomId": "room_201",
        "name": "Romantic Getaway - Serenity Suite",
        "label": "Best Match For You",
        "price": 540.00,
        "pricePerNight": 270.00,
        "matchingFeaturesCount": 5,
        "summary": "Perfect for your anniversary! This suite features an ocean view, in-room fireplace, luxury bathtub, and quiet floor location."
      },
      {
        "id": "pkg_oceanfront_room101",
        "packageId": "pkg_oceanfront",
        "roomId": "room_101",
        "name": "Oceanfront Retreat - The Mariner Suite",
        "label": "Great Value",
        "price": 460.00,
        "pricePerNight": 230.00,
        "matchingFeaturesCount": 3,
        "summary": "Enjoy stunning ocean views and a private balcony at an excellent price point."
      }
    ]
  },
  "_meta": {
    "recommendationsById": {
      "pkg_romantic_room201": {
        "roomDetails": {
          "roomNumber": "201",
          "roomName": "Serenity Suite",
          "floor": 2,
          "capacity": 2
        },
        "matchingFeatures": [
          {
            "code": "OCEAN_VIEW",
            "name": "Ocean View",
            "imageUrl": "https://cdn.gauvendi.example.com/features/ocean-view.jpg",
            "type": "view",
            "description": "Breathtaking panoramic ocean views from your room."
          },
          {
            "code": "FIREPLACE",
            "name": "In-Room Fireplace",
            "imageUrl": "https://cdn.gauvendi.example.com/features/fireplace.jpg",
            "type": "amenity",
            "description": "Cozy gas fireplace for a romantic ambiance."
          },
          {
            "code": "LARGE_BATHTUB",
            "name": "Luxury Bathtub",
            "imageUrl": "https://cdn.gauvendi.example.com/features/bathtub.jpg",
            "type": "amenity",
            "description": "Deep soaking tub perfect for relaxation."
          },
          {
            "code": "QUIET_FLOOR",
            "name": "Quiet Floor Location",
            "imageUrl": "https://cdn.gauvendi.example.com/features/quiet-floor.jpg",
            "type": "intangible",
            "description": "Located on a designated quiet floor for peace and tranquility."
          },
          {
            "code": "BALCONY",
            "name": "Private Balcony",
            "imageUrl": "https://cdn.gauvendi.example.com/features/balcony.jpg",
            "type": "amenity",
            "description": "Private outdoor space to enjoy the ocean breeze."
          }
        ],
        "allFeatures": [
          /* ... same as matchingFeatures plus additional features ... */
          {
            "code": "KING_BED",
            "name": "King Size Bed",
            "imageUrl": "https://cdn.gauvendi.example.com/features/king-bed.jpg",
            "type": "bedding",
            "description": "Plush king-size bed with premium linens."
          },
          {
            "code": "NESPRESSO_MACHINE",
            "name": "Nespresso Machine",
            "imageUrl": "https://cdn.gauvendi.example.com/features/nespresso.jpg",
            "type": "amenity",
            "description": "Enjoy barista-quality coffee in your room."
          },
          {
            "code": "SMART_TV",
            "name": "55\" Smart TV",
            "imageUrl": "https://cdn.gauvendi.example.com/features/smart-tv.jpg",
            "type": "tech",
            "description": "Stream your favorite shows and movies."
          },
          {
            "code": "HIGH_SPEED_WIFI",
            "name": "High-Speed WiFi",
            "imageUrl": "https://cdn.gauvendi.example.com/features/wifi.jpg",
            "type": "tech",
            "description": "Complimentary high-speed wireless internet."
          }
        ],
        "priceBreakdown": {
          "basePrice": 200.00,
          "featureSurcharges": 70.00,
          "nights": 2,
          "subtotal": 540.00,
          "taxes": 54.00,
          "total": 594.00
        },
        "images": [
          "https://cdn.gauvendi.example.com/rooms/room201-main.jpg",
          "https://cdn.gauvendi.example.com/rooms/room201-bathroom.jpg",
          "https://cdn.gauvendi.example.com/rooms/room201-view.jpg",
          "https://cdn.gauvendi.example.com/rooms/room201-fireplace.jpg"
        ]
      },
      "pkg_oceanfront_room101": {
        /* ... similar structure for second recommendation ... */
      }
    },
    "searchContext": {
      "arrival": "2025-03-15",
      "departure": "2025-03-17",
      "guests": 2,
      "requestedFeatures": ["OCEAN_VIEW", "FIREPLACE", "LARGE_BATHTUB", "ROMANTIC"]
    }
  },
  "content": [
    {
      "type": "text",
      "text": "I found 2 wonderful options for your romantic getaway from March 15-17. The Serenity Suite is a perfect match with all the features you're looking for, including an ocean view, fireplace, and luxury bathtub."
    }
  ]
}
```

---

### Appendix C: Database Seed Script (Sample)

**Simplified SQL for Demo Setup:**

```sql
-- Insert physical rooms
INSERT INTO physical_rooms (id, room_number, room_name, floor, base_capacity) VALUES
('room_101', '101', 'The Mariner Suite', 1, 2),
('room_201', '201', 'Serenity Suite', 2, 2),
('room_301', '301', 'Penthouse View', 3, 4),
('room_401', '401', 'Romantic Escape', 4, 2);

-- Insert features (subset)
INSERT INTO features (id, feature_code, name, description, type, surcharge) VALUES
('feat_001', 'OCEAN_VIEW', 'Ocean View', 'Breathtaking ocean views', 'view', 50.00),
('feat_005', 'BALCONY', 'Private Balcony', 'Outdoor private space', 'amenity', 40.00),
('feat_006', 'FIREPLACE', 'In-Room Fireplace', 'Cozy gas fireplace', 'amenity', 60.00),
('feat_020', 'QUIET_FLOOR', 'Quiet Floor Location', 'Peaceful environment', 'intangible', 25.00);

-- Link room_201 to its features
INSERT INTO room_features (room_id, feature_id) VALUES
('room_201', 'feat_001'),  -- OCEAN_VIEW
('room_201', 'feat_005'),  -- BALCONY
('room_201', 'feat_006'),  -- FIREPLACE
('room_201', 'feat_020');  -- QUIET_FLOOR

-- Create stay package
INSERT INTO stay_packages (id, package_code, name, description, base_price_modifier) VALUES
('pkg_romantic', 'ROMANTIC_GETAWAY', 'Romantic Getaway', 'Perfect for couples', 1.20);

-- Link package to required features
INSERT INTO package_required_features (package_id, feature_id) VALUES
('pkg_romantic', 'feat_006'),  -- FIREPLACE
('pkg_romantic', 'feat_001');  -- OCEAN_VIEW

-- Set availability (room_201 available Mar 15-17)
INSERT INTO availability (id, room_id, date, is_booked) VALUES
('avail_001', 'room_201', '2025-03-15', false),
('avail_002', 'room_201', '2025-03-16', false),
('avail_003', 'room_201', '2025-03-17', false);
```

---

### Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Attribute-Based Selling** | Marketing approach where products are sold by individual features rather than fixed categories |
| **MCP (Model Context Protocol)** | Open standard for connecting AI models to external tools and services |
| **Skybridge** | ChatGPT's widget sandboxing framework for rendering third-party UI components |
| **structuredContent** | JSON payload visible to both AI model and UI component |
| **_meta** | JSON payload visible only to UI component, hidden from AI model |
| **widgetState** | Persisted UI state scoped to a specific widget instance |
| **Stay Package** | Sellable product defined by a combination of room features |
| **Feature Code** | Machine-readable identifier for a room attribute (e.g., OCEAN_VIEW) |
| **Recommendation Label** | User-facing tag explaining why an option was suggested (e.g., "Best Match") |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-03-14 | Technical Team | Initial comprehensive technical specification |

---

**End of Technical Implementation Documentation**
