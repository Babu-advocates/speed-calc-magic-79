export const logout = () => {
  // Clear all authentication-related items from localStorage
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isAdminLoggedIn");
  localStorage.removeItem("employeeLogin");
  localStorage.removeItem("employeeUsername");
  localStorage.removeItem("employeeId");
  localStorage.removeItem("bankEmployeeLogin");
  localStorage.removeItem("bankAccountId");
  localStorage.removeItem("bankName");
  localStorage.removeItem("bankUsername");
  localStorage.removeItem("bankManagerLogin");
  
  // Redirect to home page
  window.location.href = "/";
};