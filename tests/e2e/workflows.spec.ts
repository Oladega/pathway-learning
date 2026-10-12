import { test, expect, type Page } from "@playwright/test";
async function onboard(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Your journey into AI engineering starts here.",
    }),
  ).toBeVisible();
  await page.getByLabel("Your name").fill("Kati");
  await page.getByRole("button", { name: "Build my learning plan" }).click();
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Start my journey" }).click();
  await expect(
    page.getByRole("heading", { name: /Good .*Kati/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Learning plan created", { exact: true }),
  ).toBeVisible();
}
async function snapshot(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("pathway-v2")!));
}
async function saved(page: Page) {
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.revision;
    })
    .toBeGreaterThan(0);
}
test("onboarding, course choice, lesson completion, task completion and reload", async ({
  page,
}) => {
  await onboard(page);
  await page.screenshot({path:"artifacts/dashboard-desktop.png",fullPage:true});
  await page
    .getByRole("link", { name: "Continue learning", exact: true })
    .click();
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await expect(
    page.getByRole("button", { name: "Reset lesson completion" }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.lessons[0].done;
    })
    .toBe(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Reset lesson completion" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Course details", exact: false })
    .click();
  await page.getByLabel("100 Days of Code: Python Bootcamp").check();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.courses["1"].choice;
    })
    .toBe("alternative");
  await page.getByRole("button", { name: "Start course", exact: true }).click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.courses["1"].enrolled;
    })
    .toBe(true);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/roadmap?week=1");
  await page
    .getByRole("button", {
      name: "Complete Practice: Python syntax",
      exact: true,
    })
    .click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.tasks.find((t: { id: string }) => t.id === "w1-practice").status;
    })
    .toBe("completed");
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Reset Practice: Python syntax",
      exact: true,
    }),
  ).toBeVisible();
});
test("timer refresh, pause/resume and confirmed study log updates analytics", async ({
  page,
}) => {
  await onboard(page);
  await page.goto("/planner");
  await page.getByRole("button", { name: "Start focus session" }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Stop & log session" }).click();
  await page.getByLabel("Study duration (minutes)").fill("90");
  await page
    .getByLabel("What did you learn?")
    .fill("Implemented functions independently");
  await page.getByRole("button", { name: "Save study log" }).click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.sessions.length;
    })
    .toBe(1);
  await page.goto("/analytics");
  await expect(page.getByText("1.5h", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 confirmed sessions")).toBeVisible();
});
test("weekly project completion, linked evidence and readiness", async ({
  page,
}) => {
  await onboard(page);
  await page.goto("/projects?id=week-1");
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  for (const box of await page
    .getByRole("dialog")
    .getByRole("checkbox")
    .all()) {
    await box.check();
    await expect(box).toBeChecked();
  }
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page
    .getByLabel("GitHub repository URL")
    .fill("https://github.com/learner/calculator");
  await page.getByRole("button", { name: "Save project metadata" }).click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.projects[0].repo;
    })
    .toContain("calculator");
  await page
    .getByRole("button", { name: "Retrospective", exact: true })
    .click();
  await page
    .getByLabel("Retrospective notes")
    .fill("Handled invalid input and verified all calculations with tests.");
  await page
    .getByRole("button", { name: "Save retrospective", exact: true })
    .click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.projects[0].retrospective;
    })
    .toContain("invalid input");
  await page.getByRole("button", { name: "Mark project complete" }).click();
  await expect(
    page.getByRole("button", {
      name: "Link completed project as skill evidence",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Link completed project as skill evidence" })
    .click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.evidence.length;
    })
    .toBeGreaterThan(0);
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Link completed project as skill evidence",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/career");
  await expect(
    page.getByText("Practical evidence linked", { exact: false }).first(),
  ).toBeVisible();
});
test("notes autosave, settings, export and invalid import", async ({
  page,
}) => {
  await onboard(page);
  await page.goto("/notes");
  await page.getByRole("button", { name: "New note" }).click();
  await page.getByLabel("Note title").fill("JSON persistence");
  await page
    .getByLabel("Markdown note")
    .fill("## Learned\nStore expense records as JSON.");
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.notes[0]?.body;
    })
    .toContain("JSON");
  await page.reload();
  await expect(
    page.getByRole("button", { name: /JSON persistence/ }),
  ).toBeVisible();
  await page.goto("/settings");
  await page.getByLabel("Name", { exact: true }).fill("Ada");
  await page
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.preferences.name;
    })
    .toBe("Ada");
  await page.getByLabel("Theme", { exact: true }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON backup" }).click();
  expect((await download).suggestedFilename()).toContain("pathway");
  page.on("dialog", (d) => d.accept());
  await page.getByLabel("Import a validated backup").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2}'),
  });
  await expect(page.locator(".toast.error")).toBeVisible();
  expect((await snapshot(page)).preferences.name).toBe("Ada");
  const backup=await snapshot(page);await page.getByRole('button',{name:'Dismiss'}).click();
  await page.getByLabel('Name',{exact:true}).fill('Grace');await page.getByRole('button',{name:'Save preferences',exact:true}).click();
  await expect.poll(async()=>{const s=await snapshot(page);return s.preferences.name;}).toBe('Grace');
  await page.getByLabel('Import a validated backup').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await expect.poll(async()=>{const s=await snapshot(page);return s.preferences.name;}).toBe('Ada');await page.reload();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('Ada');
});
test("mobile navigation, command search, all routes and disabled mentor", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await onboard(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "My Roadmap", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your learning roadmap" }),
  ).toBeVisible();
  for (const route of [
    "courses",
    "planner",
    "projects",
    "skills",
    "analytics",
    "career",
    "notes",
    "resources",
    "settings",
    "mentor",
  ]) {
    await page.goto("/" + route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await expect(
    page.getByRole("button", { name: "Send to mentor" }),
  ).toBeDisabled();
  await page
    .getByLabel("Question, code or error")
    .fill("Why does this function fail?");
  await page.getByRole("button", { name: "Save draft as note" }).click();
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return s.notes.length;
    })
    .toBe(1);
  await page.keyboard.press("Control+k");
  await page.getByLabel("Search workspace").fill("Week 52");
  await expect(
    page.getByRole("button", { name: /Roadmap.*Week 52/ }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("Week 52");
  await saved(page);
});

test('failed storage writes roll back progress and retain the previous backup',async({page})=>{
 await onboard(page);await page.goto('/courses?lesson=lesson-1');
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='pathway-v2')throw new DOMException('Storage quota exceeded','QuotaExceededError');original.call(this,key,value);};});
 await page.getByRole('button',{name:'Mark lesson complete'}).click();
 await expect(page.locator('.toast.error')).toContainText('Storage quota exceeded');
 await expect(page.getByRole('button',{name:'Mark lesson complete'})).toBeVisible();
 expect((await snapshot(page)).lessons[0].done).toBe(false);
});

test('same-route search opens the selected week and note edits persist on immediate navigation',async({page})=>{
 await onboard(page);await page.goto('/roadmap?week=1');await page.getByRole('button',{name:'Close dialog'}).click();
 await page.keyboard.press('Control+k');await page.getByLabel('Search workspace').fill('Week 52');await page.keyboard.press('Enter');
 await expect(page.getByRole('dialog')).toContainText('Week 52');await page.getByRole('button',{name:'Close dialog'}).click();
 await page.goto('/notes');await page.getByRole('button',{name:'New note'}).click();await page.getByLabel('Note title').fill('Immediate save');await page.getByLabel('Markdown note').fill('Saved before navigation');await page.getByRole('link',{name:'Overview',exact:true}).click();
 await expect.poll(async()=>{const s=await snapshot(page);return s.notes[0].body;}).toBe('Saved before navigation');await page.goto('/notes');await expect(page.getByRole('button',{name:/Immediate save/})).toBeVisible();
});
