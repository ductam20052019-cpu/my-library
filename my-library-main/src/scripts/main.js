import "../services/firebase.js?v=20260528g";
import "./ui.js?v=20260528g";
import "./actions.js?v=20260528g";

window.addEventListener("DOMContentLoaded", () => {
  if (window.checkUserStatus) window.checkUserStatus();
  if (window.loadData) window.loadData();
});
