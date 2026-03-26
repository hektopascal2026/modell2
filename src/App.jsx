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

function App() {
  const [startkapital, setStartkapital] = useState(150000);
  const [neueKundenJ1, setNeueKundenJ1] = useState(40);
  const [neueKundenJ2, setNeueKundenJ2] = useState(80);
  const [neueKundenJ3, setNeueKundenJ3] = useState(120);
  const [preisJ1, setPreisJ1] = useState(50);
  const [preisAbJ2, setPreisAbJ2] = useState(80);
  const [verlaengerungNachJ1, setVerlaengerungNachJ1] = useState(85);
  const [verlaengerungNachJ2, setVerlaengerungNachJ2] = useState(90);
  const [verlaengerungNachJ3, setVerlaengerungNachJ3] = useState(92);
  const [sponsoringJahr1, setSponsoringJahr1] = useState(10000);
  const [sponsoringJahr2, setSponsoringJahr2] = useState(10000);
  const [sponsoringJahr3, setSponsoringJahr3] = useState(10000);
  const [sponsoringJahr4, setSponsoringJahr4] = useState(10000);
  const [fteJ1, setFteJ1] = useState(4);
  const [fteJ2, setFteJ2] = useState(8);
  const [fteJ3, setFteJ3] = useState(12);
  const [avgLohn, setAvgLohn] = useState(8000);
  const [sachkostenAuto, setSachkostenAuto] = useState(true);
  const [fixkostenManuell, setFixkostenManuell] = useState(8000);

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
      const neueKunden = year === 1 ? neueKundenJ1 : year === 2 ? neueKundenJ2 : neueKundenJ3;
      const fte = year === 1 ? fteJ1 : year === 2 ? fteJ2 : fteJ3;
      const sponsoringProMonat = sponsoringByYear(year);
      let lizenzCashInflow = 0;

      for (let i = 0; i < cohorts.length; i += 1) {
        cohorts[i].age += 1;
        if (cohorts[i].age === 12) {
          cohorts[i].size *= renew1;
          lizenzCashInflow += cohorts[i].size * preisAbJ2 * 12;
        }
        if (cohorts[i].age === 24) {
          cohorts[i].size *= renew2;
          lizenzCashInflow += cohorts[i].size * preisAbJ2 * 12;
        }
        if (cohorts[i].age === 36) {
          cohorts[i].size *= renew3;
          lizenzCashInflow += cohorts[i].size * preisAbJ2 * 12;
        }
      }

      // Neukunden zahlen den Jahrespreis des ersten Vertragsjahres upfront.
      lizenzCashInflow += neueKunden * preisJ1 * 12;
      cohorts.push({ size: neueKunden, age: 0 });
      const aktiveKunden = cohorts.reduce((sum, cohort) => sum + cohort.size, 0);

      const umsatzLizenzen = cohorts.reduce((sum, cohort) => {
        const cohortPreis = cohort.age < 12 ? preisJ1 : preisAbJ2;
        return sum + cohort.size * cohortPreis;
      }, 0);
      const gesamteinnahmen = umsatzLizenzen + sponsoringProMonat;
      const cashwirksameEinnahmen = lizenzCashInflow + sponsoringProMonat;
      const personalkosten = fte * avgLohn;
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
        personalkosten,
        sponsoringProMonat,
        cashbestand,
      });
    }

    for (let i = 0; i < points.length; i += 1) {
      const m = points[i].month;
      let loehneNaechste3 = 0;
      for (let k = 1; k <= 3; k += 1) {
        const future = m + k;
        if (future <= MONTHS) loehneNaechste3 += personalkostenByMonth[future];
      }
      const mindestliquiditaet = RESERVE_CHF + loehneNaechste3;
      const liquiditaetspuffer = points[i].cashbestand - mindestliquiditaet;
      points[i].mindestliquiditaet = mindestliquiditaet;
      points[i].liquiditaetspuffer = liquiditaetspuffer;
    }

    return points;
  }, [
    avgLohn,
    fteJ1,
    fteJ2,
    fteJ3,
    fixkostenManuell,
    neueKundenJ1,
    neueKundenJ2,
    neueKundenJ3,
    preisAbJ2,
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-4 p-4 2xl:px-8 xl:flex-row">
      <aside className="w-full border-2 border-black bg-white p-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:w-[320px] xl:flex-none xl:overflow-y-auto">
        <h1 className="text-[18px] font-bold text-black md:text-[18px]">Finanzmodell Hektopascal</h1>
        <p className="mt-1 text-xs font-normal text-black">Interaktive Planung für 48 Monate (CHF).</p>

        <div className="mt-4 space-y-3">
          <details open className="border-2 border-black bg-white">
            <summary className="cursor-pointer list-none bg-[#F5F5F5] px-4 py-3 text-sm font-semibold text-black">
              Einnahmen-Treiber
            </summary>
            <div className="grid gap-4 border-t-2 border-black px-4 py-4">
              <LabeledNumberInput label="Startkapital (CHF)" value={startkapital} onChange={setStartkapital} step={5000} />
              <LabeledSliderInput label="Neue Kunden/Monat Jahr 1" value={neueKundenJ1} onChange={setNeueKundenJ1} max={300} />
              <LabeledSliderInput label="Neue Kunden/Monat Jahr 2" value={neueKundenJ2} onChange={setNeueKundenJ2} max={300} />
              <LabeledSliderInput label="Neue Kunden/Monat Jahr 3" value={neueKundenJ3} onChange={setNeueKundenJ3} max={300} />
              <LabeledNumberInput label="Preis pro Lizenz Jahr 1 (CHF)" value={preisJ1} onChange={setPreisJ1} step={5} />
              <LabeledNumberInput label="Preis pro Lizenz ab Jahr 2 (CHF)" value={preisAbJ2} onChange={setPreisAbJ2} step={5} />
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
                <p className="text-xs text-black">
                  Kohortenlogik: Kunden werden nach 12/24/36 Monaten mit der jeweiligen Verlängerungsrate fortgeschrieben.
                </p>
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
          </details>

          <details open className="border-2 border-black bg-white">
            <summary className="cursor-pointer list-none bg-[#F5F5F5] px-4 py-3 text-sm font-semibold text-black">
              Ausgaben-Treiber
            </summary>
            <div className="grid gap-4 border-t-2 border-black px-4 py-4">
              <LabeledSliderInput label="FTE Jahr 1" value={fteJ1} onChange={setFteJ1} min={0} max={30} />
              <LabeledSliderInput label="FTE Jahr 2" value={fteJ2} onChange={setFteJ2} min={0} max={40} />
              <LabeledSliderInput label="FTE Jahr 3" value={fteJ3} onChange={setFteJ3} min={0} max={50} />
              <LabeledNumberInput
                label="Durchschnittslohn pro FTE/Monat (CHF)"
                value={avgLohn}
                onChange={setAvgLohn}
                step={500}
              />
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
          </details>
        </div>
      </aside>

      <section className="w-full min-w-0 space-y-4 xl:flex-1">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                <span className="font-semibold">Preislogik:</span> Kunden zahlen im ersten Vertragsjahr den Jahr-1-Preis und ab der
                ersten Verlängerung den Preis ab Jahr 2.
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
      </section>
    </main>
  );
}

export default App;
