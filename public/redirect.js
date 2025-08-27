/* global location, document */
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(
    'https://' +
      location.hostname +
      location.pathname +
      location.search +
      location.hash
  );
}
document.cookie = 'jaireal=1; path=/; SameSite=Lax; Secure';
