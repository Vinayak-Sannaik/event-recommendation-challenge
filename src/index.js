/**
 * Calculate distance between two geographical points using Haversine formula
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
function calculateDistance(point1, point2) {
  // Check valid coordinates otherwise return error message and 0
  if (
    typeof point1.lat !== "number" ||
    typeof point1.lng !== "number" ||
    typeof point2.lat !== "number" ||
    typeof point2.lng !== "number"
  ) {
    return 0;
  }

  // Earth radius in kilometers
  const RADIUS = 6371;

  // Convert latitude and longitude from degrees to radians
  const latitude1Radians = (point1.lat * Math.PI) / 180;
  const latitude2Radians = (point2.lat * Math.PI) / 180;
  const differenceInLatitude = latitude2Radians - latitude1Radians;

  const longitude1Radians = (point1.lng * Math.PI) / 180;
  const longitude2Radians = (point2.lng * Math.PI) / 180;
  const differenceInLongitude = longitude2Radians - longitude1Radians;

  // Haversine formula
  const a =
    Math.sin(differenceInLatitude / 2) * Math.sin(differenceInLatitude / 2) +
    Math.cos(latitude1Radians) *
      Math.cos(latitude2Radians) *
      Math.sin(differenceInLongitude / 2) *
      Math.sin(differenceInLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Return distance in kilometers
  const distance = RADIUS * c;
  return distance;
}

/**
 * Recommend events for a user
 * @param {Object} user - User data including preferences and location
 * @param {Array} events - Array of event objects
 * @param {Object} eventSimilarity - Object mapping events to similar events
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} Array of recommended event objects
 */
function getRecommendedEvents(user, events, eventSimilarity, limit = 5) {

    const WEIGHAGE_1 = 0.35;
    const WEIGHAGE_2 = 0.25;
    const WEIGHAGE_3 = 0.20;

  // No events to recommend
  if (!events || events.length === 0) {
    return [];
  }

  const eventsMap = {};
  events.forEach((event) => {
    eventsMap[event.id] = event;
  });

  const attendedEventsSet = new Set(user.attendedEvents || []);

  // Step 1: Calculate scores for all events
  const eventScores = events
    .map((event) => {
      // Skip events the user has already attended
      if (attendedEventsSet.has(event.id)) {
        return null;
      }

      // Calculate the score based on multiple factors
      let score = 0;

      // Factor 1: Content-based filtering (similarity to attended events)
      if (user.attendedEvents && user.attendedEvents.length > 0) {
        let similarityScore = 0;
        let maxSimilarityScore = 0;

        user.attendedEvents.forEach((attendedEventId) => {
          if (!eventSimilarity[attendedEventId]) return;

          const isDirectlySimilar = eventSimilarity[attendedEventId].includes(
            event.id
          );
          if (isDirectlySimilar) {
            similarityScore += 1;
          }

          maxSimilarityScore += 1;
        });

        // Normalize similarity score (if the user has attended events)
        if (maxSimilarityScore > 0) {
          score += (similarityScore / maxSimilarityScore) * WEIGHAGE_1
        }
      }

      // Factor 2: User preferences match
      if (user.preferences && user.preferences.length > 0 && event.categories) {
        const preferenceMatchCount = event.categories.filter((category) =>
          user.preferences.includes(category)
        ).length;

        const maxPossibleMatches = Math.min(
          user.preferences.length,
          event.categories.length
        );
        if (maxPossibleMatches > 0) {
          score += (preferenceMatchCount / maxPossibleMatches) * WEIGHAGE_2
        }
      }

      // Factor 3: Geographic proximity (inverse of distance)
      if (user.location && event.location) {
        // Map the location objects to the expected format
        const userLocation = {
          latitude: user.location.lat,
          longitude: user.location.lng,
        };

        const eventLocation = {
          latitude: event.location.lat,
          longitude: event.location.lng,
        };

        const distance = calculateDistance(userLocation, eventLocation);
        // Convert distance to proximity score (closer = higher score)
        // Using exponential decay: e^(-distance/100)
        const proximityScore = Math.exp(-distance / 100);
        score += proximityScore * WEIGHAGE_3
      }

      // Factor 4: Event popularity
      if (event.popularity !== undefined) {
        score += event.popularity * WEIGHAGE_3
      }

      return {
        event,
        score,
      };
    })
    .filter((item) => item !== null); // Remove null entries (attended events)

  // Step 2: Sort events by score (descending)
  eventScores.sort((a, b) => b.score - a.score);

  // Step 3: Return the top 'limit' events
  return eventScores.slice(0, limit).map((item) => item.event);
}

module.exports = {
  calculateDistance,
  getRecommendedEvents,
};
