// Windows 95 Costume Edition logic
// Basic state machine + UI wiring

const AppState = {
  currentScreen: "bootMenu", // bootMenu | dosSetup | setupWizard | desktop | bsod
  bootMenuIndex: 0, // 0 = boot, 1 = reinstall
  setupStep: "welcome",
  reinstallFromDesktop: false,
  zCounter: 10,
  tmNotResponding: false,
  tmStackCount: 0
};

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  initScaling();
  initBootMenu();
  initDosSetup();
  initSetupWizard();
  initDesktop();
  initStartMenu();
  initRunDialog();
  initFind();
  initHelp();
  initReinstallDialog();
  initShutdown();
  initTaskManager();
  initMessageBox();
  initBSOD();

  switchScreen("bootMenu");
});

/* ------------------------- DOM CACHE ------------------------- */

const Dom = {};

function cacheDom() {
  Dom.app = document.getElementById("app");

  Dom.screens = {
    bootMenu: document.getElementById("boot-menu-screen"),
    dosSetup: document.getElementById("dos-setup-screen"),
    setupWizard: document.getElementById("setup-wizard-screen"),
    desktop: document.getElementById("desktop-screen")
  };

  Dom.bsod = document.getElementById("bsod-overlay");

  Dom.bootOptions = Array.from(document.querySelectorAll(".boot-option"));
  Dom.bootButtons = Array.from(document.querySelectorAll(".boot-btn"));

  Dom.dosOutput = document.getElementById("dos-output");

  Dom.wizardSteps = Array.from(document.querySelectorAll(".wizard-step"));
  Dom.dirRadioDefault = document.querySelector('input[name="dir-option"][value="default"]');
  Dom.dirRadioOther = document.querySelector('input[name="dir-option"][value="other"]');
  Dom.dirInput = document.getElementById("dir-input");
  Dom.wizardBack = document.getElementById("wizard-back");
  Dom.wizardNext = document.getElementById("wizard-next");
  Dom.wizardCancel = document.getElementById("wizard-cancel");
  Dom.wizardContinue = document.getElementById("wizard-continue");
  Dom.wizardYes = document.getElementById("wizard-yes");
  Dom.wizardNo = document.getElementById("wizard-no");
  Dom.wizardFinish = document.getElementById("wizard-finish");
  Dom.copyingStatus = document.getElementById("copying-status");
  Dom.copyingProgress = document.getElementById("copying-progress");

  Dom.desktopScreen = document.getElementById("desktop-screen");
  Dom.desktop = document.getElementById("desktop");
  Dom.desktopIcons = Array.from(document.querySelectorAll(".desktop-icon"));

  Dom.startButton = document.getElementById("start-button");
  Dom.startMenu = document.getElementById("start-menu");
  Dom.taskbar = document.getElementById("taskbar");
  Dom.taskbarMenu = document.getElementById("taskbar-menu");
  Dom.clock = document.getElementById("taskbar-clock");

  Dom.windows = Array.from(document.querySelectorAll(".app-window, .dialog-window"));

  Dom.runWindow = document.querySelector('[data-window-id="run"]');
  Dom.runInput = document.getElementById("run-input");
  Dom.runOk = document.getElementById("run-ok");
  Dom.runCancel = document.getElementById("run-cancel");
  Dom.runBrowse = document.getElementById("run-browse");

  Dom.findWindow = document.querySelector('[data-window-id="find"]');
  Dom.findInput = document.getElementById("find-input");
  Dom.findNow = document.getElementById("find-now");
  Dom.findStatus = document.getElementById("find-status");
  Dom.findResults = document.getElementById("find-results");

  Dom.helpWindow = document.querySelector('[data-window-id="help"]');
  Dom.helpTopics = document.getElementById("help-topics");
  Dom.helpSearch = document.getElementById("help-search");
  Dom.helpText = document.getElementById("help-text");

  Dom.reinstallDialog = document.querySelector('[data-window-id="reinstall-dialog"]');
  Dom.reinstallYes = document.getElementById("reinstall-yes");
  Dom.reinstallNo = document.getElementById("reinstall-no");

  Dom.shutdownWindow = document.querySelector('[data-window-id="shutdown"]');
  Dom.shutdownOk = document.getElementById("shutdown-ok");
  Dom.shutdownCancel = document.getElementById("shutdown-cancel");

  Dom.notepadWindow = document.querySelector('[data-window-id="notepad"]');
  Dom.notepadText = document.getElementById("notepad-text");

  Dom.partyWizardWindow = document.querySelector('[data-window-id="party-wizard"]');
  Dom.partyBack = document.getElementById("party-back");
  Dom.partyNext = document.getElementById("party-next");
  Dom.partyFinish = document.getElementById("party-finish");

  Dom.partyDriverStatus = document.getElementById("party-driver-status");

  Dom.costumeCaption = document.getElementById("costume-caption");

  Dom.existentialTable = document.getElementById("existential-processes");
  Dom.existentialEnd = document.getElementById("existential-end");

  Dom.controlPanelWindow = document.querySelector('[data-window-id="control-panel"]');

  Dom.taskManagerWindow = document.querySelector('[data-window-id="task-manager"]');
  Dom.tmTitle = document.getElementById("tm-title");
  Dom.tmBody = document.getElementById("tm-body");
  Dom.tmTabs = Array.from(document.querySelectorAll(".tm-tab"));
  Dom.tmPages = Array.from(document.querySelectorAll(".tm-tab-page"));
  Dom.tmAppsTable = document.getElementById("tm-apps-table");
  Dom.tmProcsTable = document.getElementById("tm-procs-table");
  Dom.tmEndTask = document.getElementById("tm-end-task");
  Dom.tmSwitchTo = document.getElementById("tm-switch-to");
  Dom.tmNewTask = document.getElementById("tm-new-task");
  Dom.tmStatus = document.getElementById("tm-status");
  Dom.tmProcsEnd = document.getElementById("tm-procs-end");
  Dom.tmOverlay = document.getElementById("tm-overlay");

  Dom.messageOverlay = document.getElementById("message-overlay");
  Dom.msgBox = document.getElementById("message-box");
  Dom.msgTitle = document.getElementById("msg-title");
  Dom.msgText = document.getElementById("msg-text");
  Dom.msgIcon = document.getElementById("msg-icon");
  Dom.msgButtons = document.getElementById("msg-buttons");
  Dom.msgClose = document.getElementById("msg-close");

  Dom.bsodOverlay = document.getElementById("bsod-overlay");
}

/* ------------------------- SCALING ------------------------- */

function initScaling() {
  function applyScale() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / 640, h / 480);
    Dom.app.style.transform = `scale(${scale})`;
  }

  window.addEventListener("resize", applyScale);
  applyScale();
}

/* ------------------------- SCREEN SWITCHING ------------------------- */

function switchScreen(screen) {
  AppState.currentScreen = screen;
  for (const key in Dom.screens) {
    Dom.screens[key].classList.add("hidden");
  }
  if (screen === "bootMenu") Dom.screens.bootMenu.classList.remove("hidden");
  if (screen === "dosSetup") Dom.screens.dosSetup.classList.remove("hidden");
  if (screen === "setupWizard") Dom.screens.setupWizard.classList.remove("hidden");
  if (screen === "desktop") Dom.screens.desktop.classList.remove("hidden");

  if (screen === "desktop") {
    updateClock();
  }
}

/* ------------------------- BOOT MENU ------------------------- */

function initBootMenu() {
  updateBootMenuHighlight();

  document.addEventListener("keydown", (e) => {
    if (AppState.currentScreen !== "bootMenu") return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      AppState.bootMenuIndex = AppState.bootMenuIndex === 0 ? 1 : 0;
      updateBootMenuHighlight();
    } else if (e.key === "Enter") {
      chooseBootOption(AppState.bootMenuIndex === 0 ? "boot" : "reinstall");
    }
  });

  Dom.bootOptions.forEach((opt, idx) => {
    opt.addEventListener("click", () => {
      AppState.bootMenuIndex = idx;
      updateBootMenuHighlight();
      chooseBootOption(opt.dataset.option);
    });
  });

  Dom.bootButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      chooseBootOption(btn.dataset.option);
    });
  });
}

function updateBootMenuHighlight() {
  Dom.bootOptions.forEach((el, idx) => {
    el.classList.toggle("boot-option-selected", idx === AppState.bootMenuIndex);
  });
}

function chooseBootOption(option) {
  if (option === "boot") {
    // Short fake "Starting Windows"
    switchScreen("dosSetup");
    Dom.dosOutput.textContent = "Starting Windows 95...\n";
    setTimeout(() => {
      switchScreen("desktop");
    }, 800);
  } else if (option === "reinstall") {
    AppState.reinstallFromDesktop = false;
    startDosSetup();
  }
}

/* ------------------------- DOS SETUP ------------------------- */

const dosLines = [
  "E:\\WIN95>dir /w",
  "SETUP.EXE    COOL95.CAB   PARTY01.CAB  COFFEE.CAB   THERAPY.CAB",
  "SOCIALSKL.CAB README.TXT  WIN95_01.CAB WIN95_02.CAB WIN95_03.CAB",
  "",
  "52 File(s) 48,700,101 bytes",
  "",
  "E:\\WIN95>setup",
  "",
  "Please wait while Setup initializes.",
  "Setup is now going to perform a routine check on your system.",
  "",
  "To continue, press ENTER. To quit Setup, press ESC."
];

let dosIndex = 0;
let dosInterval = null;
let dosReady = false;

function initDosSetup() {
  document.addEventListener("keydown", (e) => {
    if (AppState.currentScreen !== "dosSetup") return;
    if (!dosReady) return;
    if (e.key === "Enter") {
      startSetupWizard();
    } else if (e.key === "Escape") {
      showMessage("Windows Setup", "Nice try, there is no escape from this install.", [
        { label: "OK", action: closeMessage }
      ]);
    }
  });
}

function startDosSetup() {
  switchScreen("dosSetup");
  Dom.dosOutput.textContent = "";
  dosIndex = 0;
  dosReady = false;
  if (dosInterval) clearInterval(dosInterval);
  dosInterval = setInterval(() => {
    Dom.dosOutput.textContent += dosLines[dosIndex] + "\n";
    dosIndex++;
    if (dosIndex >= dosLines.length) {
      clearInterval(dosInterval);
      dosReady = true;
    }
  }, 250);
}

/* ------------------------- SETUP WIZARD ------------------------- */

function initSetupWizard() {
  Dom.dirRadioDefault.addEventListener("change", () => {
    Dom.dirInput.disabled = true;
  });
  Dom.dirRadioOther.addEventListener("change", () => {
    Dom.dirInput.disabled = false;
    Dom.dirInput.focus();
  });

  Dom.wizardBack.addEventListener("click", () => {
    handleWizardBack();
  });
  Dom.wizardNext.addEventListener("click", () => {
    handleWizardNext();
  });
  Dom.wizardCancel.addEventListener("click", () => {
    showMessage("Windows Setup", "Setup will now pretend to cancel.", [
      { label: "OK", action: closeMessage }
    ]);
  });

  Dom.wizardContinue.addEventListener("click", () => {
    setSetupStep("options");
  });
  Dom.wizardYes.addEventListener("click", () => {
    setSetupStep("copying");
    startCopying();
  });
  Dom.wizardNo.addEventListener("click", () => {
    showMessage(
      "License Agreement",
      "If you do not accept, you cannot install Windows 95 or attend this party.",
      [{ label: "Reconsider", action: closeMessage }]
    );
  });
  Dom.wizardFinish.addEventListener("click", () => {
    fakeRestartFromSetup();
  });
}

function startSetupWizard() {
  AppState.setupStep = "welcome";
  configureWizardButtonsForStep("welcome");
  showWizardStep("welcome");
  switchScreen("setupWizard");
}

function setSetupStep(step) {
  AppState.setupStep = step;
  showWizardStep(step);
  configureWizardButtonsForStep(step);
}

function showWizardStep(step) {
  Dom.wizardSteps.forEach((el) => {
    el.classList.toggle("hidden", el.dataset.step !== step);
  });
}

function configureWizardButtonsForStep(step) {
  // Reset
  [Dom.wizardBack, Dom.wizardNext, Dom.wizardCancel, Dom.wizardContinue, Dom.wizardYes, Dom.wizardNo, Dom.wizardFinish].forEach(
    (b) => b && b.classList.add("hidden")
  );

  if (step === "welcome") {
    Dom.wizardContinue.classList.remove("hidden");
    Dom.wizardCancel.classList.remove("hidden");
  } else if (step === "options") {
    Dom.wizardBack.classList.remove("hidden");
    Dom.wizardNext.classList.remove("hidden");
    Dom.wizardCancel.classList.remove("hidden");
  } else if (step === "directory") {
    Dom.wizardBack.classList.remove("hidden");
    Dom.wizardNext.classList.remove("hidden");
    Dom.wizardCancel.classList.remove("hidden");
  } else if (step === "overview") {
    Dom.wizardBack.classList.remove("hidden");
    Dom.wizardNext.classList.remove("hidden");
    Dom.wizardCancel.classList.remove("hidden");
  } else if (step === "license") {
    Dom.wizardBack.classList.remove("hidden");
    Dom.wizardYes.classList.remove("hidden");
    Dom.wizardNo.classList.remove("hidden");
  } else if (step === "copying") {
    // no buttons until done
  } else if (step === "finishing") {
    Dom.wizardFinish.classList.remove("hidden");
  }
}

function handleWizardBack() {
  const step = AppState.setupStep;
  if (step === "options") setSetupStep("welcome");
  else if (step === "directory") setSetupStep("options");
  else if (step === "overview") setSetupStep("directory");
  else if (step === "license") setSetupStep("overview");
}

function handleWizardNext() {
  const step = AppState.setupStep;
  if (step === "options") setSetupStep("directory");
  else if (step === "directory") {
    if (Dom.dirRadioOther.checked && !Dom.dirInput.value.trim()) {
      showMessage("Windows Setup", "Please enter a directory. We promise we won’t actually install anything.", [
        { label: "OK", action: closeMessage }
      ]);
      return;
    }
    setSetupStep("overview");
  } else if (step === "overview") setSetupStep("license");
}

function startCopying() {
  let progress = 0;
  const messages = [
    "Copying COOL95.CAB...",
    "Installing DIALUPDRM.VXD...",
    "Optimizing floppies...",
    "Copying PARTY01.CAB...",
    "Finalizing imaginary files..."
  ];
  let idx = 0;
  Dom.copyingStatus.textContent = messages[0];
  Dom.copyingProgress.style.width = "0%";

  const timer = setInterval(() => {
    progress += 20;
    Dom.copyingProgress.style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(timer);
      setSetupStep("finishing");
    } else {
      idx = Math.min(idx + 1, messages.length - 1);
      Dom.copyingStatus.textContent = messages[idx];
    }
  }, 600);
}

function fakeRestartFromSetup() {
  // Quick black screen, then desktop
  switchScreen("dosSetup");
  Dom.dosOutput.textContent = "Restarting Windows 95...\n";
  setTimeout(() => {
    switchScreen("desktop");
  }, 800);
}

/* ------------------------- DESKTOP ------------------------- */

function initDesktop() {
  // Desktop icons
  Dom.desktopIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const target = icon.dataset.windowTarget;
      if (target) openWindow(target);
    });
  });

  // Window close buttons
  Dom.windows.forEach((win) => {
    const closeBtns = win.querySelectorAll("[data-close]");
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        closeWindowByElement(win);
      });
    });
    // bring to front on mousedown
    win.addEventListener("mousedown", () => {
      bringToFront(win);
    });
  });

  // Recycle bin "View deleted items"
  const deletedBtn = document.querySelector('[data-action="view-deleted"]');
  if (deletedBtn) {
    const deletedList = document.getElementById("deleted-items");
    deletedBtn.addEventListener("click", () => {
      deletedList.classList.toggle("hidden");
      if (!deletedList.classList.contains("hidden")) {
        showMessage("Recycle Bin", "These items cannot be restored during party hours.", [
          { label: "OK", action: closeMessage }
        ]);
      }
    });
  }

  // My Computer actions
  document.querySelectorAll('[data-action="open-drive-c"]').forEach((el) =>
    el.addEventListener("click", () => {
      showMessage(
        "C:\\",
        "Access denied: you don’t actually have a C: drive here.",
        [{ label: "OK", action: closeMessage }]
      );
    })
  );
  document.querySelectorAll('[data-action="open-drive-a"]').forEach((el) =>
    el.addEventListener("click", () => {
      showMessage(
        "A:\\",
        "The device is not ready. Please insert Disk 2 of 47 into drive A:.",
        [{ label: "OK", action: closeMessage }]
      );
    })
  );
  document.querySelectorAll('[data-action="open-party-files"]').forEach((el) =>
    el.addEventListener("click", () => {
      openNotepad("TODO:\n\nThis folder is empty.\nYou clearly prepared this costume at the last minute.");
    })
  );
  document.querySelectorAll('[data-action="open-anxiety"]').forEach((el) =>
    el.addEventListener("click", () => {
      showMessage(
        "System Anxiety (X:)",
        "Drive X: is full of unresolved feelings. Please free up space by dancing.",
        [{ label: "OK", action: closeMessage }]
      );
    })
  );

  // Interweb diagnose
  const diagBtn = document.querySelector('[data-action="diagnose-connection"]');
  if (diagBtn) {
    diagBtn.addEventListener("click", () => {
      showMessage(
        "Interweb Explorer",
        "Connection failed: Someone picked up the phone in the kitchen.",
        [{ label: "OK", action: closeMessage }]
      );
    });
  }

  // Network Neighborhood
  attachNetworkHandlers();

  // Party drivers
  const pdBtn = document.querySelector('[data-action="install-party-drivers"]');
  if (pdBtn) {
    pdBtn.addEventListener("click", () => {
      Dom.partyDriverStatus.textContent = "Copying PARTYDRV.CAB... Installing GLITTER.SYS...";
      setTimeout(() => {
        showSystemSettingsChange();
      }, 800);
    });
  }

  // Costume Control Panel sliders caption
  const costumePanel = document.querySelector('[data-window-id="costume-panel"]');
  if (costumePanel) {
    const sliders = costumePanel.querySelectorAll('input[type="range"]');
    sliders.forEach((s) => {
      s.addEventListener("input", () => {
        Dom.costumeCaption.textContent = "Settings saved to C:\\IMAGINATION.";
      });
    });
  }

  // Existential Task Manager
  if (Dom.existentialTable) {
    Dom.existentialTable.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      if (!tr) return;
      Dom.existentialTable.querySelectorAll("tr").forEach((r) => r.classList.remove("tm-selected"));
      tr.classList.add("tm-selected");
    });
  }
  if (Dom.existentialEnd) {
    Dom.existentialEnd.addEventListener("click", () => {
      const sel = Dom.existentialTable.querySelector("tr.tm-selected");
      if (!sel) return;
      const proc = sel.dataset.process;
      if (proc === "dance") {
        showMessage("Task Manager", "Ending this program is not recommended.", [
          { label: "OK", action: closeMessage }
        ]);
      } else if (proc === "imposter") {
        showMessage("Task Manager", "Process ended. Confidence temporarily increased.", [
          { label: "OK", action: () => { closeMessage(); sel.remove(); } }
        ]);
      } else if (proc === "self-awareness") {
        showMessage(
          "Task Manager",
          "This process has performed an illegal operation and will be shut down.",
          [{ label: "OK", action: () => { closeMessage(); sel.remove(); } }]
        );
      }
    });
  }

  // Taskbar clock Easter egg (BSOD via multiple clicks)
  let clockClickCount = 0;
  Dom.clock.addEventListener("click", () => {
    clockClickCount++;
    if (clockClickCount >= 5) {
      clockClickCount = 0;
      triggerBSOD();
    }
  });

  // Taskbar context menu
  Dom.taskbar.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    Dom.taskbarMenu.classList.remove("hidden");
  });

  Dom.taskbarMenu.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const winId = li.dataset.open;
    Dom.taskbarMenu.classList.add("hidden");
    if (winId) openWindow(winId);
  });

  Dom.desktop.addEventListener("click", (e) => {
    if (!Dom.taskbarMenu.contains(e.target)) {
      Dom.taskbarMenu.classList.add("hidden");
    }
  });

  // Documents → open Notepad content
  const docsWindow = document.querySelector('[data-window-id="documents"]');
  if (docsWindow) {
    docsWindow.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-doc]");
      if (!li) return;
      const doc = li.dataset.doc;
      let text = "";
      if (doc === "party-instructions") {
        text =
          "Party Instructions:\n\n1. Enter.\n2. Pretend you remember everyone.\n3. Blame any awkwardness on Windows 95.";
      } else if (doc === "todo") {
        text =
          "To-do before midnight:\n\n- Hydrate.\n- Compliment at least 2 costumes.\n- Resist uninstalling yourself.";
      } else if (doc === "secret-crush") {
        text =
          "secret-crush-list.txt\n\nAccess denied.\n\nThis file is encrypted with 90s-level embarrassment.";
      }
      openNotepad(text);
    });
  }

  // Volume control sliders caption already set via note
}

function attachNetworkHandlers() {
  const netWindow = document.querySelector('[data-window-id="network"]');
  if (!netWindow) return;
  netWindow.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-action]");
    if (!li) return;
    const action = li.dataset.action;
    if (action === "net-livingroom") {
      showMessage("Network Neighborhood", "You do not have permission to access this dance circle.", [
        { label: "OK", action: closeMessage }
      ]);
    } else if (action === "net-dj") {
      showMessage("Network Neighborhood", "Network OK. Please direct all song requests to the human DJ.", [
        { label: "OK", action: closeMessage }
      ]);
    } else if (action === "net-fridge") {
      showMessage("Network Neighborhood", "Fridge online. Snack quota remaining: 0.", [
        { label: "OK", action: closeMessage }
      ]);
    } else if (action === "net-bathroom") {
      showMessage("Network Neighborhood", "Server busy. Try again in 5 minutes.", [
        { label: "OK", action: closeMessage }
      ]);
    }
  });
}

function openWindow(id) {
  const win = document.querySelector(`[data-window-id="${id}"]`);
  if (!win) {
    // Unknown window → generic error
    showMessage("Windows", `This feature is not installed in Windows 95 Costume Edition.`, [
      { label: "OK", action: closeMessage }
    ]);
    return;
  }
  win.classList.remove("hidden");
  bringToFront(win);

  // Some windows need initialization
  if (id === "notepad") {
    // pre-filled elsewhere
  } else if (id === "run") {
    Dom.runInput.value = "";
    Dom.runInput.focus();
  } else if (id === "party-wizard") {
    setPartyStep(1);
  } else if (id === "task-manager") {
    resetTaskManager();
  } else if (id === "find") {
    Dom.findStatus.textContent = "";
    Dom.findResults.innerHTML = "";
  } else if (id === "help") {
    Dom.helpText.textContent = "Select a topic on the left.";
  } else if (id === "shutdown") {
    // default radio already selected
  }
}

function closeWindowByElement(win) {
  win.classList.add("hidden");
}

/* Bring window to front by z-index */
function bringToFront(win) {
  AppState.zCounter++;
  win.style.zIndex = AppState.zCounter;
}

/* ------------------------- START MENU ------------------------- */

function initStartMenu() {
  Dom.startButton.addEventListener("click", (e) => {
    e.stopPropagation();
    Dom.startMenu.classList.toggle("hidden");
  });

  Dom.desktop.addEventListener("click", (e) => {
    if (!Dom.startMenu.contains(e.target) && e.target !== Dom.startButton) {
      Dom.startMenu.classList.add("hidden");
    }
  });

  // Start menu leaf items
  Dom.startMenu.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const openId = li.dataset.open;
    const action = li.dataset.action;
    if (openId) {
      Dom.startMenu.classList.add("hidden");
      openWindow(openId);
    } else if (action) {
      Dom.startMenu.classList.add("hidden");
      handleStartAction(action);
    }
  });

  // Clock time update every minute
  setInterval(updateClock, 60000);
}

function handleStartAction(action) {
  if (action === "reinstall") {
    openWindow("reinstall-dialog");
  } else if (action === "settings-taskbar") {
    showMessage(
      "Taskbar & Start Menu",
      "Changes will take effect after Windows reboots, which it won’t.",
      [{ label: "OK", action: closeMessage }]
    );
  } else if (action === "settings-costume") {
    showMessage(
      "Costume Settings",
      "Settings saved. Reality not affected.",
      [{ label: "OK", action: closeMessage }]
    );
  }
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  Dom.clock.textContent = `${hours}:${minutes} ${ampm}`;
}

/* ------------------------- RUN DIALOG ------------------------- */

function initRunDialog() {
  Dom.runOk.addEventListener("click", () => {
    handleRunCommand(Dom.runInput.value.trim());
  });
  Dom.runCancel.addEventListener("click", () => {
    closeWindowByElement(Dom.runWindow);
  });
  Dom.runBrowse.addEventListener("click", () => {
    showMessage(
      "Run",
      "No disk drives available in Windows 95 Costume Edition.",
      [{ label: "OK", action: closeMessage }]
    );
  });

  Dom.runInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleRunCommand(Dom.runInput.value.trim());
    }
  });
}

function handleRunCommand(cmdRaw) {
  const cmd = cmdRaw.toLowerCase();
  if (!cmd) {
    closeWindowByElement(Dom.runWindow);
    return;
  }

  if (cmd === "party.exe" || cmd === "party") {
    showMessage(
      "Run",
      "Launching party.exe... Done. Please move your body to complete installation.",
      [{ label: "OK", action: () => { closeMessage(); closeWindowByElement(Dom.runWindow); } }]
    );
  } else if (cmd === "reinstall" || cmd === "setup") {
    showMessage(
      "Run",
      "This will restart Windows and start Setup. Continue?",
      [
        {
          label: "Yes",
          action: () => {
            closeMessage();
            closeWindowByElement(Dom.runWindow);
            AppState.reinstallFromDesktop = true;
            startDosSetup();
          }
        },
        {
          label: "No",
          action: () => {
            closeMessage();
            showMessage("Run", "Reinstall aborted. OS status: ‘good enough’.", [
              { label: "OK", action: closeMessage }
            ]);
          }
        }
      ]
    );
  } else if (cmd === "crash") {
    closeWindowByElement(Dom.runWindow);
    triggerBSOD();
  } else if (cmd === "taskman" || cmd === "taskmgr") {
    closeWindowByElement(Dom.runWindow);
    openWindow("task-manager");
  } else {
    showMessage(
      "Run",
      `Windows cannot find '${cmdRaw}'. Make sure you typed the name correctly and that you’re not expecting too much from a costume.`,
      [{ label: "OK", action: closeMessage }]
    );
  }
}

/* ------------------------- FIND ------------------------- */

function initFind() {
  if (!Dom.findWindow) return;
  Dom.findNow.addEventListener("click", () => {
    const term = Dom.findInput.value.trim().toLowerCase();
    Dom.findResults.innerHTML = "";
    if (!term) {
      Dom.findStatus.textContent = "You must type something. Windows cannot find ‘nothing’.";
      return;
    }
    Dom.findStatus.textContent = "Scanning...";
    setTimeout(() => {
      if (term.includes("snack")) {
        Dom.findStatus.textContent = "1 item found.";
        Dom.findResults.innerHTML = "<li>Kitchen (Path not accessible from this computer.)</li>";
      } else {
        Dom.findStatus.textContent = "0 items found. Maybe try talking to someone instead.";
      }
    }, 700);
  });
}

/* ------------------------- HELP ------------------------- */

function initHelp() {
  if (!Dom.helpWindow) return;

  Dom.helpTopics.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-topic]");
    if (!li) return;
    const topic = li.dataset.topic;
    if (topic === "people") {
      Dom.helpText.textContent =
        "How do I people?\n\nSmile. Ask what they’re dressed as. Blame all awkward pauses on Windows 95.";
    } else if (topic === "floppy") {
      Dom.helpText.textContent =
        "What is a floppy disk?\n\nA physical save icon. Holds 1.44MB of data or one blurry JPEG.";
    } else if (topic === "accuracy") {
      Dom.helpText.textContent =
        "Is this costume historically accurate?\n\nApproximately 95% accurate. Remaining 5% lost in dial-up noise.";
    }
  });

  Dom.helpSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      Dom.helpText.textContent =
        "Help topic not found. Try asking the nearest nerd.";
    }
  });
}

/* ------------------------- REINSTALL DIALOG ------------------------- */

function initReinstallDialog() {
  if (!Dom.reinstallDialog) return;
  Dom.reinstallYes.addEventListener("click", () => {
    closeWindowByElement(Dom.reinstallDialog);
    AppState.reinstallFromDesktop = true;
    startDosSetup();
  });
  Dom.reinstallNo.addEventListener("click", () => {
    closeWindowByElement(Dom.reinstallDialog);
    showMessage(
      "Windows Setup",
      "Reinstall canceled. Windows recommends snacks instead.",
      [{ label: "OK", action: closeMessage }]
    );
  });
}

/* ------------------------- SHUTDOWN ------------------------- */

function initShutdown() {
  if (!Dom.shutdownWindow) return;
  Dom.shutdownOk.addEventListener("click", () => {
    const choice = document.querySelector('input[name="shutdown-option"]:checked').value;
    if (choice === "shutdown") {
      showMessage("Shut Down", "Shutdown failed: DJ vetoed your request.", [
        { label: "OK", action: closeMessage }
      ]);
    } else if (choice === "restart") {
      closeWindowByElement(Dom.shutdownWindow);
      // quick "Rebooting vibes..."
      switchScreen("dosSetup");
      Dom.dosOutput.textContent = "Rebooting vibes...\n";
      setTimeout(() => {
        switchScreen("desktop");
      }, 800);
    } else if (choice === "pretend") {
      showMessage("Shut Down", "Power nap recommended but not implemented.", [
        { label: "OK", action: closeMessage }
      ]);
    }
  });

  Dom.shutdownCancel.addEventListener("click", () => {
    closeWindowByElement(Dom.shutdownWindow);
    // one-time message would need more state; we keep it simple
  });
}

/* ------------------------- NOTEPAD ------------------------- */

function openNotepad(text) {
  Dom.notepadText.value = text;
  openWindow("notepad");
}

/* ------------------------- PARTY MODE WIZARD ------------------------- */

function setPartyStep(step) {
  const steps = Dom.partyWizardWindow.querySelectorAll(".party-step");
  steps.forEach((s) => {
    s.classList.toggle("hidden", s.dataset.partyStep !== String(step));
  });
  // buttons states
  if (step === 1) {
    Dom.partyBack.disabled = true;
    Dom.partyNext.disabled = false;
    Dom.partyFinish.disabled = true;
  } else if (step === 2) {
    Dom.partyBack.disabled = false;
    Dom.partyNext.disabled = false;
    Dom.partyFinish.disabled = true;
  } else if (step === 3) {
    Dom.partyBack.disabled = false;
    Dom.partyNext.disabled = true;
    Dom.partyFinish.disabled = false;
  }
}

function initPartyWizardButtons() {
  // called from initDesktop if needed
}

if (document.getElementById("party-next")) {
  Dom.partyNext.addEventListener("click", () => {
    const steps = Dom.partyWizardWindow.querySelectorAll(".party-step");
    let currentStep = 1;
    steps.forEach((s) => {
      if (!s.classList.contains("hidden")) {
        currentStep = Number(s.dataset.partyStep);
      }
    });
    if (currentStep === 1) {
      setPartyStep(2);
    } else if (currentStep === 2) {
      const chk = document.getElementById("party-snacks");
      if (!chk.checked) {
        showMessage("Party Mode Wizard", "Snack requirement not met.", [
          { label: "OK", action: closeMessage }
        ]);
      } else {
        setPartyStep(3);
      }
    }
  });

  Dom.partyBack.addEventListener("click", () => {
    const steps = Dom.partyWizardWindow.querySelectorAll(".party-step");
    let currentStep = 1;
    steps.forEach((s) => {
      if (!s.classList.contains("hidden")) currentStep = Number(s.dataset.partyStep);
    });
    if (currentStep === 2) setPartyStep(1);
    else if (currentStep === 3) setPartyStep(2);
  });

  Dom.partyFinish.addEventListener("click", () => {
    showMessage("Party Mode Wizard", "You are now ready. Windows may or may not cooperate.", [
      { label: "OK", action: closeMessage }
    ]);
  });
}

/* ------------------------- SYSTEM SETTINGS CHANGE ------------------------- */

function showSystemSettingsChange() {
  showMessage(
    "System Settings Change",
    "To finish setting up your new hardware, you must restart your computer.\nDo you want to restart your computer now?",
    [
      {
        label: "Yes",
        action: () => {
          closeMessage();
          // soft restart
          switchScreen("dosSetup");
          Dom.dosOutput.textContent = "Restarting Windows 95...\n";
          setTimeout(() => {
            switchScreen("desktop");
          }, 800);
        }
      },
      {
        label: "No",
        action: () => {
          closeMessage();
          showMessage("System Settings Change", "Restart skipped. Results may take 3–5 songs to appear.", [
            { label: "OK", action: closeMessage }
          ]);
        }
      }
    ]
  );
}

/* ------------------------- TASK MANAGER ------------------------- */

function initTaskManager() {
  if (!Dom.taskManagerWindow) return;

  // Tab switching
  Dom.tmTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      Dom.tmTabs.forEach((t) => t.classList.toggle("tm-tab-active", t === tab));
      Dom.tmPages.forEach((page) => {
        page.classList.toggle("hidden", page.dataset.tabPage !== target);
      });
    });
  });

  // Select rows in apps table
  Dom.tmAppsTable.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-task]");
    if (!tr) return;
    Dom.tmAppsTable.querySelectorAll("tr").forEach((r) => r.classList.remove("tm-selected"));
    tr.classList.add("tm-selected");
  });

  Dom.tmProcsTable.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-proc]");
    if (!tr) return;
    Dom.tmProcsTable.querySelectorAll("tr").forEach((r) => r.classList.remove("tm-selected"));
    tr.classList.add("tm-selected");
  });

  // Applications End Task
  Dom.tmEndTask.addEventListener("click", () => {
    const sel = Dom.tmAppsTable.querySelector("tr.tm-selected");
    if (!sel) return;
    const task = sel.dataset.task;
    if (task === "party") {
      // End Task sequence
      showMessage(
        "Task Manager",
        "Ending this program will lose any unsaved dance moves. Do you want to continue?",
        [
          { label: "End Task", action: () => { closeMessage(); showPartyNotRespondingDialog(); } },
          { label: "Cancel", action: () => { closeMessage(); showMessage("Task Manager", "Good call. Never kill the party.", [{ label: "OK", action: closeMessage }]); } }
        ]
      );
    } else {
      showMessage("Task Manager", "This task refuses to end politely.", [
        { label: "OK", action: closeMessage }
      ]);
    }
  });

  Dom.tmSwitchTo.addEventListener("click", () => {
    showMessage("Task Manager", "Switching not available. It’s already the 90s.", [
      { label: "OK", action: closeMessage }
    ]);
  });

  Dom.tmNewTask.addEventListener("click", () => {
    openWindow("run");
  });

  Dom.tmProcsEnd.addEventListener("click", () => {
    const sel = Dom.tmProcsTable.querySelector("tr.tm-selected");
    if (!sel) return;
    const proc = sel.dataset.proc;
    if (proc === "system" || proc === "explorer") {
      showMessage(
        "Task Manager",
        "Ending this process may cause Windows, the party, and your dignity to stop responding. Continue?",
        [
          {
            label: "Yes",
            action: () => {
              closeMessage();
              triggerBSOD();
            }
          },
          { label: "No", action: closeMessage }
        ]
      );
    } else {
      showMessage(
        "Task Manager",
        "Process ended in theory. In practice, nothing happened.",
        [{ label: "OK", action: closeMessage }]
      );
    }
  });

  // Overlay (for not responding)
  Dom.tmOverlay.addEventListener("click", () => {
    if (!AppState.tmNotResponding) return;
    spawnTaskManagerNotRespondingDialog();
  });
}

function resetTaskManager() {
  AppState.tmNotResponding = false;
  AppState.tmStackCount = 0;
  Dom.tmOverlay.classList.add("hidden");
  Dom.tmTitle.textContent = "Windows Task Manager";
  Dom.tmStatus.textContent = "";
  Dom.tmAppsTable.querySelectorAll("tbody tr").forEach((tr) => {
    if (tr.dataset.task === "party") {
      tr.children[1].textContent = "Running";
    }
  });
}

function showPartyNotRespondingDialog() {
  // Program Not Responding
  showMessage(
    "party.exe",
    "This program is not responding.\nIf you choose to end the program now, you may lose unsaved vibes.",
    [
      {
        label: "End Task",
        action: () => {
          closeMessage();
          // Mark party.exe as Not Responding and Task Manager itself stuck
          const partyRow = Dom.tmAppsTable.querySelector('tr[data-task="party"]');
          if (partyRow) partyRow.children[1].textContent = "Not Responding";
          Dom.tmStatus.textContent = "Windows is waiting for the party to respond…";

          AppState.tmNotResponding = true;
          AppState.tmStackCount = 0;
          Dom.tmOverlay.classList.remove("hidden");
          Dom.tmTitle.textContent = "Windows Task Manager (Not Responding)";
        }
      },
      {
        label: "Wait",
        action: () => {
          closeMessage();
          const partyRow = Dom.tmAppsTable.querySelector('tr[data-task="party"]');
          if (partyRow) partyRow.children[1].textContent = "Not Responding";
          Dom.tmStatus.textContent = "Windows is waiting for the party to respond…";
        }
      }
    ]
  );
}

function spawnTaskManagerNotRespondingDialog() {
  AppState.tmStackCount++;
  if (AppState.tmStackCount < 5) {
    showMessage(
      "Task Manager",
      "Task Manager is not responding.",
      [
        {
          label: "End Now",
          action: () => {
            closeMessage();
          }
        },
        {
          label: "Cancel",
          action: closeMessage
        }
      ]
    );
    // offset dialog slightly
    Dom.msgBox.style.transform = `translate(${AppState.tmStackCount * 8}px, ${AppState.tmStackCount * 8}px)`;
  } else {
    showMessage(
      "Task Manager",
      "Windows has stopped responding to your attempts to fix Windows.\nThe only known solution is to reboot or accept fate.",
      [
        {
          label: "Reboot",
          action: () => {
            closeMessage();
            triggerBSOD();
          }
        },
        {
          label: "Sigh",
          action: () => {
            closeMessage();
            AppState.tmNotResponding = false;
            Dom.tmOverlay.classList.add("hidden");
            Dom.tmTitle.textContent = "Windows Task Manager";
          }
        }
      ]
    );
    Dom.msgBox.style.transform = `translate(0, 0)`;
  }
}

/* ------------------------- MESSAGE BOX ------------------------- */

let currentMsgCallback = null;

function initMessageBox() {
  Dom.msgClose.addEventListener("click", () => {
    closeMessage();
  });
}

function showMessage(title, text, buttons) {
  Dom.msgTitle.textContent = title || "Windows";
  Dom.msgText.textContent = text || "";
  Dom.msgButtons.innerHTML = "";
  (buttons || [{ label: "OK", action: closeMessage }]).forEach((btnDef, idx) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = btnDef.label;
    btn.addEventListener("click", () => {
      if (btnDef.action) btnDef.action();
    });
    Dom.msgButtons.appendChild(btn);
  });
  Dom.messageOverlay.classList.remove("hidden");
  bringToFront(Dom.msgBox);
}

function closeMessage() {
  Dom.messageOverlay.classList.add("hidden");
}

/* ------------------------- BSOD ------------------------- */

function initBSOD() {
  Dom.bsodOverlay.addEventListener("click", () => {
    hideBSODToBoot();
  });
  document.addEventListener("keydown", (e) => {
    if (AppState.currentScreen === "bsod") {
      hideBSODToBoot();
    }
  });
}

function triggerBSOD() {
  AppState.currentScreen = "bsod";
  Dom.bsodOverlay.classList.remove("hidden");
  // hide all normal screens
  for (const key in Dom.screens) {
    Dom.screens[key].classList.add("hidden");
  }
}

function hideBSODToBoot() {
  Dom.bsodOverlay.classList.add("hidden");
  switchScreen("bootMenu");
}

/* -------------------------------------------------------- */