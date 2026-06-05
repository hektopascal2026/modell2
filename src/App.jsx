import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHS = 48;
const currencyFormatter = new Intl.NumberFormat("de-CH", {
  style: "currency",
  currency: "CHF",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("de-CH");
const axisCurrencyFormatter = (value) => numberFormatter.format(Math.round(value));

const yearByMonth = (month) => {
  return Math.min(4, Math.ceil(month / 12));
};

const RESERVE_CHF = 100_000;

const clampPercent = (value) => Math.min(100, Math.max(0, value));
const clampNumber = (value) => (Number.isNaN(value) ? 0 : value);

function LabeledNumberInput({ label, value, onChange, step = 1, min = 0, max }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-black">{label}</span>
      <input
        type="number"
        className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-black transition-shadow hover:shadow-[2px_2px_0px_#000] focus:bg-[#fafafa] focus:outline-none"
        value={draft}
        step={step}
        min={min}
        max={max}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          if (raw === "") return;
          onChange(clampNumber(Number(raw)));
        }}
        onBlur={() => {
          if (draft === "") {
            setDraft("0");
            onChange(0);
          }
        }}
      />
    </label>
  );
}

function LabeledSliderInput({ label, value, onChange, min = 0, max = 1000, step = 1 }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-black">{label}</span>
        <span className="font-semibold text-black">{numberFormatter.format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(clampNumber(Number(event.target.value)))}
        className="w-full accent-[#FF6B6B]"
      />
    </div>
  );
}

function KPI({ title, value, helpText }) {
  return (
    <div className="border-2 border-black bg-white p-4 transition-shadow hover:shadow-[2px_2px_0px_#000]">
      <p className="text-xs font-normal text-black">{title}</p>
      <p className="mt-1 text-lg font-bold text-black">{value}</p>
      <p className="mt-1 text-xs font-normal text-black">{helpText}</p>
    </div>
  );
}

const DEFAULTS = {
  startkapital: 1500000,
  neueKundenJ1: 40,
  neueKundenJ2: 80,
  neueKundenJ3: 120,
  neueKundenJ4: 120,
  preisJ1: 60,
  preisAbJ2: 80,
  preisAbJ3: 100,
  verlaengerungNachJ1: 85,
  verlaengerungNachJ2: 90,
  verlaengerungNachJ3: 92,
  sponsoringJahr1: 0,
  sponsoringJahr2: 10000,
  sponsoringJahr3: 10000,
  sponsoringJahr4: 10000,
  seniorFteJ1: 3,
  seniorFteJ2: 4,
  seniorFteJ3: 5,
  seniorFteJ4: 5,
  juniorFteJ1: 6,
  juniorFteJ2: 8,
  juniorFteJ3: 12,
  juniorFteJ4: 12,
  lohnSenior: 10000,
  lohnJunior: 6000,
  sozialabgabenProzent: 15.0,
  sachkostenAuto: true,
  fixkostenManuell: 8000
};

const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(`hekto_${key}`);
    if (val === null) return fallback;
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState("inputs"); // "inputs" | "calc" | "charts"
  const [startkapital, setStartkapital] = useState(() => getStored("startkapital", DEFAULTS.startkapital));
  const [neueKundenJ1, setNeueKundenJ1] = useState(() => getStored("neueKundenJ1", DEFAULTS.neueKundenJ1));
  const [neueKundenJ2, setNeueKundenJ2] = useState(() => getStored("neueKundenJ2", DEFAULTS.neueKundenJ2));
  const [neueKundenJ3, setNeueKundenJ3] = useState(() => getStored("neueKundenJ3", DEFAULTS.neueKundenJ3));
  const [neueKundenJ4, setNeueKundenJ4] = useState(() => getStored("neueKundenJ4", DEFAULTS.neueKundenJ4));
  const [preisJ1, setPreisJ1] = useState(() => getStored("preisJ1", DEFAULTS.preisJ1));
  const [preisAbJ2, setPreisAbJ2] = useState(() => getStored("preisAbJ2", DEFAULTS.preisAbJ2));
  const [preisAbJ3, setPreisAbJ3] = useState(() => getStored("preisAbJ3", DEFAULTS.preisAbJ3));
  const [verlaengerungNachJ1, setVerlaengerungNachJ1] = useState(() => getStored("verlaengerungNachJ1", DEFAULTS.verlaengerungNachJ1));
  const [verlaengerungNachJ2, setVerlaengerungNachJ2] = useState(() => getStored("verlaengerungNachJ2", DEFAULTS.verlaengerungNachJ2));
  const [verlaengerungNachJ3, setVerlaengerungNachJ3] = useState(() => getStored("verlaengerungNachJ3", DEFAULTS.verlaengerungNachJ3));
  const [sponsoringJahr1, setSponsoringJahr1] = useState(() => getStored("sponsoringJahr1", DEFAULTS.sponsoringJahr1));
  const [sponsoringJahr2, setSponsoringJahr2] = useState(() => getStored("sponsoringJahr2", DEFAULTS.sponsoringJahr2));
  const [sponsoringJahr3, setSponsoringJahr3] = useState(() => getStored("sponsoringJahr3", DEFAULTS.sponsoringJahr3));
  const [sponsoringJahr4, setSponsoringJahr4] = useState(() => getStored("sponsoringJahr4", DEFAULTS.sponsoringJahr4));
  
  const [seniorFteJ1, setSeniorFteJ1] = useState(() => getStored("seniorFteJ1", DEFAULTS.seniorFteJ1));
  const [seniorFteJ2, setSeniorFteJ2] = useState(() => getStored("seniorFteJ2", DEFAULTS.seniorFteJ2));
  const [seniorFteJ3, setSeniorFteJ3] = useState(() => getStored("seniorFteJ3", DEFAULTS.seniorFteJ3));
  const [seniorFteJ4, setSeniorFteJ4] = useState(() => getStored("seniorFteJ4", DEFAULTS.seniorFteJ4));
  
  const [juniorFteJ1, setJuniorFteJ1] = useState(() => getStored("juniorFteJ1", DEFAULTS.juniorFteJ1));
  const [juniorFteJ2, setJuniorFteJ2] = useState(() => getStored("juniorFteJ2", DEFAULTS.juniorFteJ2));
  const [juniorFteJ3, setJuniorFteJ3] = useState(() => getStored("juniorFteJ3", DEFAULTS.juniorFteJ3));
  const [juniorFteJ4, setJuniorFteJ4] = useState(() => getStored("juniorFteJ4", DEFAULTS.juniorFteJ4));

  const [lohnSenior, setLohnSenior] = useState(() => getStored("lohnSenior", DEFAULTS.lohnSenior));
  const [lohnJunior, setLohnJunior] = useState(() => getStored("lohnJunior", DEFAULTS.lohnJunior));
  const [sozialabgabenProzent, setSozialabgabenProzent] = useState(() => getStored("sozialabgabenProzent", DEFAULTS.sozialabgabenProzent));
  
  const [sachkostenAuto, setSachkostenAuto] = useState(() => getStored("sachkostenAuto", DEFAULTS.sachkostenAuto));
  const [fixkostenManuell, setFixkostenManuell] = useState(() => getStored("fixkostenManuell", DEFAULTS.fixkostenManuell));

  useEffect(() => {
    const data = {
      startkapital, neueKundenJ1, neueKundenJ2, neueKundenJ3, neueKundenJ4,
      preisJ1, preisAbJ2, preisAbJ3, verlaengerungNachJ1, verlaengerungNachJ2, verlaengerungNachJ3,
      sponsoringJahr1, sponsoringJahr2, sponsoringJahr3, sponsoringJahr4,
      seniorFteJ1, seniorFteJ2, seniorFteJ3, seniorFteJ4,
      juniorFteJ1, juniorFteJ2, juniorFteJ3, juniorFteJ4,
      lohnSenior, lohnJunior, sozialabgabenProzent, sachkostenAuto, fixkostenManuell
    };
    Object.entries(data).forEach(([key, val]) => {
      localStorage.setItem(`hekto_${key}`, JSON.stringify(val));
    });
  }, [
    startkapital, neueKundenJ1, neueKundenJ2, neueKundenJ3, neueKundenJ4,
    preisJ1, preisAbJ2, preisAbJ3, verlaengerungNachJ1, verlaengerungNachJ2, verlaengerungNachJ3,
    sponsoringJahr1, sponsoringJahr2, sponsoringJahr3, sponsoringJahr4,
    seniorFteJ1, seniorFteJ2, seniorFteJ3, seniorFteJ4,
    juniorFteJ1, juniorFteJ2, juniorFteJ3, juniorFteJ4,
    lohnSenior, lohnJunior, sozialabgabenProzent, sachkostenAuto, fixkostenManuell
  ]);

  const handleReset = () => {
    setStartkapital(DEFAULTS.startkapital);
    setNeueKundenJ1(DEFAULTS.neueKundenJ1);
    setNeueKundenJ2(DEFAULTS.neueKundenJ2);
    setNeueKundenJ3(DEFAULTS.neueKundenJ3);
    setNeueKundenJ4(DEFAULTS.neueKundenJ4);
    setPreisJ1(DEFAULTS.preisJ1);
    setPreisAbJ2(DEFAULTS.preisAbJ2);
    setPreisAbJ3(DEFAULTS.preisAbJ3);
    setVerlaengerungNachJ1(DEFAULTS.verlaengerungNachJ1);
    setVerlaengerungNachJ2(DEFAULTS.verlaengerungNachJ2);
    setVerlaengerungNachJ3(DEFAULTS.verlaengerungNachJ3);
    setSponsoringJahr1(DEFAULTS.sponsoringJahr1);
    setSponsoringJahr2(DEFAULTS.sponsoringJahr2);
    setSponsoringJahr3(DEFAULTS.sponsoringJahr3);
    setSponsoringJahr4(DEFAULTS.sponsoringJahr4);
    setSeniorFteJ1(DEFAULTS.seniorFteJ1);
    setSeniorFteJ2(DEFAULTS.seniorFteJ2);
    setSeniorFteJ3(DEFAULTS.seniorFteJ3);
    setSeniorFteJ4(DEFAULTS.seniorFteJ4);
    setJuniorFteJ1(DEFAULTS.juniorFteJ1);
    setJuniorFteJ2(DEFAULTS.juniorFteJ2);
    setJuniorFteJ3(DEFAULTS.juniorFteJ3);
    setJuniorFteJ4(DEFAULTS.juniorFteJ4);
    setLohnSenior(DEFAULTS.lohnSenior);
    setLohnJunior(DEFAULTS.lohnJunior);
    setSozialabgabenProzent(DEFAULTS.sozialabgabenProzent);
    setSachkostenAuto(DEFAULTS.sachkostenAuto);
    setFixkostenManuell(DEFAULTS.fixkostenManuell);
  };

  const simulation = useMemo(() => {
    const sponsoringByYear = (year) =>
      year === 1 ? sponsoringJahr1 : year === 2 ? sponsoringJahr2 : year === 3 ? sponsoringJahr3 : sponsoringJahr4;
    const renew1 = clampPercent(verlaengerungNachJ1) / 100;
    const renew2 = clampPercent(verlaengerungNachJ2) / 100;
    const renew3 = clampPercent(verlaengerungNachJ3) / 100;

    const points = [];
    const personalkostenByMonth = new Array(MONTHS + 1).fill(0);
    /** Cohorts with current size and age in months */
    const cohorts = [];
    let cashbestand = startkapital;

    for (let month = 1; month <= MONTHS; month += 1) {
      const year = yearByMonth(month);
      const neueKunden =
        year === 1
          ? neueKundenJ1
          : year === 2
            ? neueKundenJ2
            : year === 3
              ? neueKundenJ3
              : neueKundenJ4;
      const seniorFte =
        year === 1
          ? seniorFteJ1
          : year === 2
            ? seniorFteJ2
            : year === 3
              ? seniorFteJ3
              : seniorFteJ4;
      const juniorFte =
        year === 1
          ? juniorFteJ1
          : year === 2
            ? juniorFteJ2
            : year === 3
              ? juniorFteJ3
              : juniorFteJ4;
      const fte = seniorFte + juniorFte;
      const sponsoringProMonat = sponsoringByYear(year);
      let lizenzCashInflow = 0;

      const lizenzPreisNachAlter = (age) => {
        if (age < 12) return preisJ1;
        if (age < 24) return preisAbJ2;
        return preisAbJ3;
      };

      for (let i = 0; i < cohorts.length; i += 1) {
        cohorts[i].age += 1;
        if (cohorts[i].age === 12) {
          cohorts[i].size *= renew1;
          lizenzCashInflow += cohorts[i].size * preisAbJ2 * 12;
        }
        if (cohorts[i].age === 24) {
          cohorts[i].size *= renew2;
          lizenzCashInflow += cohorts[i].size * preisAbJ3 * 12;
        }
        if (cohorts[i].age === 36) {
          cohorts[i].size *= renew3;
          lizenzCashInflow += cohorts[i].size * preisAbJ3 * 12;
        }
      }

      // Neukunden zahlen den Jahrespreis des ersten Vertragsjahres upfront.
      lizenzCashInflow += neueKunden * preisJ1 * 12;
      cohorts.push({ size: neueKunden, age: 0 });
      const aktiveKunden = cohorts.reduce((sum, cohort) => sum + cohort.size, 0);

      const umsatzLizenzen = cohorts.reduce((sum, cohort) => {
        const cohortPreis = lizenzPreisNachAlter(cohort.age);
        return sum + cohort.size * cohortPreis;
      }, 0);
      const gesamteinnahmen = umsatzLizenzen + sponsoringProMonat;
      const cashwirksameEinnahmen = lizenzCashInflow + sponsoringProMonat;
      const bruttolohn = (seniorFte * lohnSenior) + (juniorFte * lohnJunior);
      const sozialabgaben = bruttolohn * (sozialabgabenProzent / 100);
      const personalkosten = bruttolohn + sozialabgaben;
      personalkostenByMonth[month] = personalkosten;
      const sachkosten = sachkostenAuto ? personalkosten * 0.25 : fixkostenManuell;
      const gesamtausgaben = personalkosten + sachkosten;
      const netBurn = cashwirksameEinnahmen - gesamtausgaben;
      cashbestand += netBurn;

      points.push({
        month,
        year,
        aktiveKunden: Math.max(0, aktiveKunden),
        umsatzLizenzen,
        gesamteinnahmen,
        cashwirksameEinnahmen,
        gesamtausgaben,
        bruttolohn,
        sozialabgaben,
        personalkosten,
        sponsoringProMonat,
        cashbestand,
      });
    }

    for (let i = 0; i < points.length; i += 1) {
      const m = points[i].month;
      let loehneNaechste3 = 0;
      for (let k = 1; k <= 3; k += 1) {
        const future = Math.min(MONTHS, m + k);
        loehneNaechste3 += personalkostenByMonth[future];
      }
      const mindestliquiditaet = RESERVE_CHF + loehneNaechste3;
      const liquiditaetspuffer = points[i].cashbestand - mindestliquiditaet;
      points[i].mindestliquiditaet = mindestliquiditaet;
      points[i].liquiditaetspuffer = liquiditaetspuffer;
    }

    return points;
  }, [
    lohnSenior,
    lohnJunior,
    sozialabgabenProzent,
    seniorFteJ1,
    seniorFteJ2,
    seniorFteJ3,
    seniorFteJ4,
    juniorFteJ1,
    juniorFteJ2,
    juniorFteJ3,
    juniorFteJ4,
    fixkostenManuell,
    neueKundenJ1,
    neueKundenJ2,
    neueKundenJ3,
    neueKundenJ4,
    preisAbJ2,
    preisAbJ3,
    preisJ1,
    sachkostenAuto,
    sponsoringJahr1,
    sponsoringJahr2,
    sponsoringJahr3,
    sponsoringJahr4,
    startkapital,
    verlaengerungNachJ1,
    verlaengerungNachJ2,
    verlaengerungNachJ3,
  ]);

  const month48 = simulation[simulation.length - 1];
  const month36 = simulation[35] ?? month48;

  const breakEvenMonat = useMemo(() => {
    const hit = simulation.find((p) => p.gesamteinnahmen >= p.gesamtausgaben);
    return hit ? hit.month : null;
  }, [simulation]);
  const breakEvenPoint = breakEvenMonat != null ? simulation[breakEvenMonat - 1] : null;

  const ersteFloorVerletzung = useMemo(() => {
    const hit = simulation.find((p) => p.liquiditaetspuffer < 0);
    return hit ? hit.month : null;
  }, [simulation]);

  const runwayMonate = useMemo(() => {
    if (startkapital < 0) return 0;
    const firstNegative = simulation.find((point) => point.cashbestand < 0);
    return firstNegative ? firstNegative.month : "48+";
  }, [simulation, startkapital]);

  const kapitalAnalyse = useMemo(() => {
    const minPuffer = Math.min(...simulation.map((p) => p.liquiditaetspuffer));
    const erforderlichesStartkapital = Math.max(0, startkapital - minPuffer);
    const chartData = simulation.map((p) => ({
      ...p,
      startkapitalBeiTouchInMonat: Math.max(0, startkapital - p.liquiditaetspuffer),
      erforderlichesStartkapital,
    }));
    return { minPuffer, erforderlichesStartkapital, chartData };
  }, [simulation, startkapital]);

  const gewinnjahrEbt = useMemo(() => {
    const ebtByYear = simulation.reduce((acc, point) => {
      const ebtMonat = point.gesamteinnahmen - point.gesamtausgaben;
      acc[point.year] = (acc[point.year] ?? 0) + ebtMonat;
      return acc;
    }, {});
    const firstProfitableYear = [1, 2, 3, 4].find((year) => (ebtByYear[year] ?? 0) > 0);
    return {
      year: firstProfitableYear ?? null,
      ebt: firstProfitableYear ? ebtByYear[firstProfitableYear] : null,
    };
  }, [simulation]);

  const calcDetails = useMemo(() => {
    const renewRate1 = clampPercent(verlaengerungNachJ1) / 100;
    const renewRate2 = clampPercent(verlaengerungNachJ2) / 100;

    const y1_sold = neueKundenJ1 * 12;
    const y1_rev = y1_sold * preisJ1 * 12;

    const y2_renew_count = y1_sold * renewRate1;
    const y2_renew_rev = y2_renew_count * preisAbJ2 * 12;
    const y2_new_sold = neueKundenJ2 * 12;
    const y2_new_rev = y2_new_sold * preisJ1 * 12;
    const y2_total_rev = y2_renew_rev + y2_new_rev;

    const y3_renew_orig_count = y2_renew_count * renewRate2;
    const y3_renew_orig_rev = y3_renew_orig_count * preisAbJ3 * 12;
    const y3_renew_y2_count = y2_new_sold * renewRate1;
    const y3_renew_y2_rev = y3_renew_y2_count * preisAbJ2 * 12;
    const y3_new_sold = neueKundenJ3 * 12;
    const y3_new_rev = y3_new_sold * preisJ1 * 12;
    const y3_total_rev = y3_renew_orig_rev + y3_renew_y2_rev + y3_new_rev;

    return {
      y1_sold,
      y1_rev,
      y2_renew_count,
      y2_renew_rev,
      y2_new_sold,
      y2_new_rev,
      y2_total_rev,
      y3_renew_orig_count,
      y3_renew_orig_rev,
      y3_renew_y2_count,
      y3_renew_y2_rev,
      y3_new_sold,
      y3_new_rev,
      y3_total_rev,
    };
  }, [
    neueKundenJ1,
    neueKundenJ2,
    neueKundenJ3,
    preisJ1,
    preisAbJ2,
    preisAbJ3,
    verlaengerungNachJ1,
    verlaengerungNachJ2,
  ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-4 p-4 2xl:px-8">
      {/* Header */}
      <header className="flex items-center justify-between border-2 border-black bg-white p-4">
        <div>
          <h1 className="text-[20px] font-bold text-black">Finanzmodell Hektopascal</h1>
          <p className="text-xs font-normal text-black mt-1">Interaktive Planung für 48 Monate (CHF).</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black transition-shadow hover:shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
          title="Alle Werte auf Standard zurücksetzen"
        >
          Reset
        </button>
      </header>

      {/* KPIs Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          title="Break-even (operativ)"
          value={breakEvenMonat != null ? `ab Monat ${breakEvenMonat}` : "—"}
          helpText="Erster Monat mit Einnahmen ≥ Ausgaben."
        />
        <KPI
          title="Aktive Kunden bei Break Even"
          value={
            breakEvenPoint != null
              ? numberFormatter.format(Math.round(breakEvenPoint.aktiveKunden))
              : "—"
          }
          helpText="Kundenbestand im ersten Monat mit Einnahmen ≥ Ausgaben."
        />
        <KPI
          title="MRR (Monat 36)"
          value={currencyFormatter.format(month36.umsatzLizenzen)}
          helpText="Monatlicher wiederkehrender Lizenzumsatz."
        />
        <KPI
          title="Liquiditätspuffer (Monat 36)"
          value={currencyFormatter.format(month36.liquiditaetspuffer)}
          helpText="Cash minus (100'000 CHF Reserve + Löhne der nächsten 3 Monate)."
        />
        <KPI
          title="Floor-Verletzung"
          value={ersteFloorVerletzung != null ? `ab Monat ${ersteFloorVerletzung}` : "keine"}
          helpText="Erster Monat, in dem der Liquiditätspuffer unter 0 fällt."
        />
        <KPI
          title="Cash Runway"
          value={typeof runwayMonate === "number" ? `${runwayMonate} Monate` : runwayMonate}
          helpText="Zeitpunkt, bis der Cashbestand negativ wird."
        />
        <KPI
          title="Erforderliches Startkapital"
          value={currencyFormatter.format(kapitalAnalyse.erforderlichesStartkapital)}
          helpText="Minimales Startkapital, damit die Mindestliquidität gerade einmal berührt wird."
        />
        <KPI
          title="Gewinnjahr (EBT)"
          value={gewinnjahrEbt.year ? `Jahr ${gewinnjahrEbt.year}` : "kein Gewinnjahr"}
          helpText={
            gewinnjahrEbt.year
              ? `EBT: ${currencyFormatter.format(gewinnjahrEbt.ebt)}`
              : "In keinem Jahr ist die Summe aus Einnahmen minus Ausgaben positiv."
          }
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex border-2 border-black bg-white">
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-bold border-r-2 border-black transition-colors ${
            activeTab === "inputs" ? "bg-[#FF6B6B] text-black" : "bg-white text-black hover:bg-[#F5F5F5]"
          }`}
          onClick={() => setActiveTab("inputs")}
        >
          Eingaben (Treiber)
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-bold border-r-2 border-black transition-colors ${
            activeTab === "calc" ? "bg-[#FF6B6B] text-black" : "bg-white text-black hover:bg-[#F5F5F5]"
          }`}
          onClick={() => setActiveTab("calc")}
        >
          Berechnung
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-bold transition-colors ${
            activeTab === "charts" ? "bg-[#FF6B6B] text-black" : "bg-white text-black hover:bg-[#F5F5F5]"
          }`}
          onClick={() => setActiveTab("charts")}
        >
          Visualisierungen
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "inputs" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1: Einnahmen-Treiber */}
          <article className="border-2 border-black bg-white p-6 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[18px] font-bold text-black border-b-2 border-black pb-2 mb-4">Einnahmen-Treiber</h2>
            <div className="grid gap-4">
              <LabeledNumberInput label="Startkapital (CHF)" value={startkapital} onChange={setStartkapital} step={5000} />
              <LabeledSliderInput label="Neue Kunden/Monat Jahr 1" value={neueKundenJ1} onChange={setNeueKundenJ1} max={300} />
              <LabeledSliderInput label="Neue Kunden/Monat Jahr 2" value={neueKundenJ2} onChange={setNeueKundenJ2} max={300} />
              <LabeledSliderInput label="Neue Kunden/Monat Jahr 3" value={neueKundenJ3} onChange={setNeueKundenJ3} max={300} />
              <LabeledSliderInput label="Neue Kunden/Monat Jahr 4" value={neueKundenJ4} onChange={setNeueKundenJ4} max={300} />
              <LabeledNumberInput label="Preis pro Lizenz Jahr 1 (CHF)" value={preisJ1} onChange={setPreisJ1} step={5} />
              <LabeledNumberInput label="Preis pro Lizenz ab Jahr 2 (CHF)" value={preisAbJ2} onChange={setPreisAbJ2} step={5} />
              <LabeledNumberInput label="Preis pro Lizenz ab Jahr 3 (CHF)" value={preisAbJ3} onChange={setPreisAbJ3} step={5} />
              <div className="grid gap-3">
                <span className="text-sm font-semibold text-black">Verlängerungsraten nach Vertragsjahr</span>
                {[
                  ["nach 1 Jahr", verlaengerungNachJ1, setVerlaengerungNachJ1],
                  ["nach 2 Jahren", verlaengerungNachJ2, setVerlaengerungNachJ2],
                  ["nach 3 Jahren", verlaengerungNachJ3, setVerlaengerungNachJ3],
                ].map(([label, val, setter]) => (
                  <div key={label} className="grid gap-1">
                    <div className="flex justify-between text-xs text-black">
                      <span>Verlängerung {label}</span>
                      <span className="font-semibold text-black">{clampPercent(val).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={100}
                      step={0.1}
                      value={val}
                      onChange={(event) => setter(clampPercent(clampNumber(Number(event.target.value))))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>
                ))}
              </div>
              <LabeledNumberInput
                label="Sponsoring/Monat Jahr 1 (CHF)"
                value={sponsoringJahr1}
                onChange={setSponsoringJahr1}
                step={1000}
              />
              <LabeledNumberInput
                label="Sponsoring/Monat Jahr 2 (CHF)"
                value={sponsoringJahr2}
                onChange={setSponsoringJahr2}
                step={1000}
              />
              <LabeledNumberInput
                label="Sponsoring/Monat Jahr 3 (CHF)"
                value={sponsoringJahr3}
                onChange={setSponsoringJahr3}
                step={1000}
              />
              <LabeledNumberInput
                label="Sponsoring/Monat Jahr 4 (CHF)"
                value={sponsoringJahr4}
                onChange={setSponsoringJahr4}
                step={1000}
              />
            </div>
          </article>

          {/* Card 2: Ausgaben-Treiber */}
          <article className="border-2 border-black bg-white p-6 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[18px] font-bold text-black border-b-2 border-black pb-2 mb-4">Ausgaben-Treiber</h2>
            <div className="grid gap-4">
              <div className="border-2 border-black p-3 space-y-2">
                <span className="text-sm font-bold text-black uppercase">Jahr 1 Staffing</span>
                <LabeledSliderInput label="Senior FTE" value={seniorFteJ1} onChange={setSeniorFteJ1} min={0} max={20} />
                <LabeledSliderInput label="Junior FTE" value={juniorFteJ1} onChange={setJuniorFteJ1} min={0} max={20} />
              </div>
              <div className="border-2 border-black p-3 space-y-2">
                <span className="text-sm font-bold text-black uppercase">Jahr 2 Staffing</span>
                <LabeledSliderInput label="Senior FTE" value={seniorFteJ2} onChange={setSeniorFteJ2} min={0} max={20} />
                <LabeledSliderInput label="Junior FTE" value={juniorFteJ2} onChange={setJuniorFteJ2} min={0} max={20} />
              </div>
              <div className="border-2 border-black p-3 space-y-2">
                <span className="text-sm font-bold text-black uppercase">Jahr 3 Staffing</span>
                <LabeledSliderInput label="Senior FTE" value={seniorFteJ3} onChange={setSeniorFteJ3} min={0} max={20} />
                <LabeledSliderInput label="Junior FTE" value={juniorFteJ3} onChange={setJuniorFteJ3} min={0} max={20} />
              </div>
              <div className="border-2 border-black p-3 space-y-2">
                <span className="text-sm font-bold text-black uppercase">Jahr 4 Staffing</span>
                <LabeledSliderInput label="Senior FTE" value={seniorFteJ4} onChange={setSeniorFteJ4} min={0} max={20} />
                <LabeledSliderInput label="Junior FTE" value={juniorFteJ4} onChange={setJuniorFteJ4} min={0} max={20} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <LabeledNumberInput
                  label="Lohn Senior FTE / Monat (CHF)"
                  value={lohnSenior}
                  onChange={setLohnSenior}
                  step={500}
                />
                <LabeledNumberInput
                  label="Lohn Junior FTE / Monat (CHF)"
                  value={lohnJunior}
                  onChange={setLohnJunior}
                  step={500}
                />
              </div>
              <div className="grid gap-1 border-2 border-black p-3 bg-[#F5F5F5]">
                <div className="flex justify-between text-sm text-black">
                  <span className="font-bold uppercase text-xs">Sozialabgaben & Vorsorge Arbeitgeber (%)</span>
                  <span className="font-semibold text-black">{clampPercent(sozialabgabenProzent).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={sozialabgabenProzent}
                  onChange={(event) => setSozialabgabenProzent(clampPercent(clampNumber(Number(event.target.value))))}
                  className="w-full accent-[#FF6B6B]"
                />
                <span className="text-[11px] text-gray-500 font-mono leading-tight">
                  AHV/IV/EO: 5.30% | ALV: 1.10% | Pensionskasse (BVG), FAK, UVG, KTG: ca. 7–9%
                </span>
              </div>
              <label className="flex items-start gap-3 border-2 border-black bg-white p-3 transition-shadow hover:shadow-[2px_2px_0px_#000]">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[#FF6B6B]"
                  checked={sachkostenAuto}
                  onChange={(event) => setSachkostenAuto(event.target.checked)}
                />
                <span className="text-sm font-semibold text-black">Sachkosten sind 25% der Personalkosten (80/20 Regel)</span>
              </label>
              {!sachkostenAuto && (
                <LabeledNumberInput
                  label="Fixkosten pro Monat (CHF)"
                  value={fixkostenManuell}
                  onChange={setFixkostenManuell}
                  step={500}
                />
              )}
            </div>
          </article>
        </div>
      )}

      {activeTab === "charts" && (
        <div className="space-y-4">
          <article className="border-2 border-black bg-white p-4 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[16px] font-bold text-black">Kundenwachstum</h2>
            <p className="text-sm font-normal text-black">Aktive Kundenentwicklung über 48 Monate.</p>
            <div className="mt-4 h-[28rem] 2xl:h-[32rem]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation} margin={{ top: 12, right: 12, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cfcfcf" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 14, fill: "#000000" }}
                    label={{ value: "Monat", position: "insideBottom", offset: -4 }}
                    minTickGap={18}
                  />
                  <YAxis tick={{ fontSize: 14, fill: "#000000" }} width={56} />
                  {breakEvenMonat != null && (
                    <ReferenceLine
                      x={breakEvenMonat}
                      stroke="#00aa00"
                      strokeDasharray="4 4"
                      label={{ value: "Break-even", position: "insideTopRight", fill: "#00aa00", fontSize: 12 }}
                    />
                  )}
                  <Tooltip
                    formatter={(value) => numberFormatter.format(Math.round(value))}
                    labelFormatter={(label) => `Monat ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 14, fontWeight: 600, color: "#000000" }} />
                  <Line
                    type="monotone"
                    dataKey="aktiveKunden"
                    name="Aktive Kunden"
                    stroke="#FF6B6B"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="border-2 border-black bg-white p-4 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[16px] font-bold text-black">Finanzen & Liquidität</h2>
            <p className="text-sm font-normal text-black">
              Einnahmen, Ausgaben, Cashbestand und Mindestliquidität (100&apos;000 CHF + Löhne für 3 Monate voraus). Die grüne Linie markiert Break-even (Einnahmen = Ausgaben).
            </p>
            <div className="mt-4 h-[34rem] 2xl:h-[38rem]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation} margin={{ top: 12, right: 26, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cfcfcf" />
                  <XAxis dataKey="month" tick={{ fontSize: 14, fill: "#000000" }} minTickGap={18} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 14, fill: "#000000" }}
                    tickFormatter={axisCurrencyFormatter}
                    width={84}
                    label={{ value: "Einnahmen/Ausgaben (CHF)", angle: -90, position: "insideLeft", fill: "#000000", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 14, fill: "#000000" }}
                    tickFormatter={axisCurrencyFormatter}
                    width={92}
                    label={{ value: "Cash/Floor (CHF)", angle: 90, position: "insideRight", fill: "#000000", fontSize: 12 }}
                  />
                  {breakEvenMonat != null && (
                    <ReferenceLine
                      x={breakEvenMonat}
                      yAxisId="left"
                      stroke="#00aa00"
                      strokeDasharray="4 4"
                      label={{ value: "Break-even", position: "insideTopRight", fill: "#00aa00", fontSize: 12 }}
                    />
                  )}
                  <Tooltip
                    formatter={(value, name) => [currencyFormatter.format(value), name]}
                    labelFormatter={(label) => `Monat ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 14, fontWeight: 600, color: "#000000" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="gesamteinnahmen"
                    name="Einnahmen"
                    stroke="#00aa00"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="gesamtausgaben"
                    name="Ausgaben"
                    stroke="#FF2C2C"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cashbestand"
                    name="Cashbestand"
                    stroke="#000000"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mindestliquiditaet"
                    name="Mindestliquidität"
                    stroke="#ff9900"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="border-2 border-black bg-white p-4 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[16px] font-bold text-black">Kapitalbedarf bei Floor-Touch</h2>
            <p className="text-sm font-normal text-black">
              Zeigt, welches Startkapital nötig wäre, um die Mindestliquidität genau in einem bestimmten Monat zu berühren.
            </p>
            <div className="mt-4 h-[30rem] 2xl:h-[34rem]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kapitalAnalyse.chartData} margin={{ top: 12, right: 26, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cfcfcf" />
                  <XAxis dataKey="month" tick={{ fontSize: 14, fill: "#000000" }} minTickGap={18} />
                  <YAxis
                    tick={{ fontSize: 14, fill: "#000000" }}
                    tickFormatter={axisCurrencyFormatter}
                    width={100}
                    label={{ value: "Startkapital (CHF)", angle: -90, position: "insideLeft", fill: "#000000", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [currencyFormatter.format(value), name]}
                    labelFormatter={(label) => `Monat ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 14, fontWeight: 600, color: "#000000" }} />
                  <Line
                    type="monotone"
                    dataKey="startkapitalBeiTouchInMonat"
                    name="Startkapital bei Touch in Monat"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="erforderlichesStartkapital"
                    name="Minimal nötiges Startkapital"
                    stroke="#000000"
                    strokeDasharray="6 4"
                    strokeWidth={2.2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      )}

      {activeTab === "calc" && (
        <div className="space-y-4">
          {/* Year 1 Card */}
          <article className="border-2 border-black bg-white p-6 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[18px] font-bold text-black border-b-2 border-black pb-2 mb-4">Jahr 1</h2>
            <p className="text-sm font-normal text-black mb-4">
              Im ersten Jahr verkaufen wir <strong>{neueKundenJ1}</strong> Kunden pro Monat à <strong>{preisJ1} CHF</strong>.
            </p>
            <div className="grid gap-3 bg-[#F5F5F5] border-2 border-black p-4 font-mono text-sm text-black">
              <div>
                <span className="font-semibold text-gray-600">Verkaufte Lizenzen:</span>
                <div className="text-[16px] font-bold mt-1">
                  {neueKundenJ1} Lizenzen/Monat * 12 Monate = {numberFormatter.format(calcDetails.y1_sold)} Lizenzen
                </div>
              </div>
              <hr className="border-black border-dashed" />
              <div>
                <span className="font-semibold text-gray-600">Einnahmen (upfront):</span>
                <div className="text-[16px] font-bold mt-1 text-[#00aa00]">
                  {numberFormatter.format(calcDetails.y1_sold)} Lizenzen * {preisJ1} CHF * 12 Monate = {currencyFormatter.format(calcDetails.y1_rev)}
                </div>
              </div>
              <hr className="border-black border-dashed" />
              <div>
                <span className="font-semibold text-gray-600">ARR (Annual Recurring Revenue) am Ende von Jahr 1:</span>
                <div className="text-[16px] font-bold mt-1 text-blue-600">
                  MRR (Monat 12): {currencyFormatter.format(calcDetails.y1_rev / 12)} / Monat<br />
                  ARR (MRR * 12): {currencyFormatter.format(calcDetails.y1_rev)} / Jahr
                </div>
              </div>
            </div>
          </article>

          {/* Year 2 Card */}
          <article className="border-2 border-black bg-white p-6 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[18px] font-bold text-black border-b-2 border-black pb-2 mb-4">Jahr 2</h2>
            <p className="text-sm font-normal text-black mb-4">
              Bestandskunden aus Jahr 1 verlängern zu <strong>{verlaengerungNachJ1}%</strong> zum Preis von <strong>{preisAbJ2} CHF</strong>.<br />
              Neukunden im Jahr 2 (<strong>{neueKundenJ2}</strong>/Monat) zahlen den Erstjahr-Preis von <strong>{preisJ1} CHF</strong>.
            </p>
            <div className="space-y-4">
              {/* Old customers */}
              <div className="grid gap-3 bg-[#F5F5F5] border-2 border-black p-4 font-mono text-sm text-black">
                <span className="font-bold text-xs uppercase text-gray-600">A) Verlängerung Bestandskunden (Jahr 1)</span>
                <div>
                  <span className="font-semibold text-gray-600">Verlängerte Lizenzen:</span>
                  <div className="text-[15px] font-semibold mt-1">
                    {numberFormatter.format(calcDetails.y1_sold)} Lizenzen * {verlaengerungNachJ1}% = {numberFormatter.format(Math.round(calcDetails.y2_renew_count))} Lizenzen
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Einnahmen:</span>
                  <div className="text-[15px] font-semibold mt-1 text-[#00aa00]">
                    {numberFormatter.format(Math.round(calcDetails.y2_renew_count))} Lizenzen * {preisAbJ2} CHF * 12 Monate = {currencyFormatter.format(calcDetails.y2_renew_rev)}
                  </div>
                </div>
              </div>

              {/* New customers */}
              <div className="grid gap-3 bg-[#F5F5F5] border-2 border-black p-4 font-mono text-sm text-black">
                <span className="font-bold text-xs uppercase text-gray-600">B) Neue Kunden Jahr 2</span>
                <div>
                  <span className="font-semibold text-gray-600">Verkaufte Lizenzen:</span>
                  <div className="text-[15px] font-semibold mt-1">
                    {neueKundenJ2} Lizenzen/Monat * 12 Monate = {numberFormatter.format(calcDetails.y2_new_sold)} Lizenzen
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Einnahmen:</span>
                  <div className="text-[15px] font-semibold mt-1 text-[#00aa00]">
                    {numberFormatter.format(calcDetails.y2_new_sold)} Lizenzen * {preisJ1} CHF * 12 Monate = {currencyFormatter.format(calcDetails.y2_new_rev)}
                  </div>
                </div>
              </div>

              {/* Year 2 Total */}
              <div className="bg-black text-white p-4 font-mono text-sm border-2 border-black flex justify-between items-center">
                <span className="font-bold">Gesamteinnahmen Jahr 2:</span>
                <span className="text-[18px] font-bold text-[#4ade80]">
                  {currencyFormatter.format(calcDetails.y2_total_rev)}
                </span>
              </div>

              {/* Year 2 ARR */}
              <div className="bg-[#EBF4FF] border-2 border-black p-4 font-mono text-sm text-black">
                <span className="font-bold text-xs uppercase text-gray-600">ARR (Annual Recurring Revenue) am Ende von Jahr 2</span>
                <div className="mt-2 space-y-1">
                  <div>MRR Bestandskunden: {currencyFormatter.format(calcDetails.y2_renew_rev / 12)} / Monat</div>
                  <div>MRR Neukunden: {currencyFormatter.format(calcDetails.y2_new_rev / 12)} / Monat</div>
                  <div className="font-bold border-t border-black pt-1 mt-1">
                    Gesamt-MRR (Monat 24): {currencyFormatter.format(calcDetails.y2_total_rev / 12)} / Monat
                  </div>
                  <div className="font-bold text-blue-600 text-[15px] mt-1">
                    Gesamt-ARR (MRR * 12): {currencyFormatter.format(calcDetails.y2_total_rev)} / Jahr
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Year 3 Card */}
          <article className="border-2 border-black bg-white p-6 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[18px] font-bold text-black border-b-2 border-black pb-2 mb-4">Jahr 3</h2>
            <p className="text-sm font-normal text-black mb-4">
              Kunden aus Jahr 1 verlängern ein zweites Mal zu <strong>{verlaengerungNachJ2}%</strong> zum Preis von <strong>{preisAbJ3} CHF</strong>.<br />
              Kunden aus Jahr 2 verlängern das erste Mal zu <strong>{verlaengerungNachJ1}%</strong> zum Preis von <strong>{preisAbJ2} CHF</strong>.<br />
              Neukunden im Jahr 3 (<strong>{neueKundenJ3}</strong>/Monat) zahlen den Erstjahr-Preis von <strong>{preisJ1} CHF</strong>.
            </p>
            <div className="space-y-4">
              {/* Original cohort renewal */}
              <div className="grid gap-3 bg-[#F5F5F5] border-2 border-black p-4 font-mono text-sm text-black">
                <span className="font-bold text-xs uppercase text-gray-600">A) Zweite Verlängerung (Originalkunden Jahr 1)</span>
                <div>
                  <span className="font-semibold text-gray-600">Verlängerte Lizenzen:</span>
                  <div className="text-[15px] font-semibold mt-1">
                    {numberFormatter.format(Math.round(calcDetails.y2_renew_count))} Lizenzen * {verlaengerungNachJ2}% = {numberFormatter.format(Math.round(calcDetails.y3_renew_orig_count))} Lizenzen
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Einnahmen:</span>
                  <div className="text-[15px] font-semibold mt-1 text-[#00aa00]">
                    {numberFormatter.format(Math.round(calcDetails.y3_renew_orig_count))} Lizenzen * {preisAbJ3} CHF * 12 Monate = {currencyFormatter.format(calcDetails.y3_renew_orig_rev)}
                  </div>
                </div>
              </div>

              {/* Year 2 cohort renewal */}
              <div className="grid gap-3 bg-[#F5F5F5] border-2 border-black p-4 font-mono text-sm text-black">
                <span className="font-bold text-xs uppercase text-gray-600">B) Erste Verlängerung (Kunden Jahr 2)</span>
                <div>
                  <span className="font-semibold text-gray-600">Verlängerte Lizenzen:</span>
                  <div className="text-[15px] font-semibold mt-1">
                    {numberFormatter.format(calcDetails.y2_new_sold)} Lizenzen * {verlaengerungNachJ1}% = {numberFormatter.format(Math.round(calcDetails.y3_renew_y2_count))} Lizenzen
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Einnahmen:</span>
                  <div className="text-[15px] font-semibold mt-1 text-[#00aa00]">
                    {numberFormatter.format(Math.round(calcDetails.y3_renew_y2_count))} Lizenzen * {preisAbJ2} CHF * 12 Monate = {currencyFormatter.format(calcDetails.y3_renew_y2_rev)}
                  </div>
                </div>
              </div>

              {/* New customers */}
              <div className="grid gap-3 bg-[#F5F5F5] border-2 border-black p-4 font-mono text-sm text-black">
                <span className="font-bold text-xs uppercase text-gray-600">C) Neue Kunden Jahr 3</span>
                <div>
                  <span className="font-semibold text-gray-600">Verkaufte Lizenzen:</span>
                  <div className="text-[15px] font-semibold mt-1">
                    {neueKundenJ3} Lizenzen/Monat * 12 Monate = {numberFormatter.format(calcDetails.y3_new_sold)} Lizenzen
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Einnahmen:</span>
                  <div className="text-[15px] font-semibold mt-1 text-[#00aa00]">
                    {numberFormatter.format(calcDetails.y3_new_sold)} Lizenzen * {preisJ1} CHF * 12 Monate = {currencyFormatter.format(calcDetails.y3_new_rev)}
                  </div>
                </div>
              </div>

              {/* Year 3 Total */}
              <div className="bg-black text-white p-4 font-mono text-sm border-2 border-black flex justify-between items-center">
                <span className="font-bold">Gesamteinnahmen Jahr 3:</span>
                <span className="text-[18px] font-bold text-[#4ade80]">
                  {currencyFormatter.format(calcDetails.y3_total_rev)}
                </span>
              </div>

              {/* Year 3 ARR */}
              <div className="bg-[#EBF4FF] border-2 border-black p-4 font-mono text-sm text-black">
                <span className="font-bold text-xs uppercase text-gray-600">ARR (Annual Recurring Revenue) am Ende von Jahr 3</span>
                <div className="mt-2 space-y-1">
                  <div>MRR Originalkunden (Jahr 1): {currencyFormatter.format(calcDetails.y3_renew_orig_rev / 12)} / Monat</div>
                  <div>MRR Bestandskunden (Jahr 2): {currencyFormatter.format(calcDetails.y3_renew_y2_rev / 12)} / Monat</div>
                  <div>MRR Neukunden (Jahr 3): {currencyFormatter.format(calcDetails.y3_new_rev / 12)} / Monat</div>
                  <div className="font-bold border-t border-black pt-1 mt-1">
                    Gesamt-MRR (Monat 36): {currencyFormatter.format(calcDetails.y3_total_rev / 12)} / Monat
                  </div>
                  <div className="font-bold text-blue-600 text-[15px] mt-1">
                    Gesamt-ARR (MRR * 12): {currencyFormatter.format(calcDetails.y3_total_rev)} / Jahr
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Break-even Card */}
          <article className="border-2 border-black bg-white p-6 transition-shadow hover:shadow-[2px_2px_0px_#000]">
            <h2 className="text-[18px] font-bold text-black border-b-2 border-black pb-2 mb-4">Break-even (operativ)</h2>
            <p className="text-sm font-normal text-black mb-4">
              Der operative Break-Even ist der erste Monat, in dem die monatlichen Einnahmen (Lizenz-MRR + Sponsoring) die monatlichen Ausgaben (Personalkosten + Sachkosten) decken oder übertreffen:
              <br />
              <span className="font-semibold">Bedingung:</span> Einnahmen ≥ Ausgaben
            </p>

            {breakEvenMonat != null && breakEvenPoint != null ? (
              <div className="grid gap-3 bg-[#F5F5F5] border-2 border-black p-4 font-mono text-sm text-black">
                <div className="text-[16px] font-bold text-[#00aa00] mb-2">
                  Erreicht in Monat {breakEvenMonat} (Jahr {breakEvenPoint.year})
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Monatliche Einnahmen in Monat {breakEvenMonat}:</span>
                  <div className="pl-4 mt-1">
                    Lizenz-Umsatz (MRR): {currencyFormatter.format(breakEvenPoint.umsatzLizenzen)} / Monat<br />
                    Sponsoring: {currencyFormatter.format(breakEvenPoint.sponsoringProMonat)} / Monat<br />
                    <span className="font-bold">Gesamteinnahmen: {currencyFormatter.format(breakEvenPoint.gesamteinnahmen)} / Monat</span>
                  </div>
                </div>
                <hr className="border-black border-dashed" />
                <div>
                  <span className="font-semibold text-gray-600">Monatliche Ausgaben in Monat {breakEvenMonat}:</span>
                  <div className="pl-4 mt-1 space-y-1">
                    <div>
                      <span className="font-semibold">Personalkosten gesamt:</span> {currencyFormatter.format(breakEvenPoint.personalkosten)} / Monat
                      <div className="text-[12px] text-gray-600 pl-4 border-l-2 border-black ml-1 mt-0.5 font-mono">
                        Bruttolöhne: {currencyFormatter.format(breakEvenPoint.bruttolohn)} / Monat<br />
                        Sozialabgaben & Vorsorge ({clampPercent(sozialabgabenProzent).toFixed(1)}%): {currencyFormatter.format(breakEvenPoint.sozialabgaben)} / Monat
                      </div>
                    </div>
                    <div>Sachkosten: {currencyFormatter.format(breakEvenPoint.gesamtausgaben - breakEvenPoint.personalkosten)} / Monat</div>
                    <div className="font-bold pt-1 mt-1 border-t border-black">Gesamtausgaben: {currencyFormatter.format(breakEvenPoint.gesamtausgaben)} / Monat</div>
                  </div>
                </div>
                <hr className="border-black border-dashed" />
                <div className="font-bold text-[#00aa00] text-[15px]">
                  Netto-Ergebnis (Einnahmen - Ausgaben): +{currencyFormatter.format(breakEvenPoint.gesamteinnahmen - breakEvenPoint.gesamtausgaben)} / Monat
                </div>
              </div>
            ) : (
              <div className="bg-[#FFF0F0] border-2 border-black p-4 font-mono text-sm text-red-600 font-bold">
                Kein Break-Even innerhalb der 48 Monate mit den aktuellen Parametern.
              </div>
            )}
          </article>
        </div>
      )}

      {/* Footnotes */}
      <article className="border-2 border-black bg-[#F5F5F5] p-4">
        <h2 className="text-[16px] font-bold text-black">Fussnoten</h2>
        <div className="mt-3 space-y-3 text-sm text-black">
          <div>
            <p className="font-semibold">Anmerkungen</p>
            <p>
              <span className="font-semibold">Liquiditäts-Floor:</span> Im Modell ist der Floor
              <span className="font-semibold"> 100&apos;000 CHF + 3 Monatslöhne</span>. Sachkosten sind dabei nicht enthalten.
            </p>
            <p>
              <span className="font-semibold">Preislogik:</span> Kunden zahlen im ersten Vertragsjahr den Jahr-1-Preis, im zweiten
              Vertragsjahr den Preis ab Jahr 2 und ab dem dritten Vertragsjahr den Preis ab Jahr 3.
            </p>
          </div>
          <div>
            <p className="font-semibold">Vereinfachungen</p>
            <p>
              <span className="font-semibold">Null-FTE = niedrige Sachkosten:</span> Bei 80/20 sinken Sachkosten mit den FTEs mit.
              Feste Startkosten (z. B. Recht, Setup, Lizenzen) sind nicht automatisch drin.
            </p>
            <p>
              <span className="font-semibold">Kein Blended ARPU:</span> Das Modell nutzt feste Preise je Kohortenalter statt eines
              gemischten Durchschnittspreises.
            </p>
            <p>
              <span className="font-semibold">Unsterbliche Kohorten:</span> Kündigungen passieren nur zu Verlängerungszeitpunkten
              (12/24/36 Monate), nicht laufend unter dem Jahr.
            </p>
            <p>
              <span className="font-semibold">Cashflow vs. MRR:</span> Cash nutzt Annual Upfront (Jahreszahlung sofort), MRR zeigt
              den monatlichen Umsatz. Beides kann daher bewusst auseinanderlaufen.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}

export default App;
