import "../services/firebase.js?v=20260529c";
import "./ui.js?v=20260529c";
import "./actions.js?v=20260529c";

window.addEventListener("DOMContentLoaded", () => {
  if (window.checkUserStatus) window.checkUserStatus();
  if (window.loadData) window.loadData();
});
