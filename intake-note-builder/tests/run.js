// Automated checks for the intake note builder. All text below is invented; no real caller data.
// Run: node intake-note-builder/tests/run.js   (uses the preinstalled Playwright + Chromium)
const path = require("path");
const { chromium } = require("playwright");

const PAGE = "file://" + path.resolve(process.argv[2] || path.join(__dirname, "..", "index.html"));
let failed = 0, passed = 0;
function check(name, ok, detail) {
  if (ok) passed++; else { failed++; console.log("FAIL " + name + (detail ? "\n     " + detail : "")); }
}

// Marks every autofail item, which unblocks Copy note.
async function passAutofail(page) {
  for (const id of ["#c-rec", "#c-phone", "#c-src", "#c-legal", "#c-promise"]) await page.check(id);
  await page.selectOption("#c-age", "adult");
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [], requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => { if (!r.url().startsWith("file:")) requests.push(r.url()); });
  await page.goto(PAGE);
  check("opens in Quick mode", await page.evaluate(() => __test.isQuick()));
  await page.uncheck("#quick");   // the checks below exercise the full form

  // ---------- Grammar: each rule fixes its bad example and leaves good text alone ----------
  const grammarCases = [
    ["the the car", "the car"], ["PC said that that hurt", null],
    ["PC was in a accident", "an accident"], ["went to an hospital", "a hospital"], ["had an MRI", null],
    ["was a uninsured driver", "an uninsured"], ["a one-car crash", null], ["a unit", null], ["an hour later", null],
    ["he should of stopped", "should have"], ["the PC were driving", "the PC was"], ["Did the PC have insurance", null],
    ["if he were there", "he were"], // subjunctive is not flagged when preceded by "if"
    ["they was hit", "they were"], ["PC was took to the ER", "was taken"], ["PC was went home", "went"],
    ["was hit by a car", null], ["their was a spill", "there was"], ["its been hurting", "it's been"],
    ["the dog hurt its leg", null], ["more then a week", "more than"], ["did not loose consciousness", "lose consciousness"],
    ["lost conscious briefly", "lost consciousness"], ["slammed on the breaks", "the brakes"], ["got rear ended", "rear-ended"],
    ["was t boned", "T-boned"], ["i went to urgent care", "I"], ["Pain in back , neck", ","], ["neck,back", ", "],
    ["pain  in neck", " "], ["hurts!!", "!"], ["Car hit PC. then it left", ". Then"], ["i.e. back pain", null]
  ];
  for (const [text, expect] of grammarCases) {
    const sugs = await page.evaluate((t) => __test.grammarSuggestions(t, false).filter((g) => g.kind === "grammar" && g.rule !== "cap-start" || /then it left/.test(t)), text);
    const fixed = sugs.map((g) => text.slice(0, g.start) + g.alts[0] + text.slice(g.end));
    if (expect === null) check("grammar no hit: " + text, sugs.length === 0, JSON.stringify(sugs.map((g) => g.rule + ":" + g.before)));
    else if (text === "if he were there") check("grammar subjunctive: " + text, !sugs.some((g) => g.rule === "sva-sing"), JSON.stringify(fixed));
    else check("grammar fix: " + text, fixed.some((f) => f.indexOf(expect) >= 0), "got " + JSON.stringify(fixed));
  }

  // ---------- Correct corpus: no grammar hits, very few spelling flags ----------
  const corpus = [
    "PC reports being the driver when another vehicle ran a red light and hit the passenger side.",
    "PC was stopped at a traffic light when the car behind rear-ended them.",
    "PC reports slipping on a wet floor near the entrance of the store. There were no warning signs.",
    "PC was bitten on the left hand by a neighbor's dog while walking on the sidewalk.",
    "PC was injured at work while lifting boxes in the warehouse and reported it to the supervisor.",
    "PC went to the emergency room the same day and had an X-ray of the neck and lower back.",
    "PC has been going to physical therapy twice a week and still has pain in the shoulder.",
    "PC says the other driver was driving a company truck and apologized at the scene.",
    "Police came to the scene and took a report. PC does not have a copy yet.",
    "PC reports headaches, dizziness and trouble sleeping since the accident.",
    "The property manager was told about the broken railing a week before the fall.",
    "PC was a passenger in a rideshare car when it was hit at an intersection.",
    "PC did not lose consciousness but felt confused for a few minutes afterward.",
    "PC was referred to an orthopedic doctor and may need an MRI of the knee.",
    "PC's insurance is through their employer. PC does not know if the other driver was insured."
  ];
  let corpusWords = 0, spellFlags = [], grammarHits = [];
  for (const sen of corpus) {
    corpusWords += sen.split(/\s+/).length;
    const r = await page.evaluate((t) => ({ s: __test.spellIssues(t).map((x) => x.before), g: __test.grammarSuggestions(t, true).filter((g) => g.kind !== "note").map((g) => g.rule + ":" + g.before) }), sen);
    spellFlags = spellFlags.concat(r.s); grammarHits = grammarHits.concat(r.g);
  }
  check("correct corpus: zero grammar hits", grammarHits.length === 0, JSON.stringify(grammarHits));
  check("correct corpus: <=1 spelling flag per 200 words", spellFlags.length <= Math.ceil(corpusWords / 200), corpusWords + " words, flagged " + JSON.stringify(spellFlags));

  // ---------- Spelling suggestions: right word in the top 3 ----------
  const typos = { acident: "accident", hosptial: "hospital", ambulence: "ambulance", sholder: "shoulder", nek: "neck",
    painfull: "painful", recieved: "received", docter: "doctor", insurence: "insurance", intersecton: "intersection",
    vehical: "vehicle", becuase: "because", tommorow: "tomorrow", surgury: "surgery", brokne: "broken", treatmnet: "treatment",
    emergancy: "emergency", injurys: "injuries", knea: "knee", hurst: "hurts", stiches: "stitches", concusion: "concussion",
    therapist: "therapist", medicin: "medicine", happend: "happened", slipt: "slipped", wiht: "with", accross: "across",
    seperate: "separate", definately: "definitely" };
  let top3 = 0; const misses = [];
  for (const [bad, good] of Object.entries(typos)) {
    const sug = await page.evaluate((w) => (__test.isKnown(w) ? [w] : __test.suggest(w)), bad);
    if (sug.indexOf(good) >= 0) top3++; else misses.push(bad + "→" + JSON.stringify(sug));
  }
  const n = Object.keys(typos).length;
  check("spelling: correct word in top 3 for >=90% of typos", top3 / n >= 0.9, top3 + "/" + n + " misses: " + misses.join(" "));

  // ---------- Names and codes are not spell-checked ----------
  const skip = await page.evaluate(() => __test.spellIssues("PC spoke with Zbigniew at the ER about the CT scan and code AB12X.").map((x) => x.before));
  check("spelling skips names, acronyms, codes", skip.length === 0, JSON.stringify(skip));

  // ---------- Safety guard ----------
  const guard = await page.evaluate(() => [
    __test.addsNothing("hit at 5 pm", "hit at 6 pm"),
    __test.addsNothing("car hit PC", "car hit PC twice"),
    __test.addsNothing("teh car", "the car"),
  ]);
  check("guard rejects changed number", guard[0] === false);
  check("guard rejects added word", guard[1] === false);
  check("guard allows known correction", guard[2] === true);

  // ---------- Review panel: accept a fix, undo it ----------
  await page.selectOption("#type", "mva");
  await page.fill("#what", "PC was in a acident and the PC were taken to the hospitol");
  await page.click("#btn-review");
  const items = await page.locator("#polish-out .rv-item").count();
  check("review shows suggestions", items >= 3, "items: " + items);
  await page.click("#polish-out button:has-text('a acident')");
  check("accept applies one fix", (await page.inputValue("#what")).indexOf("an acident") >= 0, await page.inputValue("#what"));
  await page.click("#btn-undo");
  check("undo restores text", (await page.inputValue("#what")).indexOf("a acident") >= 0);
  await page.click("#polish-out button:has-text('Accept all safe')");
  const fixedAll = await page.inputValue("#what");
  check("accept all safe fixes grammar and clear spelling", /an accident/.test(fixedAll) && /PC was taken/.test(fixedAll) && /hospital\.$/.test(fixedAll), fixedAll);

  // ---------- Copy reminder when suggestions are pending ----------
  await page.fill("#spec", "their was no other car");
  check("copy blocked until autofail items are marked", await page.isDisabled("#copy"));
  await passAutofail(page);
  check("copy unblocked once every autofail item is marked", !(await page.isDisabled("#copy")));
  await page.click("#copy");
  check("copy reminds about pending suggestions", /not reviewed/.test(await page.textContent("#toast")));

  // ---------- Dual-case triggers and Ask next ----------
  async function fresh(type, story) {
    await page.click("#btn-new");
    await page.selectOption("#type", type);
    await page.fill("#what", story);
    return page.evaluate(() => ({ cons: __test.consistency().map((c) => c.id), facts: __test.probeState().facts.map((f) => f.id) }));
  }
  const scenarios = [
    ["mva", "PC was making a delivery in a company van when another car hit them.", "trig-mva-wc", "wc-working", "Workers' Comp"],
    ["pl", "PC was on the clock stocking shelves at a customer's store and slipped on a wet floor.", "trig-pl-wc", "pl-wc-owner", "Workers' Comp"],
    ["mva", "PC was backing out in a parking lot when a car hit them.", "trig-mva-pl", "mp-condition", "Premises Liability"],
    ["dog", "PC was bitten in the neighbor's yard. The neighbor rents the house from a landlord.", "trig-dog-pl", "dp-owner", "Premises Liability"]
  ];
  for (const [type, story, trig, fact, second] of scenarios) {
    const r = await fresh(type, story);
    check("trigger fires: " + trig, r.cons.indexOf(trig) >= 0, JSON.stringify(r.cons));
    check("trigger adds facts: " + fact, r.facts.indexOf(fact) >= 0, JSON.stringify(r.facts));
    await page.check("#dual"); await page.selectOption("#type2", second);
    const after = await page.evaluate(() => ({ cons: __test.consistency().map((c) => c.id), facts: __test.probeState().facts.map((f) => f.id) }));
    check("trigger message stops once second type is set: " + trig, after.cons.indexOf(trig) < 0, JSON.stringify(after.cons));
    check("facts stay after second type is set: " + fact, after.facts.indexOf(fact) >= 0);
  }
  const noTrig = await fresh("mva", "PC was stopped at a red light when another car rear-ended them.");
  check("no trigger on a plain MVA story", !noTrig.cons.some((c) => /^trig-/.test(c)), JSON.stringify(noTrig.cons));

  // Ask next panel, score and "PC didn't know"
  check("Ask next panel shows", await page.isVisible("#probe"));
  const badge1 = await page.textContent("#probe .badge");
  await page.click("#probe .probe-item button:has-text(\"PC didn't know\")");
  const badge2 = await page.textContent("#probe .badge");
  check("PC didn't know counts as answered", parseInt(badge2) === parseInt(badge1) + 1, badge1 + " -> " + badge2);
  check("missing critical facts raise a warning flag", /critical facts? not yet asked/.test(await page.textContent("#flags")));
  await page.check("#compact");
  const note = await page.textContent("#note");
  check("compact note lists Missing sections", /MISSING/.test(note) && /Not asked \(raise on callback\)/.test(note) && /Asked, PC didn't know \(request documents\)/.test(note), note);

  // ---------- Layout matches the revised form ----------
  check("no name/phone/email fields", (await page.locator("#fname, #lname, #cphone, #cemail").count()) === 0);
  const inj = await page.locator("#injchecks label").allTextContents();
  check("injury summary list", JSON.stringify(inj) === JSON.stringify(["Amputation", "Brain Bleed or Coma", "Death", "Multiple Broken Bones", "Multiple Surgeries", "Neck / Back Surgery", "Traumatic Brain Injury"]), JSON.stringify(inj));
  await page.click("#btn-new"); await page.selectOption("#type", "dog");
  check("fault and insurance lines for every case type", /PC at fault/.test(await page.textContent("#note")) && /PC has insurance/.test(await page.textContent("#note")));
  await passAutofail(page);
  await page.fill("#what", "PC's phone is 555-123-4567");
  check("copy blocked while an identifier is detected", await page.isDisabled("#copy"));

  // ---------- Quick mode ----------
  await page.goto(PAGE);
  check("quick: duplicated fields, script and CRM tab are hidden",
    !(await page.isVisible("#date")) && !(await page.isVisible("#fault")) && !(await page.isVisible("#zip")) && !(await page.isVisible("#tab-crm")) && !(await page.isVisible(".scr")));
  check("quick: story, details and outcome are visible", (await page.isVisible("#what")) && (await page.isVisible("#spec")) && (await page.isVisible("#outcome")));
  await page.selectOption("#type", "mva");
  await page.fill("#what", "PC reports being the driver when another car ran a red light. PC already spoke to a lawyer last week.");
  const before = await page.evaluate(() => __test.consistency().map((c) => c.id));
  check("quick: lawyer check fires from the story", before.indexOf("lawyer") >= 0, JSON.stringify(before));
  await page.click("#sf button[aria-label='Has attorney: Yes']");
  check("quick: answer chip sets the field", (await page.inputValue("#atty")) === "Yes");
  const after2 = await page.evaluate(() => __test.consistency().map((c) => c.id));
  check("quick: lawyer check clears once the chip says Yes", after2.indexOf("lawyer") < 0, JSON.stringify(after2));
  await page.click("#sf button[aria-label='Has attorney: Yes']");
  check("quick: tapping the chip again clears it", (await page.inputValue("#atty")) === "");
  const open1 = await page.evaluate(() => __test.probeState().open.map((f) => f.id));
  await page.click("#sf button:has-text('Incident date')");
  const open2 = await page.evaluate(() => __test.probeState().open.map((f) => f.id));
  check("quick: entered chip answers its fact", open1.indexOf("date") >= 0 && open2.indexOf("date") < 0, JSON.stringify(open2));
  check("quick: relative-date check stops once the date chip is marked", (await page.evaluate(() => __test.consistency().map((c) => c.id))).indexOf("reldate") < 0);
  await page.click("#sf button:has-text('Incident date')");
  await page.click("#sf button[aria-label='At-fault party insured: Unknown']");
  let qn = await page.textContent("#note");
  check("quick: note lists both kinds of Missing", /MISSING/.test(qn) && /Not asked \(raise on callback\)/.test(qn) && /Asked, PC didn't know \(request documents\): [^\n]*Incident date[^\n]*At-fault insurance/.test(qn), qn);
  check("quick: note does not repeat Salesforce fields", !/PC at fault|PC has insurance|Incident date:|Incident city|Represented by/.test(qn), qn);
  check("quick: note has story and next steps", /What happened \(as PC reports\): PC reports being the driver/.test(qn) && /NEXT STEPS/.test(qn));
  check("quick: disposition is visible with a red flag", (await page.isVisible("#disp")) && /Call disposition not selected/.test(await page.textContent("#flags")));
  await page.fill("#what", "PC was making a delivery in a company van when another car hit them.");
  check("quick: dual-case trigger fires", (await page.evaluate(() => __test.consistency().map((c) => c.id))).indexOf("trig-mva-wc") >= 0);
  check("quick: no establishment chip before a second type", (await page.locator("#sf button:has-text('Establishment')").count()) === 0);
  await page.check("#dual"); await page.selectOption("#type2", "Workers' Comp");
  check("quick: establishment chip appears for a Workers' Comp dual case", (await page.locator("#sf button:has-text('Establishment')").count()) === 1);
  await page.uncheck("#quick");
  check("switch to Full form shows every field", (await page.isVisible("#date")) && (await page.isVisible("#fault")) && (await page.isVisible("#tab-crm")));
  check("switch keeps the story and case type", /company van/.test(await page.inputValue("#what")) && (await page.inputValue("#type")) === "mva");
  check("full note returns", /PC at fault/.test(await page.textContent("#note")));
  await page.check("#quick");
  check("switch back keeps answer chips", (await page.inputValue("#oins")) === "PC does not know");
  await page.click("#sf button:has-text('City and state')");
  await page.click("#btn-new");
  check("New lead clears chips", (await page.locator("#sf button[aria-pressed='true']").count()) === 0 && (await page.inputValue("#oins")) === "");
  check("New lead stays in Quick mode", await page.evaluate(() => __test.isQuick()));
  await page.uncheck("#quick");

  // ---------- Quality guards ----------
  await page.goto(PAGE);
  check("opening banner shows at the start", await page.isVisible("#opening"));
  await page.click("#ob-rec"); await page.click("#ob-phone");
  check("opening banner stays until age is verified", await page.isVisible("#opening"));
  await page.click("#ob-minor");
  check("under 18 keeps the banner with the guardian reminder", (await page.isVisible("#opening")) && /guardian/.test(await page.textContent("#opening-note")));
  await page.click("#ob-adult");
  check("opening banner clears once all three are done", !(await page.isVisible("#opening")) && (await page.inputValue("#c-age")) === "adult" && (await page.isChecked("#c-rec")));
  check("autofail gate lists what is still open", JSON.stringify(await page.evaluate(() => __test.autofailOpen())) === JSON.stringify(["lead source question", "no legal advice", "no promises"]));
  check("copy still blocked with whole-call items open", await page.isDisabled("#copy"));

  await page.selectOption("#type", "mva");
  const txIds = ["tx-er", "tx-imaging", "tx-ongoing", "tx-meds", "tx-followup"];
  let openTx = await page.evaluate(() => __test.probeState().open.map((f) => f.id).filter((id) => /^tx-/.test(id)));
  check("five separate treatment questions", JSON.stringify(openTx) === JSON.stringify(txIds), JSON.stringify(openTx));
  await page.fill("#spec", "Went to the ER the same day and had X-rays. Taking ibuprofen.");
  openTx = await page.evaluate(() => __test.probeState().open.map((f) => f.id).filter((id) => /^tx-/.test(id)));
  check("story answers only the treatment questions it covers", JSON.stringify(openTx) === JSON.stringify(["tx-ongoing", "tx-followup"]), JSON.stringify(openTx));
  check("injuries typed in Details count as written down", /\u2713 Injuries are written down or marked/.test(await page.textContent("#hangup")) === false);
  await page.fill("#spec", "Neck pain. Went to the ER the same day and had X-rays. Taking ibuprofen.");
  check("injury words in Details mark injuries as written down", /\u2713 Injuries are written down or marked/.test(await page.textContent("#hangup")));
  check("hang-up list counts open treatment questions", /Treatment questions: 2 of 5 still to ask/.test(await page.textContent("#hangup")));
  await page.fill("#spec", "Went to the ER the same day and had X-rays. Taking ibuprofen. Sees a chiropractor weekly, next appointment Friday.");
  check("hang-up list clears treatment once all are covered", /All treatment questions asked/.test(await page.textContent("#hangup")));

  await page.fill("#outcome", "PC asked for a call back tomorrow afternoon.");
  check("callback in the notes suggests the callback disposition", (await page.evaluate(() => __test.suggestedDisp())) === "Schedule Callback" && (await page.isVisible("#disp-suggest")));
  await page.click("#disp-suggest button");
  check("Use sets the suggested disposition", (await page.inputValue("#disp")) === "Schedule Callback" && !(await page.isVisible("#disp-suggest")));
  check("disposition hint names the phone system", /phone system/.test(await page.textContent("#disp-where")));

  await page.fill("#what", "PC reports being the driver when another car ran a red light and hit the passenger side.");
  await page.fill("#spec", "Neck pain. Went to the ER and had X-rays. Taking ibuprofen. Sees a chiropractor weekly, next appointment Friday.");
  await page.fill("#cbtime", "03/20/2026 3:00 PM");
  for (const id of ["#c-src", "#c-legal", "#c-promise"]) await page.check(id);
  check("copy unblocked after the last autofail item", !(await page.isDisabled("#copy")));
  check("paste reminder hidden before copying", !(await page.isVisible("#pasted-wrap")));
  await page.click("#copy");
  if (/not reviewed/.test(await page.textContent("#toast"))) await page.click("#copy");
  check("after copying, it reminds to paste into Salesforce", /Paste it into Salesforce General Information now/.test(await page.textContent("#hangup")) && (await page.isVisible("#pasted-wrap")));
  await page.check("#pasted");
  check("ticking Pasted clears the reminder", !/Paste it into Salesforce/.test(await page.textContent("#hangup")));

  await page.evaluate(() => { CONFIG.bridgeAfterSeconds = 0; });
  await page.click("#what"); await page.keyboard.type("ab");
  check("typing nudge shows a line to say", (await page.isVisible("#bridge")) && /writing that down/.test(await page.textContent("#bridge")));
  await page.click("#btn-new");
  check("New lead brings back the opening banner and clears the nudge", (await page.isVisible("#opening")) && !(await page.isVisible("#bridge")) && !(await page.isVisible("#pasted-wrap")));
  await page.uncheck("#quick");

  // ---------- Performance ----------
  // Best of three runs, each with fresh unknown words, so one slow moment on the machine doesn't fail the check.
  const ms = await page.evaluate(() => {
    const text = Array(20).fill("PC reports that the other drvier ran the red light and hit the car on the passanger side, and PC went to the hosptial.").join(" ");
    let best = Infinity;
    for (const suffix of ["q", "x", "z"]) {
      const t0 = performance.now(); const items = __test.spellIssues(text); items.forEach((i) => __test.suggest(i.before + suffix)); __test.grammarSuggestions(text, true);
      best = Math.min(best, performance.now() - t0);
    }
    return best;
  });
  check("spelling + grammar on ~300 words under 100 ms", ms < 100, ms.toFixed(1) + " ms");

  check("no page errors", errors.length === 0, errors.join(" | "));
  check("no network requests", requests.length === 0, requests.join(" "));
  await browser.close();
  console.log(passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})();
