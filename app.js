/* ----------------------------------------------------
 * LYCEUM GLOBAL HOLDINGS - SPA CONTROLLER & GRAPHICS
 * Manages spatial radial coordinate state machines, SVG connector 
 * networks, and Chart.js dashboards.
 * ---------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  
  // --- STATE SYSTEM SETUP & PERSISTENCE ---
  const DEFAULT_MASTER_SYSTEMS = [
    { id: "sap-erp", name: "SAP S/4HANA ERP", category: "Core ERP", desc: "Enterprise resource planning and financial accounting suite." },
    { id: "sf-crm", name: "Salesforce CRM", category: "Customer Relations", desc: "Corporate business relations, inquiries, and student enrollments tracker." },
    { id: "ms-teams", name: "Microsoft Teams", category: "Collaboration", desc: "Unified corporate communications, channels, and team conferences hub." },
    { id: "slack-hq", name: "Slack Corporate HQ", category: "Collaboration", desc: "Instant text operations, DevOps channels, and bot registries." },
    { id: "supabase-cloud", name: "Supabase Database", category: "Database/Cloud", desc: "Secure cloud database hosting, student tables, and profile queries." },
    { id: "edu-portal", name: "Lyceum EduPortal", category: "Education Utilities", desc: "Student homework portals, timetables, and teacher calendars." },
    { id: "campus-lnk", name: "CampusLNK System", category: "Education Utilities", desc: "Multi-campus registrar log, admissions database, and degree progress." },
    { id: "dispatch-flow", name: "DispatchFlow Log", category: "Logistics Software", desc: "NCG Speed fleet dispatch, truck schedules, and courier routing maps." },
    { id: "fleet-radar", name: "FleetRadar tracking", category: "Logistics Software", desc: "GPS logistics vehicle telemetry, fuel diagnostics, and route alerts." }
  ];

  const STATE = {
    currentLevel: 0, // 0 = Enter, 1 = Sectors, 2 = Companies, 3 = Bento Detail
    activeSector: null, // Sector Object
    activeCompany: null, // Company Object
    chartInstance: null, // Chart.js reference
    isAdmin: false,
    sectors: [],
    companies: {},
    masterSystems: []
  };

  function saveDatabaseToStorage() {
    const dataToSave = {
      sectors: STATE.sectors,
      companies: STATE.companies,
      masterSystems: STATE.masterSystems
    };
    localStorage.setItem("LYCEUM_PERSISTED_DATABASE", JSON.stringify(dataToSave));
  }

  function loadDatabaseFromStorage() {
    try {
      const stored = localStorage.getItem("LYCEUM_PERSISTED_DATABASE");
      if (stored) {
        const parsed = JSON.parse(stored);
        STATE.sectors = parsed.sectors || [];
        STATE.companies = parsed.companies || {};
        STATE.masterSystems = parsed.masterSystems || [];
      } else {
        STATE.sectors = JSON.parse(JSON.stringify(LYCEUM_SECTORS));
        STATE.companies = JSON.parse(JSON.stringify(LYCEUM_COMPANIES));
        STATE.masterSystems = JSON.parse(JSON.stringify(DEFAULT_MASTER_SYSTEMS));
        saveDatabaseToStorage();
      }
    } catch (err) {
      console.error("Database hydration failed. Resetting defaults...", err);
      STATE.sectors = JSON.parse(JSON.stringify(LYCEUM_SECTORS));
      STATE.companies = JSON.parse(JSON.stringify(LYCEUM_COMPANIES));
      STATE.masterSystems = JSON.parse(JSON.stringify(DEFAULT_MASTER_SYSTEMS));
    }
  }

  // Load from local storage right away
  loadDatabaseFromStorage();

  const getSectors = () => STATE.sectors;
  const getCompanies = () => STATE.companies;

  let selectedEditCompany = null;
  let selectedAssignmentCompany = null;

  // --- HTML INTERFACE ELEMENTS ---
  const DOM = {
    clock: document.getElementById("hud-clock"),
    breadcrumbs: document.getElementById("hud-breadcrumbs"),
    viewport: document.getElementById("viewport-arena"),
    
    // View Layers
    viewEnter: document.getElementById("view-enter"),
    viewOrbitals: document.getElementById("view-orbitals"),
    viewBento: document.getElementById("view-bento-overlay"),
    
    // Buttons
    btnEnter: document.getElementById("btn-portal-enter"),
    btnSpatialBack: document.getElementById("btn-spatial-back"),
    btnCloseBento: document.getElementById("btn-close-bento"),
    spatialStepLabel: document.getElementById("spatial-step-label"),
    
    // Orbital Core Elements
    orbitalHub: document.getElementById("orbital-hub"),
    hubName: document.getElementById("hub-display-name"),
    hubType: document.getElementById("hub-display-type"),
    hubIcon: document.getElementById("hub-main-icon"),
    hubIconContainer: document.getElementById("hub-icon-container"),
    hubTelemetry: document.getElementById("hub-telemetry-sub"),
    nodesContainer: document.getElementById("orbital-nodes-container"),
    svgCanvas: document.getElementById("connector-svg-canvas"),
    
    // Bento Dashboard Elements
    bentoSectorBadge: document.getElementById("bento-sector-badge"),
    bentoCompName: document.getElementById("bento-comp-name"),
    bentoCompTagline: document.getElementById("bento-comp-tagline"),
    bentoCompWebsite: document.getElementById("bento-comp-website"),
    bentoCompDesc: document.getElementById("bento-comp-desc"),
    bentoLoc: document.getElementById("bento-spec-location"),
    bentoWorkforce: document.getElementById("bento-spec-workforce"),
    bentoSocial: document.getElementById("bento-spec-social"),
    bentoEsgAvg: document.getElementById("bento-esg-average"),
    bentoEsgCircle: document.getElementById("esg-progress-circle"),
    bentoEsgE: document.getElementById("bento-esg-e"),
    bentoEsgS: document.getElementById("bento-esg-s"),
    bentoEsgG: document.getElementById("bento-esg-g"),
    bentoEsgEBar: document.getElementById("bento-esg-e-bar"),
    bentoEsgSBar: document.getElementById("bento-esg-s-bar"),
    bentoEsgGBar: document.getElementById("bento-esg-g-bar"),
    bentoProducts: document.getElementById("bento-products-list"),
    bentoLeaders: document.getElementById("bento-leaders-list"),
    bentoContactPhone: document.getElementById("bento-contact-phone"),
    bentoContactEmail: document.getElementById("bento-contact-email"),
    bentoContactAddress: document.getElementById("bento-contact-address"),
    bentoSystemsGrid: document.getElementById("bento-systems-grid"),
    formRegisterApp: document.getElementById("form-register-app")
  };

  // --- INITIALIZE PORTAL ---
  function init() {
    updateClock();
    setInterval(updateClock, 1000);
    bindEvents();
    
    // Initialize Lucide SVG Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- HUD CLOCK FUNCTION ---
  function updateClock() {
    const now = new Date();
    const timeString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    DOM.clock.textContent = timeString;
  }

  // --- BIND CLICKS & MOVES ---
  function bindEvents() {
    // Level 0 Enter Portal Button
    DOM.btnEnter.addEventListener("click", () => {
      transitionTo(1);
    });

    // Back Navigation Button
    DOM.btnSpatialBack.addEventListener("click", () => {
      if (STATE.currentLevel === 2) {
        transitionTo(1);
      } else if (STATE.currentLevel === 1) {
        transitionTo(0);
      }
    });

    // Close Bento Overlay Button
    DOM.btnCloseBento.addEventListener("click", () => {
      transitionTo(2); // Go back to Level 2 (Companies Ring)
    });

    // Register Application Form handler
    DOM.formRegisterApp.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("new-app-name");
      const appName = input.value.trim();
      if (!appName) return;
      
      const company = STATE.activeCompany;
      const sector = STATE.activeSector;
      
      if (company && sector) {
        const apps = getCompanyApps(company, sector.id);
        if (!apps.includes(appName)) {
          apps.push(appName);
        }
        input.value = "";
        
        // Re-populate systems grid
        populateBentoDashboard();
        
        // Transient glow effect
        DOM.bentoSystemsGrid.style.boxShadow = `0 0 20px ${sector.color}40`;
        setTimeout(() => {
          DOM.bentoSystemsGrid.style.boxShadow = "none";
        }, 500);
      }
    });

    // Click Brand Logo to Reset Entire System
    document.getElementById("hud-brand-logo").addEventListener("click", () => {
      transitionTo(0);
    });

    // Realtime window resize listener to update SVG laser linkages
    window.addEventListener("resize", () => {
      if (STATE.currentLevel === 1 || STATE.currentLevel === 2) {
        setTimeout(drawLaserLinks, 100);
      }
      resize3DCanvas();
    });

    // Interactive card-mouse highlight listener (Level 0 Card)
    const enterCard = document.querySelector(".enter-card");
    if (enterCard) {
      enterCard.addEventListener("mousemove", (e) => {
        const rect = enterCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        enterCard.style.setProperty("--mouse-x", `${x}px`);
        enterCard.style.setProperty("--mouse-y", `${y}px`);
      });
    }

    // Toggle 3D view button listeners
    document.getElementById("btn-toggle-3d").addEventListener("click", () => {
      open3DView();
    });

    document.getElementById("btn-close-3d").addEventListener("click", () => {
      close3DView();
    });

    // --- THEME TOGGLE (LIGHT / DARK) ---
    const themeToggleBtn = document.getElementById("btn-theme-toggle");
    const themeLabel = themeToggleBtn.querySelector(".theme-label");

    // Restore persisted theme preference
    const savedTheme = localStorage.getItem("LYCEUM_THEME");
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
      themeLabel.textContent = "DARK MODE";
    }

    themeToggleBtn.addEventListener("click", () => {
      // Enable smooth transition
      document.body.classList.add("theme-transitioning");

      const isLight = document.body.classList.toggle("light-mode");
      themeLabel.textContent = isLight ? "DARK MODE" : "LIGHT MODE";
      localStorage.setItem("LYCEUM_THEME", isLight ? "light" : "dark");

      // Refresh Lucide icons for the swapped sun/moon
      if (window.lucide) window.lucide.createIcons();

      // Remove transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove("theme-transitioning");
      }, 500);
    });

    // Direct Bento profile edit trigger
    const bentoAdminEditBtn = document.getElementById("bento-admin-edit-btn");
    if (bentoAdminEditBtn) {
      bentoAdminEditBtn.addEventListener("click", () => {
        if (STATE.isAdmin && STATE.activeCompany) {
          selectedEditCompany = STATE.activeCompany;
          
          // Switch to companies tab in admin workspace
          const compTabBtn = document.querySelector('.admin-tab-btn[data-tab="companies"]');
          if (compTabBtn) {
            document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.remove("active"));
            
            compTabBtn.classList.add("active");
            document.getElementById("tab-admin-companies").classList.add("active");
          }
          
          openAdminWorkspace();
        }
      });
    }

    // --- ADMINISTRATIVE PORTAL HUD TRIGGER & PASSCODE SECURITY ---
    const btnAdminPortal = document.getElementById("btn-admin-portal");
    const passcodeDialog = document.getElementById("hud-passcode-dialog");
    const passcodeVerifyBtn = document.getElementById("btn-passcode-verify");
    const passcodeCancelBtn = document.getElementById("btn-passcode-cancel");
    const passcodeInput = document.getElementById("admin-passcode-input");
    const passcodeError = document.getElementById("passcode-error-msg");
    const viewAdminPortal = document.getElementById("view-admin-portal");
    const btnCloseAdmin = document.getElementById("btn-close-admin");

    btnAdminPortal.addEventListener("click", () => {
      if (STATE.isAdmin) {
        openAdminWorkspace();
      } else {
        // Show passcode modal
        passcodeInput.value = "";
        passcodeError.style.display = "none";
        passcodeDialog.style.display = "flex";
        passcodeDialog.style.opacity = "0";
        void passcodeDialog.offsetHeight; // Reflow
        passcodeDialog.style.opacity = "1";
        passcodeInput.focus();
      }
    });

    passcodeCancelBtn.addEventListener("click", () => {
      passcodeDialog.style.opacity = "0";
      setTimeout(() => {
        passcodeDialog.style.display = "none";
      }, 300);
    });

    function verifyPasscode() {
      const value = passcodeInput.value.trim();
      if (value === "admin123") {
        STATE.isAdmin = true;
        
        // Update header indicator and button looks
        btnAdminPortal.innerHTML = `<i data-lucide="unlock"></i><span>ADMIN CORE</span>`;
        btnAdminPortal.style.borderColor = "#10b981";
        btnAdminPortal.style.color = "#10b981";
        if (window.lucide) window.lucide.createIcons();
        
        // Close passcode overlay and open Central Core
        passcodeDialog.style.opacity = "0";
        setTimeout(() => {
          passcodeDialog.style.display = "none";
          openAdminWorkspace();
        }, 300);
      } else {
        // Shake error animation
        passcodeError.style.display = "block";
        const content = passcodeDialog.querySelector(".passcode-dialog-content");
        content.classList.remove("shake");
        void content.offsetWidth; // Reflow
        content.classList.add("shake");
      }
    }

    passcodeVerifyBtn.addEventListener("click", verifyPasscode);
    passcodeInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") verifyPasscode();
    });

    btnCloseAdmin.addEventListener("click", () => {
      viewAdminPortal.classList.remove("layer-active");
      setTimeout(() => {
        // Refresh active views
        if (STATE.currentLevel === 3) populateBentoDashboard();
        if (STATE.currentLevel === 2) renderCompaniesRing();
        if (STATE.currentLevel === 1) renderSectorsRing();
      }, 300);
    });

    // Tab switching event inside Admin Central Core
    const tabBtns = document.querySelectorAll(".admin-tab-btn");
    const tabContents = document.querySelectorAll(".admin-tab-content");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        
        btn.classList.add("active");
        document.getElementById(`tab-admin-${targetTab}`).classList.add("active");
        renderAdminTab(targetTab);
      });
    });

    // Tab 1 Form Submit (Company Details Compiler)
    const compForm = document.getElementById("admin-company-form");
    compForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!selectedEditCompany) return;
      
      try {
        const parsedLeaders = JSON.parse(document.getElementById("edit-comp-leaders").value);
        if (!Array.isArray(parsedLeaders)) throw new Error("Leadership must be a JSON array.");
        
        selectedEditCompany.name = document.getElementById("edit-comp-name").value;
        selectedEditCompany.tagline = document.getElementById("edit-comp-tagline").value;
        selectedEditCompany.location = document.getElementById("edit-comp-location").value;
        selectedEditCompany.linkedin = document.getElementById("edit-comp-linkedin").value;
        selectedEditCompany.employees = document.getElementById("edit-comp-employees").value;
        selectedEditCompany.website = document.getElementById("edit-comp-website").value;
        selectedEditCompany.profile = document.getElementById("edit-comp-profile").value;
        selectedEditCompany.leaders = parsedLeaders;
        
        saveDatabaseToStorage();
        
        // Show compile toast
        const toast = document.getElementById("save-toast-msg");
        toast.style.display = "block";
        setTimeout(() => {
          toast.style.display = "none";
        }, 2000);
        
        // Refresh lists
        renderAdminTab("companies");
      } catch (err) {
        alert("JSON Parse Error: Leadership metrics must follow standard JSON arrays of name, role, avatar.");
      }
    });

    // Tab 2 Form Submit (Master Software registration)
    const sysCreateForm = document.getElementById("admin-system-create-form");
    sysCreateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawId = document.getElementById("new-system-id").value;
      const id = rawId.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      const name = document.getElementById("new-system-name").value.trim();
      const category = document.getElementById("new-system-category").value;
      const desc = document.getElementById("new-system-desc").value.trim();
      
      if (!id || !name) return;
      
      // Check duplicate slug ID
      if (STATE.masterSystems.some(s => s.id === id)) {
        alert("A system utility with this slug ID is already registered.");
        return;
      }
      
      STATE.masterSystems.push({ id, name, category, desc });
      saveDatabaseToStorage();
      
      // Reset input fields
      sysCreateForm.reset();
      
      // Show register toast
      const toast = document.getElementById("system-toast-msg");
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
      
      // Refresh inventory list
      renderAdminTab("systems");
    });

    // Tab 3 Assignments Compiler Submit
    const btnSaveAssignments = document.getElementById("btn-save-assignments");
    btnSaveAssignments.addEventListener("click", () => {
      if (!selectedAssignmentCompany) return;
      
      const grid = document.getElementById("admin-assignments-check-grid");
      const checkItems = grid.querySelectorAll(".check-item");
      const selectedAppsList = [];
      
      checkItems.forEach(item => {
        if (item.classList.contains("checked")) {
          const sysName = item.querySelector("h6").textContent;
          selectedAppsList.push(sysName);
        }
      });
      
      selectedAssignmentCompany.applications = selectedAppsList;
      saveDatabaseToStorage();
      
      // Show assignments compile toast
      const toast = document.getElementById("assign-toast-msg");
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
    });
  }

  // --- CORE VIEW STATE MACHINE TRANSITIONS ---
  function transitionTo(level) {
    // 1. Hide active screens and manage views
    DOM.viewEnter.classList.remove("layer-active");
    DOM.viewOrbitals.classList.remove("layer-active");
    DOM.viewBento.classList.remove("layer-active");

    STATE.currentLevel = level;

    if (level === 0) {
      // LEVEL 0: Enter Screen
      DOM.viewEnter.classList.add("layer-active");
      updateBreadcrumbs();
      DOM.btnSpatialBack.disabled = true;
      clearOrbitalArena();
    } 
    else if (level === 1) {
      // LEVEL 1: Sectors Ring
      DOM.viewOrbitals.classList.add("layer-active");
      DOM.btnSpatialBack.disabled = false;
      DOM.spatialStepLabel.textContent = "LEVEL 1 // CORPORATE SECTORS";
      
      STATE.activeSector = null;
      STATE.activeCompany = null;
      
      updateBreadcrumbs();
      renderSectorsRing();
      if (!laserLoopId) {
        laserLoopId = requestAnimationFrame(tickLasers);
      }
    } 
    else if (level === 2) {
      // LEVEL 2: Companies Ring within Active Sector
      DOM.viewOrbitals.classList.add("layer-active");
      DOM.btnSpatialBack.disabled = false;
      DOM.spatialStepLabel.textContent = `LEVEL 2 // ${STATE.activeSector.name.toUpperCase()} DIVISIONS`;
      
      STATE.activeCompany = null;
      
      updateBreadcrumbs();
      renderCompaniesRing();
      if (!laserLoopId) {
        laserLoopId = requestAnimationFrame(tickLasers);
      }
    } 
    else if (level === 3) {
      // LEVEL 3: Bento Detailed Company Overlay
      DOM.viewBento.classList.add("layer-active");
      updateBreadcrumbs();
      populateBentoDashboard();
    }

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- BREADCRUMB RENDERING ---
  function updateBreadcrumbs() {
    let html = `<span class="crumb" id="crumb-root" style="cursor:pointer">PORTAL</span>`;
    
    if (STATE.currentLevel >= 1) {
      html += ` <span class="crumb-separator">//</span> <span class="crumb ${STATE.currentLevel === 1 ? 'active' : ''}" id="crumb-sectors" style="cursor:pointer">SECTORS</span>`;
    }
    if (STATE.currentLevel >= 2 && STATE.activeSector) {
      html += ` <span class="crumb-separator">//</span> <span class="crumb ${STATE.currentLevel === 2 ? 'active' : ''}" id="crumb-sector-name" style="cursor:pointer">${STATE.activeSector.name.toUpperCase()}</span>`;
    }
    if (STATE.currentLevel >= 3 && STATE.activeCompany) {
      html += ` <span class="crumb-separator">//</span> <span class="crumb active" id="crumb-company-name">${STATE.activeCompany.name.toUpperCase()}</span>`;
    }
    
    DOM.breadcrumbs.innerHTML = html;

    // Click triggers inside crumbs
    document.getElementById("crumb-root").addEventListener("click", () => transitionTo(0));
    
    const sectCrumb = document.getElementById("crumb-sectors");
    if (sectCrumb) sectCrumb.addEventListener("click", () => transitionTo(1));
    
    const sectNameCrumb = document.getElementById("crumb-sector-name");
    if (sectNameCrumb) sectNameCrumb.addEventListener("click", () => transitionTo(2));
  }

  // --- RADIAL LAYOUT CALCULATOR & RENDERER ---
  
  function clearOrbitalArena() {
    DOM.nodesContainer.innerHTML = "";
    DOM.svgCanvas.innerHTML = "";
  }

  // LEVEL 1: Renders 7 Sector nodes evenly distributed
  function renderSectorsRing() {
    clearOrbitalArena();

    // Set Central Hub to Lyceum Core Styling
    DOM.hubName.textContent = "LYCEUM";
    DOM.hubType.textContent = "GLOBAL HOLDINGS";
    DOM.hubIconContainer.innerHTML = `<img src="assets/logo-lgh.png" class="hub-logo-img" alt="LGH Logo">`;
    DOM.hubTelemetry.textContent = "[SYS_LNK // STABLE]";
    DOM.orbitalHub.style.borderColor = "rgba(255, 255, 255, 0.08)";
    DOM.orbitalHub.style.setProperty("--node-color", "#06b6d4");
    DOM.orbitalHub.style.setProperty("--node-glow", "rgba(6, 182, 212, 0.15)");
    
    const totalSectors = getSectors().length;
    
    getSectors().forEach((sector, i) => {
      const angle = (i * 2 * Math.PI) / totalSectors - Math.PI / 2; // Subtract PI/2 so first starts at top center
      
      const node = document.createElement("div");
      node.className = "orbital-node enter-anim";
      node.style.setProperty("--angle", angle + "rad");
      node.style.setProperty("--delay", `${i * 0.08}s`);
      node.style.setProperty("--node-color", sector.color);
      node.style.setProperty("--node-glow", `${sector.color}25`); // HEX color + Alpha 0.15 approx
      node.setAttribute("data-id", sector.id);

      node.innerHTML = `
        <div class="node-icon-ring logo-node-ring">
          <img src="${sector.logo}" class="node-logo-img" alt="${sector.name} Logo">
        </div>
        <h4 class="node-title">${sector.name}</h4>
        <p class="node-tagline">${sector.tagline}</p>
      `;

      // Set mouseglow tracking inside individual card
      node.addEventListener("mousemove", (e) => {
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        node.style.setProperty("--mouse-x", `${x}px`);
        node.style.setProperty("--mouse-y", `${y}px`);
      });

      // Hover triggers laser highlight
      node.addEventListener("mouseenter", () => highlightLaser(i, sector.color));
      node.addEventListener("mouseleave", () => resetLasers());

      // Click: Morph sector to center & unlock subsidiaries
      node.addEventListener("click", () => {
        STATE.activeSector = sector;
        transitionTo(2);
      });

      DOM.nodesContainer.appendChild(node);
    });

    // Trigger laser link lines drawing
    setTimeout(() => {
      drawLaserLinks();
      animateOrbEntrance();
    }, 50);
  }

  // LEVEL 2: Renders subsidiaries of selected sector
  function renderCompaniesRing() {
    clearOrbitalArena();

    const sector = STATE.activeSector;
    const companies = getCompanies()[sector.id] || [];

    // Set Central Hub to Sector Theme Styling
    DOM.hubName.textContent = sector.name.toUpperCase();
    DOM.hubType.textContent = "SECTOR CORE";
    DOM.hubIconContainer.innerHTML = `<img src="${sector.logo}" class="hub-logo-img" alt="${sector.name} Logo">`;
    DOM.hubTelemetry.textContent = `[${sector.id.toUpperCase()}_NET // ACTIVE]`;
    DOM.orbitalHub.style.borderColor = sector.color;
    DOM.orbitalHub.style.setProperty("--node-color", sector.color);
    DOM.orbitalHub.style.setProperty("--node-glow", `${sector.color}25`);

    const totalCompanies = companies.length;

    companies.forEach((company, i) => {
      const angle = (i * 2 * Math.PI) / totalCompanies - Math.PI / 2;
      
      const node = document.createElement("div");
      node.className = "orbital-node enter-anim";
      node.style.setProperty("--angle", angle + "rad");
      node.style.setProperty("--delay", `${i * 0.1}s`);
      node.style.setProperty("--node-color", sector.color);
      node.style.setProperty("--node-glow", `${sector.color}25`);
      node.setAttribute("data-id", company.id);

      node.innerHTML = `
        <div class="node-icon-ring">
          <i data-lucide="${company.icon}"></i>
        </div>
        <h4 class="node-title">${company.name}</h4>
        <p class="node-tagline">${company.tagline}</p>
      `;

      node.addEventListener("mousemove", (e) => {
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        node.style.setProperty("--mouse-x", `${x}px`);
        node.style.setProperty("--mouse-y", `${y}px`);
      });

      node.addEventListener("mouseenter", () => highlightLaser(i, sector.color));
      node.addEventListener("mouseleave", () => resetLasers());

      node.addEventListener("click", () => {
        STATE.activeCompany = company;
        transitionTo(3);
      });

      DOM.nodesContainer.appendChild(node);
    });

    setTimeout(() => {
      drawLaserLinks();
      animateOrbEntrance();
    }, 50);
  }

  // --- SVG LASER PATH DRAWING UTILITY ---
  function drawLaserLinks() {
    // Only draw lines on desktop layouts where circular system is active
    if (window.innerWidth <= 768) {
      DOM.svgCanvas.innerHTML = "";
      return;
    }

    DOM.svgCanvas.innerHTML = "";
    const nodes = DOM.nodesContainer.querySelectorAll(".orbital-node");
    if (nodes.length === 0) return;

    const canvasRect = DOM.svgCanvas.getBoundingClientRect();
    const hubRect = DOM.orbitalHub.getBoundingClientRect();
    
    // Compute Hub Central point relative to canvas
    const hubX = hubRect.left - canvasRect.left + hubRect.width / 2;
    const hubY = hubRect.top - canvasRect.top + hubRect.height / 2;

    nodes.forEach((node, index) => {
      const nodeRect = node.getBoundingClientRect();
      const nodeX = nodeRect.left - canvasRect.left + nodeRect.width / 2;
      const nodeY = nodeRect.top - canvasRect.top + nodeRect.height / 2;

      // Create glowing laser pathway
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      
      // Outer soft neon duct glow
      const shadowLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      shadowLine.setAttribute("x1", hubX);
      shadowLine.setAttribute("y1", hubY);
      shadowLine.setAttribute("x2", nodeX);
      shadowLine.setAttribute("y2", nodeY);
      shadowLine.setAttribute("stroke", node.style.getPropertyValue("--node-color") || "rgba(6, 182, 212, 0.2)");
      shadowLine.setAttribute("stroke-width", "5");
      shadowLine.setAttribute("opacity", "0.15");
      shadowLine.setAttribute("class", "laser-shadow-line");
      shadowLine.style.transition = "stroke-width 0.3s ease, opacity 0.3s ease, stroke 0.3s ease";
      
      // Active core neon data stream (scrolling)
      const coreLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      coreLine.setAttribute("x1", hubX);
      coreLine.setAttribute("y1", hubY);
      coreLine.setAttribute("x2", nodeX);
      coreLine.setAttribute("y2", nodeY);
      coreLine.setAttribute("stroke", node.style.getPropertyValue("--node-color") || "rgba(255, 255, 255, 0.5)");
      coreLine.setAttribute("stroke-width", "1.5");
      coreLine.setAttribute("opacity", "0.55");
      coreLine.setAttribute("stroke-dasharray", "8 16");
      coreLine.setAttribute("class", "laser-core-line active-laser-pulse");
      coreLine.style.transition = "stroke-width 0.3s ease, opacity 0.3s ease, stroke 0.3s ease";

      g.appendChild(shadowLine);
      g.appendChild(coreLine);
      DOM.svgCanvas.appendChild(g);
    });
  }

  // --- REAL-TIME POSITION UPDATER ---
  function updateLaserPositions() {
    if (window.innerWidth <= 768) {
      DOM.svgCanvas.innerHTML = "";
      return;
    }

    const nodes = DOM.nodesContainer.querySelectorAll(".orbital-node");
    if (nodes.length === 0) return;

    const canvasRect = DOM.svgCanvas.getBoundingClientRect();
    const hubRect = DOM.orbitalHub.getBoundingClientRect();
    
    // Compute Hub Central point relative to canvas
    const hubX = hubRect.left - canvasRect.left + hubRect.width / 2;
    const hubY = hubRect.top - canvasRect.top + hubRect.height / 2;

    const shadows = DOM.svgCanvas.querySelectorAll(".laser-shadow-line");
    const cores = DOM.svgCanvas.querySelectorAll(".laser-core-line");

    nodes.forEach((node, index) => {
      const nodeRect = node.getBoundingClientRect();
      const nodeX = nodeRect.left - canvasRect.left + nodeRect.width / 2;
      const nodeY = nodeRect.top - canvasRect.top + nodeRect.height / 2;

      const shadowLine = shadows[index];
      const coreLine = cores[index];

      if (shadowLine && coreLine) {
        shadowLine.setAttribute("x1", hubX);
        shadowLine.setAttribute("y1", hubY);
        shadowLine.setAttribute("x2", nodeX);
        shadowLine.setAttribute("y2", nodeY);

        coreLine.setAttribute("x1", hubX);
        coreLine.setAttribute("y1", hubY);
        coreLine.setAttribute("x2", nodeX);
        coreLine.setAttribute("y2", nodeY);
      }
    });
  }

  // --- LASER COORDINATE TICKER ---
  let laserLoopId = null;
  function tickLasers() {
    if (STATE.currentLevel === 1 || STATE.currentLevel === 2) {
      updateLaserPositions();
      laserLoopId = requestAnimationFrame(tickLasers);
    } else {
      laserLoopId = null;
    }
  }

  // --- LASER HOVER HIGHLIGHT MECHANICAL FLOW ---
  function highlightLaser(index, color) {
    const cores = DOM.svgCanvas.querySelectorAll(".laser-core-line");
    const shadows = DOM.svgCanvas.querySelectorAll(".laser-shadow-line");
    
    if (cores[index] && shadows[index]) {
      cores[index].setAttribute("opacity", "1");
      cores[index].setAttribute("stroke-width", "2.5");
      cores[index].setAttribute("stroke-dasharray", "4 8"); // Faster tight pulse on hover
      
      shadows[index].setAttribute("opacity", "0.45");
      shadows[index].setAttribute("stroke-width", "8");
      shadows[index].style.filter = `drop-shadow(0 0 10px ${color})`;
    }
  }

  function resetLasers() {
    const cores = DOM.svgCanvas.querySelectorAll(".laser-core-line");
    const shadows = DOM.svgCanvas.querySelectorAll(".laser-shadow-line");
    
    cores.forEach(line => {
      line.setAttribute("opacity", "0.55");
      line.setAttribute("stroke-width", "1.5");
      line.setAttribute("stroke-dasharray", "8 16");
    });
    
    shadows.forEach(line => {
      line.setAttribute("opacity", "0.15");
      line.setAttribute("stroke-width", "5");
      line.style.filter = "none";
    });
  }

  function animateOrbEntrance() {
    const nodes = DOM.nodesContainer.querySelectorAll(".orbital-node");
    nodes.forEach(node => {
      node.classList.remove("enter-anim");
      void node.offsetWidth; // Trigger reflow
      node.classList.add("enter-anim");
    });
  }

  // --- SOCIAL MEDIA UTILITY INTEGRATION ---
  function getCompanySocials(company) {
    if (!company.socials) {
      const slug = company.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const employeeNum = parseInt((company.employees || "100").replace(/,/g, '')) || 100;
      
      // Dynamic follower counts
      const linkedinFollowers = Math.floor(employeeNum * (12 + Math.random() * 5));
      const twitterFollowers = Math.floor(linkedinFollowers * (0.4 + Math.random() * 0.2));
      
      company.socials = {
        linkedin: company.linkedin || `https://www.linkedin.com/company/lyceum-${slug}`,
        twitter: `https://x.com/lyceum_${slug}`,
        linkedinFollowers: linkedinFollowers >= 1000 ? (linkedinFollowers/1000).toFixed(1) + "K" : linkedinFollowers.toString(),
        twitterFollowers: twitterFollowers >= 1000 ? (twitterFollowers/1000).toFixed(1) + "K" : twitterFollowers.toString(),
        growth: {
          years: ["2022", "2023", "2024", "2025", "2026 (Est)"],
          values: [
            Math.floor(linkedinFollowers * 0.45),
            Math.floor(linkedinFollowers * 0.60),
            Math.floor(linkedinFollowers * 0.78),
            Math.floor(linkedinFollowers * 0.90),
            linkedinFollowers
          ]
        }
      };
    }
    if (company.linkedin) {
      company.socials.linkedin = company.linkedin;
    }
    return company.socials;
  }

  // --- ENTERPRISE HELPER REGISTRIES ---
  function getCompanyContact(company) {
    if (!company.contact) {
      // Build realistic contact channels dynamically if not defined
      const domain = company.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      company.contact = {
        phone: "+94 11 767 " + Math.floor(1000 + Math.random() * 9000),
        email: "office@" + (domain.substring(0, 15) || "corporate") + ".lyceum.lk",
        address: company.location || "Colombo, Sri Lanka"
      };
    }
    return company.contact;
  }

  function getCompanyApps(company, sectorId) {
    if (!company.applications) {
      const defaults = {
        education: ["Lyceum EduPortal", "CampusLNK System", "LearnSync"],
        speed: ["FleetRadar tracking", "DispatchFlow Log", "DriverNet"],
        read: ["LibCatalog", "OpenBook", "PrintMatrix"],
        build: ["HelioGrid", "StructureSafe", "CarbonMonitor"],
        tech: ["Zuse Technologies", "ConsultTask", "EventBase"],
        kit: ["UniformOrder", "AeroDesign", "TLC-POS"],
        heracle: ["ZeusFit", "NutriSchedule", "CafeBilling"]
      };
      
      const sectorApps = defaults[sectorId] || ["CoreSystem", "PortalDesk"];
      company.applications = [...sectorApps];
      saveDatabaseToStorage();
    }
    return company.applications;
  }

  // --- LEVEL 3: DYNAMIC BENTO DATA INJECTION ---
  function populateBentoDashboard() {
    const company = STATE.activeCompany;
    const sector = STATE.activeSector;

    // Badges & Text Styling
    DOM.bentoSectorBadge.textContent = sector.name;
    DOM.bentoSectorBadge.style.color = sector.color;
    DOM.bentoSectorBadge.style.borderColor = `${sector.color}40`;
    DOM.bentoSectorBadge.style.background = `${sector.color}10`;
    
    DOM.bentoCompName.textContent = company.name;
    DOM.bentoCompTagline.textContent = company.tagline;
    
    if (company.website) {
      DOM.bentoCompWebsite.style.display = "inline-flex";
      DOM.bentoCompWebsite.href = company.website;
    } else {
      DOM.bentoCompWebsite.style.display = "none";
    }
    
    // Dynamic direct Edit profile button visibility
    const adminEditBtn = document.getElementById("bento-admin-edit-btn");
    if (adminEditBtn) {
      adminEditBtn.style.display = STATE.isAdmin ? "inline-flex" : "none";
    }
    
    DOM.bentoCompDesc.textContent = company.profile;

    // Metadata details
    DOM.bentoLoc.textContent = company.location;
    DOM.bentoWorkforce.textContent = `${parseInt((company.employees || "100").replace(/,/g, '')).toLocaleString()} Experts`;

    // Bind dynamic social media links
    const socials = getCompanySocials(company);
    const linkLinkedin = document.getElementById("bento-link-linkedin");
    const linkTwitter = document.getElementById("bento-link-twitter");
    if (linkLinkedin && linkTwitter) {
      linkLinkedin.href = socials.linkedin;
      linkTwitter.href = socials.twitter;
    }

    const indicatorEl = document.getElementById("bento-social-indicators");
    if (indicatorEl) {
      indicatorEl.innerHTML = `LINKEDIN: <span style="color: ${sector.color}; font-weight: bold;">${socials.linkedinFollowers}</span> // TWITTER: <span style="color: ${sector.color}; font-weight: bold;">${socials.twitterFollowers}</span>`;
    }

    // Contact Info Binding
    const contact = getCompanyContact(company);
    DOM.bentoContactPhone.textContent = contact.phone;
    DOM.bentoContactEmail.textContent = contact.email;
    DOM.bentoContactAddress.textContent = contact.address;

    // Applications Binding
    const apps = getCompanyApps(company, sector.id);
    DOM.bentoSystemsGrid.innerHTML = "";
    apps.forEach(appName => {
      const appLetters = appName.substring(0, 2).toUpperCase();
      const appItem = document.createElement("div");
      appItem.className = "app-item";
      appItem.innerHTML = `
        <div class="app-thumbnail" style="--sector-gradient: linear-gradient(135deg, ${sector.color}15, ${sector.color}35); --sector-border: ${sector.color}50; --node-color: ${sector.color}; --node-glow: ${sector.color}40;">
          <span class="app-letters">${appLetters}</span>
        </div>
        <span class="app-name">${appName}</span>
      `;
      DOM.bentoSystemsGrid.appendChild(appItem);
    });

    // Update active applications count
    const appsCountEl = document.getElementById("bento-apps-count");
    if (appsCountEl) {
      appsCountEl.textContent = apps.length;
    }

    // Dynamic Auth Lock Visibilities on Bento Register box
    const systemsBox = document.getElementById("bento-box-systems");
    const appInput = document.getElementById("new-app-name");
    if (systemsBox && appInput) {
      // Clear previous lock indicators if any
      const oldLock = systemsBox.querySelector(".admin-lock-badge");
      if (oldLock) oldLock.remove();

      if (!STATE.isAdmin) {
        systemsBox.classList.add("locked-state");
        appInput.disabled = true;
        appInput.placeholder = "[ADMIN REGISTRY LOCKED]";
        
        // Add lock badge dynamically
        const lockBadge = document.createElement("div");
        lockBadge.className = "admin-lock-badge";
        lockBadge.innerHTML = `<i data-lucide="lock"></i><span>ADMIN ACCESS ONLY</span>`;
        systemsBox.appendChild(lockBadge);
        if (window.lucide) window.lucide.createIcons();
      } else {
        systemsBox.classList.remove("locked-state");
        appInput.disabled = false;
        appInput.placeholder = "Register utility...";
      }
    }

    // ESG Sustainability parameters
    const esg = company.esgScore;
    const avgScore = Math.round((esg.e + esg.s + esg.g) / 3);
    DOM.bentoEsgAvg.textContent = avgScore;
    DOM.bentoEsgE.textContent = `${esg.e}%`;
    DOM.bentoEsgS.textContent = `${esg.s}%`;
    DOM.bentoEsgG.textContent = `${esg.g}%`;

    // Visual indicators updates
    DOM.bentoEsgEBar.style.width = `${esg.e}%`;
    DOM.bentoEsgSBar.style.width = `${esg.s}%`;
    DOM.bentoEsgGBar.style.width = `${esg.g}%`;

    // ESG Circle progress offset (radius 40, circum 251.2)
    const circum = 2 * Math.PI * 40;
    const offset = circum - (avgScore / 100) * circum;
    DOM.bentoEsgCircle.style.strokeDashoffset = offset;

    // Populate Capabilities/Products list
    DOM.bentoProducts.innerHTML = "";
    company.products.forEach(p => {
      const item = document.createElement("div");
      item.className = "product-item";
      item.innerHTML = `
        <span class="product-name">${p.name}</span>
        <span class="product-desc">${p.description}</span>
      `;
      DOM.bentoProducts.appendChild(item);
    });

    // Populate Executive Leadership list
    DOM.bentoLeaders.innerHTML = "";
    company.leaders.forEach(leader => {
      const card = document.createElement("div");
      card.className = "leader-item";
      card.innerHTML = `
        <div class="leader-avatar">${leader.avatar}</div>
        <div class="leader-info">
          <span class="leader-name">${leader.name}</span>
          <span class="leader-role">${leader.role}</span>
        </div>
      `;
      DOM.bentoLeaders.appendChild(card);
    });

    // Render Chart.js dynamic dashboard graphics using followers growth dataset
    setTimeout(() => {
      const socials = getCompanySocials(company);
      renderFinancialChart(socials.growth, sector.color);
    }, 150);
  }

  // --- CHART.JS METRIC BUILDER ---
  function renderFinancialChart(chartData, themeColor) {
    const ctx = document.getElementById("bento-financial-chart").getContext("2d");
    
    // Destroy previous Chart instance to clear cache memory
    if (STATE.chartInstance) {
      STATE.chartInstance.destroy();
    }

    // Set custom visual gradient layout
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, `${themeColor}40`);
    gradient.addColorStop(1, `${themeColor}00`);

    // Chart.js Premium Styling Options
    STATE.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.years,
        datasets: [{
          label: 'Audience growth (Followers)',
          data: chartData.values,
          borderColor: themeColor,
          borderWidth: 2.5,
          pointBackgroundColor: themeColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: gradient,
          tension: 0.35 // Custom Bezier curves
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Clean minimalist layout
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              family: 'Outfit',
              weight: 'bold',
              size: 13
            },
            bodyFont: {
              family: 'Inter',
              size: 11
            },
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false // No vertical gridlines
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.4)',
              font: {
                family: 'Inter',
                size: 10,
                weight: '600'
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.03)',
              drawTicks: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.4)',
              font: {
                family: 'Inter',
                size: 10,
                weight: '600'
              },
              callback: function(value) {
                return value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toString();
              }
            }
          }
        }
      }
    });
  }

  // --- 3D INTERACTIVE HIERARCHY ENGINE ---
  let canvas3D = null;
  let ctx3D = null;
  let nodes3D = [];
  let zoom3D = 1.0;
  let pitch3D = 0.3;
  let yaw3D = 0.5;
  let isDragging3D = false;
  let dragStart3D = { x: 0, y: 0 };
  let hoveredNode3D = null;
  let selectedNode3D = null;
  let animId3D = null;
  let autoRotate3D = true;

  function init3DConstellation() {
    canvas3D = document.getElementById("canvas-3d-hierarchy");
    ctx3D = canvas3D.getContext("2d");
    resize3DCanvas();
    
    // Reset Zoom and camera angles
    zoom3D = 1.0;
    pitch3D = 0.3;
    yaw3D = 0.5;
    hoveredNode3D = null;
    selectedNode3D = null;
    update3DTelemetry(null);
    hideSpatialDetailCard();

    // Populate 3D nodes
    nodes3D = [];
    
    // Root Node (Holding Company)
    const rootNode = {
      id: "root",
      x: 0, y: 0, z: 0,
      size: 14,
      color: "#06b6d4",
      label: "Lyceum Global Holdings",
      type: "holding"
    };
    nodes3D.push(rootNode);
    
    // Sector Nodes
    getSectors().forEach((sector, i) => {
      const theta = (i / getSectors().length) * 2 * Math.PI;
      const phi = Math.PI / 2 + (Math.sin(i * 1.7) * 0.25); 
      const x = 200 * Math.sin(phi) * Math.cos(theta);
      const y = 200 * Math.cos(phi);
      const z = 200 * Math.sin(phi) * Math.sin(theta);
      
      const sectorNode = {
        id: sector.id,
        x, y, z,
        size: 9,
        color: sector.color,
        label: sector.name,
        type: "sector",
        parent: rootNode,
        originalData: sector
      };
      nodes3D.push(sectorNode);
      
      // Subsidiary nodes orbiting parent sector node
      const companies = getCompanies()[sector.id] || [];
      companies.forEach((company, j) => {
        const subTheta = (j / companies.length) * 2 * Math.PI;
        const radius = 65;
        const cx = x + radius * Math.cos(subTheta);
        const cy = y + radius * Math.sin(subTheta) * 0.4;
        const cz = z + radius * Math.sin(subTheta);
        
        nodes3D.push({
          id: company.id,
          x: cx, y: cy, z: cz,
          size: 4.5,
          color: sector.color,
          label: company.name,
          type: "company",
          parent: sectorNode,
          originalData: company
        });
      });
    });

    // Event bindings for 3D interactions
    canvas3D.replaceWith(canvas3D.cloneNode(true)); // Clear previous listeners
    canvas3D = document.getElementById("canvas-3d-hierarchy");
    ctx3D = canvas3D.getContext("2d");

    canvas3D.addEventListener("mousedown", (e) => {
      isDragging3D = true;
      autoRotate3D = false;
      dragStart3D = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
      isDragging3D = false;
      setTimeout(() => { if (!isDragging3D) autoRotate3D = true; }, 3000);
    });

    canvas3D.addEventListener("mousemove", (e) => {
      const rect = canvas3D.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      if (isDragging3D) {
        const dx = e.clientX - dragStart3D.x;
        const dy = e.clientY - dragStart3D.y;
        yaw3D += dx * 0.007;
        pitch3D = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch3D + dy * 0.007));
        dragStart3D = { x: e.clientX, y: e.clientY };
      } else {
        // Track hovering
        let closest = null;
        let minDist = 18; // Hover tolerance pixels
        
        nodes3D.forEach(node => {
          if (node.projX !== undefined && node.projY !== undefined) {
            const dist = Math.hypot(node.projX - mouseX, node.projY - mouseY);
            if (dist < minDist) {
              minDist = dist;
              closest = node;
            }
          }
        });
        
        if (hoveredNode3D !== closest) {
          hoveredNode3D = closest;
          update3DTelemetry(closest);
        }
      }
    });

    canvas3D.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoom3D = Math.max(0.4, Math.min(2.5, zoom3D - e.deltaY * 0.001));
    }, { passive: false });

    // Lock selected node on click and pop detailed card
    canvas3D.addEventListener("click", () => {
      if (isDragging3D) return;
      if (hoveredNode3D) {
        showSpatialDetailCard(hoveredNode3D);
      } else {
        hideSpatialDetailCard();
      }
    });

    // Detail card navigation trigger
    document.getElementById("btn-detail-navigate").replaceWith(document.getElementById("btn-detail-navigate").cloneNode(true));
    document.getElementById("btn-detail-navigate").addEventListener("click", () => {
      if (selectedNode3D) {
        navigate3DNode(selectedNode3D);
      }
    });

    // Detail card close trigger
    document.getElementById("btn-close-detail-card").replaceWith(document.getElementById("btn-close-detail-card").cloneNode(true));
    document.getElementById("btn-close-detail-card").addEventListener("click", (e) => {
      e.stopPropagation();
      hideSpatialDetailCard();
    });
  }

  function resize3DCanvas() {
    if (canvas3D) {
      canvas3D.width = window.innerWidth;
      canvas3D.height = window.innerHeight;
    }
  }

  function update3DTelemetry(node) {
    const nameEl = document.getElementById("node-3d-name");
    const classEl = document.getElementById("node-3d-class");
    const locEl = document.getElementById("node-3d-loc");
    const valEl = document.getElementById("node-3d-val");
    
    if (!node) {
      nameEl.textContent = "SELECT NODE";
      classEl.textContent = "-";
      locEl.textContent = "-";
      valEl.textContent = "-";
      return;
    }
    
    nameEl.textContent = node.label.toUpperCase();
    
    if (node.type === "holding") {
      classEl.textContent = "HOLDING CORPORATE OFFICE";
      locEl.textContent = "COLOMBO, SRI LANKA";
      valEl.textContent = "245,000+ AUDIENCE";
    } else if (node.type === "sector") {
      classEl.textContent = "SECTOR LAYER DIVISION";
      locEl.textContent = "GLOBAL MARKET";
      const companies = getCompanies()[node.id] || [];
      classEl.style.color = node.color;
      classEl.style.textShadow = `0 0 10px ${node.color}40`;
      valEl.textContent = companies.length + " ACTIVE SUBSIDIARIES";
    } else {
      classEl.textContent = "ACTIVE SUBSIDIARY";
      classEl.style.color = node.color;
      classEl.style.textShadow = `0 0 10px ${node.color}40`;
      locEl.textContent = (node.originalData.location || "SRI LANKA").toUpperCase();
      valEl.textContent = getCompanySocials(node.originalData).linkedinFollowers + " FOLLOWERS";
    }
  }

  function render3DFrame() {
    if (autoRotate3D) {
      yaw3D += 0.002;
    }
    
    ctx3D.clearRect(0, 0, canvas3D.width, canvas3D.height);
    
    const width = canvas3D.width;
    const height = canvas3D.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const fov = 400;
    const cameraDistance = 500;
    
    // Project and rotate all nodes
    nodes3D.forEach(node => {
      // Y-axis Rotation (yaw)
      let cosY = Math.cos(yaw3D), sinY = Math.sin(yaw3D);
      let x1 = node.x * cosY - node.z * sinY;
      let z1 = node.x * sinY + node.z * cosY;
      
      // X-axis Rotation (pitch)
      let cosX = Math.cos(pitch3D), sinX = Math.sin(pitch3D);
      let y2 = node.y * cosX - z1 * sinX;
      let z2 = node.y * sinX + z1 * cosX;
      
      const projectedZ = z2 + cameraDistance;
      const scale = (fov * zoom3D) / Math.max(10, projectedZ);
      
      node.projX = centerX + x1 * scale;
      node.projY = centerY + y2 * scale;
      node.projScale = scale;
      node.depth = projectedZ;
    });
    
    const isLightMode = document.body.classList.contains("light-mode");

    // Connections array
    const connections = [];
    nodes3D.forEach(node => {
      if (node.parent) {
        connections.push({
          parent: node.parent,
          child: node,
          depth: (node.depth + node.parent.depth) / 2
        });
      }
    });
    
    // Animate line dash offset for data pulses
    if (!window.dashOffset3D) window.dashOffset3D = 0;
    window.dashOffset3D -= 0.25;

    // Draw connections (depth sorted - back to front)
    connections.sort((a, b) => b.depth - a.depth);
    connections.forEach(conn => {
      const p = conn.parent;
      const c = conn.child;
      
      // Set high-visibility depthFactor with minimum 35% opacity
      const depthFactor = Math.max(0.35, Math.min(1.0, 1 - (conn.depth - 250) / 600));
      
      // Determine if this connection line is connected to the selected node
      const isConnected = !selectedNode3D || (p.id === selectedNode3D.id || c.id === selectedNode3D.id);
      const fadeMultiplier = isConnected ? 1.0 : 0.15;
      
      // Connection line style and colors matching the node sector for high visibility
      const strokeColor = c.color;
      const opacityGlow = depthFactor * (c.type === "sector" ? 0.6 : 0.4) * fadeMultiplier;
      
      // 1. Draw glowing background connecting line
      ctx3D.beginPath();
      ctx3D.moveTo(p.projX, p.projY);
      ctx3D.lineTo(c.projX, c.projY);
      ctx3D.strokeStyle = strokeColor + Math.floor(opacityGlow * 255).toString(16).padStart(2,'0');
      ctx3D.lineWidth = Math.max(1.5, (c.type === "sector" ? 3.5 : 1.8) * c.projScale / 2.5);
      ctx3D.setLineDash([]);
      ctx3D.stroke();
      
      // 2. Draw animated scrolling data pulse core on top
      ctx3D.beginPath();
      ctx3D.moveTo(p.projX, p.projY);
      ctx3D.lineTo(c.projX, c.projY);
      ctx3D.strokeStyle = isLightMode 
        ? strokeColor 
        : (isConnected ? "#ffffff" : "rgba(255, 255, 255, 0.1)");
      ctx3D.lineWidth = Math.max(0.8, (c.type === "sector" ? 1.5 : 0.8) * c.projScale / 2.5);
      ctx3D.setLineDash([8, 12]);
      ctx3D.lineDashOffset = window.dashOffset3D * (c.type === "sector" ? 1.5 : 1.0);
      ctx3D.stroke();
    });

    // Reset line dash so borders and text are solid
    ctx3D.setLineDash([]);
    
    // Sort nodes by depth (back to front)
    const sortedNodes = [...nodes3D].sort((a, b) => b.depth - a.depth);
    
    // Draw nodes
    sortedNodes.forEach(node => {
      const isHovered = (node === hoveredNode3D);
      const radius = Math.max(2, node.size * node.projScale / 2.5);
      
      // Set high-visibility depthFactor with minimum 35% opacity
      const depthFactor = Math.max(0.35, Math.min(1.0, 1 - (node.depth - 250) / 600));
      
      // Determine if node is connected to the selected node
      const isNodeConnected = !selectedNode3D || (
        node.id === selectedNode3D.id || 
        (node.parent && node.parent.id === selectedNode3D.id) || 
        (selectedNode3D.parent && node.id === selectedNode3D.parent.id)
      );
      const nodeFadeMultiplier = isNodeConnected ? 1.0 : 0.3;
      
      // Draw dynamic glowing aura
      ctx3D.beginPath();
      ctx3D.arc(node.projX, node.projY, radius * (isHovered ? 2.5 : 1.8), 0, 2 * Math.PI);
      ctx3D.fillStyle = node.color + Math.floor(depthFactor * (isHovered ? 85 : 40) * nodeFadeMultiplier).toString(16).padStart(2,'0');
      ctx3D.fill();
      
      // Center solid core circle
      ctx3D.beginPath();
      ctx3D.arc(node.projX, node.projY, radius, 0, 2 * Math.PI);
      if (isHovered) {
        ctx3D.fillStyle = isLightMode ? "#4f46e5" : "#ffffff";
      } else {
        ctx3D.fillStyle = node.color + Math.floor(depthFactor * 255 * (isNodeConnected ? 1.0 : 0.4)).toString(16).padStart(2,'0');
      }
      ctx3D.fill();
      
      // Border stroke
      ctx3D.lineWidth = isHovered ? 2 : 1;
      ctx3D.strokeStyle = isHovered 
        ? node.color 
        : (isLightMode 
            ? "rgba(75, 85, 99, " + (depthFactor * 0.4 * nodeFadeMultiplier) + ")" 
            : "rgba(255, 255, 255, " + (depthFactor * 0.3 * nodeFadeMultiplier) + ")");
      ctx3D.stroke();
      
      // Monospace spatial labels
      if (node.projScale > 0.35 || isHovered || node.type === "holding" || node.type === "sector") {
        const labelOpacity = Math.max(0, depthFactor * (isHovered ? 1.0 : (node.type === "holding" ? 0.95 : 0.65)) * nodeFadeMultiplier);
        if (labelOpacity > 0.1) {
          ctx3D.fillStyle = isLightMode 
            ? `rgba(15, 23, 42, ${labelOpacity})` 
            : `rgba(255, 255, 255, ${labelOpacity})`;
          ctx3D.font = `${node.type === "holding" ? "bold 11px" : (node.type === "sector" ? "bold 9px" : "8px")} 'SFMono-Regular', Consolas, monospace`;
          ctx3D.textAlign = "center";
          ctx3D.fillText(node.label, node.projX, node.projY - radius - 6);
        }
      }
      
      // Tactical bracket selector overlay
      if (isHovered) {
        ctx3D.strokeStyle = node.color;
        ctx3D.lineWidth = 1.5;
        const b = radius * 1.8;
        
        ctx3D.beginPath();
        ctx3D.moveTo(node.projX - b, node.projY - b + 4);
        ctx3D.lineTo(node.projX - b, node.projY - b);
        ctx3D.lineTo(node.projX - b + 4, node.projY - b);
        ctx3D.stroke();
        
        ctx3D.beginPath();
        ctx3D.moveTo(node.projX + b - 4, node.projY - b);
        ctx3D.lineTo(node.projX + b, node.projY - b);
        ctx3D.lineTo(node.projX + b, node.projY - b + 4);
        ctx3D.stroke();
        
        ctx3D.beginPath();
        ctx3D.moveTo(node.projX - b, node.projY + b - 4);
        ctx3D.lineTo(node.projX - b, node.projY + b);
        ctx3D.lineTo(node.projX - b + 4, node.projY + b);
        ctx3D.stroke();
        
        ctx3D.beginPath();
        ctx3D.moveTo(node.projX + b - 4, node.projY + b);
        ctx3D.lineTo(node.projX + b, node.projY + b);
        ctx3D.lineTo(node.projX + b, node.projY + b - 4);
        ctx3D.stroke();
      }
    });
    
    // Position floating spatial detail card if tracking a selected node
    if (selectedNode3D && selectedNode3D.projX !== undefined) {
      positionDetailCard(selectedNode3D);
      
      // Draw dynamic glowing vector tracking line from node to detail card
      const card = document.getElementById("spatial-detail-card");
      if (card && card.style.display !== "none") {
        const cardX = parseFloat(card.style.left);
        const cardY = parseFloat(card.style.top);
        const cardHeight = card.offsetHeight || 280;
        
        // Target edge center (nearest side of the popover card)
        const targetX = cardX < selectedNode3D.projX ? cardX + 290 : cardX;
        const targetY = cardY + cardHeight / 2;
        
        ctx3D.beginPath();
        ctx3D.moveTo(selectedNode3D.projX, selectedNode3D.projY);
        ctx3D.lineTo(targetX, targetY);
        
        // Linear neon gradient stroke
        const grad = ctx3D.createLinearGradient(selectedNode3D.projX, selectedNode3D.projY, targetX, targetY);
        grad.addColorStop(0, selectedNode3D.color);
        grad.addColorStop(1, `${selectedNode3D.color}25`);
        
        ctx3D.strokeStyle = grad;
        ctx3D.lineWidth = 1.5;
        ctx3D.setLineDash([4, 4]); // Sci-fi dashes
        ctx3D.stroke();
        ctx3D.setLineDash([]); // Reset
        
        // Solid core target dot at the card edge
        ctx3D.beginPath();
        ctx3D.arc(targetX, targetY, 3, 0, 2 * Math.PI);
        ctx3D.fillStyle = selectedNode3D.color;
        ctx3D.fill();
      }
    }
    
    animId3D = requestAnimationFrame(render3DFrame);
  }

  function open3DView() {
    autoRotate3D = true;
    document.getElementById("view-3d-hierarchy").classList.add("layer-active");
    init3DConstellation();
    render3DFrame();
  }

  function close3DView() {
    document.getElementById("view-3d-hierarchy").classList.remove("layer-active");
    hideSpatialDetailCard();
    if (animId3D) {
      cancelAnimationFrame(animId3D);
      animId3D = null;
    }
  }

  function navigate3DNode(node) {
    close3DView();
    if (node.type === "holding") {
      transitionTo(1);
    } else if (node.type === "sector") {
      STATE.activeSector = node.originalData;
      transitionTo(2);
    } else if (node.type === "company") {
      const sector = getSectors().find(s => s.id === node.originalData.sector);
      STATE.activeSector = sector;
      STATE.activeCompany = node.originalData;
      transitionTo(3); // Level 3 Bento Dashboard!
    }
  }

  function showSpatialDetailCard(node) {
    selectedNode3D = node;
    const card = document.getElementById("spatial-detail-card");
    if (!node) {
      hideSpatialDetailCard();
      return;
    }
    
    // Fill Card content elements
    const logoContainer = document.getElementById("detail-card-logo");
    const nameEl = document.getElementById("detail-card-name");
    const sectorEl = document.getElementById("detail-card-sector");
    const descEl = document.getElementById("detail-card-desc");
    const revEl = document.getElementById("detail-card-rev");
    const locEl = document.getElementById("detail-card-loc");
    const leadersEl = document.getElementById("detail-card-leaders");
    const appsEl = document.getElementById("detail-card-apps");
    
    card.style.setProperty("--node-color", node.color);
    nameEl.textContent = node.label.toUpperCase();
    
    if (node.type === "holding") {
      logoContainer.innerHTML = `<span class="monospace" style="color: ${node.color}; font-size: 11px; font-weight: bold;">LGH</span>`;
      sectorEl.textContent = "GLOBAL PARENT CORP";
      descEl.textContent = "Lyceum Global Holdings is a diversified multi-sector conglomerate operating key physical and digital utility networks internationally.";
      revEl.textContent = "245,000+ AUDIENCE";
      locEl.textContent = "COLOMBO, SRI LANKA";
      leadersEl.textContent = "BOARD OF DIRECTORS";
      appsEl.textContent = "ALL SYSTEM PORTALS";
    } else if (node.type === "sector") {
      logoContainer.innerHTML = `<i data-lucide="${node.originalData.icon || 'shield'}" style="color: ${node.color}; width: 18px; height: 18px;"></i>`;
      if (window.lucide) window.lucide.createIcons();
      sectorEl.textContent = "SECTOR LAYER DIVISION";
      descEl.textContent = `Unified core directory managing high-performance holdings and asset structures in the ${node.label} sector.`;
      
      const companies = getCompanies()[node.id] || [];
      revEl.textContent = "ACTIVE CHANNELS";
      locEl.textContent = "GLOBAL MARKET";
      leadersEl.textContent = "SECTOR MANAGERS";
      appsEl.textContent = `${companies.length} ACTIVE SUBSIDIARIES`;
    } else {
      // Company node
      const comp = node.originalData;
      const sectorObj = getSectors().find(s => s.id === comp.sector);
      logoContainer.innerHTML = comp.logo ? `<img src="${comp.logo}" class="detail-logo-img" alt="Logo">` : `<span class="monospace" style="color: ${node.color}; font-size: 11px; font-weight: bold;">${comp.name.substring(0,2).toUpperCase()}</span>`;
      sectorEl.textContent = (sectorObj ? sectorObj.name : "SUBSIDIARY").toUpperCase();
      descEl.textContent = comp.description || "Active operations corporate network unit.";
      revEl.textContent = getCompanySocials(comp).linkedinFollowers + " (LinkedIn)";
      locEl.textContent = (comp.location || "SRI LANKA").toUpperCase();
      
      const leaderNames = comp.leaders ? comp.leaders.map(l => l.name.split(" ")[0]).join(", ") : "-";
      leadersEl.textContent = leaderNames;
      
      const apps = getCompanyApps(comp, comp.sector);
      appsEl.textContent = apps.slice(0, 3).join(", ") + (apps.length > 3 ? "..." : "");
    }
    
    // Position card initially
    positionDetailCard(node);
    
    card.style.display = "block";
    card.offsetHeight; // force reflow
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  }

  function hideSpatialDetailCard() {
    selectedNode3D = null;
    const card = document.getElementById("spatial-detail-card");
    if (card) {
      card.style.opacity = "0";
      card.style.transform = "translateY(10px)";
      setTimeout(() => {
        if (!selectedNode3D) {
          card.style.display = "none";
        }
      }, 250);
    }
  }

  function positionDetailCard(node) {
    const card = document.getElementById("spatial-detail-card");
    if (!card || !node || node.projX === undefined) return;
    
    const cardWidth = 290;
    const cardHeight = card.offsetHeight || 280;
    
    let left = node.projX + 25;
    let top = node.projY - cardHeight / 2;
    
    if (left + cardWidth > window.innerWidth - 20) {
      left = node.projX - cardWidth - 25; // Flip left
    }
    if (left < 20) left = 20;
    
    if (top + cardHeight > window.innerHeight - 20) {
      top = window.innerHeight - cardHeight - 20;
    }
    if (top < 20) top = 20;
    
    card.style.left = left + "px";
    card.style.top = top + "px";
  }

  // --- CENTRAL ADMINISTRATIVE PORTAL SYSTEM WORKSPACE ---
  function openAdminWorkspace() {
    const viewAdminPortal = document.getElementById("view-admin-portal");
    viewAdminPortal.classList.add("layer-active");
    
    // Set active tab buttons
    const activeBtn = document.querySelector(".admin-tab-btn.active");
    const activeTab = activeBtn ? activeBtn.getAttribute("data-tab") : "companies";
    renderAdminTab(activeTab);
  }

  function renderAdminTab(tab) {
    if (tab === "companies") {
      const compList = document.getElementById("admin-company-list");
      compList.innerHTML = "";
      
      let firstCompNode = null;
      
      // Get all subsidiaries grouped by sector
      getSectors().forEach(sector => {
        const sectorCompanies = getCompanies()[sector.id] || [];
        sectorCompanies.forEach(comp => {
          const item = document.createElement("div");
          item.className = "editor-item";
          if (selectedEditCompany && selectedEditCompany.id === comp.id) {
            item.classList.add("active");
          }
          item.innerHTML = `
            <h5>${comp.name}</h5>
            <span>Sector: ${sector.name}</span>
          `;
          item.addEventListener("click", () => {
            document.querySelectorAll("#admin-company-list .editor-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            loadCompanyIntoEditor(comp);
          });
          compList.appendChild(item);
          if (!firstCompNode) firstCompNode = item;
        });
      });
      
      // Auto-load first company if none selected
      if (!selectedEditCompany && firstCompNode) {
        firstCompNode.click();
      } else if (selectedEditCompany) {
        loadCompanyIntoEditor(selectedEditCompany);
      }
    } 
    else if (tab === "systems") {
      const sysList = document.getElementById("admin-master-systems-list");
      sysList.innerHTML = "";
      
      STATE.masterSystems.forEach(sys => {
        const item = document.createElement("div");
        item.className = "system-db-item";
        item.innerHTML = `
          <h5>${sys.name}</h5>
          <span>Category: ${sys.category} [${sys.id}]</span>
        `;
        sysList.appendChild(item);
      });
    } 
    else if (tab === "assignments") {
      const compList = document.getElementById("admin-assignment-company-list");
      compList.innerHTML = "";
      
      let firstCompNode = null;
      
      getSectors().forEach(sector => {
        const sectorCompanies = getCompanies()[sector.id] || [];
        sectorCompanies.forEach(comp => {
          const item = document.createElement("div");
          item.className = "editor-item";
          if (selectedAssignmentCompany && selectedAssignmentCompany.id === comp.id) {
            item.classList.add("active");
          }
          item.innerHTML = `
            <h5>${comp.name}</h5>
            <span>Sector: ${sector.name}</span>
          `;
          item.addEventListener("click", () => {
            document.querySelectorAll("#admin-assignment-company-list .editor-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            loadCompanyIntoAssignments(comp, sector.id);
          });
          compList.appendChild(item);
          if (!firstCompNode) firstCompNode = item;
        });
      });
      
      // Auto-load first if none
      if (!selectedAssignmentCompany && firstCompNode) {
        firstCompNode.click();
      } else if (selectedAssignmentCompany) {
        // Find sector id
        let sectorId = "education";
        getSectors().forEach(s => {
          const companies = getCompanies()[s.id] || [];
          if (companies.some(c => c.id === selectedAssignmentCompany.id)) {
            sectorId = s.id;
          }
        });
        loadCompanyIntoAssignments(selectedAssignmentCompany, sectorId);
      }
    }
  }

  function loadCompanyIntoEditor(company) {
    selectedEditCompany = company;
    
    document.getElementById("edit-comp-name").value = company.name || "";
    document.getElementById("edit-comp-tagline").value = company.tagline || "";
    document.getElementById("edit-comp-location").value = company.location || "";
    document.getElementById("edit-comp-linkedin").value = company.linkedin || (company.socials ? company.socials.linkedin : "");
    document.getElementById("edit-comp-employees").value = company.employees || "";
    document.getElementById("edit-comp-website").value = company.website || "";
    document.getElementById("edit-comp-profile").value = company.profile || "";
    
    // Leadership array serialization
    document.getElementById("edit-comp-leaders").value = JSON.stringify(company.leaders || [], null, 2);
  }

  function loadCompanyIntoAssignments(company, sectorId) {
    selectedAssignmentCompany = company;
    
    document.getElementById("assignment-target-company-name").textContent = company.name.toUpperCase();
    
    const grid = document.getElementById("admin-assignments-check-grid");
    grid.innerHTML = "";
    
    const currentApps = getCompanyApps(company, sectorId);
    
    STATE.masterSystems.forEach(sys => {
      const isChecked = currentApps.includes(sys.name);
      
      const item = document.createElement("div");
      item.className = "check-item";
      if (isChecked) item.classList.add("checked");
      
      item.innerHTML = `
        <div class="check-box"></div>
        <div class="check-meta">
          <h6>${sys.name}</h6>
          <span>${sys.category}</span>
          <p>${sys.desc || ''}</p>
        </div>
      `;
      
      item.addEventListener("click", () => {
        item.classList.toggle("checked");
      });
      
      grid.appendChild(item);
    });
  }

  // Fire up the portal!
  init();
});
