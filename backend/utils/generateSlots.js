/**
 * Generate 30-minute time slots between startTime and endTime.
 * The last slot starts strictly before endTime.
 *
 * Example: startTime="09:00", endTime="13:00"
 * → ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]
 *
 * @param {string} startTime - "HH:MM"
 * @param {string} endTime   - "HH:MM"
 * @returns {string[]}
 */
const generateSlots = (startTime, endTime) => {
  const slots = [];

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += 30;
  }

  return slots;
};

module.exports = generateSlots;
