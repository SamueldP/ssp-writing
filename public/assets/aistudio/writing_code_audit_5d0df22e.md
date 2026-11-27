# Subspace Protocols — Read-Only Writing & Narrative Code Audit

> **Audit Scope:** Complete read-only audit of all C# source files (`Core/`, `Data/`, `Simulation/`, `Procedural/`, `UI/`, `Program.cs`) and all JSON data files (`data/`). Zero game code or data files were modified.  
> **Purpose:** 1-to-1 reference for syncing an external HTML writing workbench to the exact C# state machine, active JSON schemas, live placeholders/fallbacks, UI text budgets, and code-vs-JSON mismatches.

## Table of Contents
1. [Exact Ship Encounter & Dialogue Flow (Turn-by-Turn)](#1-exact-ship-encounter--dialogue-flow-turn-by-turn)
2. [Active JSON Data Schemas (Exact Keys & Paths)](#2-active-json-data-schemas-exact-keys--paths)
3. [Complete Inventory of Current Text, Placeholders & Hardcoded Strings](#3-complete-inventory-of-current-text-placeholders--hardcoded-strings)
4. [UI Text Width & Formatting Constraints](#4-ui-text-width--formatting-constraints)
5. [Summary Action List for Workbench Sync](#5-summary-action-list-for-workbench-sync)

---

## 1. Exact Ship Encounter & Dialogue Flow (Turn-by-Turn)

### Core State Machines & Comms Pacing
- **`DeskScreen.EncounterPhase`** (`UI/DeskScreen.cs:23-38`):
  `BayEmpty (0)` → `ShipGlidingIn (1)` → `OpeningGreetingDelay (2)` → `[optional: AwaitingAutoShieldsDrop (12)]` → `AwaitingPortForDownload (3)` / `DownloadingProtocols (4)` ↔ `DownloadAborted (5)` → `InspectingSlateAndShip (6)` → `UploadingClearance (7)` → `AwaitingClearanceReturnToTopPort (8)` → `TransmittingClearance (9)` → `ResolvingDecision (11)` → `BayEmpty (0)`.
  - **Detain branch** (reachable from phases `2`, `12`, `3`, `4`, `5`, `6`, `8`): → `DetainClamping (10)` → `FinalizeShipResolution()` → `BayEmpty (0)`.
- **`DeskScreen.PreShiftStage`** (`UI/DeskScreen.cs:58-66`):
  `None (0)`, `Day1VorstLiveHail (1)`, `Day3KordaniLiveHail (2)` *(actually fires on `DayUnlockWarpScanner`, default Day 4)*, `Day2NixaLiveHail (3)`, `Day8NixaLiveHail (4)`, `Day15ForemanLiveHail (5)`.
- **`DeskScreen.FaultSequenceStage`** (`UI/DeskScreen.cs:80-85`):
  `None (0)`, `FaultBeat (1)` (`0.50s`), `OfficerAccusationPause (2)`.
- **`DeskScreen.DataSlateTelemetryState`** (`UI/DeskScreen.cs:47-56`):
  `Empty (0)`, `Downloading (1)`, `DownloadAborted (2)`, `Loaded (3)`, `UploadingClearance (4)`, `ClearedReadyToTransmit (5)`, `TransmittingClearance (6)`.
- **`CommsTypewriterQueue`** (`Simulation/CommsTypewriterQueue.cs`):
  - Routine encounter spoken lines stream at `65 chars/sec` (`data/config.json:22`); talking-head pre-shift hails stream at `32 chars/sec` with `0.95s` line pause (`data/config.json:25-26`).
  - Automatically inserts `ShiftController.SubspaceReceivingLagSeconds` (`0.60s`, displaying `[RECEIVING...]`) whenever `Speaker == Captain && _lastSpokenSpeaker == Officer && !IsInstant && !SuppressAutoReceivingLag` (`CommsTypewriterQueue.cs:611-626`).

> ### Key Ordering & Architecture Answers
> 1. **Reputation Greeting Variants (`greetingsHostile` / `greetingsWarm`) Do NOT Exist:** `FactionDialoguePool.FactionPoolEntry` (`Simulation/FactionDialoguePool.cs:15-28`) only reads `greetings`, `excuses`, `detentionReactions`, and `recentCallbacks`. Faction reputation (`factionRep`) currently only alters:
>    - `ShieldsLoweredLine` (`<= -5`: `"Fine. Dropping shields now."`, else `"Shields down."` — `ShipGenerator.cs:1024-1026`)
>    - `WeaponsPoweredDownLine` (`<= -5`: `"Cutting weapon power."`, else `"Weapons cold."` — `ShipGenerator.cs:1028-1030`)
>    - `ComplianceDelaySeconds` (`>= +6`: `0.20f`, mid: `0.55f`, `<= -5`: `1.35f` — `ShipGenerator.cs:687-689`)
>    - Day `DayUnlockHostilityDestroy` (default `22`) + `rep <= -9` outright shields/weapons refusal (`ShipGenerator.cs:379-382`, `ShiftController.cs:178-181, 212-215`).
> 2. **Exact Chronological Order (`greetings` vs. Protocol Request vs. Shields vs. Weapons):**
>    - **1st — `greetings` (+ inline `recentCallbacks`):** Fires immediately when `ShipGlidingIn` (`3.2s`) finishes (`DeskScreen.cs:1718-1735`). Any matched `recentCallbacks` line is **appended onto the end of `GreetingHailLine` separated by a single space** (`ShipGenerator.cs:1013-1022`), NOT queued as a separate message.
>    - **2nd — `"Send subspace protocols."`:** Enqueued `0.18s` after `OpeningGreetingDelay` starts (with `preDelaySeconds: 0.10f` behind the greeting, `DeskScreen.cs:1740-1745, 2025-2030`).
>    - **3rd — `"Shields down, please."`:** Fires **ONLY if `ActualShieldsUp == true`**, enqueued immediately inside `InitiateSubspaceProtocolRequest()` (`DeskScreen.cs:2032-2040`) after `"Send subspace protocols."`, separated by an instant `"..."` beat (`preDelaySeconds: 0.25f`) and `preDelaySeconds: 0.20f`.
>    - **4th (On-Demand Mid-Inspection) — `"Power down weapons."`:** **NEVER fires on arrival.** Fires **ONLY on Day 2+ (`IsSpsUnlocked`) when the player opens the SPS Probe and sweeps the reticle near a hot weapon mount** (after shields are down) inside `UpdateSpsHoldToLock()` (`UI/DeskScreen.HardwareModules.cs:143-164`). Debounced to at most once per ship (`_autoSpsWeaponsOrderTriggered`).
> 3. **Dead/Unimplemented Encounter Paths:**
>    - `ComplianceOrderOutcome.AlreadyCompliant` (`DeskScreen.cs:1952-1954, 1977-1979`), `ComplianceOrderOutcome.SpoofedDeflection` (`DeskScreen.cs:1985-1989` / `SpoofedWeaponsDeflectionLine`), and `ShipSpec.ConfrontationInnocentProtest` (`ShipGenerator.cs:898-899, 1132-1133`) are unreachable/unused in live play.
>    - **Bribes / Stings:** Not implemented at runtime (scaffolding only; `ValidationEngine.cs` hardcodes `tookBribe: false` on all 7 `RecordShipEncounterOnce` call sites).
>    - **Day 9 Ghost:** Not implemented anywhere in C# or JSON.
>    - **Raids (`RaidController.cs`):** Fire during **Evening Sleep** in Quarters (`UI/QuartersScreen.cs:449-453`), never during Booth 04 encounters.

---

### Turn-by-Turn Encounter Script Timeline

#### Stage 0: Pre-Shift Live Viewscreen Hails (Before Ship 1, Shift Timer Frozen)
Triggered in `DeskScreen.OnEnter()` (`UI/DeskScreen.cs:1086-1121`):
1. **Day 1** (`!Day1VorstHailCompleted`, `UI/DeskScreen.ProtocolsAndComms.cs:14-46`):
   - `[SYSTEM]` -> `"[INTERNAL HAIL] COMMANDER VORST // KORDANI SECURITY COMMAND"` (`ProtocolsAndComms.cs:36`)
   - `[CAPTAIN / TALKING HEAD]` -> 8 lines of `Day2And3ScriptedDialogue.Day1CommanderVorstHailLines` (`data/Day2And3ScriptedDialogue.cs:16-26`)
   - *(On Hail Close, `ProtocolsAndComms.cs:272-289`)* `[SYSTEM]` -> `"[SYS] INTERNAL HAIL CLOSED -- BOOTH 04 CONSOLE ONLINE."` + Day 1 directive lines + `"PRESS [NEXT HAIL] TO BEGIN DAY 01 WATCH."`
2. **Day 2** (`!Day2NixaHailCompleted`, `ProtocolsAndComms.cs:48-80`):
   - `[SYSTEM]` -> `"[INTERNAL HAIL] REGEER NIXA // CONSORTIUM LOGISTICS"` (`ProtocolsAndComms.cs:70`)
   - `[CAPTAIN / TALKING HEAD]` -> 5 lines of `Day2RegeerNixaHailLines` (`Day2And3ScriptedDialogue.cs:45-52`)
   - *(On Hail Close, `ProtocolsAndComms.cs:290-307`)* `[SYSTEM]` -> `"[SYS] CONSORTIUM HAIL CLOSED -- SPS PROBE ONLINE."` + Day 2 directive lines + `"PRESS [NEXT HAIL] TO BEGIN DAY 02 WATCH."`
3. **Day `DayUnlockWarpScanner` (default Day 4)** (`!Day4PreShiftHailCompleted`, `ProtocolsAndComms.cs:116-161`):
   - `[SYSTEM]` -> `BuildDay4ShiftDirectiveLines(...)` (Detained vs. Cleared variant, `ProtocolsAndComms.cs:143-150`)
   - `[SYSTEM]` -> `"[INTERNAL HAIL] COMMANDER VORST // KORDANI SECURITY COMMAND"` (`ProtocolsAndComms.cs:151`)
   - `[CAPTAIN / TALKING HEAD]` -> 4 lines of `BuildDay4KordaniHailLines(...)` (`Day2And3ScriptedDialogue.cs:71-97`)
   - *(On Hail Close, `ProtocolsAndComms.cs:344-352`)* `[SYSTEM]` -> `"[SYS] INTERNAL HAIL CLOSED -- WARP SPECTROMETER & SECURITY STRIKES ONLINE."` + `$"PRESS [NEXT HAIL] TO BEGIN DAY {_gameState.Day:D2} WATCH."`
4. **Day `DayUnlockManualPart1` (default Day 8)** (`!Day8NixaHailCompleted`, `ProtocolsAndComms.cs:82-114`):
   - `[SYSTEM]` -> `"[INTERNAL HAIL] REGEER NIXA // CONSORTIUM LOGISTICS"` (`ProtocolsAndComms.cs:104`)
   - `[CAPTAIN / TALKING HEAD]` -> 7 lines of `Day8RegeerNixaHailLines` (`Day2And3ScriptedDialogue.cs:55-64`)
   - *(On Hail Close, `ProtocolsAndComms.cs:308-325`)* `[SYSTEM]` -> `"[SYS] CONSORTIUM HAIL CLOSED -- BRENGOP REFERENCE MANUAL ISSUED."` + Day 8 directive lines + `$"PRESS [NEXT HAIL] TO BEGIN DAY {_gameState.Day:D2} WATCH."`
5. **Day `DayUnlockStoker` (default Day 15)** (`!Day15ForemanHailCompleted`, `ProtocolsAndComms.cs:163-195`):
   - `[SYSTEM]` -> `"[INTERNAL HAIL] REGEER NIXA // CONSORTIUM LOGISTICS"` (`ProtocolsAndComms.cs:185`)
   - `[CAPTAIN / TALKING HEAD]` -> 4 lines of `Day15BrengopForemanHailLines` (`Day2And3ScriptedDialogue.cs:36-42`)
   - *(On Hail Close, `ProtocolsAndComms.cs:326-343`)* `[SYSTEM]` -> `"[SYS] CONSORTIUM HAIL CLOSED -- STELLAR STOKER MASS DIAL ONLINE."` + Day 15 directive lines + `$"PRESS [NEXT HAIL] TO BEGIN DAY {_gameState.Day:D2} WATCH."`
6. **All Other Days (`DeskScreen.cs:1106-1121`)**: No hail; `BuildDailyShiftDirectiveLines(...)` prints directly as `[SYSTEM]` lines.

---

#### Stage 1: Ship Arrival & Greeting + Inline `recentCallbacks`
1. Player clicks `[NEXT HAIL]` (`UI/DeskScreen.HardwareModules.cs:373-378`) → `StartNextShipEncounter()` (`DeskScreen.cs:2682-2756`), enters `ShipGlidingIn` (`3.2s`):
   - `[SYSTEM]` -> `"APPROACH VECTOR LOCKED -- VESSEL GLIDING INTO BAY..."` (`DeskScreen.cs:2751`)
2. Approach completes (`_shipApproachElapsed >= 3.2f`, `DeskScreen.cs:1718-1735`): clears `_commsQueue` (removing the approach vector line), enters `OpeningGreetingDelay` (`0.18s`):
   - *(Day 3 Ghost Route only)* Sets `_ghostRouteTransponderFlickerTimer = 0.50f` (`DeskScreen.cs:1727-1730`).
   - `[CAPTAIN]` -> `$"HAIL [{_activeShip.Slate.RegistrationCode}]: {_activeShip.GreetingHailLine}"` (`DeskScreen.cs:1734`)
     - *Assembly order (`ShipGenerator.cs:995-1022`):* Hardcoded prefix greeting → overridden by `FactionDialoguePool.TryPickGreeting(prefix, spec)` if non-TODO → if `EncounterHistoryQuery.GetRecentFactionPattern(...)` returns `TookBribe` > `RepeatedDetentions (>=2)` > `ClearedViolation (>=1)` within `[day-3 .. day-1]`, `FactionDialoguePool.TryPickRecentCallback(...)` is appended inline: `"{greeting} {callbackLine}"`. *(Day 3 Ghost Route bypasses `PopulateDialogueLines`, so it never pulls from `faction_pools.json` or `recentCallbacks`.)*

---

#### Stage 2: Protocol Request & Automatic Shields-Down Cadence
3. `0.18s` into `OpeningGreetingDelay` (`DeskScreen.cs:1739-1747`) → `InitiateSubspaceProtocolRequest()` (`DeskScreen.cs:2025-2044`):
   - `[OFFICER]` -> `> BOOTH 04: "Send subspace protocols."` (`preDelaySeconds: 0.10f`, `DeskScreen.cs:2030`)
4. **If `ActualShieldsUp == true` (`DeskScreen.cs:2032-2041`)**:
   - `[SYSTEM]` -> `"..."` (`preDelaySeconds: 0.25f`, `DeskScreen.cs:2036`)
   - `[OFFICER]` -> `> BOOTH 04: "Shields down, please."` (`preDelaySeconds: 0.20f`, `DeskScreen.cs:2037`)
   - Enters `AwaitingAutoShieldsDrop` (`_autoShieldsPostSpeechBeat = Clamp(ComplianceDelaySeconds * 0.5f, 0.12f, 0.35f)`), then calls `CompleteAutoShieldsCompliance()` (`DeskScreen.cs:2046-2073`):
     - *If `RefusedOutright` (Day >= `DayUnlockHostilityDestroy` [22] & `rep <= -9` & `WillRefuseShieldsCompliance`):*
       - `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.RefusalLine}\""` (`DeskScreen.cs:2058`)
       - `[SYSTEM]` -> `"[SYS] COMPLIANCE REFUSAL VERIFIED."` (`DeskScreen.cs:2059`)
       - Marks `ProtocolReviewVerified = true` and jumps directly to `InspectingSlateAndShip` (skips telemetry download).
     - *If `Complied`:*
       - `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.ShieldsLoweredLine}\""` (`DeskScreen.cs:2068`)
       - `[SYSTEM]` -> `"[SYS] SHIELDS LOWERED -- SUBSPACE CHANNEL CLEAR."` (`DeskScreen.cs:2069`)
       - Proceeds to Step 5.
5. **Shields Clear (`BeginProtocolTransferAfterShieldsClear()`, `DeskScreen.cs:2075-2096`)**:
   - *Primary Data Slate in Slate Bus:* Starts `DownloadingProtocols` (`1.80s`, `BeginSubspaceProtocolsDownload(false)`, `DeskScreen.cs:2136-2163`).
   - *Blank Contraband Slate in Slate Bus:* `[SYSTEM]` -> `"[SLATE BUS] RECEIVING SUBSPACE PROTOCOL PACKET..."` (`DeskScreen.cs:2132`).
   - *Slate Bus empty:* `[SYSTEM]` -> `"[SLATE BUS] NO SLATE DETECTED -- PLUG DATA SLATE INTO SLATE BUS."` (`DeskScreen.cs:2094`).

---

#### Stage 3: Protocol Download Completion, Wafer Demux & Auto-Interrogation
6. Primary Data Slate download hits `1.80s` → `CompleteSubspaceProtocolsDownload()` (`DeskScreen.cs:2242-2334`):
   - Enters `InspectingSlateAndShip`.
   - `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.SubspaceUploadLine}\""` (`preDelaySeconds: 0.16f`, shows `[RECEIVING...]`, `suppressAutoReceivingLag: true`, `DeskScreen.cs:2293-2298`).
7. **Day 12+ Cargo Manifest Cert-Wafer Demux** (`IsWaferWriterOperational && ExpectsCargoManifestWafer`, `DeskScreen.cs:2301-2319`):
   - *First arrival ever (`!Day12CargoIntroShown`):* `[SYSTEM]` -> `"[WAFER DEMUX] Ceramic Cargo Manifest wafers now print per arrival. Wipe used wafers in top slot (3 blanks)."` (`DeskScreen.cs:2308`)
   - *If `CargoManifestInitiallyOmitted`:* `[SYSTEM]` -> `"[WAFER WRITER] NO CARGO MANIFEST PACKET IN SUBSPACE BUNDLE."` (`DeskScreen.cs:2313`)
   - *Else if hopper empty (`_waferHopperCount <= 0`, `DocumentsAndDrag.cs:1852-1854`):*
     - `[SYSTEM]` -> `"[WAFER WRITER] HOPPER EMPTY (0/3) -- PRINT HELD. WIPE A WAFER IN TOP SLOT."`
     - `[SYSTEM]` -> `"NOTE: \"Oh yes, don't forget to wipe the wafers clean\u2014we only gave you enough for what you need.\""`
8. **Auto-Interrogation** (`_gameState.Day >= 1`, `DeskScreen.cs:2322-2333`):
   - `[OFFICER]` -> `> BOOTH 04: "Confirm route, purpose of visit, and cargo."` (`preDelaySeconds: 0.08f`, `DeskScreen.cs:2325`)
   - `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.AutoInterrogationReplyLine}\""` (`isCaptainStatementEvidence: true`, `DeskScreen.cs:2326-2332`).
     - *Routine example (`ShipGenerator.cs:1081-1082`):* `"{spokenOrigin} to {shortDest}. {shortPurpose}. {spokenCargo}."` (`preDelaySeconds: 0.18f`, shows `[RECEIVING...]`, `suppressAutoReceivingLag: true`).
     - *Day 3 Ghost Route (`ShipGenerator.cs:873-875`):* `"Inbound from {declaredOrigin} -- uh, I mean, departed {declaredOrigin} four cycles ago. Heading to {destination}. Purpose is {slotPurpose}. Hold is carrying {slotCargoSpeech}"` (`preDelaySeconds: 0f`, `suppressAutoReceivingLag: false` → `0.60s` `[RECEIVING...]`).

---

#### Stage 4: Mid-Encounter Interactions (Inspection Phase)

##### 4A. Slate Bus Unplug & Re-Transmit Interruptions
- **Unplug Primary Data Slate mid-download (`DownloadingProtocols`, `DocumentsAndDrag.cs:530-542` → `DeskScreen.cs:2165-2178`)**:
  - `[SYSTEM]` -> `"[PORT ERROR] DATA SLATE UNPLUGGED MID-DOWNLOAD -- TRANSMISSION ABORTED."`
  - `[SYSTEM]` -> `"[SLATE BUS] RE-PLUG SLATE INTO SLATE BUS AND CLICK [RE-TRANSMIT]."`
- **Unplug Blank Contraband Slate mid-download (`DeskScreen.cs:2180-2212`)**:
  - *Day 6+ (silent mode):* `[SYSTEM]` -> `"[SLATE BUS] SLATE REMOVED -- READY FOR PRIMARY SLATE."` (`:2199`)
  - *Days 1–5:* `[SYSTEM]` -> `"[PORT ERROR] BLANK SLATE UNPLUGGED MID-DOWNLOAD -- TRANSMISSION ABORTED."` + `"[SLATE BUS] RE-PLUG SLATE INTO SLATE BUS AND CLICK [RE-TRANSMIT]."` (`:2210-2211`)
- **Click `[RE-TRANSMIT]` (`HardwareModules.cs:324-330` → `TryTriggerReTransmit`, `DeskScreen.cs:2214-2240`)**:
  - *Slate Bus empty:* `[SYSTEM]` -> `"[SLATE BUS] PLUG DATA SLATE INTO SLATE BUS FIRST BEFORE RE-TRANSMIT."` (`:2225`)
  - *After silent Blank Slate swap (`_silentBlankSlateCaptureMode == true`):* `[OFFICER]` -> `> BOOTH 04: "Send subspace protocols."` (`:2232`, no annoyed reply)
  - *Normal abort:*
    - `[OFFICER]` -> `> BOOTH 04: "Link dropped. Re-transmit subspace protocols."` (`:2236`)
    - `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.ReTransmitAnnoyedLine}\""` (`:2237`)
  - *After `0.55s` (`DeskScreen.cs:1795-1813`):* restarts download (`"[SLATE BUS] RE-SYNCING SUBSPACE PROTOCOL PACKET..."` `:2159`), or if unplugged during delay: `"[SLATE BUS] PLUG DATA SLATE INTO SLATE BUS & CLICK [RE-TRANSMIT]."` (`:1810`).
- **Blank Slate Intercept Swap mid-Inspection (`DocumentsAndDrag.cs:785-799` → `DeskScreen.cs:2120-2128`)**:
  - `[OFFICER]` -> `> BOOTH 04: "Send subspace protocols."` (`:2124`)
  - `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.SubspaceUploadLine}\""` (`:2125`)
  - `[SYSTEM]` -> `"[SLATE BUS] RECEIVING SUBSPACE PROTOCOL PACKET..."` (`:2127`)
  - *On finish (`DeskScreen.cs:2248-2286`):* logs `[UNAUTH_IO]`, emits `[SYSTEM]` -> `"[SLATE BUS] SUBSPACE TELEMETRY SYNC COMPLETE."` (`:2273, 2278`) or `"[SLATE BUS] STANDBY -- SLOT PRIMARY SLATE & CLICK [RE-TRANSMIT]."` (`:2283`).
- **Prematurely Wiped Cert-Wafer `[RE-TRANSMIT]` (`DocumentsAndDrag.cs:1910-1926`)**:
  - `[OFFICER]` -> `> BOOTH 04: "Re-transmit auxiliary certificates."` (`:1918`)
  - `[CAPTAIN]` -> `"CAPT: \"Already sent them. Sending again.\""` (`:1921`)
  - Re-ejects wafer after `0.55s` (`DocumentsAndDrag.cs:2033-2042`).

##### 4B. Day 2+ Auto-SPS Weapons Power-Down Order
Triggered once per ship when SPS lens sweeps near a hot weapon mount (`HardwareModules.cs:143-164`):
- `[OFFICER]` -> `> BOOTH 04: "Power down weapons."` (`HardwareModules.cs:155`)
- After officer finishes + `ComplianceDelaySeconds` (`0.20s` / `0.55s` / `1.35s`) → `ResolvePendingComplianceOrders()` (`DeskScreen.cs:1971-2017`):
  - *Honest armed ship (`Complied`):* `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.WeaponsPoweredDownLine}\""` (`:2014`) (SPS mounts visibly cool)
  - *Liar (`SpoofedBluff`):* `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.SpoofedWeaponsBluffLine}\""` (`:1983`) (SPS mounts remain orange-hot)
  - *Hostile refusal (`RefusedOutright`):* `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.RefusalLine}\""` (`:1995`), `[SYSTEM]` -> `"[SYS] COMPLIANCE REFUSAL VERIFIED."` (`:1996`)

##### 4C. Day 3 Ghost Route Suspect `[INSPECT ROUTE]` Pushback
Triggered only on Day 3 Ghost Route suspect via `[INSPECT ROUTE]` (`HardwareModules.cs:369-372` → `DeskScreen.cs:2336-2355`):
- `[OFFICER]` -> `> BOOTH 04: "Your departure timing does not match the {declaredOrigin} lane."` (`ShipGenerator.cs:893`, `DeskScreen.cs:2344-2353`) → `0.28s` portrait static flicker
- `[CAPTAIN]` -> (auto `0.60s` `[RECEIVING...]`) `"CAPT: \"Your station's own spectrometer is dark, Port Officer. My slate is green, my weapons are cold, and my papers are legal. Unless you want to explain to Kordani Command why you detained a clean vessel on a hunch, clear my dock.\""` (`ShipGenerator.cs:894-895`, `DeskScreen.cs:2354`)

##### 4D. Protocol Review Officer Challenges & Captain Excuses
Triggered by clicking `[PROTOCOL REVIEW]` and pairing two fields (`UI/DeskScreen.ProtocolsAndComms.cs:569-1281`):
- *Already found (`:857-866`):* `[SYSTEM]` -> `"[SYS] PROTOCOL REVIEW: MISMATCH ALREADY FOUND."`
- *Matching pair (`:1271-1281`):* `[SYSTEM]` -> `"[SYS] PROTOCOL REVIEW: PROTOCOLS MATCH // NO FAULT."`
- *Honest Omitted Cargo Manifest (`!OmittedManifestIsDishonest`):*
  - Pair `StokerMeasuredMassLed` + `DataSlateMass`/`CargoManifestWafer`/`DataSlateCargo` (`:889-913`):
    - `[OFFICER]` -> `> BOOTH 04: "Your hull mass exceeds your Data Slate. Transmit your Cargo Manifest cert-wafer."`
    - `[CAPTAIN]` -> `"CAPT: \"Oversight on bridge -- transmitting Cargo Manifest packet now.\""` (ejects wafer `0.55s` later)
  - Pair `WaferWriterModule` + any target (`:1227-1252`):
    - `[OFFICER]` -> `> BOOTH 04: "Your subspace bundle omitted a Cargo Manifest cert-wafer. Transmit it now."`
    - `[CAPTAIN]` -> `"CAPT: \"Oversight on bridge -- transmitting Cargo Manifest packet now.\""`
- *Confirmed Fault (`BeginProtocolFaultSequence`, `:360-434`):*
  1. Flushes prior routine comms (`FlushAllImmediately(invokeCallbacks: false)`).
  2. `0.50s` `FaultBeat`: `[SYSTEM]` -> `$"[PROTOCOL FAULT] {summary}"` (`:396-409`).
  3. `[OFFICER]` -> `> BOOTH 04: "{officerPrompt}"` (`:412-421`) → `0.28s` portrait static flicker.
  4. `0.60s` `[RECEIVING...]`: `[CAPTAIN]` -> `$"CAPT: \"{captainExcuse}\""` (`:424-433`).

| Discrepancy Pair | `ShipInfractionType` | Officer Challenge (`ProtocolsAndComms.cs`) | `ShipSpec` Excuse Property | `faction_pools.json` Key Lookup (`ShipGenerator.cs:1135-1164`) |
|---|---|---|---|---|
| `DataSlatePrefix` + `VisualSignalTransponderId` | `TransponderIdMismatch` | `"Our raw transponder reads '{RawTransponderId}', which does not match your Data Slate code '{RegistrationCode}'."` (:448) | `ConfrontationGuiltyExcuseTransponderId` | `"TransponderMismatch"` → `"General"` → C# fallback |
| `DataSlateExpiry` + `TopHeaderCycle` | `ExpiredRegistration` | `"Your registration expired on {RegistrationExpiryDisplay}. Current cycle is {curCycle}."` (:454) | `ConfrontationGuiltyExcuseExpired` | `"ExpiredRegistration"` → `"General"` → C# fallback |
| `DataSlatePrefix`/`Org` + `DataSlateOrg` / Manual `Prefix`/`Species` | `PrefixOrganizationMismatch` | `"Prefix '{DeclaredPrefix}' does not belong to '{DeclaredFactionName}'."` (:459) | `ConfrontationGuiltyExcuseOrgMismatch` | `"PrefixOrganizationMismatch"` → `"General"` → C# fallback |
| `DataSlatePrefix`/`Org`/`Species` + `DataSlateSpecies` / Manual `Prefix`/`Species` | `PrefixSpeciesMismatch` | `"Prefix '{DeclaredPrefix}' is restricted and does not permit a {DeclaredCaptainSpecies} captain."` (:464) | `ConfrontationGuiltyExcuseSpeciesMismatch` | `"PrefixSpeciesMismatch"` → `"General"` → C# fallback |
| `DataSlatePrefix`/`Org`/`Class` / `ViewportShipHull` + `ViewportShipHull` / Manual `Hull` | `PrefixHullSilhouetteMismatch` (Class) | `"Your Data Slate declares a {ShortClass(Declared)} vessel, yet sensors show a {ShortClass(Actual)} hull silhouette."` (:471) | `ConfrontationGuiltyExcuseClassMismatch` | `"PrefixHullSilhouetteMismatch"` → `"General"` → C# fallback |
| *(same pair)* | `PrefixHullSilhouetteMismatch` (Hull) | `"Your Data Slate declares '{DeclaredPrefix}', which does not match your hull silhouette."` (:476) | `ConfrontationGuiltyExcuseHull` | `"PrefixHullSilhouetteMismatch"` → `"General"` → C# fallback |
| `DataSlateWeapons` + `SpsMiniScreenHotWeapons` / `SpsLensConduit` | `SpoofedWeaponsHot` | `"Your Data Slate claims weapons OFFLINE, yet SPS shows live power feeding forward mounts."` (:482) | `ConfrontationGuiltyExcuseWeapons` | `"SpoofedWeaponsHot"` → `"General"` → C# fallback |
| `DataSlateCargo`/`CargoManifestWafer` + `SpsMiniScreenCargoPower` / `SpsLensConduit` | `UnexplainedCargoPowerDraw` | `"Your manifest declares an empty unpowered hold, yet SPS shows high-draw violet power in your cargo bay."` (:487) | `ConfrontationGuiltyExcuseCargoPower` | `"UnexplainedCargoPowerDraw"` → `"General"` → C# fallback |
| `DataSlateOrigin`/`CommsTranscriptStatement` + `WarpStripPaper` | `FalsifiedOriginWaveform` | `"Your thermal warp strip does not match your declared departure from {OriginSystem}."` (:492) | `ConfrontationGuiltyExcuseOrigin` | `"FalsifiedOriginWaveform"` → `"General"` → C# fallback |
| `CommsTranscriptStatement` + `DataSlateOrigin`/`WarpStripPaper` | `SpokenRouteDiscrepancy` | `"You stated departure from {SpokenOriginSystem} on comms, contradicting your filed origin {OriginSystem}."` (:497) | `ConfrontationGuiltyExcuseSpokenRoute` | **NONE** (always C# fallback) |
| `CommsTranscriptStatement` + `CargoManifestWafer`/`DataSlateCargo` | `SpokenCargoDiscrepancy` | `"You declared {SpokenCargoItem} on comms, contradicting your Cargo Manifest ({WaferCargoManifestItem})."` (:502) | `ConfrontationGuiltyExcuseSpokenCargo` | **NONE** (always C# fallback) |
| `CargoManifestWafer`/`DataSlateCargo` + Manual `Cargo` (or SPS Violet) | `BannedCargoItem` | `"Your Cargo Manifest lists {WaferCargoManifestItem}, which is permanently banned at Void Gate 3."` (:507) | `ConfrontationGuiltyExcuseBannedCargo` | **NONE** (always C# fallback) |
| `CargoManifestWafer` + `DataSlateCargo` | `CargoManifestDiscrepancy` | `"Your Cargo Manifest cert-wafer lists {WaferCargoManifestItem}, contradicting your Data Slate ({CargoManifest})."` (:512) | `ConfrontationGuiltyExcuseManifestMismatch` | **NONE** (always C# fallback) |
| `WaferWriterModule` + any target (dishonest) | `WithheldIllicitCargoManifest` | `"Your subspace bundle omitted the mandatory Cargo Manifest cert-wafer. Produce it or prepare for detention."` (:517) | `ConfrontationGuiltyExcuseWithheldManifest` | **NONE** (always C# fallback) |
| `StokerMeasuredMassLed` + `DataSlateMass`/`CargoManifestWafer`/`DataSlateCargo` | `StokerMassMismatch` | `"Stellar Stoker anchor reads {ActualMass:N0} T, exceeding your declared {DeclaredTonnage:N0} T."` (:523) | `ConfrontationGuiltyExcuseMassMismatch` | **NONE** (always C# fallback; secondary fallback at :525) |
| `ViewportShipHull` (when `_captainRefusedCompliance`, :599-607) | `RefusedShieldsOrWeaponsCompliance` | `"Protocol discrepancy verified on your vessel."` (:530) | `RefusalLine` | **NONE** (always C# fallback) |

> **IMPORTANT `General` FALLBACK TRAP (`ShipGenerator.cs:1157-1164`):** `PickExcuseOrDefault` checks `TryPickExcuse(prefix, "General", spec)` **before** falling back to the C# infraction-specific excuse. Because `FTV-` and `MNG-` have authored `excuses.General` lines while 6 specific keys in JSON are `[TODO...]`, `FTV-` and `MNG-` ships currently speak generic `"General"` excuses for `SpoofedWeaponsHot`, `ExpiredRegistration`, `PrefixOrganizationMismatch`, `PrefixSpeciesMismatch`, `PrefixHullSilhouetteMismatch`, and `UnexplainedCargoPowerDraw` instead of their C# infraction-specific lines.

##### 4E. Covert Delivery Mission Uploads (`DeskScreen.cs:2360-2551`)
- *Upload start (`1.35s`, `DeskScreen.cs:2376`):* `[SYSTEM]` -> `$"[SLATE BUS // TX] UPLOADING COVERT MISSION PAYLOAD TO {_activeShip.Slate.RegistrationCode}..."`
- *Outcome 1 — Intended Recipient (`:2421-2484`):*
  - `[CAPTAIN]` -> `"CAPT: \"Wait -- what is this encrypted burst coming straight off your Slate Bus?!\""` (`suppressAutoReceivingLag: true`, `:2426`)
  - `[CAPTAIN]` -> `"CAPT: \"...Understood, Booth 04. Thank you. Forget this channel ever pulsed.\""` (`preDelaySeconds: 0.45f`, `suppressAutoReceivingLag: true`, `:2430`)
  - `[SYSTEM]` -> `$"[COVERT MISSION COMPLETE] PAYLOAD DELIVERED TO {dockedReg} (+{rewardSc} SC). CRYSTAL BURNT -- UNPLUG SLATE."` (`:2482`)
- *Outcome 3 — Pact Cruiser (`KDF-` or `BMC-`, `:2486-2538`):*
  - `[CAPTAIN]` (`KDF-`, `:2491`) -> `"CAPT: \"Unauthorized telemetry injection on a Kordani Defense Fleet bus?! Security Command is logging Booth 04 immediately!\""`
  - `[CAPTAIN]` (`BMC-`, `:2492`) -> `"CAPT: \"Illegal non-clearance burst onto a Brengop Consortium hull?! Factor Audit is flagging your booth right now!\""`
  - Issues `[AUDIT_FLAG]`, +1 Security Strike (or Warning/Fine), Citation Popup, ejects slate.
- *Outcome 2 — Wrong Non-Pact Ship (`:2540-2551`):*
  - `[CAPTAIN]` -> `"CAPT: \"Uh, Booth 04? You just dumped raw junk telemetry onto my helm buffer. Keep your Slate Bus clean!\""` (`:2543`)
  - `[SYSTEM]` -> `"[SLATE BUS] WRONG RECIPIENT -- COVERT MISSION SLATE EJECTED TO DESK."` (`:2546`)

##### 4F. Bribes, Stings, Day 9 Ghost & Raids
- **Bribes / Stings:** Unimplemented in runtime encounters.
- **Day 9 Ghost:** Unimplemented.
- **Raids (`RaidController.cs`):** Executed during Evening Sleep in Quarters, never at Booth 04.

---

#### Stage 5: Clearance, Detention & Departure
- **Path A — Grant Access (Clearance):**
  1. Drag loaded Data Slate to Clearance Dock (`1.80s`, `DeskScreen.cs:2553-2584`): `[SYSTEM]` -> `"> BOOTH 04: [ENCRYPTING CLEARANCE IN DOCK...]"` (`:2583`). *(If unplugged mid-encryption: `"[CLEARANCE DOCK] ENCRYPTION ABORTED -- SLATE UNPLUGGED (0%)."` `:2600`.)*
  2. Encryption completes (`DeskScreen.cs:1826-1838`): `[SYSTEM]` -> `"[CLEARANCE DOCK] ENCRYPTION 100% -- RETURN DATA SLATE TO SLATE BUS TO TRANSMIT."` (`:1837`).
  3. Drag cleared Data Slate to Slate Bus (`1.80s`, `DeskScreen.cs:2603-2624`): `[SYSTEM]` -> `"[SLATE BUS] TRANSMITTING ENCRYPTED CLEARANCE TO VESSEL..."` (`:2623`). *(If unplugged mid-TX: `"[SLATE BUS] TX CLEARANCE ABORTED -- CLEARED SLATE UNPLUGGED (0%)."` `:2636`.)*
  4. TX completes (`DeskScreen.cs:1859-1869`): `[SYSTEM]` -> `"[SLATE BUS] CLEARANCE TRANSMITTED -- DEPARTURE AUTHORIZED."` (`:1865`). **Captains have NO departure/thank-you line.** Enters `ResolvingDecision` (`1.25s`) → `FinalizeShipResolution()`.
- **Path B — Detain Lever (`DeskScreen.cs:2639-2680`):**
  1. Player pulls Detain Lever → snaps active line & drops pending comms (`SnapActiveAndDropPendingQueue()`, `:2645`), stops active voice clips.
     - `[SYSTEM]` -> `$"> BOOTH 04: [DETAIN LEVER PULLED -- {tag}]"` (`:2669`; `tag` = `VERIFIED: ...`, `UNVERIFIED CLAMP`, or `STATION CLAMPS ENGAGED`).
     - **`detentionReactions` fires HERE (`:2671-2677`):** If `!string.IsNullOrWhiteSpace(_activeShip.DetentionReactionLine)` → `[CAPTAIN]` -> `$"CAPT: \"{_activeShip.DetentionReactionLine}\""` (`suppressAutoReceivingLag: true`).
     - **NO C# Fallback Warning:** `ShipGenerator.cs:1154` sets `DetentionReactionLine = FactionDialoguePool.TryPickDetentionReaction(prefix, spec) ?? string.Empty;`. Because only `FTV-` and `MNG-` have authored `detentionReactions`, **all other 10 factions + Day 3 Ghost Route emit silence on detain**.
  2. `DetainClamping` (`1.80s`): at `65%` (`1.17s`), `[SYSTEM]` -> `"[DATA SLATE] ACTIVE TELEMETRY WIPED."` (`:1906`).
  3. At `100%`, calls `FinalizeShipResolution()` (`DeskScreen.cs:2758-2850`):
     - *Citation:* `[SYSTEM]` -> `$"[CITATION] {result.ViolationReason}"` + `$"[PENALTY] {result.PenaltyText}"` (`:2772-2779`).
     - *Accurate:* `[SYSTEM]` -> `$"[DOCKED] Vessel {result.RegistrationCode} cleared (+{result.ScripDelta} SC)."` or `$"[DETAINED] Vessel {result.RegistrationCode} detained (+{result.ScripDelta} SC)."` (`:2780-2786`).
     - *Stoker Overload:* `[SYSTEM]` -> `"[STOKER OVERLOAD] COIL STRAIN EXCEEDED 100% -- STRUCTURAL FINE & SABOTAGE AUDIT FLAGGED."` (`HardwareModules.cs:2905`).
     - *Shift Timer Expired:* `[SYSTEM]` -> `"BROWN DWARF BELOW HORIZON -- WATCH COMPLETE. PROCEED TO QUARTERS."` (`DeskScreen.cs:2848`).
     - *Console Power-Down:* `[SYSTEM]` -> `"[BOOTH 04] SHIFT COMPLETE -- POWERING DOWN CONSOLES..."` (`DeskScreen.cs:1360`).

---
## 2. Active JSON Data Schemas (Exact Keys & Paths)

### Master JSON Inventory
- **9 static JSON files exist in `data/`**; **zero missing `.json` files** are referenced by C#.
- **`data/quests.json` does NOT exist** and there are **zero references** to `quests.json` anywhere in C#.
- **Runtime user saves** live outside `data/` at `%APPDATA%/SubspaceProtocols/save_slot_1..3.json` (`Core/GameState.cs:206-219`, `PropertyNameCaseInsensitive = true`, `ReadCommentHandling = Skip`, `AllowTrailingCommas = true`, `WriteIndented = true`).
- **Shared Loader (`data/DataLoader.cs:9-40`):** `DataLoader.DefaultOptions` (`PropertyNameCaseInsensitive = true`, `ReadCommentHandling = Skip`, `AllowTrailingCommas = true`, `WriteIndented = true`). `LoadJson<T>` resolves `Path.Combine(AppContext.BaseDirectory, "data", fileName)` and returns `null` if missing (no `try/catch` around `JsonSerializer.Deserialize`). Used by `forum.json`, `covert_missions.json`, `sector_map.json`; the remaining loaders deserialize directly.

| Relative Path | C# Loader & Model (`File:Line`) | Options | Runtime Usage & Caching | `[TODO]` / Empty Handling |
|---|---|---|---|---|
| `data/dialogue/faction_pools.json` | `Simulation/FactionDialoguePool.cs:123-161` | `CaseInsensitive`, `Skip` comments, `TrailingCommas` | Static cached (`_loaded`) | `IsPlayableLine`: skips null/whitespace or `TrimStart().StartsWith("[TODO", OrdinalIgnoreCase)` |
| `data/forum.json` | `data/ForumModels.cs:64-65` (`DataLoader`) | `DataLoader.DefaultOptions` | Reloaded per Terminal open | `TerminalOverlay.StripAuthoringTodoTags` strips `[TODO...]` in `Title` & `Body` only |
| `data/covert_missions.json` | `data/ForumModels.cs:167-177` (`DataLoader`) | `DataLoader.DefaultOptions` | Static cached (`_cachedInstance`) | Partial `StripAuthoringTodoTags`; **`[PLACEHOLDER ...]` & `assigningFaction` `[TODO]` leak!** |
| `data/sector_map.json` | `data/SectorMapModels.cs:245-250` (`DataLoader`) | `DataLoader.DefaultOptions` | Loaded by `StarChartModal.cs` | Empty `faction`/`tag`/`export` **default TO literal `"[TODO]"`** and render live |
| `data/cargo_catalog.json` | `data/CargoCatalog.cs:50-84` | `CaseInsensitive`, `Skip` comments, `TrailingCommas` | Static cached (`_cached`) | Falls back to `CreateDefault()` if pools empty or `< 5` banned items |
| `data/voice_profiles.json` | `Core/AudioHooks.cs:487-525` | `CaseInsensitive`, `Skip` comments, `TrailingCommas` | Cached on init | Falls back to `SeedMissingDefaultProfiles()` |
| `data/corridor_sprites.json` | `data/CorridorSpriteConfig.cs:106-126` | `CaseInsensitive`, `Skip` comments, `TrailingCommas` | Loaded by `ArtTestScreen.CorridorTab.cs` only (NOT `CorridorScreen.cs`) | `NormalizeDefaults()` backfills empty strings/collections |
| `data/config.json` | `Core/ConfigFlags.cs:311-377` | `CaseInsensitive`, `Skip` comments, `TrailingCommas`, `JsonStringEnumConverter` | Loaded at startup; regex-patched on settings save | Missing/invalid falls back to `new ConfigFlags()`; clamps ranges |
| `data/placeholders_todo.json` | **NONE** (smoke-test read only at `Program.cs:2398`) | N/A | **Never loaded by game runtime** | On-disk authoring tracker only |

---

### 2.1 `data/dialogue/faction_pools.json`
- **Loader:** `Simulation/FactionDialoguePool.cs:123-161` (`ReloadCore`).
- **Exact JSON Schema (`FactionPoolEntry`, `FactionDialoguePool.cs:15-28`):**
  - Root object: `Dictionary<string, FactionPoolEntry>` keyed by the 13 normalized prefixes: `"FTV-"`, `"MNG-"`, `"KDF-"`, `"BMC-"`, `"FTC-"`, `"ORN-"`, `"ZNI-"`, `"PRJ-"`, `"TLV-"`, `"KRW-"`, `"HBR-"`, `"GUV-"`, `"DEFAULT"`.
  - Each value has 4 camelCase properties (`[JsonPropertyName]`):
    - `"greetings"`: `string[]` (`List<string>? Greetings`)
    - `"excuses"`: `Record<string, string[]>` (`Dictionary<string, List<string>>? Excuses`)
    - `"detentionReactions"`: `string[]` (`List<string>? DetentionReactions`)
    - `"recentCallbacks"`: `Record<string, string[]>` (`Dictionary<string, List<string>>? RecentCallbacks`)
- **Template Tokens (`ApplyTokens`, `FactionDialoguePool.cs:240-255`):** `{shipName}`, `{reg}`, `{origin}`, `{destination}` (case-insensitive).
- **Placeholder / Empty Handling:**
  - `IsPlayableLine` (`FactionDialoguePool.cs:71-78`) rejects `null`, whitespace, and strings starting with `"[TODO"` (case-insensitive). *Caveat: trailing inline `[TODO]` suffixes would NOT be skipped.*
  - Falls back from faction bucket → `"DEFAULT"` bucket → `null` (`TryPickFromFactionOrDefault`, `:163-193`).
- **Schema Mismatch Audit:**
  - **`greetingsHostile` / `greetingsWarm`:** **Missing from BOTH JSON and C#.** Zero references exist codebase-wide.
  - **`recentCallbacks`:** Exact 1:1 match between all 13 JSON buckets (`"ClearedViolation"`, `"RepeatedDetentions"`, `"TookBribe"`) and `RecentFactionCallbackKind` (`Simulation/EncounterHistoryQuery.cs:5-11`).
  - **`excuses` keys:**
    - **9 keys present in all 13 JSON buckets:** `TransponderMismatch` *(also aliased from `"TransponderIdMismatch"` at `FactionDialoguePool.cs:269`)*, `SpoofedWeaponsHot`, `FalsifiedOriginWaveform`, `ExpiredRegistration`, `PrefixOrganizationMismatch`, `PrefixSpeciesMismatch`, `PrefixHullSilhouetteMismatch` *(shared by both hull and class mismatches in `ShipGenerator.cs:1136,1138`)*, `UnexplainedCargoPowerDraw`, `General`.
    - **10 `ShipInfractionType` values MISSING from `faction_pools.json` (`data/ShipSpec.cs:5-26`):**
      - *6 active confrontation faults hardcoded in `ShipGenerator.cs:1111-1127` (never query `FactionDialoguePool`):* `SpokenRouteDiscrepancy`, `SpokenCargoDiscrepancy`, `BannedCargoItem`, `CargoManifestDiscrepancy`, `WithheldIllicitCargoManifest`, `StokerMassMismatch`.
      - *1 aliased in `FactionDialoguePool.cs:270` (`"RefusedShieldsOrWeaponsCompliance" => "General"`) but never queried by `ShipGenerator.cs`:* `RefusedShieldsOrWeaponsCompliance`.
      - *3 future/unwired enum values:* `BiometricSpeciesMismatch`, `UndeclaredCargoBioSignature`, `InvalidBrengopTransitPass`.
    - **`excuses.General` override trap (`ShipGenerator.cs:1157-1164`):** `PickExcuseOrDefault` tries `TryPickExcuse(prefix, "General", spec)` **before** falling back to the infraction-specific C# excuse, causing `FTV-` and `MNG-` to emit generic `"General"` lines for the 6 `[TODO]` excuse keys.

---

### 2.2 `data/forum.json`
- **Loader:** `data/ForumModels.cs:64-65` (`ForumDatabase.Load()`) via `DataLoader.LoadJson<ForumDatabase>("forum.json")`, called in `UI/TerminalOverlay.cs:272`.
- **Exact JSON Schema (`ForumModels.cs:5-66`):**
  - Root (`ForumDatabase`): `"boardName"` (`string`), `"threads"` (`ForumThreadModel[]`)
  - Thread (`ForumThreadModel`): `"id"` (`string`), `"title"` (`string`), `"boardTag"` (`string`), `"minDay"` (`int`), `"maxDay"` (`int`), `"requiredFlags"` (`string[]`), `"powerScoreCondition"` (`{ "prefix": string, "state": string }` | `null`), `"posts"` (`ForumPostModel[]`)
  - Post (`ForumPostModel`): `"handle"` (`string`), `"roleTag"` (`string`), `"timestamp"` (`string`), `"body"` (`string`)
- **Placeholder / Empty Handling:**
  - `TerminalOverlay.StripAuthoringTodoTags` (`UI/TerminalOverlay.cs:1917-1930`, regex `\s*\[TODO(?::[^\]]*)?\]`) strips `[TODO...]` from thread `Title` (`:1290,1306`) and post `Body` (`:1314`) at render time.
  - **Not sanitized:** `boardName`, `boardTag`, `handle`, `roleTag`, `timestamp`.
- **Schema Mismatch Audit:**
  - **Ignored JSON key:** Top-level `"_todoNote"` (`forum.json:2`).
  - **Deserialized but unused at runtime:** `ForumThreadModel.Id` (`ForumModels.cs:31-32`, checked only in `Program.cs` tests).
  - **C# flag tokens with no threads in `forum.json`:** `"sabotage_audit"`, `"protected_detained"`, `"ashen_rift"` (`EconomyEngine.EvaluateForumFlag`, `Simulation/EconomyEngine.cs:851-864`).
  - **Unused `powerScoreCondition.state` values:** `"Weakened"`, `"Crisis"` (all 4 power threads check `"Dominant"`).

---

### 2.3 `data/covert_missions.json`
- **Loader:** `data/ForumModels.cs:167-177` (`CovertMissionDatabase.Load()`), cached in `_cachedInstance`.
- **Exact JSON Schema (`CovertMissionSpec`, `ForumModels.cs:68-157`):**
  - Root (`CovertMissionDatabase`): `"missions"` (`CovertMissionSpec[]`)
  - Mission properties (21 keys): `"missionId"`, `"missionType"` (`"Delivery"` | `"Intercept"`), `"title"`, `"assigningFaction"`, `"minAvailableDay"`, `"autoActivateOnHack"`, `"triggerEmailDay"`, `"triggerEmailPhase"` (`"Morning"` | `"Evening"`), `"scheduledDeliveryDay"`, `"targetPrefix"`, `"targetRegistration"`, `"targetShipName"`, `"slatePayloadLabel"`, `"payloadDescription"`, `"encryptedSubject"`, `"decryptedBody"`, `"rewardScrip"`, `"rewardFactionPrefix"`, `"rewardRepDelta"`, `"targetPowerDelta"`, `"grantDoubleAgentTrust"`.
- **Placeholder / Empty Handling & Live Leaks:**
  - `StripAuthoringTodoTags` runs on `AssigningFaction` (`TerminalOverlay.cs:1530, 1698`), `Title` (`:1537, 1684`), `reqLine` (`:1697`), and email `Body` (`:1200`).
  - **LEAK 1 (`[PLACEHOLDER ...]`):** `StripAuthoringTodoTags` only matches `[TODO...]`, so `"[PLACEHOLDER OP-01]"`, `"[PLACEHOLDER INT-01]"`, `"[PLACEHOLDER OP-02]"`, `"[PLACEHOLDER INT-02]"` render verbatim in DECK 4, CRYPTO / LOGS, and `CONTRACT SETTLED` emails!
  - **LEAK 2 (`assigningFaction [TODO]`):** `TerminalOverlay.cs:1144,1154,1173,1184` renders `mail.Sender`, `TerminalOverlay.cs:1606` renders `SecurityLogEntry.Description`, and `DeskScreen.cs:2464`/`IntelEconomy.cs:241,253,269`/`EconomyEngine.cs:786` copy `spec.AssigningFaction` **without** `StripAuthoringTodoTags`, leaking `"DECK 4 CONTACT [TODO]"`, `"GALACTIC UNION HANDLER [TODO]"`, `"GU HANDLER [TODO]"`, and `"KRUSHVAK LIAISON [TODO]"` directly into email headers, security logs, and toast text!
- **Schema Mismatch Audit:**
  - **Ignored JSON key:** Top-level `"_todoNote"` (`covert_missions.json:2`).
  - **Deserialized but unused at runtime:** `scheduledDeliveryDay` (`ForumModels.cs:97-98`; `EconomyEngine.cs:332,509` always schedules `state.Day + 1`); `payloadDescription` (`ForumModels.cs:112-113`; copied to `ContrabandPocketItem.MissionDescription` which is never rendered in UI).

---

### 2.4 `data/sector_map.json`
- **Loader:** `data/SectorMapModels.cs:245-250` (`SectorMapData.Load()`) + `InitializeDerivedState()` (`:252-307`), used by `UI/StarChartModal.cs:71,77`.
- **Exact JSON Schema (`SectorMapModels.cs:1-230`):**
  - Root (`SectorMapData`): `"format"`, `"version"`, `"canvas"` (`{ "width", "height", "aspect" }`), `"coordinateSystem"`, `"borders"`, `"nodes"`, `"routes"`, `"labels"`.
  - `borders[]` (`SectorMapBorder`): `"id"`, `"name"`, `"type"`, `"color"`, `"fillAlpha"`, `"hatch"`, `"closed"`, `"smooth"`, `"dashed"`, `"width"`, `"points"` (`[{ "x", "y" }]`), `"renderPoints"` (`[{ "x", "y" }]`).
  - `nodes[]` (`SectorMapNode`): `"id"`, `"type"`, `"name"`, `"faction"`, `"tag"`, `"x"`, `"y"`, `"color"`, `"labelPos"`, `"notes"`.
  - `routes[]` (`SectorMapRoute`): `"id"`, `"from"`, `"to"`, `"export"`, `"color"`, `"notes"`.
  - `labels[]` (`SectorMapLabel`): `"id"`, `"text"`, `"x"`, `"y"`, `"size"`, `"color"`, `"spacing"`, `"rotation"`, `"opacity"`.
- **Placeholder / Empty Handling:**
  - `b134` (`name: "REMOVE IN PROD"`) is excluded from `RenderableBorders` (`SectorMapModels.cs:68-70, 255-256`) and used strictly as the hit-test polygon for the 7 inner nodes and 9 inner routes.
  - **Intentional `[TODO]` Substitution:** `SectorMapNode.TodoFallback = "[TODO]"` and `SectorMapRoute.TodoFallback = "[TODO]"` (`SectorMapModels.cs:79, 115-120, 125, 149-150, 266-269, 287-288`) turn empty/null `faction`, `tag`, and `export` into literal `"[TODO]"`, which `StarChartModal.cs:274-276, 292-293` renders live without stripping.
- **Schema Mismatch Audit:**
  - **Deserialized but unused at runtime:** Root `format`, `version`, `canvas`, `coordinateSystem`; `borders[].type`, `borders[].smooth`; `nodes[].labelPos` (`StarChartModal.cs` hardcodes below-node labels), `nodes[].notes`; `routes[].notes`; `labels[].size` (`StarChartModal.cs:587` hardcodes `fontSize = 10`), `labels[].rotation`.

---

### 2.5 `data/cargo_catalog.json`
- **Loader:** `data/CargoCatalog.cs:50-84` (`CargoCatalog.Load()`), cached in `_cached`.
- **Exact JSON Schema (`CargoCatalog.cs:6-48`):**
  - Root (`CargoCatalog`): `"stage1Days"` (`string`), `"stage2Days"` (`string`), `"legalInertPool"` (`string[]`), `"controlledLegalBioPool"` (`string[]`), `"bannedCargoList"` (`BannedCargoEntry[]`).
  - `BannedCargoEntry`: `"name"`, `"category"`, `"spsViolet"` (`bool`), `"denseMass"` (`bool`), `"bannedBio"` (`bool`), `"manualTag"` (`string`).
- **Placeholder / Empty Handling:** No `[TODO]` tags/sanitizer; if any pool is empty or `< 5` banned items exist (`:67-70`), falls back to `CreateDefault()`. `IsBannedCargo` (`:108-123`) returns `false` on blank input.
- **Schema Mismatch Audit:**
  - **Deserialized but unused at runtime:** `stage1Days`, `stage2Days`, `bannedCargoList[].category`, `bannedCargoList[].manualTag` (`DeskScreen.DocumentsAndDrag.cs:1750` derives `[VIOLET]`/`[MASS]`/`[BIO]` directly from the booleans instead of `manualTag`).

---

### 2.6 `data/voice_profiles.json`
- **Loader:** `Core/AudioHooks.cs:487-525` (`LoadVoiceProfiles()`).
- **Exact JSON Schema (`AudioHooks.cs:7-69`):**
  - Root (`VoiceProfilesDocument`): `"officerSettings"` (`{ "officerAnchorMatch", "officerConsoleCooldownMs", "officerConsolePitch", "officerConsoleJitter", "officerConsoleVolume" }`), `"speciesProfiles"` (`Record<string, { "bank", "cooldownMs", "pitchMin", "pitchMax", "jitter", "volume" }>`).
- **Placeholder / Empty Handling:** Missing/invalid file seeds `SeedMissingDefaultProfiles()` (`:527-557`). Blank `bank` falls back to `"Human_GU"`. `NormalizeSpeciesKey` (`:214-237`) maps `"hun-borian"` → `"HunBorian"`, `"orun"` → `"Oruun"`, `"dopple"` → `"Human"`.
- **Schema Mismatch Audit:** Zero mismatches — all keys and all 12 species / 9 audio banks match `assets/audio/comms/voices/*` 1:1.

---

### 2.7 `data/corridor_sprites.json`
- **Loader:** `data/CorridorSpriteConfig.cs:106-126` (`CorridorSpritesConfig.Load()`), loaded only by `UI/ArtTestScreen.CorridorTab.cs:74` (and smoke test `Program.cs:3578`), **NOT** by `UI/CorridorScreen.cs`.
- **Exact JSON Schema (`CorridorSpriteConfig.cs:30-87`):**
  - Root (`CorridorSpritesConfig`): `"lockedPlayerCharacter"` (`{ "seed", "species", "role", "facingDefault", "notes" }`), `"npcProceduralConfig"` (`{ "proceduralEnabled", "roleWeights": Record<string, int>, "allowedSpecies": string[] }`).
- **Placeholder / Empty Handling:** `NormalizeDefaults()` (`:128-153`) fills blank fields/empty lists *(note: fallback list at `:151` lists 8 species vs. 12 in JSON/initializer)*.
- **Schema Mismatch Audit:**
  - **Deserialized but unused at runtime:** `lockedPlayerCharacter.notes`, `lockedPlayerCharacter.species`/`role` (overwritten on save in ArtTest only), `npcProceduralConfig.proceduralEnabled`.
  - **Cross-file naming note:** Uses `"Hun-Borian"` and `"Orun"` vs. `"HunBorian"` and `"Oruun"` in `voice_profiles.json`.

---

### 2.8 `data/config.json`
- **Loader:** `Core/ConfigFlags.cs:311-377` (`ConfigFlags.Load()`). Uses `JsonStringEnumConverter` for `deskUpperLayoutMode`, `shipArtVersion`, `waferScoopMode`, `talkingHeadAdvanceMode`.
- **Exact JSON Schema (56 camelCase keys, `ConfigFlags.cs:39-284`):**
  - Feature toggles: `enableGravityGauge`, `enableStokerDial`, `enableDockingDrone`, `enableDebugMenu`, `enableDenyTurnBack`
  - Layout/Visual/Pacing: `deskUpperLayoutMode`, `shipArtVersion`, `waferScoopMode`, `uiFontPreset`, `uiFontSizeOffset`, `dialogueTypewriterCharsPerSec`, `talkingHeadCharsPerSec`, `talkingHeadLinePauseSeconds`, `talkingHeadAdvanceMode`, `clockOutPowerDownDelaySeconds`
  - Traffic & Shift Timers: `shieldsUpBaseChance`, `invalidShipRateEarly`, `invalidShipRateMid`, `shiftDurationDay1`, `shiftDurationDays2To5`, `shiftDurationDays6To11`, `shiftDurationDays12To17`, `shiftDurationDays18Plus`
  - Economy & Stash: `berthLeaseCost`, `dryRationBricksCost`, `nutrientPasteCost`, `highTierRationsCost`, `scrubSecurityLogsCost`, `independentPassageFundTarget`, `blankDataSlateCost`, `shieldedPocketLiningCost`, `pocketUpgrade2Cost`, `pocketUpgrade3Cost`, `pocketUpgrade2MinDay`, `pocketUpgrade3MinDay`, `auditDeferralFeeCost`, `maxStrikesBeforeAudit`, `cleanAuditFine`, `cleanAuditKordaniRepDrop`, `stokerOverloadFine`, `stokerIdleBaseline`, `stokerSafeLoadCap`, `stokerSafeLoadStepFactor`, `stokerUncalibratedShock`, `ventStashCapacity`
  - Progression Days: `dayUnlockWarpScanner`, `dayUnlockManualPart1`, `dayUnlockManualHulls`, `dayUnlockWaferCargo`, `dayUnlockStoker`, `dayUnlockFaceBribes`, `dayUnlockCargoBioScan`, `dayUnlockHostilityDestroy`, `dayUnlockTransitPass`, `dayPactClimax`, `campaignFinalDay`
- **Placeholder / Empty Handling:** Missing/corrupt file falls back to `new ConfigFlags()`; `// TODO: BALANCE` comments skipped by `JsonCommentHandling.Skip`. Blank `uiFontPreset` falls back to `"ConsolasBold"` (`:339-341`), differing from default `"PixelOperatorMono-Bold"`. `waferScoopMode` skips `Enum.IsDefined` validation.
- **Schema Mismatch Audit:**
  - **Deserialized but unused in runtime gameplay:** `enableGravityGauge`, `enableDockingDrone`, `enableDenyTurnBack`, `dayUnlockFaceBribes`, `dayUnlockCargoBioScan`, `dayUnlockTransitPass`, `dayPactClimax`.
  - **Write-only legacy aliases in C# (absent from JSON):** `shiftDurationDays2To4`, `shiftDurationDays5To9`, `shiftDurationDays10To15`, `shiftDurationDays16Plus`, `passageFundGoal`.

---

### 2.9 `data/placeholders_todo.json` (Not Loaded at Runtime)
- **Loader:** None in runtime code (read as raw text only in smoke test `Program.cs:2398-2400`).
- **Exact Keys on Disk (`data/placeholders_todo.json:1-16`):**
  - `"universeNameTodo"`, `"securityAuditStrikeThreshold"`, `"day17ConflictingDirectivesTodo"` (`"day"`, `"kordaniDirective"`, `"brengopDirective"`), `"factionQuestArcsTodo"` (`"pathA_GalacticUnion"`, `"pathB_Kordani"`, `"pathC_Brengop"`, `"pathD_MastersAndDopples"`, `"pathE_IndependentEscape"`).

---
## 3. Complete Inventory of Current Text, Placeholders & Hardcoded Strings

Status legend:
- `[AUTHORED]` — Written narrative/lore/UI text (locked or authored without TODO markers)
- `[PLACEHOLDER / TODO]` — Marked with `// TODO: USER DIALOGUE PASS`, `[TODO...]`, `[PLACEHOLDER...]`, or playtest-temporary comments
- `[HARDCODED FALLBACK]` — Hardcoded C# systemic or fallback dialogue/text (either active fallback when JSON is empty/`[TODO]` or unmigrated systemic strings)

---

### 3.1 Intro & Day-by-Day Hails / Morning Directives / Booklet Notes

#### Main Menu, Window Title & Pause Menu
- `[AUTHORED]` `Program.cs:79` (Window Title): `"Subspace Protocols -- Void Gate 3 (Booth 04)"`
- `[AUTHORED]` `UI/MainMenuScreen.cs:149,153,157,163`:
  - `"SUBSPACE PROTOCOLS"`
  - `"VOID GATE 3 (VG-3) // BOOTH 04 CUSTOMS & DOCKING TERMINAL"`
  - `"LEGACY FTC CONSORTIUM OS v4.08 -- BULWARK PACT OVERRIDE"`
  - `"PORT OFFICER ASSIGNMENT PROFILES (3 SAVE SLOTS -- NEW SAVE STARTS ON DAY 01)"`
- `[AUTHORED]` `UI/MainMenuScreen.cs:175,179,180,188,191,192,197-198,204`:
  - `$"SAVE SLOT {slot.SlotNumber:D2}"`, `"STATUS: [ EMPTY ]"`, `"START NEW SAVE (DAY 01)"`, `$"DAY {slot.Day:D2} ({phaseTag})  |  {slot.PactScrip} SC{strikesPart}"`, `"LOAD SAVE"`, `"DELETE"`, `"OFFICER QUARTERS (BERTH PREVIEW)"`, `"PROCEDURAL ART & PALETTE GALLERY"`, `$"ACTIVE SLOT: {_gameState.ActiveSaveSlot:D2}  |  DAY {_gameState.Day:D2}  |  1280x720 NATIVE  |  F1 / `: DEV DEBUG & DAY JUMP  |  F11 / ALT+ENTER: FULLSCREEN"`
- `[AUTHORED]` `UI/PauseMenuOverlay.cs:231-251,258-279`:
  - `"BOOTH 04 TERMINAL // SETTINGS"`, `"VG-3 WATCH TERMINAL // PAUSED"`, `$"SLOT {_gameState.ActiveSaveSlot:D2}  |  DAY {_gameState.Day:D2}  |  TIMER & ANIMATIONS FROZEN"`, `"RESUME WATCH [ESC]"`, `"[?] RULES / CONTROLS"`, `"SETTINGS"`, `"RETURN TO MAIN MENU"`, `"QUIT TO DESKTOP"`, `"PRESS [ESC] TO RESUME SHIFT"`, `"DISPLAY: BORDERLESS FULLSCREEN"` / `"DISPLAY: WINDOWED (1280x720)"`, `$"VOLUME: {volPct}% (STUB)"`, `"AUDIO STUBS: MUTED"` / `"AUDIO STUBS: ACTIVE (NO SFX BUNDLED)"`, `"< BACK TO PAUSE MENU [ESC]"`, `"F11 / ALT+ENTER ALSO TOGGLES FULLSCREEN"`

#### New-Game 5-Card Intro (`UI/IntroScreen.cs`)
- `[AUTHORED]` `UI/IntroScreen.cs:13-20` (5 cards verbatim):
  1. `"Three years after the Concord War, Void Gate 3 remains the sole operational corridor through the rifts."`
  2. `"Under the terms of the Bulwark Pact, joint control is split between Brengop logistics and Kordani military command."`
  3. `"When the Far-Line Transit Corp sold the station, the stranded crew were transferred as part of the inventory under updated contracts."`
  4. `"Due to a sudden vacancy at Booth 04, a replacement has been promoted to customs gate operations. Authority level: Provisional."`
  5. `"Congratulations"`
- `[HARDCODED FALLBACK]` `UI/IntroScreen.cs:151`: `$"ARCHIVE FEED // {_cardIndex + 1:D2} OF {Cards.Length:D2}"`
- `[AUTHORED]` `UI/IntroScreen.cs:198`: `"[SPACE / CLICK TO ENTER QUARTERS]"` / `"[SPACE / CLICK TO CONTINUE]"`

#### Live Pre-Shift Viewscreen Hails (`data/Day2And3ScriptedDialogue.cs` & `UI/DeskScreen.ProtocolsAndComms.cs`)
1. **Day 1 — Commander Vorst (`KDF-CMD-01`)** — `[AUTHORED]` (`Day2And3ScriptedDialogue.cs:12-26`):
   - `"Vorst: \"884-D. Commander Vorst, Kordani Security.\""`
   - `"Vorst: \"Another human face. I see they are still scraping Deck 4.\""`
   - `"Vorst: \"The Brengop treat this gate like a tollbooth. The Kordani will hold it like a border.\""`
   - `"Vorst: \"I spent years on the Concord front—I know the cost of one breach.\""`
   - `"Vorst: \"If the registries do not match, detain them. Do not ask for an explanation. My men will handle it.\""`
   - `"Vorst: \"The last clerk got greedy. It took four minutes to clear his desk. Replacing him was not difficult.\""`
   - `"Vorst: \"...\""`
   - `"Vorst: \"Hail the first ship.\""`
   - Close lines (`ProtocolsAndComms.cs:277,288`): `"[SYS] INTERNAL HAIL CLOSED -- BOOTH 04 CONSOLE ONLINE."` / `"PRESS [NEXT HAIL] TO BEGIN DAY 01 WATCH."`
2. **Day 2 — Regeer Nixa (`BMC-LOG-01`)** — `[AUTHORED]` (`Day2And3ScriptedDialogue.cs:28-29,44-52`):
   - `"Regeer Nixa: \"Morning, 884-D. I am Regeer Nixa, Consortium Logistics. It is... good to meet you.\""`
   - `"Regeer Nixa: \"I see your shift yesterday went smoothly. Keep this up and we—I—will make sure your berth stays warm.\""`
   - `"Regeer Nixa: \"I had your former associates on Deck 4 restore the SPS probe last night.\""`
   - `"Regeer Nixa: \"Scan every ship and make sure their shields and weapons are actually off before you let them through. Pilots lie, and those Kordani thugs don't care how much a station costs when they get their scales on a trigger.\""`
   - `"Regeer Nixa: \"Keep the lane moving, 884-D.\""`
   - Close lines (`ProtocolsAndComms.cs:295,306`): `"[SYS] CONSORTIUM HAIL CLOSED -- SPS PROBE ONLINE."` / `"PRESS [NEXT HAIL] TO BEGIN DAY 02 WATCH."`
3. **Day 4 (`DayUnlockWarpScanner`) — Commander Vorst (2 Branches)** — `[AUTHORED]` (`Day2And3ScriptedDialogue.cs:66-97`, fallback `"ORN-442-K"` / `"Oruun-4"`):
   - *Branch A (`ghostRouteSuspectDetained == true`, `:83-86`):*
     - `$"Vorst: \"884-D. Our boarding teams investigated the vessel you detained yesterday ({safeReg}). Their departure logs from {safeOrigin} were falsified.\""`
     - `"Vorst: \"You trusted your gut, and it paid off. Thank you for the catch.\""`
     - `"Vorst: \"That said, Booth 04 does not run on instinct. I pulled Deck 4 salvage to restore your Warp Spectrometer and Glowing Warp Checker.\""`
     - `"Vorst: \"Effective immediately, Kordani Security Strikes (/3 cap) are active on your console. Print and verify every origin waveform before you pull Access or Detain.\""`
   - *Branch B (`ghostRouteSuspectDetained == false`, `:92-95`):*
     - `$"Vorst: \"884-D. Perimeter relays flagged vessel {safeReg} slipping out of Void Gate 3 yesterday on an unlogged vector. Its {safeOrigin} declaration was falsified.\""`
     - `"Vorst: \"You followed active Day 03 rules, yet a recon hull still crossed my border while Brengop management sat on your broken spectrometer.\""`
     - `"Vorst: \"I bypassed their ledger and had Deck 4 salvage wired into your Warp Residue Printer and Glowing Warp Checker.\""`
     - `"Vorst: \"Effective immediately, Kordani Security Strikes (/3 cap) are active at Booth 04. Verify every origin strip before you clear a lane.\""`
   - Close lines (`ProtocolsAndComms.cs:350-351`): `"[SYS] INTERNAL HAIL CLOSED -- WARP SPECTROMETER & SECURITY STRIKES ONLINE."` / `$"PRESS [NEXT HAIL] TO BEGIN DAY {_gameState.Day:D2} WATCH."`
4. **Day 8 (`DayUnlockManualPart1`) — Regeer Nixa** — `[AUTHORED]` (`Day2And3ScriptedDialogue.cs:55-64`):
   - `"Regeer Nixa: \"Morning, 884-D. Still clearing lanes I see. I do love a reliable investment.\""`
   - `"Regeer Nixa: \"I pulled a few strings with Consortium Compliance and had a Registry Tablet sent up for your desk. Brand-new glass. Try not to grease it up with those fingers.\""`
   - `"Regeer Nixa: \"Check every vessel's registration expiry with the registrar and match its prefix against whatever they like to call themselves. Wrong flag or wrong crew, mark the discrepancy and detain them. Let the lizards deal with it.\""`
   - `"Regeer Nixa: \"They wanted to run armed boarding sweeps on every second freighter over those ridiculous... Dopple rumours. Imagine what that would do to our docking turnaround.\""`
   - `"Regeer Nixa: \"...\""`
   - `"Regeer Nixa: \"Shapeshifting Concord leftovers. Pure gossip, of course. Nothing left of the Dopples after the Ashen collapse wiped them all to dust.\""`
   - `"Regeer Nixa: \"Not that it is anything for a booth clerk to count dust over. Leave the paranoia to the Kordani. You just cross-check the registries and keep my ledger clean, 884-D.\""`
   - Close lines (`ProtocolsAndComms.cs:313,324`): `"[SYS] CONSORTIUM HAIL CLOSED -- BRENGOP REFERENCE MANUAL ISSUED."` / `$"PRESS [NEXT HAIL] TO BEGIN DAY {_gameState.Day:D2} WATCH."`
5. **Day 15 (`DayUnlockStoker`) — Regeer Nixa** — `[PLACEHOLDER / TODO]` (`Day2And3ScriptedDialogue.cs:35-42`, 5 `// TODO: USER DIALOGUE PASS` tags):
   - `"Regeer Nixa: \"Morning, 884-D. Do forgive the grease on your console—I had our riggers bolt a Stellar Stoker mass-anchor gauge beneath your Detain Lever before dawn.\""`
   - `"Regeer Nixa: \"Press ANCHOR on every hull that docks and match its measured weight against the mass declared on their slate.\""`
   - `"Regeer Nixa: \"Keep that strain needle out of the red band. One heavy uncalibrated freighter will rattle the ring, and two will cook the coils.\""`
   - `"Regeer Nixa: \"Do try not to fry Consortium hardware, 884-D. Billing will dock your pay, and those paranoid Kordani will tear your berth apart hunting for sabotage.\""`
   - Close lines (`ProtocolsAndComms.cs:331,342`): `"[SYS] CONSORTIUM HAIL CLOSED -- STELLAR STOKER MASS DIAL ONLINE."` / `$"PRESS [NEXT HAIL] TO BEGIN DAY {_gameState.Day:D2} WATCH."`

#### Morning Shift Directives (`data/Day2And3ScriptedDialogue.cs:106-306`, `data/placeholders_todo.json:4-8`, `Simulation/WorldSim.cs:44`)
- **Day 1** (`Day2And3ScriptedDialogue.cs:175-188`) `[AUTHORED]`:
  - `"VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 01"` / `"CLASSIFICATION: BULWARK PACT INTERNAL"` / `"----------------------------------------------------------"` / `"ACTIVE PROTOCOL CHECKS:"` / `"1. On hail, shielded ships receive an automatic shields-down order before telemetry transfer."` / `"2. Cross-check Raw Transponder ID (under Viewscreen) vs. Data Slate REG CODE."` / `"3. Matching ID: Slot Data Slate in Clearance Dock, then return to Slate Bus."` / `"4. Mismatched ID: Confirm conflict via PROTOCOL REVIEW first, then pull Detain Lever."`
- **Day 2** (`:190-203`) `[AUTHORED]`:
  - `"VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 02"` / `"NEW HARDWARE ONLINE: SPS PROBE (AUTO-WEAPONS COMPLIANCE)"` / `"1. Cross-check Raw Transponder ID vs. Data Slate REG CODE."` / `"2. Sweep armed weapon mounts with the SPS Probe: comms will auto-issue 'Power down weapons.'"` / `"3. Honest armed ships cool visibly inside the lens. Hold-to-lock [!] HOT WEAPONS on liars."`
- **Day 3** (`:205-218`) `[AUTHORED]`:
  - `"VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 03"` / `"ROUTINE WATCH NOTICE: BREATHER SHIFT"` / `"1. No new desk equipment today (Warp Residue Printer remains offline awaiting KDF tech pass)."` / `"2. Cross-check Raw Transponder ID vs. Data Slate REG CODE."` / `"3. Sweep weapon mounts with the SPS Probe and flag any spoofed [!] HOT WEAPONS via Protocol Review."`
- **Day 4 (`warpUnlockDay`)** (`:114-154`) `[AUTHORED]` (2 variants):
  - Header: `"=================================================="` / `"VOID GATE 3 // PORT AUTHORITY SHIFT DIRECTIVE - DAY 04"` / `"CLASSIFICATION: BULWARK PACT INTERNAL"`
  - `INCIDENT REPORT [KDF-SEC-09]` (if not detained): `$"At 02:14 station standard, long-range perimeter relays flagged vessel {safeReg} departing Void Gate 3 on an unlogged vector. Post-transit telemetry confirmed its declared origin ({safeOrigin}) was falsified."`
  - `INCIDENT REPORT [KDF-SEC-09]` (if detained): `$"Overnight investigation by Kordani boarding teams on detained vessel {safeReg} confirmed its declared origin ({safeOrigin}) was falsified. Because Booth 04 only caught the breach on a hunch while the spectrometer was offline, Kordani Security has forced an immediate spectrometer repair anyway."`
  - `ADMINISTRATIVE NOTICE [BMC-OPS]`: `"Maintenance request #4412 (Booth 04 Warp Field Residue Spectrometer - thermal coil burnout from Brown Dwarf infrared surge) was previously deferred under Brengop cost-containment policy. Following Kordani Security intervention, a replacement coil has been pulled from Deck 4 salvage and wired into your console."`
  - `NEW MANDATORY PROTOCOL`: `"Effective immediately, ALL incoming vessels must undergo a Warp Field Residue print-check. Overlap the printed magnetic waveform strip directly onto your backlit Glowing Warp Checker before slotting any Data Slate into the Clearance Dock."`
  - `NOTE`: `"NOTE: Salvaged coil runs hot. Print speed is suboptimal. Do not tamper with housing. Brengop Management will bill replacement costs directly to your Berth Lease."`
- **Days 5–7** (`:225-241`) `[HARDCODED FALLBACK]`: Day 5/7 `"ROUTINE WATCH NOTICE: BREATHER SHIFT (NO NEW HARDWARE)"`; Day 6 `"ROUTINE WATCH NOTICE: STANDARD QUEUE TRAFFIC"`; 3 checks (Transponder, SPS Hot Weapons, Warp Strip + `/3` Strikes).
- **Days 8–9** (`:243-260`) `[HARDCODED FALLBACK]`: Day 8 `"NEW HARDWARE ISSUED: BRENGOP REFERENCE MANUAL TABLET (SHIP REGISTRAR | SPECIES REGISTRAR)"`; 3 checks (EXP vs. Cycle, Prefix vs. Org & Species, prior checks).
- **Days 10–11** (`:262-276`) `[HARDCODED FALLBACK]`: Day 10 `"NEW PROTOCOL ACTIVE: HULL SILHOUETTES & SHIP CLASS (BRENGOP MANUAL -> HULLS TAB)"`; 3 checks (Hulls tab, EXP/Prefix/Species, prior checks).
- **Days 12–14** (`:278-292`) `[HARDCODED FALLBACK]`: Day 12 `"NEW HARDWARE ONLINE: WAFER WRITER DEMUX & MANUAL CARGO TAB"`; 3 checks (Cert-Wafers vs. 5-item Banned List, Violet `[!] POWERED CARGO` + wipe in top slot, prior checks). *(Note: Day 12 also emits `[WAFER DEMUX] Ceramic Cargo Manifest wafers now print per arrival. Wipe used wafers in top slot (3 blanks).` at `DeskScreen.cs:2307-2308` `[PLACEHOLDER / TODO]`.)*
- **Days 15–28** (`:294-305`) `[HARDCODED FALLBACK]`: Day 15 `"NEW HARDWARE ONLINE: STELLAR STOKER DUAL-READOUT MASS ANCHOR"`; 3 checks (`[ANCHOR]` vs. Data Slate MASS, flag overweight/Raw Slag Isotope, keep strain needle out of red).
- **Day 17 Conflicting Directives Placeholder** (`data/placeholders_todo.json:4-8`) `[PLACEHOLDER / TODO]` *(not loaded at runtime)*:
  - `kordaniDirective`: `"[TODO: Finalize Kordani Security morning shift directive for Day 17]"`
  - `brengopDirective`: `"[TODO: Finalize contradictory Brengop Mercantile Administration morning shift directive for Day 17]"`
- **WorldSim Delayed Ripple Directive** (`Simulation/WorldSim.cs:44`) `[HARDCODED FALLBACK]`:
  - `$"SECTOR TRAFFIC ALERT: {prefix} REGISTRY REACHED {after.ToString().ToUpperInvariant()} THRESHOLD."`

#### Field Booklet (`"884-D — MY NOTES"`, `UI/FieldBooklet.cs:21,73-170`) — all 9 pages `[AUTHORED]`
1. `day1_shift` — `"DAY 01 // TRANSPONDER & CLEARANCE"`: `"Check TRANSPONDER ID under the viewscreen against REG CODE on the Data Slate. If matching, upload encrypted clearance (Clearance Dock -> Slate Bus). If mismatching, enter Protocol Review to flag and execute Detain."`
2. `day1_evening` — `"DAY 01 PM // LEASE & RATIONS"`: `"Berth lease (-30 SC) deducts automatically at Clock-Out. Order nightly rations in PACT REQ before sleeping to prevent SPS sway."`
3. `day2_sps` — `"DAY 02 // SPS WEAPONS SWEEP"`: `"1. Press SPS button. 2. Sweep ship with SPS probe. 3. Hot weapons trigger mandatory order \"Power down weapons.\" If weapons remain powered, hold to lock [!] HOT WEAPONS on the mini-screen, flag in Protocol Review, and Detain."`
4. `day4_warp` — `"DAY 04 // WARP CHECKER & STRIKES"`: `"Warp Printer scan -> tear off strip -> align over Glowing Warp Checker (< REF: SYSTEM >). Red bleed or restricted Ashen Rift requires Detain. /3 Security Strikes system active."`
5. `day6_crypto` — `"DAY 06 // BLANK SLATE & CRYPTO"`: `$"TARGET RIG: {targetReg}\nSlot Blank Data Slate into Slate Bus before protocols hit -> capture packet -> re-transmit onto Primary Slate -> transmit in CRYPTOGRAPHY tab tonight and scrub logs before sleeping."`
6. `day8_manual` — `"DAY 08 // BRENGOP MANUAL"`: `"Open Brengop Reference Manual -> check EXP: CYC against Station Cycle -> click prefix in SHIP REGISTRAR -> verify organization and species in SPECIES REGISTRAR."`
7. `day10_hulls` — `"DAY 10 // HULL SILHOUETTES"`: `"Open HULLS tab -> verify viewport hull silhouette matches declared ship class and prefix."`
8. `day12_cargo` — `"DAY 12 // WAFERS & CARGO"`: `"Wafer Writer prints a Cargo Manifest per ship. Check CARGO tab for the 5 banned items and sweep cargo bays on SPS for Violet [!] POWERED CARGO. Wipe used wafers in the top slot (3 blanks)."`
9. `day15_stoker` — `"DAY 15 // STELLAR STOKER"`: `"Press [ANCHOR] to check MEASURED tons against Data Slate MASS. Flag undeclared mass in Protocol Review and Detain. Keep the dial out of the red band to avoid overload fines and brownouts."`

#### Brengop Reference Manual & Cargo Catalog (`UI/DeskScreen.cs:340-354`, `UI/DeskScreen.DocumentsAndDrag.cs:1550-1788,2481-2493`, `data/cargo_catalog.json`) — all `[AUTHORED]`
- **12 Factions (SHIP tab):** `GUV- GALACTIC UNION`, `KDF- KORDANI DEFENSE FLEET`, `BMC- BRENGOP CONSORTIUM`, `KRW- KRUSHVAK WAR-FLEET`, `ORN- ORUN REGISTRY NETWORK`, `TLV- TOLVAK TRANSIT LINE`, `PRJ- PRUNJUN SALVAGE REG.`, `FTV- INDEPENDENT FREE TRADERS`, `HBR- HUN-BORIAN FREE VESSEL`, `FTC- FAR-LINE TRANSIT CORP`, `MNG- MINING GUILD SYNDICATE`, `ZNI- ZENITH INTERSTELLAR`.
- **SPECIES tab labels:** `"AUTHORIZED CAPTAIN SPECIES:"`, `"REG. EXPIRY: MUST MATCH/EXCEED CYC"`, `"SOURCE: CONSORTIUM REGISTRY TABLET"`, `"KORDANI ONLY"`, `"BRENGOP ONLY"`, `"KRUSHVAK ONLY"`, `"ORUN ONLY"`, `"TOLVAK ONLY"`, `"PRUNJUN ONLY"`, `"HUN-BORIAN ONLY"`, `"GU MEMBERS (HUM / HEL / KLA / THN / VEL)"`, `"MULTI-SPECIES PERMITTED"`.
- **CARGO tab (`data/cargo_catalog.json`):**
  - 5 Banned: `"1. DISRUPTOR CELLS"` `[VIOLET]`, `"2. UNSHIELDED COILS"` `[VIOLET]`, `"3. RAW SLAG ISOTOPE"` `[MASS]`, `"4. ASHEN SPORES"` `[BIO]`, `"5. SILT WORMS"` `[BIO]`.
  - Legal Inert (8): `Hull Plating`, `Refined Ore`, `Coolant Rods`, `Ration Bricks`, `Mining Drills`, `Conduit Wire`, `Sensor Relays`, `Reactor Bearings`.
  - Controlled Legal Bio (6): `Hydro-Grain`, `Cryo-Fish`, `Vat Algae`, `Medical Cultures`, `Livestock Embryos`, `Synth-Yeast`.

#### Playtest Tutorial Overlay (`UI/TutorialOverlay.cs:252-381`) — 6 Cards `[PLACEHOLDER / TODO]`
*(Class comment `:6-12` notes these are temporary playtest cards designed to swap into in-character comms.)*
- `OnDay1Start` (`:282-299`): `"DAY 01 RULES & CONTROLS // BOOTH 04 ORIENTATION [PLAYTEST]"` (Transponder vs. Reg Code, Auto-shields + Clearance, Protocol Review before Detain; tip on 2 free warnings / -10 SC).
- `OnDay2Start` (`:301-318`): `"DAY 02-03 RULES & CONTROLS // SPS PROBE & AUTO-WEAPONS [PLAYTEST]"` (SPS Probe arm & sway, Auto-weapons compliance, Hold 0.5s for `[!] HOT WEAPONS`).
- `OnDay3Start` (Days 4–14, `:362-380`): `$"DAY {config.DayUnlockWarpScanner:D2} RULES & CONTROLS // STRIKES & GLOWING WARP CHECKER [PLAYTEST]"` (0/3 Strikes, Warp Printer + `< REF: SYSTEM >` alignment, Days 05/07 breather watches & Day 8/10 Manual rollout).
- `OnDay3Start` (Day 15+, `:258-278`): `$"DAY {currentDay:D2} RULES & CONTROLS // STELLAR STOKER & ACTIVE CHECKS [?]"` (Idle 15% / Safe Cap 65% / +33% Shock, >100% overload fine + sabotage audit + brownouts, all prior protocols).
- `OnFirstMorningQuarters` (`:320-337`): `"MORNING QUARTERS // PRE-SHIFT PREPARATION [PLAYTEST]"` (Terminal + Day 2+ 10-ship Roster, 0500 Chute / Coat / Vent, Left-wall Door).
- `OnFirstEveningQuarters` (`:339-360`): `"EVENING QUARTERS // SURVIVAL, INTEL & SLEEP [PLAYTEST]"` (PACT REQ flat-SC rations, MESSAGES/FORUM or CRYPTO/DECK 4, Bed sleep & Two-Tier Raid).

---

### 3.2 Ship Encounter Pools & Hardcoded Fallbacks

#### `data/dialogue/faction_pools.json` (381 Total Slots: 38 `[AUTHORED]`, 343 `[PLACEHOLDER / TODO]`)
Only **`FTV-`** (19 authored, 12 `[TODO]`) and **`MNG-`** (19 authored, 12 `[TODO]`) have authored lines. All other 11 buckets (`KDF-`, `BMC-`, `FTC-`, `ORN-`, `ZNI-`, `PRJ-`, `TLV-`, `KRW-`, `HBR-`, `GUV-`, `DEFAULT`) contain 29 `[TODO: <PFX> ...]` placeholders each (`319` slots).

- **`FTV-` (`faction_pools.json:2-66`) — 19 `[AUTHORED]` verbatim:**
  - `greetings` (`:4-6`, 3):
    - `"{shipName} ({reg}) holding. Clear our lane."`
    - `"{shipName}, {reg}, inbound. Run the check."`
    - `"Tramp hull {reg} holding. Packet queued."`
  - `excuses.TransponderMismatch` (`:10-11`, 2):
    - `"Beacon {reg} was re-riveted in a drydock rush out on the rim — the hull transponder just lags a cycle behind."`
    - `"Brown Dwarf static chews half our packet headers. Trust the slate on {shipName}, not that bargain-bin receiver."`
  - `excuses.FalsifiedOriginWaveform` (`:18-19`, 2):
    - `"We skirted a gravity eddy off {origin} to dodge toll pickets — that coil trace always bends funny afterward."`
    - `"Look, independent haulers take the quiet drift lanes out of {origin}. Your salvaged spectrometer is reading ghosts."`
  - `excuses.General` (`:42-44`, 3):
    - `"We're scraping margin on thin fuel out of {origin} — give an independent captain some slack on the paperwork."`
    - `"Brengop factors squeeze us at every buoy. It's a harmless filing snag on {reg}, nothing worth locking clamps over."`
    - `"Look, {shipName} hauls honest freight for outer-belt ports. Don't bury us in Pact fines over a clerk's typo."`
  - `detentionReactions` (`:48-50`, 3):
    - `"Clamps?! That impound fee is going to wipe three weeks of salvage margin on {shipName}!"`
    - `"Easy on the hull, Booth 04! You keep clamping free traders and nobody's going to haul water to your dock."`
    - `"Fine — lock the berth! Tell the Brengop factor he can try squeezing Scrip out of an empty hold."`
  - `recentCallbacks.ClearedViolation` (`:54-55`, 2):
    - `"Word on the outer buoys says Booth 04 cuts free traders a break on messy slates. Good to know."`
    - `"Heard from a tramp crew out of {origin} that you waved a rough packet through. Appreciate the fair watch."`
  - `recentCallbacks.RepeatedDetentions` (`:58-59`, 2):
    - `"Free Trader channels are flashing red about Booth 04 clamps. Keep your finger off that lever, officer."`
    - `"Two tramp hulls detained in as many shifts — half the independent lane is thinking of bypassing Void Gate 3."`
  - `recentCallbacks.TookBribe` (`:62-63`, 2):
    - `"Chatter on the rim says Booth 04 knows how to pocket quiet Scrip when the slate gets thick."`
    - `"Captains along the drift say you're open to practical arrangements if the manifest runs heavy."`
  - `FTV-` `[PLACEHOLDER / TODO]` (`:13-16, :21-40`, 12): 2 each for `SpoofedWeaponsHot`, `ExpiredRegistration`, `PrefixOrganizationMismatch`, `PrefixSpeciesMismatch`, `PrefixHullSilhouetteMismatch`, `UnexplainedCargoPowerDraw` formatted as `"[TODO: FTV- <Key> excuse 1..2]"`.

- **`MNG-` (`faction_pools.json:67-131`) — 19 `[AUTHORED]` verbatim:**
  - `greetings` (`:69-71`, 3):
    - `"Guild rig {shipName} holding. Cycle our packet."`
    - `"{reg}, Guild haul inbound. Open the lane."`
    - `"{shipName} ({reg}) holding. Keep the scan brisk."`
  - `excuses.TransponderMismatch` (`:75-76`, 2):
    - `"Ore grit and micro-slag eat transponder casings on the Oruun-4 run — {reg} is valid on the syndicate ledger."`
    - `"That hull unit got swapped off a sister barge in the belt. Check the slate checksum for {shipName}, not the casing."`
  - `excuses.FalsifiedOriginWaveform` (`:83-84`, 2):
    - `"High-iron belt dust off {origin} twists every warp residue coil in this sector. Ask your maintenance chief."`
    - `"We ran a sling-burn around heavy slag fields outside {origin}. Your secondhand strip is reading belt static."`
  - `excuses.General` (`:107-109`, 3):
    - `"Guild dispatch stamped {reg} before launch — take up any clerical noise with the Dul-Krag factor, not my crew."`
    - `"Every hour {shipName} sits in holding costs tonnage at the refinery. Clear the berth and file a note."`
    - `"We haul steel and silicate for Pact foundries. A smudge on the slate doesn't make us smugglers."`
  - `detentionReactions` (`:113-115`, 3):
    - `"You're clamping a Mining Guild rig?! Dispatch will have your berth tariff tripled by morning!"`
    - `"Big mistake, Booth 04. Delaying Guild ore out of {origin} lands straight on the Brengop ledger."`
    - `"Lock the clamps then — our claim-guard escorts will remember who stalled {shipName} at the gate."`
  - `recentCallbacks.ClearedViolation` (`:119-120`, 2):
    - `"Syndicate dispatch noted you kept Guild ore moving last shift despite slate hiccups. Smart watch, clerk."`
    - `"Word in the Oruun-4 haulers' channel is Booth 04 doesn't nitpick Guild barges. Keep the lane green."`
  - `recentCallbacks.RepeatedDetentions` (`:123-124`, 2):
    - `"Guild foremen are fuming over Booth 04 clamping our rigs two shifts running. Don't test the syndicate."`
    - `"Watch yourself, clerk — holding up Guild tonnage puts your station's ore quotas in the red."`
  - `recentCallbacks.TookBribe` (`:127-128`, 2):
    - `"Foremen say Booth 04 takes a practical cut to keep heavy rigs on schedule. Good to keep in mind."`
    - `"Heard around the Oruun-4 docks that a little extra Scrip clears Guild paperwork real fast here."`
  - `MNG-` `[PLACEHOLDER / TODO]` (`:78-81, :86-105`, 12): 2 each for `SpoofedWeaponsHot`, `ExpiredRegistration`, `PrefixOrganizationMismatch`, `PrefixSpeciesMismatch`, `PrefixHullSilhouetteMismatch`, `UnexplainedCargoPowerDraw` formatted as `"[TODO: MNG- <Key> excuse 1..2]"`.

- **Remaining 11 Buckets (`KDF-`, `BMC-`, `FTC-`, `ORN-`, `ZNI-`, `PRJ-`, `TLV-`, `KRW-`, `HBR-`, `GUV-`, `DEFAULT`, lines `132-824`) — 319 `[PLACEHOLDER / TODO]`:**
  - Every bucket contains 29 placeholder strings following the exact pattern:
    - `greetings` (3): `"[TODO: <PFX> greeting 1..3]"`
    - `excuses` (18 = 9 keys × 2): `"[TODO: <PFX> <ExcuseKey> excuse 1..2]"`
    - `detentionReactions` (2): `"[TODO: <PFX> detention reaction 1..2]"`
    - `recentCallbacks` (6 = 3 keys × 2): `"[TODO: <PFX> <CallbackKind> callback 1..2]"`

#### Hardcoded C# Encounter Fallbacks & Officer Prompts
- **Officer Routine Lines** (`[HARDCODED FALLBACK]`):
  - `DeskScreen.cs:2030,2124,2232`: `"Send subspace protocols."`
  - `DeskScreen.cs:2037`: `"Shields down, please."`
  - `DeskScreen.HardwareModules.cs:155`: `"Power down weapons."`
  - `DeskScreen.cs:2236`: `"Link dropped. Re-transmit subspace protocols."`
  - `DeskScreen.cs:2325`: `"Confirm route, purpose of visit, and cargo."`
  - `DeskScreen.DocumentsAndDrag.cs:1918`: `"Re-transmit auxiliary certificates."`
  - `DeskScreen.ProtocolsAndComms.cs:905`: `"Your hull mass exceeds your Data Slate. Transmit your Cargo Manifest cert-wafer."`
  - `DeskScreen.ProtocolsAndComms.cs:1245`: `"Your subspace bundle omitted a Cargo Manifest cert-wafer. Transmit it now."`
  - **All 16 Protocol Review Officer Challenge Prompts:** see verbatim table in Section 1 (`ProtocolsAndComms.cs:448-530`; `:523` `StokerMassMismatch` is `[PLACEHOLDER / TODO]`, tagged `// TODO: USER DIALOGUE PASS`).
- **Captain Routine Fallbacks (`Simulation/ShipGenerator.cs:995-1133`)** (`[HARDCODED FALLBACK]` unless noted):
  - `GreetingHailLine` (`:997-1004`): `KDF-`: `$"{shipName} holding. Pact military transit."`; `BMC-`: `$"{shipName} inbound. Time is Scrip."`; `KRW-`: `$"{shipName} at gate. Process our lane."`; `ORN-`: `$"{reg} holding vector. Telemetry ready."`; `PRJ-`: `$"{shipName} holding! Very legal dock!"`; `HBR-`: `$"{shipName} requesting Void Gate transit."`; `GUV-`: `$"{shipName} holding. Requesting standard dock."`; default: `$"{shipName} holding. Clear our lane."`
  - `ShieldsLoweredLine` (`:1024-1026`): `lowRep ? "Fine. Dropping shields now." : "Shields down."`
  - `WeaponsPoweredDownLine` (`:1028-1030`): `lowRep ? "Cutting weapon power." : "Weapons cold."`
  - `RefusalLine` (`:1034-1037`): `KRW-`: `"A Krushvak warship does not strip its defenses for a Pact tollbooth! Clear us or clamp us!"`; `KDF-`: `"Negative, Booth 04! Under patrol directive we keep tactical systems hot. Do not test us!"`; `PRJ-`: `"Uh, power switches are rusted welded shut! Cannot turn off! Just let us dock anyway!"`; default: `"Negative, Booth 04! We are not dropping our defenses in this sector. Open the gate or lock clamps!"`
  - `SpoofedWeaponsBluffLine` (`:1042-1045`): `KRW-` / default: `"Complying. Weapons cycling cold."`; `BMC-`: `"Acknowledged. Weapon banks cold."`; `PRJ-`: `"Flipping weapons cold right now!"`
  - `SpoofedWeaponsDeflectionLine` (`:1048-1049`, unused): `"My board reads green -- your SPS probe must be faulty. Check our slate, it clearly says WPN: OFFLINE!"`
  - `SubspaceUploadLine` (`:1053-1057`): `ORN-`: `"Checksum packet sent."`; `KRW-` / default: `"Protocols sent."`; `PRJ-`: `"Packet sent!"`; `BMC-`: `"Telemetry uploaded."`
  - `ReTransmitAnnoyedLine` (`:1062-1067`): `KRW-`: `"Keep that slate plugged in! Resending."`; `KDF-`: `"Link severed?! Resending packet now."`; `BMC-`: `"Fix your port -- resending packet!"`; `ORN-`: `"Carrier dropped. Resending packet."`; `PRJ-`: `"Hey! Sending packet again!"`; default: `"Link dropped -- resending protocols."`
  - `AutoInterrogationReplyLine` (`:1081-1082`): `$"{spokenOrigin} to {shortDest}. {shortPurpose}. {spokenCargo}."`
  - `ConfrontationGuiltyExcuseHull` (`:1085`): `$"Wait -- we bought this hull surplus last quarter! The registry refit paperwork for {reg} must still be stuck in port processing!"`
  - `ConfrontationGuiltyExcuseClassMismatch` (`:1088`): `$"Our {GetShortClassCode(spec.Slate.DeclaredShipClass)} hull classification was updated at drydock -- your visual sensors must be misreading our refit!"`
  - `ConfrontationGuiltyExcuseTransponderId` (`:1091`): `$"Raw sensor ID {spec.GroundTruth.RawTransponderId}?! Brown Dwarf static must be scrambling your local transponder receiver -- trust the Data Slate!"`
  - `ConfrontationGuiltyExcuseWeapons` (`:1094`): `"Look, our slate clearly says weapons OFFLINE! That hot orange glow on your SPS is just a... faulty diagnostic shunt. We aren't powering anything down!"`
  - `ConfrontationGuiltyExcuseOrigin` (`:1097`): `$"Your salvaged spectrometer coil is drifting! Our logbook says {spec.Slate.OriginSystem} -- ignore that waveform strip!"`
  - `ConfrontationGuiltyExcuseExpired` (`:1100`): `$"Our renewal fee was wired to the port factor last month! {spec.Slate.RegistrationExpiryDisplay} is just a clerical lag -- cut us a break!"`
  - `ConfrontationGuiltyExcuseOrgMismatch` (`:1103`): `$"Charter lease paperwork changed hands mid-run! {prefix} and {spec.Slate.DeclaredFactionName} share the same holding broker -- mostly!"`
  - `ConfrontationGuiltyExcuseSpeciesMismatch` (`:1106`): `$"The regular captain came down with drift-fever before departure! I am only filling in on the {prefix} bridge for one jump!"`
  - `ConfrontationGuiltyExcuseCargoPower` (`:1109`): `"Violet draw in our hold? Just... deck heaters! Keep your scanner off our cargo bay and clear the berth!"`
  - `ConfrontationGuiltyExcuseSpokenRoute` (`:1112`): `$"Did I say {spokenOrigin}? Long watch on the bridge -- check the slate, I meant {spec.Slate.OriginSystem}!"`
  - `ConfrontationGuiltyExcuseSpokenCargo` (`:1115`): `$"Uh, {spokenCargo} was our last haul! Quartermaster must have swapped the hold crates at launch!"`
  - `ConfrontationGuiltyExcuseBannedCargo` (`:1118`): `$"Wait -- {spec.GroundTruth.WaferCargoManifestItem} is on the permanent contraband list?! The broker swore we had a transit exemption!"`
  - `ConfrontationGuiltyExcuseManifestMismatch` (`:1121`): `$"The cert-wafer says {spec.GroundTruth.WaferCargoManifestItem} while the slate says {spec.Slate.CargoManifest}? Dockside clerk loaded the wrong manifest lot!"`
  - `ConfrontationGuiltyExcuseWithheldManifest` (`:1124`): `"We... didn't file a cargo wafer at departure! Look, our hold is private charter -- just wave us through without it!"`
  - `ConfrontationGuiltyExcuseMassMismatch` (`:1126-1127`) `[PLACEHOLDER / TODO]` (`// TODO: USER DIALOGUE PASS`): `$"Extra {Math.Max(120, spec.GroundTruth.ActualMass - spec.Slate.DeclaredTonnage)} tons? Just... spare reactor ballast we loaded after filing!"` *(Secondary fallback at `ProtocolsAndComms.cs:525` `[PLACEHOLDER / TODO]`: `"Ballast trim must have run heavy. That scale's off!"`)*
  - `HonestOmittedManifestReplyLine` (`:1130`): `"Oversight on bridge -- transmitting Cargo Manifest packet now."`
  - `ConfrontationInnocentProtest` (`:1133`, unused): `$"Check your Reference Manual again, Officer! Vessel {reg} is 100% regulation and compliant -- detaining us will cost you!"`
- **Additional `// TODO: USER DIALOGUE PASS` Encounter Lines:**
  - `UI/DeskScreen.DocumentsAndDrag.cs:1853-1854` `[PLACEHOLDER / TODO]`: `"NOTE: \"Oh yes, don't forget to wipe the wafers clean—we only gave you enough for what you need.\""`
  - `UI/DeskScreen.DocumentsAndDrag.cs:1919-1921` `[PLACEHOLDER / TODO]`: `"CAPT: \"Already sent them. Sending again.\""`
- **Covert Upload Captain Reactions (`UI/DeskScreen.cs:2426-2543`):** `[HARDCODED FALLBACK]` (all 4 lines quoted verbatim in Section 1 §4E).
- **Unreachable Captain Replies (`UI/DeskScreen.cs:1953, 1978`):** `"CAPT: \"Our shields are already down, Booth 04.\""` / `"CAPT: \"Our weapon mounts are already powered down.\""`.
- **Detention Fallbacks:** **NONE in C#** (`ShipGenerator.cs:1154` sets `string.Empty` if `faction_pools.json` returns `null`).
- **Bribes / Stings:** **NONE** (unimplemented).

---
### 3.3 Quarters (Emails, Forum, Room Prompts, Audits & Ledger)

#### MESSAGES / Emails
1. **Day 1 Morning — Brengop Contract `#884-D`** (`Core/QuartersModels.cs:115-162`) — `[AUTHORED]` (Locked verbatim):
   - Sender: `"Brengop Mercantile Consortium // VG3 Debt & Asset Management"`
   - Recipient: `"Contractor #884-D (Subspace Gate 3, Booth 04)"`
   - Subject: `"Congratulations on Your Upward Mobility [CONTRACT #884-D]"`
   - Timestamp: `$"CYC {Constants.FormatStationCycle(cy, cm)} // 06:00"`
   - Body (verbatim):
     ```text
     Dear Contractor #884-D,

     Congratulations. Effective 06:00 station time, the Consortium is pleased to
     elevate you from Deck 4 Scrap & Maintenance to Provisional Port Inspector at
     Subspace Gate Booth 04.

     Your predecessor vacated his post unexpectedly mid-shift, leaving the lane idle
     for forty-two minutes—a regrettable interruption to tariff collection that the
     BMC cannot afford to repeat. We trust you will display greater fiscal discipline.

     To reflect your newly elevated earning potential, your existing quarters have
     been upgraded to our Tier-3 Solo billing rate. Your revised daily terms follow:

     DAILY LEDGER (EFFECTIVE DAY 1):
     --------------------------------------------------------------------------------
     - Clearing Commission (Compliant Vessel):   +10 SC / ship
     - Mandatory Berth Lease (Tier-3 Solo):      -30 SC / night (Auto-debited)
     - Transit Debt Buyout (Off-Station Visa): 1,000 SC (Lump sum)
     --------------------------------------------------------------------------------

     FIDUCIARY OBLIGATIONS:
     You are expected to clear a minimum of 6 vessels per shift. Unregistered hulls
     represent uncollected tariffs; hesitation costs the Consortium throughput.

     Booth 04 instrumentation represents considerable BMC capital. Hardware damage,
     shift delays, or excessive wear on the mechanical toggles will be assessed and
     billed to your personal ledger at close of shift.

     Should Kordani Security fine, detain, or liquidate you for procedural breaches,
     the Consortium assumes no liability. Please note that berth rent continues to
     accrue during periods of detainment.

     NOTICE OF EXECUTION:
     As a courtesy—and to spare your ledger our standard 2 SC notarization fee—
     perusal of this notice constitutes constructive assent, carrying the full legal
     force and effect of a wet-ink signature.

     We value your continued solvency.
     — Brengop Mercantile Consortium
     ```
2. **Day 2+ Morning — Port Traffic Roster** (`Simulation/EconomyEngine.cs:718-750`) — `[AUTHORED]`:
   - Sender: `"VG-3 PORT TRAFFIC CONTROL"`, Subject: `$"PORT TRAFFIC ROSTER // DAY {state.Day:D2}"`, Timestamp: `$"CYC {Constants.FormatStationCycle(cy, cm)} // 05:00"`
   - Body template:
     ```text
     VOID GATE 3 // ADVANCE TRAFFIC ROSTER -- DAY {state.Day:D2}
     CYCLE {Constants.FormatStationCycle(cy, cm)} // AUTOMATED 05:00 DISPATCH
     --------------------------------------------------------
     ADVANCE-FILED VESSELS EXPECTED IN SECTOR QUEUE (10):

     {01..10}. {r.RegistrationCode,-11} | {r.ShipClassCode,-3} | {r.ShipName}
         ORG: {r.OrganizationName}

     NOTICE: ADVANCE FILINGS DO NOT GUARANTEE COMPLIANCE.
     ONLY A SUBSET WILL REACH BOOTH 04 DURING YOUR {watchSeconds}s WATCH.
     DETAIN ANY ROSTERED VESSEL CARRYING PROTOCOL VIOLATIONS.
     ```
3. **Day 6 Morning — Terminal Hack / Chute Drop** (`Simulation/EconomyEngine.cs:214-234`) — `[AUTHORED]`:
   - Sender: `"unknown"`, Subject: `"Check your chute"`, CustomStatusLine: `"asf.as\u2026tje"`, Timestamp: `$"CYC {Constants.FormatStationCycle(cy, cm)} // 05:01"`
   - Body (verbatim):
     ```text
     Hi…
     Check your Chute next to your door.
     You’ll find a blank data-slate. Don’t worry too much where it comes from… just know that you still have friends down on Deck 4
     There is a MNG- rig ({targetReg}) on today’s roster carrying telemetry someone is willing to pay for. Slot in the blank slate into the Bus before protocols hit.
     You can transmit the slate tonight via the Cryptography tab
     Don’t forget to scrub your logs, I hear the Kordani are getting on edge about something.
     Regards
     A friend
     ```
4. **Day 12+ Encrypted Covert Delivery Emails** (`Simulation/EconomyEngine.cs:780-797` + `data/covert_missions.json`) — `[PLACEHOLDER / TODO]`:
   - Encrypted wrapper (`EconomyEngine.cs:788-791`): `"[ENCRYPTED SUBSPACE PACKET]\nCIPHER: PACT-EX-409 // AUTH HASH: 0x7F9C-A211\n7E A4 19 F0 88 C2 3B 51 99 0D E4 6A 11 B7 ...\n\nUSE [CRYPTOGRAPHY] -> [DECRYPT MESSAGE (0 SC)] TO READ."`
   - `slate_bus_mission_01` (Day 12 Evening, `covert_missions.json:28-49`): Sender `"DECK 4 CONTACT [TODO]"`, Subject `"ENCRYPTED DISPATCH // RELAY DROP [OP-01]"`, DecryptedBody: `"PORT OFFICER -- Decrypt confirmed. A sealed pre-loaded Covert Mission Data Slate [OP-01] has been queued for your 0500 Service Chute. Check your Morning Ship Roster for Free Trader vessel FTV-719-R (CINDER LARK). When it docks at Booth 04, slot this Mission Slate into the Slate Bus to upload our dead-drop telemetry. WARNING: Single-use glass burns on completion; never slot a covert slate while a KDF- or BMC- Pact vessel is docked! [TODO: USER DIALOGUE PASS]"`
   - `slate_bus_mission_02` (Day 14 Evening, `covert_missions.json:74-95`): Sender `"GU HANDLER [TODO]"`, Subject `"ENCRYPTED DISPATCH // UNION HANDLER [OP-02]"`, DecryptedBody: `"OFFICER -- Sealed Covert Mission Data Slate [OP-02] queued for your next 0500 Service Chute drop. Watch the Morning Ship Roster for Far-Line Transit Corp hull FTC-408-M (MERIDIAN DRIFT) and upload via Booth 04's Slate Bus while docked. Single-use crystal burns on delivery. [TODO: USER DIALOGUE PASS]"`
5. **Reactive Covert Settlement Receipts** — `[HARDCODED FALLBACK]`:
   - Delivery (`DeskScreen.cs:2458-2468`): Sender `spec?.AssigningFaction ?? "COVERT HANDLER"`, Subject `$"DROP CONFIRMED // {dockedReg}"`, Body `$"TELEMETRY UPLOAD TO {dockedReg} VERIFIED.\n\nSETTLEMENT: +{rewardSc} SC ROUTED TO YOUR BERTH ACCOUNT.\nSCRUB YOUR SECURITY LOGS BEFORE SLEEP."`
   - Intercept (`IntelEconomy.cs:247-260`): Sender `spec.AssigningFaction`, Subject `$"CONTRACT SETTLED // {slate.TargetShipRegistration}"`, Body `$"INTERCEPT PACKET VERIFIED FOR {slate.TargetShipRegistration} ({slate.TargetShipPrefix}).\n\nCONTRACT: {spec.Title}\nSETTLEMENT: +{payout} SC CREDITED TO BERTH ACCOUNT.\n\nWARNING: TRANSMISSION WROTE [AUDIT_FLAG]. RUN [SCRUB LOGS ({scrubCost} SC)] BEFORE KORDANI CHECKS."`
6. **Citation / Warning Emails:** None exist in C# or JSON (citations currently appear only on Booth 04 popups and the Clock-Out Ledger).

#### FORUM (`data/forum.json`) & Reactive `{VARIABLE}` Tokens
- **Reactive `{VARIABLE}` Token Support:** **NONE in Forum.** Forum thread titles and post bodies in `data/forum.json` render literally (stripped only of `[TODO...]` via `StripAuthoringTodoTags`). The ONLY `{VARIABLE}` tokens anywhere in C# are `{shipName}`, `{reg}`, `{origin}`, `{destination}` in `FactionDialoguePool.ApplyTokens` (`Simulation/FactionDialoguePool.cs:240-255`).
- **Forum Visibility Conditions (`EconomyEngine.EvaluateForumFlag`, `Simulation/EconomyEngine.cs:804-864`):**
  - `requiredFlags` supported: `"stoker_overload"`, `"berth_search"`, `"sabotage_audit"`, `"day2_detained"`, `"day2_cleared"`, `"missed_lease"`, `"protected_detained"`, `"ashen_rift"`, `"deck4_used"`, or `state.QuestFlags[flag]`.
  - `powerScoreCondition`: `{ "prefix", "state" }` (`"Weakened"`, `"Dominant"`, `"Crisis"`).
- **All 14 Threads / 21 Posts in `data/forum.json` (`[PLACEHOLDER / TODO]` — global `_todoNote` + 13 post-body `[TODO: USER DIALOGUE PASS]` tags):**
  - `boardName` (`:3`): `"VG3-NET // STATION COMMUNAL FORUM v1.4"`
  - `_todoNote` (`:2`): `"// TODO: USER DIALOGUE PASS -- Replace placeholder forum thread bodies and handles with final authored writing from /design/09_Dialogue_and_Writing/Quarters_Message_Board_Posts.md"`
  1. `d1_spectrometer_outage` (`[OPS]`, Days 1–2): `"Booth 04 warp spectrometer STILL dark?"`
     - `@dock_hand_maren` `[DECK 3 BAY CREW]` (`CYC 2409.04 // 06:12`): `"Three shifts running and the thermal coil in Booth 04 is still tagged MAINTENANCE PENDING. Brengop factor says replacement coils eat into quarterly bonus margins. [TODO: USER DIALOGUE PASS]"`
     - `@ftc_wrench_88` `[EX-FTC TECH]` (`CYC 2409.04 // 08:44`): `"That infrared surge off the Brown Dwarf cooked two coils last cycle. If Kordani doesn't force a salvage pull from Deck 4, customs is flying blind on jump origins."`
  2. `d1_ration_paste` (`[GENERAL]`, Days 1–4): `"Replicator nutrient paste tastes like coolant"`
     - `@berth_11_joss` `[NIGHT LOADER]` (`CYC 2409.04 // 21:05`): `"Anyone else living on SKU-014 dry bricks to make berth lease? Hands were shaking so bad on crane alignment today I nearly clipped a Mining Guild barge. [TODO: USER DIALOGUE PASS]"`
     - `@med_tech_tala` `[INFIRMARY]` (`CYC 2409.04 // 22:18`): `"Two consecutive nights on dry bricks craters fine motor steadiness. Spend the 20 SC on paste if you run precision consoles."`
  3. `d2_lower_deck_rumors` (`[DECK4]`, Day 6): `"Deck 4 vent relay humming again at 0400"`
     - `@vent_rat_09` `[UNVERIFIED]` (`CYC 2409.04 // 04:19`): `"Reminder for new berth tenants: official PACT REQ leaves paper trails. Whatever gets dropped in your 0500 service chute off the lower vent relay stays off Brengop ledgers -- just scrub your local hex logs before Kordani walks the hall."`
  4. `d3_coil_repaired_cleared` (`[SECTOR]`, Days 4–5, `["day2_cleared"]`): `"KDF security alert -- unlogged vector out of VG-3"`
     - `@nav_watch_soren` `[PERIMETER RELAY]` (`CYC 2409.04 // 03:40`): `"Perimeter dishes lit up at 0214 -- a vessel cleared yesterday jumped out on a completely falsified vector. Kordani marched straight into Deck 4 salvage and ripped a replacement warp coil out for Booth 04. [TODO: USER DIALOGUE PASS]"`
     - `@dock_hand_maren` `[DECK 3 BAY CREW]` (`CYC 2409.04 // 05:11`): `"Heard Kordani activated formal Security Strikes across customs too. Three strikes and they toss your berth while you sleep."`
  5. `d3_coil_repaired_detained` (`[SECTOR]`, Days 4–5, `["day2_detained"]`): `"Boarding team found falsified logs in Detain Bay 2"`
     - `@nav_watch_soren` `[PERIMETER RELAY]` (`CYC 2409.04 // 04:02`): `"Word is Booth 04 clamped a clean-paper hauler yesterday on pure gut instinct and KDF boarding teams actually found cooked jump logs inside. Kordani forced Brengop to repair the warp spectrometer immediately anyway. [TODO: USER DIALOGUE PASS]"`
     - `@ftc_wrench_88` `[EX-FTC TECH]` (`CYC 2409.04 // 05:25`): `"Salvaged coil runs hotter than a Stoker baffle, and KDF turned Security Strikes live starting this watch. Play it by the book."`
  6. `d4_d7_early_sector_chatter` (`[GENERAL]`, Days 4–9): `"Post-war registries still a mess out on the rim"`
     - `@hauler_kess` `[FREE TRADER]` (`CYC 2409.04 // 19:50`): `"Half the hulls passing Void Gate 3 were patched together after the Concord war. Kordani's new reference tablets are strict on prefix-to-hull matching, so double check silhouettes before stamping anything. [TODO: USER DIALOGUE PASS]"`
     - `@berth_11_joss` `[NIGHT LOADER]` (`CYC 2409.04 // 20:32`): `"And watch out for anyone asking about the Ashen Rift. Nobody comes out of that red nebula with clean warp residue."`
  7. `evt_stoker_overload_brownout` (`[OPS]`, Days 1–30, `["stoker_overload"]`): `"WHO OVERLOADED THE STELLAR STOKER?! Corridor lights keep dying!"`
     - `@ftc_wrench_88` `[EX-FTC TECH]` (`STATION ALERT // LIVE`): `"Gravity anchor coils took a shear spike above 100% strain! Corridor lamps and berth amber strips are flickering across the entire customs ring. Expect rolling power brownouts next shift. [TODO: USER DIALOGUE PASS]"`
     - `@dock_hand_maren` `[DECK 3 BAY CREW]` (`STATION ALERT // +14m`): `"Kordani patrol squads just locked down the officer quarters wing looking for orbital sabotage. Hope whoever let undeclared tonnage into the Stoker has clean logs."`
  8. `evt_berth_search_rumors` (`[RUMORS]`, Days 1–30, `["berth_search"]`): `"KDF boots in the quarters corridor at 0300"`
     - `@berth_11_joss` `[NIGHT LOADER]` (`CYC 2409.04 // 05:08`): `"Heard magnetic lock breakers down by Berth 04 before wake bell. Kordani audit teams check terminal I/O buffers first and coat pockets second. Never sleep with unscrubbed [UNAUTH_IO] flags. [TODO: USER DIALOGUE PASS]"`
  9. `evt_missed_berth_lease` (`[GENERAL]`, Days 1–30, `["missed_lease"]`): `"Brengop Factor posting foreclosure slips on Habitat Ring B"`
     - `@berth_11_joss` `[NIGHT LOADER]` (`CYC 2409.04 // 22:40`): `"Reminder: Brengop gives you ONE deferred lease night with a red flag. Miss two nights of 30 SC berth rent and they strip your badge and drop you onto the lower reactor decks. [TODO: USER DIALOGUE PASS]"`
  10. `evt_deck4_chatter` (`[DECK4]`, Days 1–30, `["deck4_used"]`): `"Runner drops running tight before 0500 shift change"`
      - `@vent_rat_09` `[D4 RELAY]` (`CYC 2409.04 // 04:55`): `"Chute drop confirmed on Habitat Ring. Keep fake slates tucked under the desk vent grate if heat climbs -- and never feed a covert payload into a Pact cruiser's Slate Bus. [TODO: USER DIALOGUE PASS]"`
  11. `power_kdf_dominant` (`[SECTOR]`, Days 2–30, `KDF-:Dominant`): `"Kordani patrol cruisers stacking double at the outer buoy"`
      - `@hauler_kess` `[FREE TRADER]` (`SECTOR WIRE // LIVE`): `"KDF throughput is way up this cycle. Non-Pact captains are sweating bullets in the approach lane with Kordani hulls parked outside the gate. [TODO: USER DIALOGUE PASS]"`
  12. `power_mng_dominant` (`[SECTOR]`, Days 2–30, `MNG-:Dominant`): `"Mining Guild escorts pushing Free Traders off the outer belt"`
      - `@hauler_kess` `[FREE TRADER]` (`SECTOR WIRE // LIVE`): `"Half our FTV rigs docked with plasma scorch along their flanks today. Mining Guild's flush with traffic and acting like they own every asteroid lane. [TODO: USER DIALOGUE PASS]"`
  13. `power_bmc_dominant` (`[SECTOR]`, Days 2–30, `BMC-:Dominant`): `"Brengop Mercantile raising dockside docking surcharges again"`
      - `@dock_hand_maren` `[DECK 3 BAY CREW]` (`SECTOR WIRE // LIVE`): `"Consortium freight volume is through the roof and they STILL won't fix the broken auxiliary units in officer berths. Classic Brengop. [TODO: USER DIALOGUE PASS]"`
  14. `power_guv_dominant` (`[SECTOR]`, Days 2–30, `GUV-:Dominant`): `"Galactic Union envoys spotted near the observation deck"`
      - `@nav_watch_soren` `[PERIMETER RELAY]` (`SECTOR WIRE // LIVE`): `"More GUV- transponders clearing the gate lately. Kordani Command hates seeing Union hulls this close to the Brown Dwarf. [TODO: USER DIALOGUE PASS]"`

#### Chute / Door / Bed / Vent / Terminal Prompts (`UI/QuartersScreen.cs` & `UI/TerminalOverlay.cs`) — `[AUTHORED]`
- **Door / Chute / Bed / Vent / Terminal Nudges (`QuartersScreen.cs`):**
  - `:473, 692`: `$"MORNING CYCLE -- DAY {_gameState.Day:D2}. CHECK TERMINAL & 0500 SERVICE CHUTE."`
  - `:570` (Day 1/6 unread email gate): `"Should probably read my emails first."`
  - `:577` (Day 6 uncollected blank slate gate): `"I see there is something in my chute, let me check it out"`
  - `:587` (Evening door click): `"SHIFT COMPLETE -- REST BEFORE NEXT WATCH"`
  - `:628` (Morning bed click): `"HEAD TO DOOR FOR WATCH"`
  - `:993` (Day 1 Evening ration reminder): `"Long first shift. Better order rations on the terminal before sleeping."`
  - Hover tooltips (`:1898-1968`): `"DOOR // WALK TO BOOTH 04"`, `"DOOR // OFF WATCH"`, `$"SERVICE CHUTE ({c} DROP)"` / `"SERVICE CHUTE (EMPTY)"`, `$"PERSONAL TERMINAL ({unread} UNREAD)"` / `"PERSONAL TERMINAL"`, `$"VENT STASH ({count}/{cap})"`, `"BED // SLEEP (EVENING ONLY)"` / `"BED // SLEEP [RAID WARRANT PENDING!]"` / `"BED // SLEEP"`, `"SECTOR STAR CHART"`, `$"{item.DisplayName} // CLICK TO STASH IN VENT"`.
  - Chute & Vent modals (`:1995-2139`): `"SERVICE CHUTE TRAY IS EMPTY."`, `$"WARNING: {unscrubbed} UNSCRUBBED LOG(S) -- SCRUB IN CRYPTO / LOGS OR RAID WILL BREACH VENT!"`, `"LOGS CLEAN: VENT STASH STAYS UNDISCOVERED DURING STANDARD KORDANI SWEEPS."`
- **Terminal Tabs (`TerminalOverlay.cs:35-42, 919-929, 1371-1793`):**
  - Tabs: `"MESSAGES"`, `"FORUM"`, `"PACT REQ"`, `"CRYPTOGRAPHY"`, `"DECK 4"`.
  - Day 6 Hack Sequence (`:919-929`): `"[SYS_OVERRIDE // PORT 04 TUNNEL INJECTED]"`, `"0xD4:4F9A  INJECT_BUS -> 7E 9A 0F 44 C1 8B 2E 77 A0 5D 19 E4"`, `"0xD4:4FAA  BYPASS_AUTH -> KORDANI_WATCHDOG_MASK [OK]"`, `"0xD4:4FBA  MOUNT_TAB_03 -> [CRYPTO / LOGS] // CIPHER_DIAG"`, `"0xD4:4FCA  MOUNT_TAB_04 -> [DECK 4] // VENT_RELAY_2400"`, `"0xD4:4FDA  CONTRACT_SYNC -> DAY 06 MNG- INTERCEPT [45 SC]"`, `"PORT 04 TUNNEL MOUNTED -- [CRYPTO / LOGS] & [DECK 4] UNLOCKED."`.
  - PACT REQ SKUs: `SKU-014 DRY RATION BRICKS` (`10 SC`), `SKU-029 NUTRIENT PASTE (STANDARD)` (`20 SC`), `SKU-088 HIGH-TIER RATIONS` (`30 SC`).

#### Berth / Stoker Audits, Citations & End-of-Day Ledger (`RaidController.cs`, `QuartersScreen.cs`, `LedgerOverlay.cs`, `ValidationEngine.cs`) — `[AUTHORED]` / `[HARDCODED FALLBACK]`
- **Sleep Raid Modal (`QuartersScreen.cs:2171-2197`) & Log Lines (`RaidController.cs:44-192`):**
  - Headers: `"03:15 WAKE-UP RAID // KORDANI TWO-TIER 3-STRIKE BERTH AUDIT"` / `"03:15 WAKE-UP RAID // KORDANI STELLAR STOKER SABOTAGE AUDIT"` / `"KORDANI SECURITY TROOPERS UNSEALED BERTH 04 DURING SLEEP CYCLE."`
  - Warrants: `$"KORDANI SECURITY RAID // 3-STRIKE BERTH WARRANT (STRIKES: {SecurityStrikes}/{MaxStrikesBeforeAudit})"` / `"KORDANI SABOTAGE RAID // STELLAR STOKER OVERLOAD WARRANT (+0 STRIKES)"`.
  - Tier 1 (`[TIER 1 // COAT FRISK]`): clear / lining concealed 1 item / confiscated unshielded items.
  - Tier 2 (`[TIER 2 // TERMINAL LOGS]` & `[TIER 2 // BERTH SWEEP]` or `[TIER 2 // DEEP SWEEP]`): clean logs keep vent safe; dirty logs trigger Deep Sweep breaching vent.
  - Verdicts: `"[VERDICT] SEVERE CONTRABAND PENALTY -- {caughtReason}."`, `"[VERDICT] CLEAN AUDIT -- STRIKES RESET TO 0."`, `$"[ADMIN FEE] CLEAN-AUDIT FINE: -{cleanAuditFine} SC  |  KDF REP {repDelta}"`, `"[VERDICT] SABOTAGE AUDIT CLEAN -- NO EVIDENCE OF ORBITAL TAMPERING (+0 STRIKES)."`.
- **Clock-Out Settlement Ledger (`LedgerOverlay.cs:110-298`):**
  - Header: `$"BRENGOP PORT AUTHORITY // SHIFT {ShiftDay:D2} SETTLEMENT"`, `$"VOID GATE 3  |  BOOTH 04 CLOCK-OUT SLIP  |  CYC {FormatStationCycle(cy, cm)}"`
  - Rows: `SHIPS PROCESSED`, `CLERICAL WARNINGS` / `CLERICAL FINES`, `STELLAR STOKER OVERLOAD STRAIN FEE (+0 STRIKES)` (`>> NOTICE: KORDANI SABOTAGE AUDIT QUEUED FOR SLEEP CYCLE`), `KORDANI SECURITY STRIKES (PERSISTENT)`, `KORDANI CLEAN-AUDIT ADMIN FEE (PRIOR AUDIT)`, `AUTO-DEDUCTED BERTH LEASE (NIGHTLY RENT)` / `BERTH LEASE DEFERRED -- 1 NIGHT GRACE WARNING!` (`"WARNING: MISSING 1 MORE BERTH LEASE TRIGGERS DEBT FORECLOSURE!"`) / `BERTH LEASE DEFAULT -- 2 NIGHTS MISSED!` (`"DEBT FORECLOSURE"`, `"BADGE REVOKED: PERMANENT REASSIGNMENT TO LOWER REACTOR DECKS."`), `NET PACT SCRIP AVAILABLE (EVENING QUARTERS)`.
- **Citations (`ValidationEngine.cs`):** `"UNVERIFIED DETENTION -- CONFIRM FAULT VIA PROTOCOL REVIEW FIRST"`, `"BRENGOP MERCANTILE OPS // CLERICAL WARNING"`, `"BRENGOP MERCANTILE OPS // PROTOCOL CITATION"`, `"KORDANI SECURITY COMMAND // SECURITY STRIKE ISSUED"`.

---

### 3.4 Quests & Recurring Faces

- **`quests.json`:** **Does NOT exist.** Quest tracking is split across `data/covert_missions.json`, `Core/GameState.cs` (`QuestFlags`, `EndingFlags`), `data/Day2And3ScriptedDialogue.cs`, `Simulation/ShipGenerator.cs`, and `data/placeholders_todo.json` (unloaded).
- **Recurring Faces Implemented:**
  - **Commander Vorst (`KDF-CMD-01`)**: Day 1 Hail (`[AUTHORED]`) & Day 4 Branching Hail (`[AUTHORED]`).
  - **Regeer Nixa (`BMC-LOG-01`)**: Day 2 Hail (`[AUTHORED]`), Day 8 Hail (`[AUTHORED]`), Day 15 Stoker Hail (`[PLACEHOLDER / TODO]`, 5 `// TODO: USER DIALOGUE PASS` tags).
  - **Day 6 `"A friend"` / `RELAY_D4`**: Day 6 Morning email (`[AUTHORED]`) + `day6_mng_intro` in `covert_missions.json`.
- **Day 3 Hardcoded Story Encounter — "The Ghost Route" (`ShipGenerator.cs:782-936`, `StoryTag = "ghost_route"`)** — `[AUTHORED]`:
  - Uses hardcoded `GreetingHailLine`, `ShieldsLoweredLine`, `WeaponsPoweredDownLine`, `ReTransmitAnnoyedLine`, `SuspectRoutePushbackPromptLine`, `SuspectRouteDeflectionLine`, `ConfrontationGuiltyExcuseOrigin`, `ConfrontationInnocentProtest`, plus per-faction `SubspaceUploadLine` (`KRW-`, `HBR-`, `ORN-`, `PRJ-`, default) and 7 faction `AutoInterrogationReplyLine` cargo/purpose slots (`KRW-`, `HBR-`, `ORN-`, `PRJ-`, `MNG-`, `FTC-`/`ZNI-`, default). *(See Section 3.2 / `ShipGenerator.cs:864-936` for verbatim lines.)*
- **Day 9 Ghost Encounter:** **NOT IMPLEMENTED.** Zero code or data references exist.
- **`GameState.QuestFlags` & `EndingFlags` (`Core/GameState.cs:515-546`):**
  - `QuestFlags`: `Day2_GhostRouteEncountered`, `Day3_SpectrometerRepaired`, `Day4_SpectrometerRepaired`, plus **3 unimplemented stub flags** (`SideQuest_HelaniCourierWarpSignature`, `SideQuest_OrunFreighter442`, `KordaniDestroyOverrideUnlocked`).
  - `EndingFlags`: `PathA_AcrossTheLine`, `PathB_TheKordaniCoup`, `PathC_TheBuyout`, `PathD_TheQuietReturn`, `PathE_OutIntoTheDark` (all 5 unimplemented), plus `Fail_SecurityDetainment`, `Fail_DebtForeclosure` (implemented).
- **`data/covert_missions.json` (5 Missions — all `[PLACEHOLDER / TODO]`):**
  1. `day6_mng_intro` (`Intercept`, Day 6, `MNG-`, `45 SC`): title `"RELAY_D4 INTRO // MINING GUILD PACKET"`, faction `"UNKNOWN // RELAY_D4"`, desc `"Slot the unmarked black Blank Data Slate from your 0500 chute when a Mining Guild (MNG-) ship docks. Pocket it and transmit via CRYPTO / LOGS tonight. [TODO: USER DIALOGUE PASS]"`.
  2. `slate_bus_mission_01` (`Delivery`, Day 12, `FTV-719-R` `CINDER LARK`, `45 SC`, `FTV- +2`): title `"[PLACEHOLDER OP-01] RIM COURIER TELEMETRY DROP"`, faction `"DECK 4 CONTACT [TODO]"`, desc `"Sealed single-use jump-beacon offsets for Free Trader FTV-719-R (CINDER LARK). Drops at 0500. Upload in Booth 04 Slate Bus; crystal burns on use. DO NOT upload to KDF- or BMC-!"`, subject `"ENCRYPTED DISPATCH // RELAY DROP [OP-01]"`.
  3. `intercept_op_01` (`Intercept`, Day 7, `BMC-`, `50 SC`, `GUV- +2`, `grantDoubleAgentTrust: true`): title `"[PLACEHOLDER INT-01] CONSORTIUM FREIGHT TELEMETRY"`, faction `"GALACTIC UNION HANDLER [TODO]"`, desc `"Requires a Blank Data Slate (15 SC). Silently swap into Booth 04 Slate Bus on any Brengop Consortium (BMC-) vessel, pocket it, and transmit via CRYPTO / LOGS. [TODO: USER DIALOGUE PASS]"`.
  4. `slate_bus_mission_02` (`Delivery`, Day 14, `FTC-408-M` `MERIDIAN DRIFT`, `55 SC`, `GUV- +2`): title `"[PLACEHOLDER OP-02] UNION LISTENING POST PACKET"`, faction `"GU HANDLER [TODO]"`, desc `"Sealed single-use sensor calibration keys for Far-Line vessel FTC-408-M (MERIDIAN DRIFT). Drops at 0500. Upload in Slate Bus during shift."`, subject `"ENCRYPTED DISPATCH // UNION HANDLER [OP-02]"`.
  5. `intercept_op_02` (`Intercept`, Day 10, `KDF-`, `60 SC`, `KRW- +2`): title `"[PLACEHOLDER INT-02] KORDANI PATROL TELEMETRY"`, faction `"KRUSHVAK LIAISON [TODO]"`, desc `"Requires a Blank Data Slate (15 SC). Silently copy any Kordani Defense Fleet (KDF-) vessel's subspace packet in Booth 04 Slate Bus and transmit via CRYPTO / LOGS. [TODO: USER DIALOGUE PASS]"`.
- **`data/placeholders_todo.json:9-15` (`[PLACEHOLDER / TODO]`, unloaded):**
  - `universeNameTodo`: `"[TODO: Select final Universe Name from _Project_Overview.md]"`
  - `pathA_GalacticUnion`: `"Across the Line (5 covert double-agent objectives; 3 of 5 required)"`
  - `pathB_Kordani`: `"[TODO: Author 5 Kordani Security quest milestones for The Kordani Coup]"`
  - `pathC_Brengop`: `"[TODO: Author Brengop Mercantile quest milestones for The Buyout]"`
  - `pathD_MastersAndDopples`: `"[TODO: Author Masters/Dopples discovery triggers and quest milestones for The Quiet Return]"`
  - `pathE_IndependentEscape`: `"Out into the Dark (1,000 SC live Pact Scrip balance + FTV-/FTC- rep_score >= +6)"`

---

### 3.5 Corridor, Star Chart & Endings

#### Corridor (`UI/CorridorScreen.cs`, `data/corridor_sprites.json`)
- **Overhead Barks, NPC Dialogue & Zoomable Poster Modals:** **NOT IMPLEMENTED.** `CorridorScreen.cs` is a `2.6s` animated `21:9` transit strip (`0.35s` minimum before skip).
- **Comments `[PLACEHOLDER / TODO]`:** `UI/CorridorScreen.cs:13, 124` (`[TODO: Fill in manually - exact 21:9 visual state variations]`).
- **Hardcoded UI Strings (`UI/CorridorScreen.cs`):** `[HARDCODED FALLBACK]`:
  - Wall poster (when `brengopDebtNotice`, `:249-250`): `"BMC NOTICE"` / `"LEASE DUE"`
  - Transit banner title (`:274-276`): `$"WALK TO WORK // BERTH 04 -> CUSTOMS BOOTH 04 (DAY {_gameState.Day:D2})"` / `$"SECTOR CORRIDOR // -> {_screenManager.NextCorridorDestination.ToString().ToUpperInvariant()}"`
  - Transit banner subtitle (`:282-287`, priority order):
    1. `"ALERT: STELLAR STOKER GRID UNSTABLE -- CORRIDOR LIGHTS FLICKERING"`
    2. `"SECURITY NOTICE: KORDANI GARRISON PATROLS ACTIVE ON RING B"`
    3. `"BRENGOP NOTICE: HABITAT LEASE AUDIT IN EFFECT"`
    4. `"VOID GATE 3 // HABITAT RING B ACCESS CORRIDOR"`
  - Letterbox top (`:309`) & bottom (`:313-314`): `$"DAY {_gameState.Day:D2} // MORNING TRANSIT  |  SCRIP: {_gameState.PactScrip} SC  |  POCKET: {_gameState.PocketItems.Count}/{_gameState.PocketCapacity}"`, `"CLICK OR PRESS [SPACE] TO ENTER BOOTH 04  |  [ESC] PAUSE"` / `"TRANSITING HABITAT RING B..."`
- **`data/corridor_sprites.json:7`:** `"notes": "Deck 4 Officer 884-D locked default candidate; pick/override via F5 Art Test [CORRIDOR] tab."`

#### Star Chart (`UI/StarChartModal.cs`, `data/SectorMapModels.cs`, `data/sector_map.json`)
- **Modal Chrome (`UI/StarChartModal.cs:321-389, 676-795`)** — `[HARDCODED FALLBACK]`:
  - `"VOID GATE 3 // SECTOR ASTROGATION & TRADE CORRIDOR CHART"`, `"CLICK INNER SYSTEM OR TRADE ROUTE FOR TELEMETRY  |  [ESC] CLOSE"`, `"LAT"` (`0.1`..`0.9`), `"KEY"`, `"GATE"`, `"CORE"`, `"RIFT"`, `"LANE"`, `"OUTER"`, `"WORMHOLE"`, `"ASTROGATION TELEMETRY READOUT"`, `$"SYSTEM: {node.Name}"`, `$"CONTROLLING FACTION: {node.EffectiveFaction}"`, `$"SYSTEM TAG: {node.EffectiveTag}"`, `$"TRADE ROUTE: {fromName} <-> {toName}"`, `$"PRIMARY EXPORT: {route.EffectiveExport}"`, `"SELECT AN INNER SECTOR SYSTEM (VG-3 + 6 NEIGHBORS) OR TRADE CORRIDOR LINE."`
- **`data/sector_map.json` Content & `[TODO]` Inventory:**
  - **9 Region Labels (`[AUTHORED]`):** `"Ashen Rift"`, `"Krushvak Space"`, `"Galactic Union"`, `"Indp"`, `"Kordani Space"`, `"Brengop Space"`, `"Oruun "` *(trailing space)*, `"VOID"`, `"Mining"`.
  - **7 Clickable Core Nodes (inside `b134` `"REMOVE IN PROD"`):** `VG-3` (`faction: "[TODO]"`, `tag: "[TODO]"`), `Gharok` (`Krushvak`, `tag: "[TODO]"`), `Veridia` (`GU`, `tag: "[TODO]"`), `Oruun-4` (`Independent`, `tag: "[TODO]"`), `Ash` (`Unclaimed`, `tag: "[TODO]"`), `Korr-Vath` (`Kordani`, `tag: "[TODO]"`), `Dul-Krag` (`Brengop`, `tag: "[TODO]"`).
  - **40 Non-Clickable Outer Nodes** (`K1..K8`, `G1..G10`, `I1..I3`, `KD1..KD7`, `B1..B7`, `M1..M4`, `WORMHOLE`): ALL have `faction: "[TODO]"`, `tag: "[TODO]"`, `notes: ""`.
  - **54 Routes (9 clickable inner routes `r47..r52, r64, r111, r112`):** ALL 54 have `export: "[TODO]"`, `notes: ""`.
  - **Total `[TODO]` slots in `sector_map.json`:** **142** (`41` node factions + `47` node tags + `54` route exports), of which **17** render live on screen (`1` VG-3 faction + `7` inner node tags + `9` inner route exports).

#### Endings (`UI/QuartersScreen.cs:2202-2228`, `Core/GameState.cs:515-524, 817`)
- **Victory / Campaign Endings (`PathA_AcrossTheLine` .. `PathE_OutIntoTheDark`):** **NOT IMPLEMENTED.** No ending screen or epilogue exists; advancing past Day 28 (`CampaignFinalDay = 28`) clamps back to Day 28 Morning (`GameState.cs:817`).
- **Implemented Failure Endings (`UI/QuartersScreen.cs:2202-2228`, `DrawFailureEndingScreen`)** — `[HARDCODED FALLBACK]`:
  - `Fail_SecurityDetainment`:
    - Title: `"FAILURE ENDING // SECURITY DETAINMENT"`
    - Body 1: `"KORDANI SECURITY TROOPERS BREACHED BERTH 04 AIRLOCK AFTER SEIZING CONTRABAND / LOGS."`
    - Body 2: `"PORT OFFICER CREDENTIALS REVOKED. TRANSFERRED TO KORR-VATH DETENTION BLOCK."`
  - `Fail_DebtForeclosure`:
    - Title: `"FAILURE ENDING // DEBT FORECLOSURE"`
    - Body 1: `"TWO MISSED NIGHTS OF BERTH LEASE TRIGGERED BRENGOP MERCANTILE FORECLOSURE."`
    - Body 2: `"PORT OFFICER BADGE STRIPPED. PERMANENTLY REASSIGNED TO LOWER REACTOR DECKS."`
  - Shared footer & button: `$"FINAL RECORD: DAY {_gameState.Day:D2}  |  SCRIP: {_gameState.PactScrip} SC  |  STRIKES: {_gameState.SecurityStrikes}/{_config.MaxStrikesBeforeAudit}"`, `"[ RETURN TO MAIN MENU ]"`.

---
## 4. UI Text Width & Formatting Constraints

### Global Rendering & Font Metrics (`Core/Constants.cs`, `Core/FontManager.cs`, `UI/UiText.cs`)
- **Virtual Resolution:** `1280 x 720` (`Constants.cs:6-7`). All UI geometry is measured in virtual pixels.
- **Default Font Preset:** `PixelOperatorMono-Bold` (`data/config.json:18`, `FontManager.cs:65-66, 372, 513-517`): `IsPixelFont = true`, `NativePixelSize = 16`, `spacing = 0f`, binary alpha threshold `>= 112`.
- **User Font Size Offset (`uiFontSizeOffset`):** `-2` to `+3` (`FontManager.cs:22-23`).
  - `requested = 10`, **`denseRow: false`**:
    - `+0` offset → `16px` effective → **~8.0 px/char**
    - `+3` worst-case → `19px` effective → **~9.5 px/char**
  - `requested = 10`, **`denseRow: true`** (`FontManager.cs:239, 247-252`):
    - Clamped to `16px` native across `+0..+3` → **~8.0 px/char** (never grows with `+3` offset).
  - `requested = 20`, **`denseRow: false`** (`FontManager.cs:254-258`):
    - `+0` → `32px` (**~16.0 px/char**); `+3` → `35px` (**~17.5 px/char**).
- **Wrapping Helper Caveats:**
  - `UiText.Wrap` (`UI/UiText.cs:49-99`): Splits `\n` paragraphs, wraps on spaces, truncates oversized single words, enforces `maxLines`.
  - `DeskScreen.WrapTextByPixelWidth` (`UI/DeskScreen.cs:3287-3328`): Word-wraps + truncates oversized words + enforces `maxLines`, **does NOT split on `\n`** (single-paragraph only).
  - `TerminalOverlay.WrapMultilineText` (`UI/TerminalOverlay.cs:1944-1983`): Splits `\n` paragraphs, wraps on spaces, **no `maxLines` cap, and does NOT break single unbroken strings wider than `maxPx`** (e.g., long `----` dividers overflow horizontally).

---

### 4.1 Viewscreen Comms Dialogue Boxes (`UI/DeskLayout.cs`, `UI/DeskScreen.ProtocolsAndComms.cs`, `UI/DeskScreen.HardwareModules.cs`)

| UI Element | Virtual Rect (`File:Line`) | Inner Text Width | Font / `denseRow` / Helper | Max Chars/Line (`+0` / `+3`) | Max Lines & Scroll |
|---|---|---|---|---|---|
| **CRT Comms Dialogue Log** *(used for live hails, ship encounters, interrogations & Morning Directives)* | **B1 / B2 (Default):** `(680, 40, 364, 172)`<br>**Option A:** `(908, 40, 364, 216)` (`DeskLayout.cs:118-120, 148, 196-197`) | **`334 px`** (`364 - ScrollbarW(16) - 14`) | `fontSize: 10`, **`denseRow: false`** (`ProtocolsAndComms.cs:1477, 1898, 1912`), `WrapTextByPixelWidth(..., maxLines: 64)`, `13px` row pitch | **~41 chars** (`+0`)<br>**~35 chars** (`+3`)<br>*(Speaker tags `> BOOTH 04: `, `CAPT: `, `Vorst: `, `Regeer Nixa: ` consume first-line budget)* | **11 visible rows** (B1/B2) / **14 visible rows** (Option A); **scrollable** (wheel ±2 + scrollbar, auto-follows bottom); hard wrap cap `64` lines/entry |
| **Comms Log Header Bar** | `w = 364, h = 16` (`ProtocolsAndComms.cs:1408-1419`) | **`350 px`** (`tr.W - 14`) | `fontSize: 10`, `denseRow: false`, `TruncateByPixelWidth` | ~43 / ~36 chars | 1 line |
| **Viewscreen 2x Bezel Status** *(hidden in default 3x 192x192 mode)* | `(1072, 212, 176, 26)` (`HardwareModules.cs:1300-1314`) | **`152 px`** (`sbW - 24`) | `fontSize: 10`, `denseRow: false`, `TruncateByPixelWidth` | ~19 / ~16 chars | 1 line |
| **Transponder / Signal Feed Box** | **B1/B2:** `(1052, 264, 220, 88)`<br>**Option A:** `(688, 184, 204, 64)` (`DeskLayout.cs:117, 147`) | Feed: **`196 px`** (B) / **`180 px`** (A)<br>Raw ID: **`204 px`** (B) / **`188 px`** (A) | Feed: `10`, `denseRow: false`, truncated.<br>ID: tries `20`, drops to `10` if `> fb.W - 16` (`HardwareModules.cs:1441-1445`) | Feed: ~24/20 (B), ~22/18 (A)<br>ID @20: ~12/11; @10: ~25/21 | 1 line each |
| **Next Hail / Command Strip Button** | **B1/B2:** `(680, 220, 364, 36)`<br>**Option A:** `(908, 264, 364, 44)` (`DeskLayout.cs:121-122, 149-150`) | **`~352 px`** | `fontSize: 10`, `denseRow: false` (no wrap) | ~44 / ~37 chars *(38-char `"ACKNOWLEDGE HAIL -- BEGIN DAY 01 WATCH"` is tight at `+3`)* | 1 line |
| **Protocol Review Button** | **B1/B2:** `(680, 264, 364, 36)`<br>**Option A:** `(908, 316, 364, 36)` (`DeskLayout.cs:123, 151`) | **`~352 px`** | `fontSize: 10`, `denseRow: false` (no wrap) | ~44 / ~37 chars *(37-char `"PROTOCOL REVIEW: SELECT REALITY (2/2)"`)* | 1 line |

---

### 4.2 Emails, Morning Directives, Booklet Pages & Desk Documents

| UI Element | Virtual Rect (`File:Line`) | Inner Text Width | Font / `denseRow` / Helper | Max Chars/Line (`+0` / `+3`) | Max Lines & Scroll |
|---|---|---|---|---|---|
| **Terminal MESSAGES — Left Inbox** | `(96, 112, 344, 496)` (`TerminalOverlay.cs:61-64`); row `316 x 52` (`:1092-1156`) | Read subj/sender: **`300 px`**<br>Unread subj: **`~254 px`** (`+0`) / **`~246 px`** (`+3`) | `fontSize: 10`, **`denseRow: false`**, `TruncateText` | Read: ~37 / ~31 chars<br>Unread: ~31 / ~25 chars | **8 rows visible**, **scrollable** |
| **Terminal MESSAGES — Right Reader** | `(448, 112, 736, 496)` (`TerminalOverlay.cs:65-68`); `15px` line pitch (`:1167-1223`) | Headers: **`648 px`** / **`632 px`**<br>Body: **`688 px`** (`ReaderW - 48`, `:1200`) | `fontSize: 10`, **`denseRow: false`**, `StripAuthoringTodoTags` + `WrapMultilineText` | Body: **~86 chars** (`+0`) / **~72 chars** (`+3`)<br>*(Caveat: Day 1 Contract `#884-D`'s 80-dash divider at `QuartersModels.cs:138` overflows ~72px at `+3`)* | **26 visible lines** (or **21** when Decrypt button shown); **scrollable** |
| **Morning Shift Directives** | Printed into **CRT Comms Dialogue Log** (no desk paper item) | **`334 px`** | `fontSize: 10`, `denseRow: false`, `WrapTextByPixelWidth(..., 64)` | **~41 chars** (`+0`) / **~35 chars** (`+3`)<br>*(50–58 char `====`/`----` dividers in `Day2And3ScriptedDialogue.cs:118,181` get clipped)* | 11 rows (B1/B2) / 14 rows (A); **scrollable** |
| **Field Booklet (`"884-D — MY NOTES"`)** | Closed: **`208 x 44`**<br>Open: **`316 x 264`** (`FieldBooklet.cs:22-25`) | Header & Body: **`280 px`** (`:322, 330-331`)<br>Closed title: **`146 px`** (`:376`) | `fontSize: 10`, **`denseRow: true`** everywhere (`:298-382`), `WrapToWidth(..., maxLines: 9, denseRow: true)` at `12px` pitch | **~35 chars/line** *(locked across `+0..+3`)* | **1 header + max 9 body lines (~315 chars max)**; **NOT scrollable** (excess clipped) |
| **Primary Data Slate** | **`184 x 216`** (`DeskLayout.cs:28-29`) | Top-right col: **`104 px`**<br>Full-width: **`170 px`** (`DocumentsAndDrag.cs:1298-1300`) | `fontSize: 10`; D1–3 `denseRow: false`, D4+ `denseRow: true` (`:1402-1434`); Cargo wrapped `maxLines: 2` | Right col: ~13 (`denseRow`) / ~11 (`+3`)<br>Full row: ~21 (`denseRow`) / ~18 (`+3`) | Fixed fields; Cargo max 2 lines (~42 chars); not scrollable |
| **Brengop Reference Manual** | **`280 x 192`** (`DeskScreen.cs:284-285`) | Ship rows: **`262 px`**<br>Species card: **`252 px`**<br>Cargo row: **`~190 px`** | `fontSize: 10`; Ship/Cargo `denseRow: true`, Species/Hulls titles `denseRow: false`; single-line truncated | Ship: ~32 chars<br>Species: ~31 (`+0`) / ~26 (`+3`)<br>Cargo: ~23 chars | Fixed rows (12 prefixes, 5 banned cargo); not scrollable |
| **Cert-Wafer (Cargo Manifest)** | **`144 x 164`**; e-ink **`132 x 118`** (`DeskScreen.cs:289-290`, `DocumentsAndDrag.cs:2407-2410`) | E-ink lines: **`124 px`**; wrapped cargo: **`122 px`** (`:2425`) | `fontSize: 10`, **`denseRow: true`** everywhere; cargo wrapped `maxLines: 2` @ `13px` pitch | **~15 chars/line** *(locked across `+0..+3`)* | Cargo max 2 lines (~30 chars); fixed fields; not scrollable |
| **Contraband Slate** | **`160 x 188`** (`DeskScreen.cs:408-409`) | Header: **`140 px`**; body: **`132 px`** | `fontSize: 10`, `denseRow: false` *(`DisplayName` at `:1051` is untruncated)* | ~16 (`+0`) / ~13 (`+3`) | Fixed 5 lines |
| **Citation Slide-Out Popup** | **`480 x 88`** (`HardwareModules.cs:2495-2534`) | Header: **`464 px`**; Reason/Penalty: **`460 px`** | `fontSize: 10`, `denseRow: false`, `TruncateByPixelWidth` | ~57 (`+0`) / ~48 (`+3`) | 1 line per field |

---

### 4.3 FORUM Post Titles & Bodies (`UI/TerminalOverlay.cs:70-82, 1245-1353`)

| UI Element | Virtual Rect (`File:Line`) | Inner Text Width | Font / `denseRow` / Helper | Max Chars/Line (`+0` / `+3`) | Max Lines & Scroll |
|---|---|---|---|---|---|
| **FORUM Board Header** | `(96, 112, 1088, 44)` (`:71-74, 1255-1259`) | **`~1064 px`** (untruncated) | `fontSize: 10`, `denseRow: false` | ~133 / ~112 chars | 2 lines |
| **Left Thread Index List** | `(96, 164, 376, 444)` (`:75-78`); row `348 x 54` (`:1277-1295`) | Title: **`332 px`** (`ForumListW - 44`, `:1290,1293`) | `fontSize: 10`, `denseRow: false`, `StripAuthoringTodoTags` → `WrapMultilineText(..., 332)` → `Math.Min(2, Count)` + `TruncateText` | **~41 chars/line** (`+0`)<br>**~34 chars/line** (`+3`)<br>**Max 2 lines → ~82 (`+0`) / ~68 (`+3`) total title chars** | **7 thread rows visible**, **scrollable** |
| **Right Expanded Thread Title** | `(480, 164, 704, 30)` (`:79-82, 1304-1307`) | **`680 px`** (`ForumStreamW - 24`, `:1306`) | `fontSize: 10`, `denseRow: false`, `TruncateText($"[{BoardTag}] {title}", 10, 680)` | **~85 chars** (`+0`) / **~71 chars** (`+3`) *(including `[TAG] `)* | **1 line** (no wrap) |
| **Right Post Author/Role Header** | Inside `(480, 195, 704, 413)` (`:1339-1340`) | **`660 px`** (`ForumStreamW - 44`) | `fontSize: 10`, `denseRow: false`, `TruncateText($"@{Handle}  [{RoleTag}]   --   {Timestamp}", 10, 660)` | **~82 chars** (`+0`) / **~69 chars** (`+3`) | 1 line per post |
| **Right Post & Reply Bodies** | Inside `(480, 195, 704, 413)` (`:1314-1350`) | Wrap: **`656 px`** (`ForumStreamW - 48`)<br>Draw clip: **`660 px`** (`ForumStreamW - 44`) | `fontSize: 10`, `denseRow: false`, `StripAuthoringTodoTags` → `WrapMultilineText(..., 656)` + `TruncateText(..., 660)` at `16px` pitch | **~82 chars/line** (`+0`)<br>**~69 chars/line** (`+3`) | **24 visible lines** (`visLines = 24`, `16px` pitch); **scrollable** |

---

### 4.4 Corridor Overhead Barks & Zoomable Posters (`UI/CorridorScreen.cs`)
- **Overhead Bark Bubbles:** **Not implemented** (no bubble container, width, or line limit exists in `UI/`).
- **Zoomable Poster Modal:** **Not implemented.**
- **Existing Corridor Text Elements (`UI/CorridorScreen.cs`):**
  - **Wall Poster (`brengopDebtNotice`, `:247-250`):** `72 x 48` (`~60 px` inner). `"BMC NOTICE"` / `"LEASE DUE"` at `fontSize: 10`, `denseRow: false`, **no wrap/truncation** (~7 chars fit; `"BMC NOTICE"` overflows `72px` at `+3` offset).
  - **Transit Status Banner (`:264-294`):** `540 x 74` (`~520 px` safe inner). `fontSize: 10`, `denseRow: false`, centered, **no wrap/truncation** (~65 chars `+0` / ~54 chars `+3`). *Overflow alert:* `"ALERT: STELLAR STOKER GRID UNSTABLE -- CORRIDOR LIGHTS FLICKERING"` (65 chars) is ~618px at `+3` and overflows the `540px` box.
  - **Top/Bottom Letterbox Lines (`:309-316`):** Full `1280 px` width, `fontSize: 10`, `denseRow: false`, 1 line each (~156 chars `+0` / ~130 chars `+3`).

---

### 4.5 Ending Cards (`UI/QuartersScreen.cs`, `UI/LedgerOverlay.cs`, `UI/IntroScreen.cs` Reference)

| Screen / Modal | Virtual Rect (`File:Line`) | Inner Text Width | Font / `denseRow` / Helper | Max Chars/Line (`+0` / `+3`) | Max Lines & Scroll |
|---|---|---|---|---|---|
| **Failure Ending Screen** *(sole implemented ending card, `QuartersScreen.cs:2202-2228`)* | **`720 x 440`** at `(280, 140)` (`:2206`) | **No enforced inner margin/wrap** (`720 px` outer; `~680 px` practical safe width) | Title (`y=184`): `20`, `denseRow: false`, centered, **no wrap/trunc**.<br>Body 1 (`y=268`) & Body 2 (`y=294`): `10`, `denseRow: false`, centered, **no wrap/trunc**.<br>Record (`y=356`): `10`, left `x=416` (`584 px` to right edge), **no wrap/trunc** | Title (`@20`): ~42 (`+0`) / ~38 (`+3`)<br>Body (`@10`): ~85 (`+0`) / **~71 (`+3`)**.<br>*(Overflow alert: Detainment `body1` is 86 chars → ~817px at `+3`, overflowing both edges of the `720px` box!)* | Fixed 1 title + 2 single-line bodies + 1 record line; not scrollable |
| **Victory Endings (`PathA`–`PathE`)** | **Unimplemented** | N/A | *Reference pattern:* `IntroScreen.cs:25-28, 160-182` uses `920 x 528` card with `856 x 296` art + `856 x 140` text plaque (`808 px` wrap width, `fontSize: 18`, `24px` step, max ~5 lines @ ~70/+0, ~58/+3 chars) | See IntroScreen ref | N/A |
| **Sleep Raid Audit Modal** (`QuartersScreen.cs:110-113, 2162-2200`) | **`832 x 512`** at `(224, 104)`; log box **`784 x 344`** | Log lines: **`756 px`** (`AuditModalW - 76`, `:2191`) | `fontSize: 10`, `denseRow: false`, `TruncateText` per line (no wrap), `30px` row pitch | **~94 chars** (`+0`) / **~79 chars** (`+3`) | **Max ~11 lines**; not scrollable |
| **Clock-Out Settlement Ledger** (`LedgerOverlay.cs:16-24, 71-329`) | **`560 x 464`** at `(360, 128)`; body **`528 x 330`** | Rows: **`496 px`** (`bodyW - 32`); banner: **`476 px`** | `fontSize: 10` (net `20`), `denseRow: false`, **no wrap/trunc** (`:260, 269, 319`) | **~62 chars** (`+0`) / **~52 chars** (`+3`). *(61–62 char foreclosure banners overflow at `+3`.)* | Fixed 6–8 rows + net box; not scrollable |

---

## 5. Summary Action List for Workbench Sync

### 5.1 Hardcoded C# Text to Migrate to JSON
- [ ] **Protocol Review Officer Challenges (`UI/DeskScreen.ProtocolsAndComms.cs:448-530, 905, 1245`):** Move all 16 officer challenge prompts + 2 honest omitted-manifest prompts out of C# switches into JSON (and resolve the `StokerMassMismatch` `// TODO: USER DIALOGUE PASS` prompt at `:523`).
- [ ] **Routine Encounter Captain Fallbacks (`Simulation/ShipGenerator.cs:995-1133`, `UI/DeskScreen.cs:1953,1978,2030-2546`, `UI/DeskScreen.HardwareModules.cs:155`, `UI/DeskScreen.DocumentsAndDrag.cs:1853,1918-1921`):** Move or align hardcoded `GreetingHailLine`, `ShieldsLoweredLine`, `WeaponsPoweredDownLine`, `RefusalLine`, `SpoofedWeaponsBluffLine`, `SubspaceUploadLine`, `ReTransmitAnnoyedLine`, `AutoInterrogationReplyLine`, all 15 `ConfrontationGuiltyExcuse*` fallbacks, covert upload reactions, and `"Send subspace protocols."` / `"Shields down, please."` / `"Power down weapons."` officer beats.
- [ ] **Pre-Shift Live Viewscreen Hails & Morning Shift Directives (`data/Day2And3ScriptedDialogue.cs:12-306`):** Move Day 1/2/4/8/15 live hails (including Day 15's 4 `// TODO: USER DIALOGUE PASS` lines) and Days 1–28 shift directives (plus Day 17 conflicting Kordani/Brengop directives from `placeholders_todo.json`) into data-driven JSON.
- [ ] **Day 3 Ghost Route & Future Story Encounters (`Simulation/ShipGenerator.cs:782-936`):** Externalize Day 3 Ghost Route dialogue/slots; author and wire Day 9 Ghost, `SideQuest_HelaniCourierWarpSignature`, `SideQuest_OrunFreighter442`, and `KordaniDestroyOverrideUnlocked`.
- [ ] **Quarters Emails, Field Booklet & Endings (`Core/QuartersModels.cs:115-162`, `Simulation/EconomyEngine.cs:214-234, 718-750`, `UI/FieldBooklet.cs:73-170`, `UI/QuartersScreen.cs:2202-2228`):** Externalize scripted emails, Field Booklet pages, failure endings, and author the 5 unimplemented victory endings (`PathA`–`PathE`) + Day 28 epilogue trigger.
- [ ] **Corridor Barks, Posters & Tutorial Replacement (`UI/CorridorScreen.cs`, `UI/TutorialOverlay.cs`):** Author/implement corridor overhead barks and zoomable posters; replace the 6 temporary `[PLAYTEST]` tutorial cards with in-character comms or finalized data.

---

### 5.2 Exact Code-vs-JSON Mismatches & Live Leaks to Fix / Sync
- [ ] **No `quests.json` Exists:** Do not export a `quests.json` file expecting the game to read it unless a loader is added; current mission/quest JSON is `data/covert_missions.json` only.
- [ ] **`greetingsHostile` / `greetingsWarm` Do Not Exist:** The workbench must export `"greetings"` only (or C# `FactionDialoguePool.FactionPoolEntry` must be extended to read reputation greeting buckets).
- [ ] **10 `ShipInfractionType` Keys Missing from `faction_pools.json`:**
  - *6 active faults hardcoded in C# only:* `SpokenRouteDiscrepancy`, `SpokenCargoDiscrepancy`, `BannedCargoItem`, `CargoManifestDiscrepancy`, `WithheldIllicitCargoManifest`, `StokerMassMismatch`.
  - *1 aliased in `FactionDialoguePool.cs:270` (`RefusedShieldsOrWeaponsCompliance => General`) but never queried by `ShipGenerator.cs`.*
  - *3 unwired future faults:* `BiometricSpeciesMismatch`, `UndeclaredCargoBioSignature`, `InvalidBrengopTransitPass`.
- [ ] **`excuses.General` Fallback Precedence Bug (`ShipGenerator.cs:1157-1164`):** For `FTV-` and `MNG-`, `PickExcuseOrDefault` picks `excuses.General` before C# infraction-specific fallbacks whenever the specific JSON excuse key is still `[TODO...]`.
- [ ] **Zero C# Detention Fallback (`ShipGenerator.cs:1154`):** Because only `FTV-` and `MNG-` have `detentionReactions`, all other 10 factions and Day 3 Ghost Route emit **no spoken line** when detained.
- [ ] **Live Placeholder Leaks in `covert_missions.json` & `TerminalOverlay.cs`:**
  - `[PLACEHOLDER OP-01]`, `[PLACEHOLDER INT-01]`, `[PLACEHOLDER OP-02]`, `[PLACEHOLDER INT-02]` are NOT matched by `StripAuthoringTodoTags` (`\s*\[TODO(?::[^\]]*)?\]`) and render verbatim in DECK 4, CRYPTO / LOGS, and settlement emails.
  - `assigningFaction` (`"DECK 4 CONTACT [TODO]"`, etc.) is NOT passed through `StripAuthoringTodoTags` when displayed as email `Sender` (`TerminalOverlay.cs:1144,1154,1173,1184`), security log descriptions (`:1606`), or toast messages.
- [ ] **Live `"[TODO]"` Strings in Star Chart (`data/sector_map.json` + `SectorMapModels.cs`):** All 7 inner nodes' `tag`, `VG-3`'s `faction`, and all 9 inner routes' `export` render literal `"[TODO]"` in `StarChartModal.cs`.
- [ ] **Zero `{VARIABLE}` Substitution in `forum.json`:** Only `FactionDialoguePool` substitutes `{shipName}`, `{reg}`, `{origin}`, `{destination}`; `forum.json` posts render raw text.
- [ ] **Unused JSON Keys to Prune or Wire:**
  - `covert_missions.json`: `scheduledDeliveryDay`, `payloadDescription`, `_todoNote`
  - `forum.json`: `id` (runtime), `_todoNote`; unused C# flags `sabotage_audit`, `protected_detained`, `ashen_rift`
  - `cargo_catalog.json`: `stage1Days`, `stage2Days`, `category`, `manualTag`
  - `sector_map.json`: `format`, `version`, `canvas`, `coordinateSystem`, `borders[].type/smooth`, `nodes[].labelPos/notes`, `routes[].notes`, `labels[].size/rotation`
  - `corridor_sprites.json`: `notes`, `species`, `role`, `proceduralEnabled` (also not loaded by `CorridorScreen.cs`)
  - `config.json`: `enableGravityGauge`, `enableDockingDrone`, `enableDenyTurnBack`, `dayUnlockFaceBribes`, `dayUnlockCargoBioScan`, `dayUnlockTransitPass`, `dayPactClimax`
  - `placeholders_todo.json`: 100% unread by runtime gameplay code.
- [ ] **UI Wrapping / Overflow Hotspots at `+3` Font Offset:**
  - `QuartersScreen.cs:2216` (`Fail_SecurityDetainment` 86-char `body1` overflows `720px` box without wrapping)
  - `CorridorScreen.cs:249, 282` (`"BMC NOTICE"` inside `72px` poster; 65-char Stoker brownout subtitle inside `540px` banner)
  - `QuartersModels.cs:138` (80-dash divider in Contract `#884-D` overflows `688px` reader pane)
  - `LedgerOverlay.cs:260, 269` (61–62 char foreclosure banners overflow `496px` box)

---

### 5.3 Total Placeholder / `[TODO]` vs. Authored Slot Count Summary

| Source / System | Authored Slots | `[TODO]` / Placeholder Slots | Notes |
|---|---:|---:|---|
| `data/dialogue/faction_pools.json` | **38** | **343** | 381 total slots (`FTV-`: 19/12; `MNG-`: 19/12; other 11 buckets: 0/29 each) |
| `data/sector_map.json` | **15** *(+47 node names)* | **142** | 6 core node factions + 9 region labels authored; 41 node factions + 47 node tags + 54 route exports `[TODO]` (17 visible live on inner nodes/routes) |
| `data/forum.json` | **0 threads** *(8 post bodies lack inline tag)* | **13 posts + 1 `_todoNote`** | Global `_todoNote` marks all 14 threads (21 posts) for dialogue pass; 13 posts carry inline `[TODO: USER DIALOGUE PASS]` |
| `data/covert_missions.json` | **0 missions** | **13 field values + 1 `_todoNote`** | 5 missions total; 4 `[PLACEHOLDER ...]` titles + 4 `[TODO]` factions + 5 `[TODO: USER DIALOGUE PASS]` descriptions/bodies |
| `data/placeholders_todo.json` | **2 rough specs** (`pathA`, `pathE`) | **6** | Universe name (1) + Day 17 directives (2) + Path B/C/D arcs (3); unread at runtime |
| C# `// TODO: USER DIALOGUE PASS` strings | — | **10 runtime strings** *(11 comment markers)* | Day 15 Nixa hail (4), Stoker mass officer prompt (1) & 2 excuses (2), Day 12 Wafer intro (1), Empty hopper note (1), Prematurely wiped wafer reply (1) |
| `UI/TutorialOverlay.cs` | — | **6 `[PLAYTEST]` cards** | Temporary playtest tutorial cards pending comms replacement |
| **Unimplemented Systems** | — | **8 major gaps** | 5 Victory Endings (`PathA`–`PathE`), Bribes/Stings, Day 9 Ghost, Corridor Barks/NPCs/Posters, `quests.json` (absent), Day 28 campaign wrap-up, 3 `GameState.QuestFlags` stubs, 10 missing `ShipInfractionType` excuse pools |
