# Hero Image Selection & Overlay Logic Specification

## Overview

This document defines the complete logic for hero image selection and conditional overlay display on the home page hero section.

## Primary Hero Image Selection Criteria (ONLY 2 CRITERIA)

The hero section should **ONLY** display images that meet these two criteria:

1. **Event must be in the future** (`startDate >= today`)
2. **Media must have `isHomePageHeroImage = true``

**Result:** Only events meeting BOTH criteria + the default hero image should be displayed in rotation.

## Additional Filtering (Applied AFTER the 2 primary criteria)

These filters are applied to the events that already meet the primary criteria:

- **Time Window:** Events within 3 months (`startDate <= threeMonthsFromNow`)
- **Active Status:** Event must be active (`isActive = true`)

## Conditional Overlay Logic (Right Bottom Corner)

The overlay should be displayed based on the **current event being shown** and its specific requirements:

### 1. Buy Tickets Overlay
- **Show when:** `admissionType` contains "ticket", "paid", or "fee"
- **Image:** `/images/buy_tickets_click_here_red.webp`
- **Action:** Navigate to specific event page
- **Priority:** Highest

### 2. Registration Required Overlay
- **Show when:** `isRegistrationRequired = true`
- **Image:** `/images/register_here_button.png` (or similar)
- **Action:** Navigate to event registration page
- **Priority:** Second

### 3. Live Event Overlay
- **Show when:** `isLive = true`
- **Image:** `/images/watch_live_button.png` (or similar)
- **Action:** Navigate to live event page
- **Priority:** Third

### 4. Sports Event Overlay
- **Show when:** `isSportsEvent = true`
- **Image:** `/images/sports_event_button.png` (or similar)
- **Action:** Navigate to sports event page
- **Priority:** Fourth

## Implementation Requirements

### TypeScript Implementation

```typescript
// Primary selection - ONLY these 2 criteria
const heroEvents = events.filter(event => {
  const eventDate = event.startDate ? new Date(event.startDate) : null;
  return eventDate &&
         eventDate >= today &&
         event.thumbnailUrl; // This means isHomePageHeroImage = true
});

// Additional filtering
const upcomingEvents = heroEvents.filter(event => {
  const eventDate = event.startDate ? new Date(event.startDate) : null;
  return eventDate <= threeMonthsFromNow && event.isActive;
});

// Overlay logic based on current event
const getOverlayForEvent = (event) => {
  if (event.admissionType?.toLowerCase().includes('ticket') ||
      event.admissionType?.toLowerCase().includes('paid') ||
      event.admissionType?.toLowerCase().includes('fee')) {
    return { type: 'tickets', image: '/images/buy_tickets_click_here_red.webp' };
  }
  if (event.isRegistrationRequired) {
    return { type: 'registration', image: '/images/register_here_button.png' };
  }
  if (event.isLive) {
    return { type: 'live', image: '/images/watch_live_button.png' };
  }
  if (event.isSportsEvent) {
    return { type: 'sports', image: '/images/sports_event_button.png' };
  }
  return null; // No overlay
};
```

### React Component Structure

```tsx
// Hero image selection
const upcomingEvents = events
  .filter(event => {
    const eventDate = event.startDate ? new Date(event.startDate) : null;
    return eventDate &&
           eventDate >= today &&
           eventDate <= threeMonthsFromNow &&
           event.isActive &&
           event.thumbnailUrl; // isHomePageHeroImage = true
  })
  .sort((a, b) => {
    const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
    const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
    return aDate - bDate;
  });

// Overlay component
const EventOverlay = ({ event }) => {
  if (!event) return null;

  const overlay = getOverlayForEvent(event);
  if (!overlay) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Image
        src={overlay.image}
        alt={overlay.type}
        width={180}
        height={90}
        className="cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={() => {
          // Navigate based on overlay type
          window.location.href = `/events/${event.id}`;
        }}
      />
    </div>
  );
};
```

## Display Rules

1. **Hero Images:** Only events with `isHomePageHeroImage = true` + default image
2. **Overlay Priority:**
   - Tickets (highest priority)
   - Registration Required
   - Live Event
   - Sports Event
   - No overlay (if none of the above)
3. **Overlay Display:** Only show for the currently displayed event image
4. **Fallback:** Default hero image with no overlay

## Expected Behavior Examples

### Example 1: Ticketed Event
- **Event:** "KHNJ Mega Onam 2025"
- **Criteria:** `isHomePageHeroImage = true` + `admissionType = "ticketed"`
- **Result:** Show hero image + Buy Tickets overlay

### Example 2: Registration Required Event
- **Event:** "VIP Dinner"
- **Criteria:** `isHomePageHeroImage = true` + `isRegistrationRequired = true`
- **Result:** Show hero image + Registration overlay

### Example 3: Live Event
- **Event:** "Live Concert"
- **Criteria:** `isHomePageHeroImage = true` + `isLive = true`
- **Result:** Show hero image + Watch Live overlay

### Example 4: Sports Event
- **Event:** "Cricket Match"
- **Criteria:** `isHomePageHeroImage = true` + `isSportsEvent = true`
- **Result:** Show hero image + Sports Event overlay

### Example 5: Regular Event
- **Event:** "Cultural Program"
- **Criteria:** `isHomePageHeroImage = true` + no special requirements
- **Result:** Show hero image + No overlay

### Example 6: No Qualifying Events
- **Result:** Show default image + No overlay

## Database Requirements

### Event Details Table
```sql
-- Required fields for hero image selection
start_date DATE NOT NULL,
is_active BOOLEAN NOT NULL DEFAULT true,
is_registration_required BOOLEAN NOT NULL DEFAULT false,
is_live BOOLEAN NOT NULL DEFAULT false,
is_sports_event BOOLEAN NOT NULL DEFAULT false,
admission_type VARCHAR(50)
```

### Event Media Table
```sql
-- Required field for hero image selection
is_home_page_hero_image BOOLEAN NOT NULL DEFAULT false
```

## Testing Scenarios

1. **Test with multiple events having `isHomePageHeroImage = true`**
   - Verify only future events are selected
   - Verify correct overlay is shown for each event type

2. **Test with no events having `isHomePageHeroImage = true`**
   - Verify default image is shown
   - Verify no overlay is displayed

3. **Test with events having multiple overlay criteria**
   - Verify highest priority overlay is shown (tickets > registration > live > sports)

4. **Test with past events**
   - Verify past events are not selected even if they have `isHomePageHeroImage = true`

5. **Test with inactive events**
   - Verify inactive events are not selected even if they have `isHomePageHeroImage = true`

## File Locations

- **Main Component:** `src/components/HeroSection.tsx`
- **Types:** `src/types/index.ts`
- **Images:** `public/images/` directory
- **Documentation:** `documentation/hero-image-selection-overlay-logic.md`

## Notes

- The hero image rotation should include the default image as a fallback
- Overlay images should be optimized for web display
- All overlay buttons should have hover effects and proper accessibility
- The system should gracefully handle missing overlay images
- Console logging should be minimal in production builds
