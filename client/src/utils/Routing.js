export const routes = {
    "/": "html/index.html",
    "/lobby": "html/lobby.html",
  };
  
  export async function navigateTo(path, isPopState = false) {
    const page = routes[path];
    if (!page) {
      document.getElementById("app").innerHTML = "<h2>404 - Page Not Found</h2>";
      return;
    }
  
    const res = await fetch(page);
    const html = await res.text();
    document.getElementById("app").innerHTML = html;
  
    if (!isPopState) {
      history.pushState({ path }, "", path);
    }
  }
  
  export function initRouter() {
    // Initial page load
    navigateTo(location.pathname, true);
  
    // Handle browser back/forward
    window.addEventListener("popstate", (event) => {
      const path = event.state?.path || "/";
      navigateTo(path, true);
    });
  
    // Optional: handle internal anchor links
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && link.origin === location.origin && link.pathname in routes) {
        e.preventDefault();
        navigateTo(link.pathname);
      }
    });
  }
  