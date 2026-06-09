mport { useState, useCallback, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
 bg: "#F7F8FA", surface: "#FFFFFF", navy: "#1B2A4A", navyLight: "#2C3E5D",
 coral: "#E8614A", mint: "#2ECC9A", amber: "#F0A500", muted: "#8A94A6",
 border: "#E4E8F0", text: "#1B2A4A", textSoft: "#5A6478",
};

// ── Seed data (empty — ready for real data) ────────────────────────────────────
const DEMO_PROPERTIES = [];
const DEMO_CLEANERS   = [];
const DEMO_BOOKINGS   = [];
const DEMO_CLEANS     = [];
const DEMO_EARNINGS   = [];

const today = new Date();
const d = (offsetDays, h = 11) => { const dt = new Date(today); dt.setDate(dt.getDate() + offsetDays); dt.setHours(h,0,0,0); return dt; };

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = dt => dt.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
const fmtShort= dt => dt.toLocaleDateString("en-GB", { day:"numeric", month:"short" });
const isToday = dt => { const n=new Date(); return dt.getDate()===n.getDate()&&dt.getMonth()===n.getMonth()&&dt.getFullYear()===n.getFullYear(); };
const isSameDay=(a,b)=>a.getDate()===b.getDate()&&a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear();
const gbp = v => `£${v.toLocaleString("en-GB", { minimumFractionDigits:0, maximumFractionDigits:0 })}`;
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const daysInMonth = (y,m) => new Date(y, m+1, 0).getDate();

function statusPill(status) {
 const map = { pending:[C.amber,"#FFF8E7"], "in-progress":[C.navy,"#EEF1F7"], complete:[C.mint,"#E8FAF4"], cancelled:[C.muted,"#F4F5F7"] };
 const [fg,bg] = map[status]||[C.muted,"#F4F5F7"];
 return { color:fg, background:bg, borderRadius:99, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:"0.04em", textTransform:"uppercase", display:"inline-block" };
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function CleanOps() {
 const [role,setRole]           = useState(null);
 const [currentCleaner,setCC]   = useState(null);
 const [pin,setPin]             = useState("");
 const [pinError,setPinError]   = useState("");
 const [properties,setProps]    = useState(DEMO_PROPERTIES);
 const [cleaners,setCleaners]   = useState(DEMO_CLEANERS);
 const [bookings,setBookings]   = useState(DEMO_BOOKINGS);
 const [cleans,setCleans]       = useState(DEMO_CLEANS);
 const [earnings,setEarnings]   = useState(DEMO_EARNINGS);
 const [tab,setTab]             = useState("diary");
 const [toast,setToast]         = useState(null);

 const showToast = useCallback((msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3200); },[]);

 if (!role) return <LoginScreen pin={pin} setPin={setPin} pinError={pinError} setPinError={setPinError} cleaners={cleaners} setRole={setRole} setCurrentCleaner={setCC} />;
 if (role==="cleaner") return <CleanerPortal cleaner={currentCleaner} properties={properties} cleans={cleans} bookings={bookings} setCleans={setCleans} showToast={showToast} toast={toast} onLogout={()=>{setRole(null);setPin("");setCC(null);}} />;

 return (
   <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter',system-ui,sans-serif", color:C.text }}>
     {toast && <Toast msg={toast.msg} type={toast.type} />}
     <Sidebar tab={tab} setTab={setTab} onLogout={()=>{setRole(null);setPin("");}} />
     <div style={{ marginLeft:220, padding:"32px 36px", maxWidth:1100 }}>
       {tab==="diary"      && <DiaryView      properties={properties} bookings={bookings} cleans={cleans} cleaners={cleaners} setCleans={setCleans} setBookings={setBookings} showToast={showToast} />}
       {tab==="cleans"     && <CleansView     cleans={cleans} setCleans={setCleans} properties={properties} cleaners={cleaners} bookings={bookings} showToast={showToast} />}
       {tab==="earnings"   && <EarningsView   properties={properties} earnings={earnings} setEarnings={setEarnings} showToast={showToast} />}
       {tab==="properties" && <PropertiesView properties={properties} setProperties={setProps} bookings={bookings} showToast={showToast} />}
       {tab==="team"       && <TeamView       cleaners={cleaners} setCleaners={setCleaners} properties={properties} showToast={showToast} />}
       {tab==="settings"   && <SettingsView />}
     </div>
   </div>
 );
}

// ── Login ──────────────────────────────────────────────────────────────────────
function LoginScreen({ pin,setPin,pinError,setPinError,cleaners,setRole,setCurrentCleaner }) {
 const MANAGER_PIN="0000";
 const digits=["1","2","3","4","5","6","7","8","9","","0","⌫"];
 const handleDigit=(dg)=>{
   if(dg==="⌫"){setPin(p=>p.slice(0,-1));setPinError("");return;}
   if(dg==="")return;
   const next=pin+dg; setPin(next); setPinError("");
   if(next.length===4){
     if(next===MANAGER_PIN){setRole("manager");return;}
     const cl=cleaners.find(c=>c.pin===next);
     if(cl){setRole("cleaner");setCurrentCleaner(cl);return;}
     setTimeout(()=>{setPin("");setPinError("Incorrect PIN — try again");},300);
   }
 };
 return (
   <div style={{ minHeight:"100vh", background:C.navy, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
     <div style={{ marginBottom:32, textAlign:"center" }}>
       <div style={{ fontSize:13, letterSpacing:"0.18em", color:C.coral, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>CleanOps</div>
       <div style={{ fontSize:28, fontWeight:700, color:"#fff" }}>Enter your PIN</div>
       <div style={{ color:"#8A99B8", marginTop:6, fontSize:14 }}>Manager: 0000 · Cleaners use their own PIN</div>
     </div>
     <div style={{ background:"#fff", borderRadius:20, padding:"32px 28px", width:280, boxShadow:"0 24px 64px rgba(0,0,0,0.28)" }}>
       <div style={{ display:"flex", justifyContent:"center", gap:14, marginBottom:28 }}>
         {[0,1,2,3].map(i=><div key={i} style={{ width:14, height:14, borderRadius:"50%", background:pin.length>i?C.navy:C.border, transition:"background 0.15s" }} />)}
       </div>
       {pinError && <div style={{ color:C.coral, fontSize:13, textAlign:"center", marginBottom:14 }}>{pinError}</div>}
       <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
         {digits.map((dg,i)=>(
           <button key={i} onClick={()=>handleDigit(dg)} style={{ height:56, borderRadius:12, border:"none", background:dg===""?"transparent":C.bg, color:C.navy, fontSize:dg==="⌫"?20:22, fontWeight:600, cursor:dg===""?"default":"pointer" }}
             onMouseOver={e=>{if(dg!=="")e.target.style.background=C.border;}} onMouseOut={e=>{if(dg!=="")e.target.style.background=C.bg;}}>
             {dg}
           </button>
         ))}
       </div>
     </div>
   </div>
 );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ tab,setTab,onLogout }) {
 const items=[
   {id:"diary",     label:"Booking Diary", icon:"📅"},
   {id:"cleans",    label:"Cleans",        icon:"🧹"},
   {id:"earnings",  label:"Earnings",      icon:"💷"},
   {id:"properties",label:"Properties",   icon:"🏠"},
   {id:"team",      label:"Team",          icon:"👥"},
   {id:"settings",  label:"Settings",      icon:"⚙️"},
 ];
 return (
   <div style={{ position:"fixed", left:0, top:0, bottom:0, width:220, background:C.navy, display:"flex", flexDirection:"column", padding:"24px 0" }}>
     <div style={{ padding:"0 20px 28px", borderBottom:"1px solid #2C3E5D" }}>
       <div style={{ fontSize:11, letterSpacing:"0.18em", color:C.coral, fontWeight:700, textTransform:"uppercase" }}>CleanOps</div>
       <div style={{ color:"#fff", fontWeight:700, fontSize:15, marginTop:2 }}>Manager</div>
     </div>
     <nav style={{ flex:1, padding:"16px 12px" }}>
       {items.map(item=>(
         <button key={item.id} onClick={()=>setTab(item.id)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 12px", borderRadius:10, border:"none", marginBottom:2, background:tab===item.id?"rgba(255,255,255,0.1)":"transparent", color:tab===item.id?"#fff":"#8A99B8", fontSize:14, fontWeight:tab===item.id?600:400, cursor:"pointer", textAlign:"left" }}>
           <span>{item.icon}</span>{item.label}
         </button>
       ))}
     </nav>
     <div style={{ padding:"0 12px" }}>
       <button onClick={onLogout} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"none", background:"transparent", color:"#8A99B8", fontSize:14, cursor:"pointer", textAlign:"left" }}>🚪 Log out</button>
     </div>
   </div>
 );
}

// ── Earnings view ──────────────────────────────────────────────────────────────
function EarningsView({ properties, earnings, setEarnings, showToast }) {
 const [yearFilter, setYearFilter] = useState(today.getFullYear());
 const [view, setView]             = useState("overview"); // overview | property
 const [selProp, setSelProp]       = useState(properties[0]?.id);
 const [showAdd, setShowAdd]       = useState(false);
 const [showCSV, setShowCSV]       = useState(false);
 const [addForm, setAddForm]       = useState({ propertyId: properties[0]?.id||"", year: today.getFullYear(), month: today.getMonth(), revenue:"", nightsBooked:"" });
 const fileRef = useRef();

 const months = MONTH_NAMES.map((name,mi)=>({ name, mi }));

 // helpers
 const getEarning = (pid,y,m) => earnings.find(e=>e.propertyId===pid&&e.year===y&&e.month===m);
 const totalRevenue = (pid,y) => earnings.filter(e=>e.propertyId===pid&&e.year===y).reduce((s,e)=>s+e.revenue,0);
 const ytdRevenue   = earnings.filter(e=>e.year===yearFilter).reduce((s,e)=>s+e.revenue,0);
 const bestMonth    = (() => {
   const monthly = MONTH_NAMES.map((_,mi)=>({ month:mi, rev: earnings.filter(e=>e.year===yearFilter&&e.month===mi).reduce((s,e)=>s+e.revenue,0) }));
   return monthly.reduce((best,m)=>m.rev>best.rev?m:best, {month:0,rev:0});
 })();

 // Chart data: monthly revenue grouped by property
 const chartData = months.map(({name,mi})=>{
   const row = { month: name };
   properties.forEach(p=>{ const e=getEarning(p.id,yearFilter,mi); row[p.id]=e?e.revenue:0; });
   return row;
 });

 // Occupancy chart data for selected property
 const occData = months.map(({name,mi})=>{
   const e = getEarning(selProp, yearFilter, mi);
   const daysInMo = daysInMonth(yearFilter, mi);
   const occ = e ? Math.round((e.nightsBooked/daysInMo)*100) : 0;
   return { month: name, occupancy: occ, revenue: e?e.revenue:0 };
 });

 function handleAddManual() {
   const rev = parseFloat(addForm.revenue);
   const nts = parseInt(addForm.nightsBooked);
   if (!rev || !nts) { showToast("Enter valid revenue and nights","error"); return; }
   const existing = getEarning(addForm.propertyId, Number(addForm.year), Number(addForm.month));
   if (existing) {
     setEarnings(es=>es.map(e=>e.id===existing.id?{...e,revenue:rev,nightsBooked:nts,source:"manual"}:e));
     showToast("Earnings updated");
   } else {
     setEarnings(es=>[...es,{ id:`e${Date.now()}`, propertyId:addForm.propertyId, year:Number(addForm.year), month:Number(addForm.month), revenue:rev, nightsBooked:nts, source:"manual" }]);
     showToast("Earnings added");
   }
   setShowAdd(false);
 }

 function handleCSV(e) {
   const file = e.target.files[0]; if(!file) return;
   const reader = new FileReader();
   reader.onload = (ev) => {
     try {
       const lines = ev.target.result.split("\n").filter(l=>l.trim());
       // Expected Airbnb CSV format: Date,Type,Confirmation Code,Guest,Nights,Amount
       // We also accept simple: property,year,month,revenue,nights
       const parsed = [];
       for (let i=1; i<lines.length; i++) {
         const cols = lines[i].split(",").map(c=>c.replace(/"/g,"").trim());
         // Try Airbnb payout format: cols[0]=date, cols[3]=guest/desc, cols[4]=nights, cols[5]=amount
         if (cols.length >= 6 && cols[0].match(/\d{4}-\d{2}-\d{2}/)) {
           const dt = new Date(cols[0]);
           const amt = parseFloat(cols[5]?.replace(/[^0-9.-]/g,""));
           const nts = parseInt(cols[4]) || 1;
           if (!isNaN(dt) && !isNaN(amt) && amt > 0) {
             parsed.push({ year:dt.getFullYear(), month:dt.getMonth(), revenue:amt, nightsBooked:nts });
           }
         }
         // simple format: propertyId,year,month,revenue,nights
         else if (cols.length >= 5 && properties.find(p=>p.id===cols[0])) {
           parsed.push({ propertyId:cols[0], year:parseInt(cols[1]), month:parseInt(cols[2])-1, revenue:parseFloat(cols[3]), nightsBooked:parseInt(cols[4]) });
         }
       }
       if (!parsed.length) { showToast("No matching rows found in CSV","error"); return; }
       // For Airbnb format rows without propertyId, assign to first property by default
       const newRows = parsed.map(row => {
         const pid = row.propertyId || selProp;
         const existing = getEarning(pid, row.year, row.month);
         if (existing) return { ...existing, revenue: existing.revenue + row.revenue, nightsBooked: existing.nightsBooked + row.nightsBooked, source:"csv" };
         return { id:`ecsv${Date.now()}${Math.random()}`, propertyId:pid, year:row.year, month:row.month, revenue:row.revenue, nightsBooked:row.nightsBooked, source:"csv" };
       });
       setEarnings(es => {
         const merged = [...es];
         newRows.forEach(nr => {
           const idx = merged.findIndex(e=>e.id===nr.id||( e.propertyId===nr.propertyId&&e.year===nr.year&&e.month===nr.month));
           if (idx>=0) merged[idx]=nr; else merged.push(nr);
         });
         return merged;
       });
       showToast(`Imported ${parsed.length} row(s) from CSV`);
       setShowCSV(false);
     } catch(err) { showToast("Could not parse CSV — check format","error"); }
   };
   reader.readAsText(file);
 }

 // portfolio summary KPIs
 const allYears = [...new Set(earnings.map(e=>e.year))].sort();

 return (
   <div>
     <PageHeader title="Earnings" subtitle={`${yearFilter} · ${properties.length} properties`}>
       <div style={{ display:"flex", gap:8 }}>
         <select value={yearFilter} onChange={e=>setYearFilter(Number(e.target.value))}
           style={{ padding:"8px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, background:C.surface, color:C.text, cursor:"pointer" }}>
           {allYears.map(y=><option key={y} value={y}>{y}</option>)}
         </select>
         <Btn onClick={()=>setShowCSV(true)} secondary>📂 Import CSV</Btn>
         <Btn onClick={()=>setShowAdd(true)}>+ Add earnings</Btn>
       </div>
     </PageHeader>

     {/* KPI row */}
     <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
       <KpiCard label="YTD Revenue" value={gbp(ytdRevenue)} accent={C.mint} icon="💷" />
       <KpiCard label="Best month" value={MONTH_NAMES[bestMonth.month]} sub={gbp(bestMonth.rev)} accent={C.coral} icon="🏆" />
       <KpiCard label="Properties" value={properties.length} icon="🏠" />
       <KpiCard label={`Avg/property ${yearFilter}`} value={gbp(properties.length ? Math.round(ytdRevenue/properties.length) : 0)} icon="📊" />
     </div>

     {/* View toggle */}
     <div style={{ marginBottom:24 }}>
       <FilterTabs value={view} onChange={setView} options={[{id:"overview",label:"Portfolio overview"},{id:"property",label:"Property deep-dive"}]} />
     </div>

     {/* ── OVERVIEW ── */}
     {view==="overview" && (
       <>
         {/* Monthly revenue bar chart */}
         <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px 24px 16px", marginBottom:24 }}>
           <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Monthly revenue by property</div>
           <ResponsiveContainer width="100%" height={260}>
             <BarChart data={chartData} barCategoryGap="30%">
               <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
               <XAxis dataKey="month" tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} />
               <YAxis tickFormatter={v=>`£${(v/1000).toFixed(0)}k`} tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} />
               <Tooltip formatter={(v,name)=>[gbp(v), properties.find(p=>p.id===name)?.name||name]} contentStyle={{ borderRadius:10, border:`1px solid ${C.border}`, fontSize:13 }} />
               <Legend formatter={name=>properties.find(p=>p.id===name)?.name||name} />
               {properties.map(p=><Bar key={p.id} dataKey={p.id} fill={p.color} radius={[4,4,0,0]} />)}
             </BarChart>
           </ResponsiveContainer>
         </div>

         {/* Per-property summary table */}
         <SectionTitle>Annual summary</SectionTitle>
         <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", marginBottom:32 }}>
           {/* Header */}
           <div style={{ display:"grid", gridTemplateColumns:"200px repeat(13,1fr)", background:"#FAFBFD", borderBottom:`1px solid ${C.border}` }}>
             <div style={{ padding:"10px 16px", fontSize:12, fontWeight:700, color:C.muted }}>Property</div>
             {MONTH_NAMES.map(m=><div key={m} style={{ padding:"10px 4px", fontSize:11, fontWeight:700, color:C.muted, textAlign:"center" }}>{m}</div>)}
             <div style={{ padding:"10px 8px", fontSize:12, fontWeight:700, color:C.text, textAlign:"right" }}>Total</div>
           </div>
           {properties.map(prop=>(
             <div key={prop.id} style={{ display:"grid", gridTemplateColumns:"200px repeat(13,1fr)", borderBottom:`1px solid ${C.border}` }}>
               <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:8 }}>
                 <div style={{ width:8, height:8, borderRadius:"50%", background:prop.color }} />
                 <span style={{ fontSize:13, fontWeight:600 }}>{prop.name}</span>
               </div>
               {MONTH_NAMES.map((_,mi)=>{
                 const e = getEarning(prop.id, yearFilter, mi);
                 const daysInMo = daysInMonth(yearFilter, mi);
                 const occ = e ? Math.round((e.nightsBooked/daysInMo)*100) : null;
                 return (
                   <div key={mi} style={{ padding:"10px 4px", textAlign:"center" }}>
                     {e ? (
                       <>
                         <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{gbp(e.revenue)}</div>
                         <div style={{ fontSize:10, color:occ>=70?C.mint:occ>=50?C.amber:C.muted, fontWeight:600 }}>{occ}%</div>
                       </>
                     ) : <div style={{ fontSize:12, color:C.border }}>—</div>}
                   </div>
                 );
               })}
               <div style={{ padding:"12px 8px", textAlign:"right", fontSize:13, fontWeight:800, color:C.text }}>{gbp(totalRevenue(prop.id, yearFilter))}</div>
             </div>
           ))}
         </div>
       </>
     )}

     {/* ── PROPERTY DEEP-DIVE ── */}
     {view==="property" && (
       <>
         <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
           {properties.map(p=>(
             <button key={p.id} onClick={()=>setSelProp(p.id)} style={{ padding:"8px 18px", borderRadius:20, border:`2px solid ${selProp===p.id?p.color:C.border}`, background:selProp===p.id?p.color+"18":"transparent", color:selProp===p.id?p.color:C.muted, fontSize:13, fontWeight:700, cursor:"pointer" }}>
               {p.name}
             </button>
           ))}
         </div>

         {(() => {
           const prop = properties.find(p=>p.id===selProp);
           const propEarnings = earnings.filter(e=>e.propertyId===selProp&&e.year===yearFilter);
           const annualRev = propEarnings.reduce((s,e)=>s+e.revenue,0);
           const annualNights = propEarnings.reduce((s,e)=>s+e.nightsBooked,0);
           const annualDays = MONTH_NAMES.reduce((s,_,mi)=>s+daysInMonth(yearFilter,mi),0);
           const avgOcc = annualDays ? Math.round((annualNights/annualDays)*100) : 0;
           const avgNightly = annualNights ? Math.round(annualRev/annualNights) : 0;
           const bestPropMonth = propEarnings.reduce((b,e)=>e.revenue>b.revenue?e:b, {revenue:0,month:0});
           return (
             <>
               <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
                 <KpiCard label="Annual revenue" value={gbp(annualRev)} accent={prop?.color} icon="💷" />
                 <KpiCard label="Annual occupancy" value={`${avgOcc}%`} accent={avgOcc>=70?C.mint:avgOcc>=50?C.amber:C.coral} icon="📅" />
                 <KpiCard label="Avg nightly rate" value={gbp(avgNightly)} icon="🌙" />
                 <KpiCard label="Best month" value={MONTH_NAMES[bestPropMonth.month]||"—"} sub={bestPropMonth.revenue?gbp(bestPropMonth.revenue):""} icon="🏆" accent={C.coral} />
               </div>

               {/* Revenue + Occupancy dual chart */}
               <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px 24px 16px", marginBottom:24 }}>
                 <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>{prop?.name} — revenue & occupancy {yearFilter}</div>
                 <ResponsiveContainer width="100%" height={260}>
                   <BarChart data={occData}>
                     <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                     <XAxis dataKey="month" tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} />
                     <YAxis yAxisId="rev" tickFormatter={v=>`£${(v/1000).toFixed(0)}k`} tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} />
                     <YAxis yAxisId="occ" orientation="right" tickFormatter={v=>`${v}%`} tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} domain={[0,100]} />
                     <Tooltip formatter={(v,name)=>name==="revenue"?[gbp(v),"Revenue"]:[`${v}%`,"Occupancy"]} contentStyle={{ borderRadius:10, border:`1px solid ${C.border}`, fontSize:13 }} />
                     <Bar yAxisId="rev" dataKey="revenue" fill={prop?.color||C.navy} radius={[4,4,0,0]} name="revenue" />
                     <Line yAxisId="occ" type="monotone" dataKey="occupancy" stroke={C.amber} strokeWidth={2.5} dot={{ r:4, fill:C.amber }} name="occupancy" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>

               {/* Monthly breakdown table */}
               <SectionTitle>Monthly breakdown</SectionTitle>
               <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
                 <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 1fr 1fr 80px", background:"#FAFBFD", borderBottom:`1px solid ${C.border}`, padding:"10px 20px" }}>
                   {["Month","Revenue","Nights booked","Occupancy","Source"].map(h=><div key={h} style={{ fontSize:12, fontWeight:700, color:C.muted }}>{h}</div>)}
                 </div>
                 {MONTH_NAMES.map((name,mi)=>{
                   const e = getEarning(selProp, yearFilter, mi);
                   const daysInMo = daysInMonth(yearFilter, mi);
                   const occ = e ? Math.round((e.nightsBooked/daysInMo)*100) : null;
                   const isCurr = yearFilter===today.getFullYear()&&mi===today.getMonth();
                   return (
                     <div key={mi} style={{ display:"grid", gridTemplateColumns:"120px 1fr 1fr 1fr 80px", padding:"12px 20px", borderBottom:`1px solid ${C.border}`, background:isCurr?"#FAFEFF":"transparent" }}>
                       <div style={{ fontSize:13, fontWeight:isCurr?700:500, color:isCurr?prop?.color:C.text }}>{name}{isCurr?" ·now":""}</div>
                       <div style={{ fontSize:13, fontWeight:700 }}>{e?gbp(e.revenue):<span style={{ color:C.border }}>—</span>}</div>
                       <div style={{ fontSize:13, color:C.textSoft }}>{e?`${e.nightsBooked} nights`:<span style={{ color:C.border }}>—</span>}</div>
                       <div>
                         {occ!=null ? (
                           <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                             <div style={{ flex:1, height:6, background:C.bg, borderRadius:3, overflow:"hidden" }}>
                               <div style={{ height:"100%", width:`${occ}%`, background:occ>=70?C.mint:occ>=50?C.amber:C.coral, borderRadius:3 }} />
                             </div>
                             <span style={{ fontSize:12, fontWeight:700, color:occ>=70?C.mint:occ>=50?C.amber:C.coral, width:32 }}>{occ}%</span>
                           </div>
                         ) : <span style={{ color:C.border, fontSize:12 }}>—</span>}
                       </div>
                       <div style={{ fontSize:11, color:C.muted }}>{e?.source||""}</div>
                     </div>
                   );
                 })}
               </div>
             </>
           );
         })()}
       </>
     )}

     {/* Add manual earnings modal */}
     {showAdd && (
       <Modal onClose={()=>setShowAdd(false)} title="Add earnings manually">
         <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
           <div>
             <label style={{ fontSize:12, fontWeight:600, color:C.textSoft, display:"block", marginBottom:6 }}>Property</label>
             <select value={addForm.propertyId} onChange={e=>setAddForm(f=>({...f,propertyId:e.target.value}))}
               style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, background:C.bg }}>
               {properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
             <div>
               <label style={{ fontSize:12, fontWeight:600, color:C.textSoft, display:"block", marginBottom:6 }}>Year</label>
               <select value={addForm.year} onChange={e=>setAddForm(f=>({...f,year:Number(e.target.value)}))}
                 style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, background:C.bg }}>
                 {[today.getFullYear()-1, today.getFullYear(), today.getFullYear()+1].map(y=><option key={y} value={y}>{y}</option>)}
               </select>
             </div>
             <div>
               <label style={{ fontSize:12, fontWeight:600, color:C.textSoft, display:"block", marginBottom:6 }}>Month</label>
               <select value={addForm.month} onChange={e=>setAddForm(f=>({...f,month:Number(e.target.value)}))}
                 style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, background:C.bg }}>
                 {MONTH_NAMES.map((m,i)=><option key={i} value={i}>{m}</option>)}
               </select>
             </div>
           </div>
           <Field label="Revenue (£)" value={addForm.revenue} onChange={v=>setAddForm(f=>({...f,revenue:v}))} placeholder="e.g. 1840" />
           <Field label="Nights booked" value={addForm.nightsBooked} onChange={v=>setAddForm(f=>({...f,nightsBooked:v}))} placeholder="e.g. 18" />
           <div style={{ display:"flex", gap:10, marginTop:8 }}>
             <Btn onClick={handleAddManual}>Save</Btn>
             <Btn onClick={()=>setShowAdd(false)} secondary>Cancel</Btn>
           </div>
         </div>
       </Modal>
     )}

     {/* CSV import modal */}
     {showCSV && (
       <Modal onClose={()=>setShowCSV(false)} title="Import from Airbnb CSV">
         <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
           <div style={{ background:"#F0F6FF", borderRadius:12, padding:"14px 16px", fontSize:13, color:C.textSoft, lineHeight:1.7 }}>
             <strong style={{ color:C.text }}>How to export from Airbnb:</strong><br/>
             Go to <strong>Airbnb → Earnings → Transaction history → Export CSV</strong>.<br/>
             The file should include columns: Date, Type, Confirmation Code, Guest, Nights, Amount.
           </div>
           <div style={{ background:"#FFF8E7", borderRadius:12, padding:"12px 16px", fontSize:12, color:C.textSoft }}>
             Tip: If importing for a specific property, select it below first. Payouts will be merged by month.
           </div>
           <div>
             <label style={{ fontSize:12, fontWeight:600, color:C.textSoft, display:"block", marginBottom:6 }}>Assign to property</label>
             <select value={selProp} onChange={e=>setSelProp(e.target.value)}
               style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, background:C.bg }}>
               {properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
           <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display:"none" }} />
           <Btn onClick={()=>fileRef.current?.click()}>📂 Choose CSV file</Btn>
           <Btn onClick={()=>setShowCSV(false)} secondary>Cancel</Btn>
         </div>
       </Modal>
     )}
   </div>
 );
}

// ── KPI card ───────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, icon }) {
 return (
   <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px" }}>
     <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
     <div style={{ fontSize:24, fontWeight:800, color:accent||C.text }}>{value}</div>
     {sub && <div style={{ fontSize:13, color:C.muted, fontWeight:600 }}>{sub}</div>}
     <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{label}</div>
   </div>
 );
}

// ── Diary view ─────────────────────────────────────────────────────────────────
function DiaryView({ properties,bookings,cleans,cleaners,setCleans,setBookings,showToast }) {
 const [weekOffset,setWeekOffset] = useState(0);
 const [selectedBooking,setSelectedBooking] = useState(null);
 const weekStart = new Date(today); weekStart.setDate(today.getDate()-today.getDay()+1+weekOffset*7);
 const days = Array.from({length:7},(_,i)=>{ const dd=new Date(weekStart); dd.setDate(weekStart.getDate()+i); return dd; });
 const todayCheckouts = bookings.filter(b=>isSameDay(b.checkout,today));
 const upcomingCheckouts = bookings.filter(b=>b.checkout>today&&b.checkout<=d(7)).sort((a,b)=>a.checkout-b.checkout);

 function bookingsForDay(day,pid){ return bookings.filter(b=>b.propertyId===pid&&b.checkin<=day&&b.checkout>day); }

 function handleNotify(booking) {
   const prop=properties.find(p=>p.id===booking.propertyId);
   const asc=cleaners.filter(c=>c.assignedProperties.includes(booking.propertyId));
   console.log(`[SMS] Notifying:`,asc.map(c=>c.phone),`Checkout: ${fmt(booking.checkout)}`);
   setBookings(bs=>bs.map(b=>b.id===booking.id?{...b,notified:true}:b));
   showToast(`Cleaners notified for ${prop?.name}`);
 }
 function handleAssignClean(booking) {
   if(cleans.find(c=>c.bookingId===booking.id)){showToast("Clean already scheduled","info");return;}
   const prop=properties.find(p=>p.id===booking.propertyId);
   const ac=cleaners.find(c=>c.assignedProperties.includes(booking.propertyId));
   setCleans(cs=>[...cs,{id:`cl${Date.now()}`,bookingId:booking.id,propertyId:booking.propertyId,cleanerId:ac?.id||null,date:booking.checkout,status:"pending",notes:""}]);
   showToast(`Clean scheduled for ${prop?.name}`);
 }

 return (
   <div>
     <PageHeader title="Booking Diary" subtitle={`${fmtShort(days[0])} – ${fmtShort(days[6])}`}>
       <div style={{ display:"flex", gap:8 }}>
         <Btn onClick={()=>setWeekOffset(w=>w-1)} secondary>← Prev</Btn>
         <Btn onClick={()=>setWeekOffset(0)} secondary>Today</Btn>
         <Btn onClick={()=>setWeekOffset(w=>w+1)} secondary>Next →</Btn>
       </div>
     </PageHeader>
     {todayCheckouts.length>0&&(
       <div style={{ background:"#FFF3F1", border:`1px solid ${C.coral}`, borderRadius:12, padding:"14px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
         <span style={{ fontSize:20 }}>🔔</span>
         <div>
           <div style={{ fontWeight:700, color:C.coral, fontSize:14 }}>Checkouts today</div>
           <div style={{ color:C.textSoft, fontSize:13 }}>{todayCheckouts.map(b=>{ const p=properties.find(pr=>pr.id===b.propertyId); return `${b.guest} – ${p?.name}`; }).join(" · ")}</div>
         </div>
       </div>
     )}
     <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:32 }}>
       <div style={{ display:"grid", gridTemplateColumns:"140px repeat(7,1fr)", borderBottom:`1px solid ${C.border}` }}>
         <div style={{ padding:"12px 16px", background:"#FAFBFD", fontSize:12, color:C.muted, fontWeight:600 }}>Property</div>
         {days.map((day,i)=>(
           <div key={i} style={{ padding:"10px 8px", textAlign:"center", background:isToday(day)?"#EEF6FF":"#FAFBFD", borderLeft:`1px solid ${C.border}` }}>
             <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{day.toLocaleDateString("en-GB",{weekday:"short"})}</div>
             <div style={{ fontWeight:isToday(day)?800:500, fontSize:15, color:isToday(day)?C.coral:C.text }}>{day.getDate()}</div>
           </div>
         ))}
       </div>
       {properties.map(prop=>(
         <div key={prop.id} style={{ display:"grid", gridTemplateColumns:"140px repeat(7,1fr)", borderBottom:`1px solid ${C.border}` }}>
           <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:8 }}>
             <div style={{ width:8, height:8, borderRadius:"50%", background:prop.color, flexShrink:0 }} />
             <span style={{ fontSize:12, fontWeight:600 }}>{prop.name}</span>
           </div>
           {days.map((day,i)=>{
             const bks=bookingsForDay(day,prop.id);
             const isCheckout=bookings.some(b=>b.propertyId===prop.id&&isSameDay(b.checkout,day));
             const isCheckin=bookings.some(b=>b.propertyId===prop.id&&isSameDay(b.checkin,day));
             return (
               <div key={i} onClick={()=>bks[0]&&setSelectedBooking(bks[0])} style={{ borderLeft:`1px solid ${C.border}`, background:isToday(day)?"#FAFEFF":"transparent", minHeight:56, padding:4, cursor:bks[0]?"pointer":"default", position:"relative" }}>
                 {bks.map(b=>(
                   <div key={b.id} style={{ background:prop.color+"22", borderLeft:`3px solid ${prop.color}`, borderRadius:4, padding:"3px 6px", fontSize:11, fontWeight:600, color:prop.color, marginBottom:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                     {b.guest.split(" ")[0]}
                   </div>
                 ))}
                 {isCheckout&&<div style={{ position:"absolute", bottom:3, right:4, fontSize:9, color:C.coral, fontWeight:700 }}>OUT</div>}
                 {isCheckin&&<div style={{ position:"absolute", top:3, right:4, fontSize:9, color:C.mint, fontWeight:700 }}>IN</div>}
               </div>
             );
           })}
         </div>
       ))}
     </div>
     <SectionTitle>Upcoming checkouts — next 7 days</SectionTitle>
     <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
       {upcomingCheckouts.length===0&&<EmptyState icon="🏖️" text="No checkouts in the next 7 days" />}
       {upcomingCheckouts.map(b=>{
         const prop=properties.find(p=>p.id===b.propertyId);
         const hasClean=cleans.some(c=>c.bookingId===b.id);
         return (
           <div key={b.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
             <div style={{ width:10, height:10, borderRadius:"50%", background:prop?.color }} />
             <div style={{ flex:1 }}>
               <div style={{ fontWeight:600, fontSize:14 }}>{b.guest}</div>
               <div style={{ color:C.textSoft, fontSize:13 }}>{prop?.name} · Checkout {fmt(b.checkout)}</div>
             </div>
             {hasClean?<span style={statusPill("pending")}>Clean scheduled</span>:<Btn onClick={()=>handleAssignClean(b)} secondary small>+ Schedule clean</Btn>}
             {!b.notified?<Btn onClick={()=>handleNotify(b)} small>Notify cleaners</Btn>:<span style={{...statusPill("complete"),fontSize:11}}>✓ Notified</span>}
           </div>
         );
       })}
     </div>
     {selectedBooking&&(
       <Modal onClose={()=>setSelectedBooking(null)} title="Booking details">
         <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
             <InfoCard label="Guest" value={selectedBooking.guest} />
             <InfoCard label="Property" value={properties.find(p=>p.id===selectedBooking.propertyId)?.name} />
             <InfoCard label="Check-in" value={fmt(selectedBooking.checkin)} accent={C.mint} />
             <InfoCard label="Checkout" value={fmt(selectedBooking.checkout)} accent={C.coral} />
           </div>
           {!cleans.find(c=>c.bookingId===selectedBooking.id)&&<Btn onClick={()=>{handleAssignClean(selectedBooking);setSelectedBooking(null);}}>+ Schedule clean</Btn>}
           {!selectedBooking.notified&&<Btn onClick={()=>{handleNotify(selectedBooking);setSelectedBooking(null);}} secondary>📲 Notify cleaners</Btn>}
         </div>
       </Modal>
     )}
   </div>
 );
}

// ── Cleans view ────────────────────────────────────────────────────────────────
function CleansView({ cleans,setCleans,properties,cleaners,bookings,showToast }) {
 const [filter,setFilter]=useState("all");
 const filtered=cleans.filter(c=>filter==="all"||c.status===filter).sort((a,b)=>a.date-b.date);
 function updateStatus(id,status){ setCleans(cs=>cs.map(c=>c.id===id?{...c,status}:c)); showToast(`Clean marked as ${status}`); }
 return (
   <div>
     <PageHeader title="Cleans" subtitle={`${cleans.length} total · ${cleans.filter(c=>c.status==="pending").length} pending`}>
       <FilterTabs value={filter} onChange={setFilter} options={[{id:"all",label:"All"},{id:"pending",label:"Pending"},{id:"in-progress",label:"In progress"},{id:"complete",label:"Complete"}]} />
     </PageHeader>
     <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
       {filtered.length===0&&<EmptyState icon="🧹" text="No cleans in this category" />}
       {filtered.map(clean=>{
         const prop=properties.find(p=>p.id===clean.propertyId);
         const cleaner=cleaners.find(c=>c.id===clean.cleanerId);
         const booking=bookings.find(b=>b.id===clean.bookingId);
         return (
           <div key={clean.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
             <div style={{ width:10, height:10, borderRadius:"50%", background:prop?.color, flexShrink:0 }} />
             <div style={{ flex:1 }}>
               <div style={{ fontWeight:600, fontSize:14 }}>{prop?.name}</div>
               <div style={{ color:C.textSoft, fontSize:13 }}>{fmtShort(clean.date)} · {cleaner?.name||"Unassigned"} · after {booking?.guest}</div>
             </div>
             <span style={statusPill(clean.status)}>{clean.status}</span>
             {clean.status==="pending"&&<Btn onClick={()=>updateStatus(clean.id,"in-progress")} small secondary>Start</Btn>}
             {clean.status==="in-progress"&&<Btn onClick={()=>updateStatus(clean.id,"complete")} small>✓ Done</Btn>}
           </div>
         );
       })}
     </div>
   </div>
 );
}

// ── Properties view ────────────────────────────────────────────────────────────
function PropertiesView({ properties,setProperties,bookings,showToast }) {
 const [showAdd,setShowAdd]=useState(false);
 const [form,setForm]=useState({name:"",address:"",icalUrl:"",color:C.coral});
 function handleAdd(){
   if(!form.name.trim())return;
   setProperties(ps=>[...ps,{...form,id:`p${Date.now()}`}]);
   setForm({name:"",address:"",icalUrl:"",color:C.coral}); setShowAdd(false); showToast("Property added");
 }
 return (
   <div>
     <PageHeader title="Properties" subtitle={`${properties.length} properties`}><Btn onClick={()=>setShowAdd(true)}>+ Add property</Btn></PageHeader>
     <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
       {properties.map(prop=>{
         const pb=bookings.filter(b=>b.propertyId===prop.id);
         return (
           <div key={prop.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
             <div style={{ height:6, background:prop.color }} />
             <div style={{ padding:"18px 20px" }}>
               <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{prop.name}</div>
               <div style={{ color:C.textSoft, fontSize:13, marginBottom:14 }}>📍 {prop.address}</div>
               <div style={{ display:"flex", gap:16 }}>
                 <Stat label="Bookings" value={pb.length} />
                 <Stat label="Upcoming" value={pb.filter(b=>b.checkin>=today).length} />
               </div>
               <div style={{ marginTop:14, fontSize:12, color:prop.icalUrl?C.mint:C.muted, background:prop.icalUrl?"#E8FAF4":C.bg, padding:"6px 10px", borderRadius:8 }}>
                 {prop.icalUrl?"✓ iCal connected":"⚠ No iCal URL — add to sync bookings"}
               </div>
             </div>
           </div>
         );
       })}
     </div>
     {showAdd&&(
       <Modal onClose={()=>setShowAdd(false)} title="Add property">
         <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
           <Field label="Property name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Harbour View Studio" />
           <Field label="Address" value={form.address} onChange={v=>setForm(f=>({...f,address:v}))} placeholder="Full address" />
           <Field label="Airbnb iCal URL" value={form.icalUrl} onChange={v=>setForm(f=>({...f,icalUrl:v}))} placeholder="https://www.airbnb.co.uk/calendar/ical/..." />
           <div>
             <label style={{ fontSize:12, fontWeight:600, color:C.textSoft, display:"block", marginBottom:6 }}>Colour</label>
             <div style={{ display:"flex", gap:8 }}>
               {[C.coral,C.mint,"#7C5CBF",C.amber,"#3B82F6"].map(col=>(
                 <div key={col} onClick={()=>setForm(f=>({...f,color:col}))} style={{ width:28, height:28, borderRadius:"50%", background:col, cursor:"pointer", border:form.color===col?`3px solid ${C.navy}`:"3px solid transparent" }} />
               ))}
             </div>
           </div>
           <div style={{ display:"flex", gap:10, marginTop:8 }}><Btn onClick={handleAdd}>Add property</Btn><Btn onClick={()=>setShowAdd(false)} secondary>Cancel</Btn></div>
         </div>
       </Modal>
     )}
   </div>
 );
}

// ── Team view ──────────────────────────────────────────────────────────────────
function TeamView({ cleaners,setCleaners,properties,showToast }) {
 const [showAdd,setShowAdd]=useState(false);
 const [form,setForm]=useState({name:"",phone:"",pin:"",assignedProperties:[]});
 function handleAdd(){
   if(!form.name.trim()||form.pin.length!==4)return;
   setCleaners(cs=>[...cs,{...form,id:`c${Date.now()}`}]);
   setForm({name:"",phone:"",pin:"",assignedProperties:[]}); setShowAdd(false); showToast("Cleaner added");
 }
 function toggleProp(cid,pid){
   setCleaners(cs=>cs.map(c=>{
     if(c.id!==cid)return c;
     const has=c.assignedProperties.includes(pid);
     return{...c,assignedProperties:has?c.assignedProperties.filter(p=>p!==pid):[...c.assignedProperties,pid]};
   }));
 }
 return (
   <div>
     <PageHeader title="Team" subtitle={`${cleaners.length} cleaners`}><Btn onClick={()=>setShowAdd(true)}>+ Add cleaner</Btn></PageHeader>
     <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
       {cleaners.map(cleaner=>(
         <div key={cleaner.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 22px" }}>
           <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
             <div style={{ width:42, height:42, borderRadius:"50%", background:C.navy, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, flexShrink:0 }}>
               {cleaner.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
             </div>
             <div style={{ flex:1 }}>
               <div style={{ fontWeight:700, fontSize:15 }}>{cleaner.name}</div>
               <div style={{ color:C.textSoft, fontSize:13 }}>{cleaner.phone} · PIN: {cleaner.pin}</div>
               <div style={{ marginTop:12 }}>
                 <div style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:6 }}>Assigned properties</div>
                 <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                   {properties.map(prop=>{
                     const active=cleaner.assignedProperties.includes(prop.id);
                     return <button key={prop.id} onClick={()=>toggleProp(cleaner.id,prop.id)} style={{ padding:"4px 12px", borderRadius:20, border:`1.5px solid ${active?prop.color:C.border}`, background:active?prop.color+"18":"transparent", color:active?prop.color:C.muted, fontSize:12, fontWeight:600, cursor:"pointer" }}>{prop.name}</button>;
                   })}
                 </div>
               </div>
             </div>
           </div>
         </div>
       ))}
     </div>
     {showAdd&&(
       <Modal onClose={()=>setShowAdd(false)} title="Add cleaner">
         <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
           <Field label="Full name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Maria Santos" />
           <Field label="Phone" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder="+447700900000" />
           <Field label="4-digit PIN" value={form.pin} onChange={v=>{ if(/^\d{0,4}$/.test(v))setForm(f=>({...f,pin:v})); }} placeholder="e.g. 5678" />
           <div>
             <label style={{ fontSize:12, fontWeight:600, color:C.textSoft, display:"block", marginBottom:6 }}>Assign properties</label>
             <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
               {properties.map(prop=>{ const active=form.assignedProperties.includes(prop.id); return <button key={prop.id} onClick={()=>setForm(f=>({...f,assignedProperties:active?f.assignedProperties.filter(p=>p!==prop.id):[...f.assignedProperties,prop.id]}))} style={{ padding:"5px 14px", borderRadius:20, border:`1.5px solid ${active?prop.color:C.border}`, background:active?prop.color+"18":"transparent", color:active?prop.color:C.muted, fontSize:13, fontWeight:600, cursor:"pointer" }}>{prop.name}</button>; })}
             </div>
           </div>
           <div style={{ display:"flex", gap:10, marginTop:8 }}><Btn onClick={handleAdd}>Add cleaner</Btn><Btn onClick={()=>setShowAdd(false)} secondary>Cancel</Btn></div>
         </div>
       </Modal>
     )}
   </div>
 );
}

// ── Settings ───────────────────────────────────────────────────────────────────
function SettingsView() {
 return (
   <div>
     <PageHeader title="Settings" subtitle="Integrations & notifications" />
     <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:560 }}>
       {[
         {title:"Airbnb iCal sync",          desc:"Add an iCal export URL per property in the Properties page. Find it in Airbnb → Calendar → Export calendar.", badge:"Active",        badgeColor:C.mint},
         {title:"Airbnb CSV earnings import", desc:"Export your transaction history from Airbnb → Earnings → Transaction history → Export CSV, then import on the Earnings page.", badge:"Active", badgeColor:C.mint},
         {title:"SMS notifications (Twilio)", desc:"Wire up your Twilio Account SID and auth token to send real SMS messages to cleaners on checkout.", badge:"Console only", badgeColor:C.amber},
         {title:"WhatsApp notifications",     desc:"Enable the Twilio WhatsApp Business API sandbox or production number.", badge:"Console only", badgeColor:C.amber},
         {title:"Manager PIN",                desc:"Current manager PIN is 0000. Change it here once deployed to production.", badge:"Default", badgeColor:C.muted},
       ].map(s=>(
         <div key={s.title} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 22px" }}>
           <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
             <div style={{ fontWeight:700, fontSize:15 }}>{s.title}</div>
             <span style={{ ...statusPill("pending"), background:s.badgeColor+"22", color:s.badgeColor }}>{s.badge}</span>
           </div>
           <div style={{ color:C.textSoft, fontSize:13, lineHeight:1.6 }}>{s.desc}</div>
         </div>
       ))}
     </div>
   </div>
 );
}

// ── Cleaner portal ─────────────────────────────────────────────────────────────
function CleanerPortal({ cleaner,properties,cleans,bookings,setCleans,showToast,toast,onLogout }) {
 const myCleans=cleans.filter(c=>c.cleanerId===cleaner.id).sort((a,b)=>a.date-b.date);
 const pending=myCleans.filter(c=>c.status!=="complete");
 const done=myCleans.filter(c=>c.status==="complete");
 function updateStatus(id,status){ setCleans(cs=>cs.map(c=>c.id===id?{...c,status}:c)); showToast(status==="complete"?"Clean marked complete ✓":"Status updated"); }
 return (
   <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter',system-ui,sans-serif" }}>
     {toast&&<Toast msg={toast.msg} type={toast.type} />}
     <div style={{ background:C.navy, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
       <div>
         <div style={{ fontSize:11, color:C.coral, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>CleanOps</div>
         <div style={{ color:"#fff", fontWeight:700, fontSize:18 }}>Hi, {cleaner.name.split(" ")[0]} 👋</div>
       </div>
       <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:10, cursor:"pointer", fontSize:13 }}>Log out</button>
     </div>
     <div style={{ padding:"28px 24px", maxWidth:600, margin:"0 auto" }}>
       <div style={{ display:"flex", gap:16, marginBottom:28 }}>
         <div style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", textAlign:"center" }}>
           <div style={{ fontSize:28, fontWeight:800, color:C.coral }}>{pending.length}</div>
           <div style={{ fontSize:13, color:C.textSoft }}>Pending cleans</div>
         </div>
         <div style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", textAlign:"center" }}>
           <div style={{ fontSize:28, fontWeight:800, color:C.mint }}>{done.length}</div>
           <div style={{ fontSize:13, color:C.textSoft }}>Completed</div>
         </div>
       </div>
       <SectionTitle>Your cleans</SectionTitle>
       <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
         {myCleans.length===0&&<EmptyState icon="☀️" text="No cleans assigned yet" />}
         {myCleans.map(clean=>{
           const prop=properties.find(p=>p.id===clean.propertyId);
           const booking=bookings.find(b=>b.id===clean.bookingId);
           return (
             <div key={clean.id} style={{ background:C.surface, border:`1px solid ${clean.status==="complete"?C.mint:C.border}`, borderRadius:14, padding:"18px 20px" }}>
               <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                 <div>
                   <div style={{ fontWeight:700, fontSize:15 }}>{prop?.name}</div>
                   <div style={{ color:C.textSoft, fontSize:13 }}>📅 {fmt(clean.date)} · after {booking?.guest}</div>
                   {prop?.address&&<div style={{ color:C.muted, fontSize:12, marginTop:2 }}>📍 {prop.address}</div>}
                 </div>
                 <span style={statusPill(clean.status)}>{clean.status}</span>
               </div>
               {clean.status!=="complete"&&(
                 <div style={{ display:"flex", gap:8, marginTop:12 }}>
                   {clean.status==="pending"&&<Btn onClick={()=>updateStatus(clean.id,"in-progress")} small secondary>🧹 Start clean</Btn>}
                   {clean.status==="in-progress"&&<Btn onClick={()=>updateStatus(clean.id,"complete")} small>✓ Mark complete</Btn>}
                 </div>
               )}
               {clean.status==="complete"&&<div style={{ color:C.mint, fontSize:13, marginTop:6, fontWeight:600 }}>✓ Done</div>}
             </div>
           );
         })}
       </div>
     </div>
   </div>
 );
}

// ── Micro components ───────────────────────────────────────────────────────────
function PageHeader({ title,subtitle,children }) {
 return (
   <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
     <div>
       <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:C.text }}>{title}</h1>
       {subtitle&&<div style={{ color:C.muted, fontSize:14, marginTop:4 }}>{subtitle}</div>}
     </div>
     {children&&<div style={{ display:"flex", gap:10 }}>{children}</div>}
   </div>
 );
}
function SectionTitle({ children }) { return <div style={{ fontSize:13, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>{children}</div>; }
function Btn({ onClick,children,secondary,small }) {
 return <button onClick={onClick} style={{ padding:small?"6px 14px":"9px 18px", borderRadius:10, border:secondary?`1.5px solid ${C.border}`:"none", background:secondary?C.surface:C.navy, color:secondary?C.text:"#fff", fontSize:small?12:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>{children}</button>;
}
function Field({ label,value,onChange,placeholder }) {
 return (
   <div>
     <label style={{ fontSize:12, fontWeight:600, color:C.textSoft, display:"block", marginBottom:6 }}>{label}</label>
     <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, background:C.bg, outline:"none", boxSizing:"border-box" }} />
   </div>
 );
}
function InfoCard({ label,value,accent }) {
 return <div style={{ background:C.bg, borderRadius:10, padding:"10px 14px" }}><div style={{ fontSize:11, color:C.muted, fontWeight:600, marginBottom:2 }}>{label}</div><div style={{ fontSize:14, fontWeight:700, color:accent||C.text }}>{value}</div></div>;
}
function Stat({ label,value }) { return <div><div style={{ fontSize:20, fontWeight:800, color:C.text }}>{value}</div><div style={{ fontSize:12, color:C.muted }}>{label}</div></div>; }
function Modal({ onClose,title,children }) {
 return (
   <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
     <div style={{ background:C.surface, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:480, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.25)" }}>
       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
         <div style={{ fontWeight:800, fontSize:18 }}>{title}</div>
         <button onClick={onClose} style={{ background:C.bg, border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
       </div>
       {children}
     </div>
   </div>
 );
}
function FilterTabs({ value,onChange,options }) {
 return (
   <div style={{ display:"flex", gap:4, background:C.bg, borderRadius:10, padding:4 }}>
     {options.map(opt=><button key={opt.id} onClick={()=>onChange(opt.id)} style={{ padding:"6px 14px", borderRadius:8, border:"none", fontSize:13, fontWeight:600, background:value===opt.id?C.surface:"transparent", color:value===opt.id?C.text:C.muted, cursor:"pointer", boxShadow:value===opt.id?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>{opt.label}</button>)}
   </div>
 );
}
function EmptyState({ icon,text }) { return <div style={{ textAlign:"center", padding:"48px 0", color:C.muted }}><div style={{ fontSize:36, marginBottom:12 }}>{icon}</div><div style={{ fontSize:14 }}>{text}</div></div>; }
function Toast({ msg,type }) {
 const bg=type==="success"?C.mint:type==="error"?C.coral:C.navy;
 return <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:bg, color:"#fff", padding:"12px 24px", borderRadius:12, fontWeight:600, fontSize:14, zIndex:999, boxShadow:"0 8px 32px rgba(0,0,0,0.18)", whiteSpace:"nowrap" }}>{msg}</div>;
}
