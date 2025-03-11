/**
 * Calculate distance between two geographical points using Haversine formula
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
function calculateDistance(point1, point2) {

  // Ensure we have valid coordinates otherwise return error message and 0
  if (
    typeof point1.lat !== "number" ||
    typeof point1.lng  !== "number" ||
    typeof point2.lat !== "number" ||
    typeof point2.lng !== "number"
  ) {
    return 0; 
  }

  // Earth's radius in kilometers
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
  // Distance in kilometers
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
  // Your implementation here
}

module.exports = {
  calculateDistance,
  getRecommendedEvents,
};
