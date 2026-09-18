<template>
  <svg
    class="adm-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="paths[name]"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ name: keyof typeof paths, size?: number }>(), { size: 18 })
</script>

<script lang="ts">
// Stroke icons on a 24px grid, drawn to match each other's weight.
const paths = {
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  floor: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="2"/><rect x="13" y="6.5" width="5" height="4" rx="0.6"/><rect x="6" y="14" width="12" height="4" rx="0.6"/>',
  timeline: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/><path d="M12 13.5h6M12 17h3.5"/>',
  guests: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c1.9.7 3.2 2.4 3.5 5.2"/>',
  reports: '<path d="M3 21h18"/><rect x="5" y="11" width="3" height="7" rx="0.6"/><rect x="10.5" y="6" width="3" height="12" rx="0.6"/><rect x="16" y="13" width="3" height="5" rx="0.6"/>',
  editor: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14.5 8.5l2 2"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5L16 16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  walkin: '<circle cx="13" cy="4.5" r="1.8"/><path d="M9.5 21l2.5-6.5 3 3V21M8 12l2.5-4.5 3.5 1.5 2 3.5h3M12 14.5l-.7-4.5"/>',
  download: '<path d="M12 3v12M7 10.5l5 5 5-5"/><path d="M4 20h16"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  phone: '<path d="M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8.5 12h7M8.5 16h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  users: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 21c.7-4.2 3.7-6.5 7.5-6.5s6.8 2.3 7.5 6.5"/>',
  table: '<path d="M3 8h18M5 8v12M19 8v12M3 8l2-4h14l2 4"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  check: '<path d="M4.5 12.5l5 5L20 7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4.5h4.5M12 7.5V12l3 2"/>',
  save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5"/>',
  alert: '<path d="M12 3L2 20h20z"/><path d="M12 10v4M12 17v.5"/>'
}
</script>
