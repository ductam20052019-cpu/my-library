import "./firebase.js?v=20260216d";
import "./ui.js?v=20260216d";
import "./actions.js?v=20260216d";

window.addEventListener("DOMContentLoaded", () => {
  if (window.checkUserStatus) window.checkUserStatus();
  if (window.loadData) window.loadData();
});
