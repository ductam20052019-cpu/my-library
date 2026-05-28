import "../services/firebase.js?v=20260528f";
import "./ui.js?v=20260528f";
import "./actions.js?v=20260528f";

window.addEventListener("DOMContentLoaded", () => {
  if (window.checkUserStatus) window.checkUserStatus();
  if (window.loadData) window.loadData();
});
