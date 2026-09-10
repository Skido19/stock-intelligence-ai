
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const STOCKS = {
  NVDA: { name:"NVIDIA Corporation", sector:"Semiconductors", price:182.10, change:2.84, signal:"CONSTRUCTIVE", score:82, marketCap:"$4.43T", pe:"48.6x", revenue:"$46.7B", growth:"+56.2%", momentum:86, sentiment:79, fundamentals:83 },
  MSFT: { name:"Microsoft Corporation", sector:"Technology", price:511.22, change:1.42, signal:"POSITIVE", score:78, marketCap:"$3.80T", pe:"37.2x", revenue:"$76.4B", growth:"+17.8%", momentum:77, sentiment:74, fundamentals:88 },
  AMD: { name:"Advanced Micro Devices", sector:"Semiconductors", price:165.72, change:3.16, signal:"CONSTRUCTIVE", score:84, marketCap:"$270B", pe:"61.4x", revenue:"$8.6B", growth:"+32.1%", momentum:91, sentiment:82, fundamentals:79 },
  TSLA: { name:"Tesla Inc.", sector:"Automotive", price:348.91, change:0.87, signal:"WATCH", score:64, marketCap:"$1.10T", pe:"104x", revenue:"$26.4B", growth:"+4.2%", momentum:69, sentiment:58, fundamentals:61 },
  AAPL: { name:"Apple Inc.", sector:"Technology", price:238.44, change:-0.34, signal:"NEUTRAL", score:67, marketCap:"$3.55T", pe:"34.8x", revenue:"$94.0B", growth:"+9.1%", momentum:61, sentiment:66, fundamentals:78 },
  AVGO: { name:"Broadcom Inc.", sector:"Semiconductors", price:311.65, change:1.91, signal:"POSITIVE", score:81, marketCap:"$1.47T", pe:"72.1x", revenue:"$17.3B", growth:"+21.6%", momentum:84, sentiment:80, fundamentals:82 },
  ONDS: { name:"Ondas Holdings Inc.", sector:"Technology / Autonomous Systems", price:8.42, change:4.76, signal:"WATCH", score:71, marketCap:"$190M", pe:"NM", revenue:"$2.1M", growth:"+28.4%", momentum:78, sentiment:73, fundamentals:49 }
};

const NEWS = [
  {id:1,time:"18:42",source:"Reuters",category:"Macro",title:"U.S. markets digest fresh inflation signals as investors reposition",summary:"New macro data is shifting expectations for rates and growth-sensitive sectors.",impact:"CRITICAL",sentiment:"BEARISH",tickers:["SPY","QQQ","NVDA"],score:94,why:"Rate expectations can reprice long-duration growth stocks quickly."},
  {id:2,time:"18:21",source:"SEC Filing",category:"Earnings",title:"NVIDIA files quarterly report; data-center demand remains a key focus",summary:"Investors are watching margins, capex and forward guidance for the next leg of AI infrastructure spending.",impact:"HIGH",sentiment:"BULLISH",tickers:["NVDA"],score:87,why:"Forward guidance and data-center demand are central to NVIDIA's valuation narrative."},
  {id:3,time:"17:58",source:"Company IR",category:"Earnings",title:"Major semiconductor supplier raises full-year revenue outlook",summary:"Higher guidance supports the broader semiconductor supply-chain thesis.",impact:"HIGH",sentiment:"BULLISH",tickers:["AMD","NVDA","AVGO"],score:82,why:"Upstream guidance can change revenue expectations across the semiconductor chain."},
  {id:4,time:"17:31",source:"Reuters",category:"Commodities",title:"Oil prices retreat as traders assess global demand outlook",summary:"Energy shares may face pressure while lower input costs could support selected consumer sectors.",impact:"MEDIUM",sentiment:"NEUTRAL",tickers:["XLE","CVX"],score:65,why:"Lower oil prices have cross-sector effects through margins, inflation and energy earnings."},
  {id:5,time:"16:49",source:"Federal Reserve",category:"Macro",title:"Officials emphasize data dependency ahead of next policy decision",summary:"Rate-sensitive assets remain sensitive to incoming labor and inflation data.",impact:"HIGH",sentiment:"NEUTRAL",tickers:["TLT","QQQ","IWM"],score:78,why:"The policy path directly affects discount rates and liquidity conditions."},
  {id:6,time:"16:12",source:"SEC Filing",category:"Insider",title:"Executive purchase disclosed in a large-cap technology company",summary:"The transaction is being reviewed alongside valuation and recent price performance.",impact:"MEDIUM",sentiment:"BULLISH",tickers:["AAPL"],score:61,why:"Insider transactions can provide context but should not be treated as standalone signals."},
  {id:7,time:"15:46",source:"Company IR",category:"Technology",title:"Ondas Holdings highlights autonomous systems and industrial wireless pipeline",summary:"Investors are monitoring execution, commercial adoption and funding needs across the company's operating units.",impact:"HIGH",sentiment:"BULLISH",tickers:["ONDS"],score:76,why:"Small-cap names can react sharply to contract, funding and execution updates."}
];

const REPORTS = [
  {id:1,ticker:"NVDA",company:"NVIDIA Corporation",form:"10-Q",date:"2026-08-27",focus:"Revenue growth, margins, data center",facts:["Quarterly revenue trend","Data-center demand","Gross margin","Capital expenditure"],source:"SEC EDGAR"},
  {id:2,ticker:"AAPL",company:"Apple Inc.",form:"10-Q",date:"2026-07-31",focus:"Services, China, buybacks",facts:["Services growth","Geographic revenue","Share repurchases","Operating margin"],source:"SEC EDGAR"},
  {id:3,ticker:"MSFT",company:"Microsoft Corporation",form:"10-K",date:"2026-07-30",focus:"Cloud, AI capex, margins",facts:["Cloud revenue","AI infrastructure","Operating margin","Cash generation"],source:"SEC EDGAR"},
  {id:4,ticker:"AMD",company:"Advanced Micro Devices",form:"10-Q",date:"2026-08-05",focus:"Data center, AI accelerators",facts:["Data-center revenue","Accelerator roadmap","Gross margin","Guidance"],source:"SEC EDGAR"},
  {id:5,ticker:"AVGO",company:"Broadcom Inc.",form:"10-Q",date:"2026-09-01",focus:"AI networking, infrastructure software",facts:["AI revenue","Networking","Software","Free cash flow"],source:"SEC EDGAR"},
  {id:6,ticker:"ONDS",company:"Ondas Holdings Inc.",form:"10-Q",date:"2026-08-12",focus:"Autonomous systems, wireless infrastructure",facts:["Revenue trend","Order pipeline","Cash position","Operating expenses"],source:"SEC EDGAR"}
];

const CHARTS = {
  NVDA:[177.2,178.1,177.7,179.0,180.3,179.7,181.4,182.1],
  MSFT:[505,506,507.2,508,509.1,510.2,509.6,511.2],
  AMD:[158,159.4,160.1,161.8,160.9,163.2,164.5,165.7],
  TSLA:[342,344,343.2,346.4,345.8,347.1,348.3,348.9],
  AAPL:[237,238.1,237.5,239,238.4,239.1,238.8,238.4],
  AVGO:[302,304,303.6,306,307.8,309.2,310.1,311.7],
  ONDS:[7.72,7.85,7.91,8.04,7.98,8.17,8.28,8.42]
};

const DEFAULT_PREFS = {
  markets:["US Equities"],
  sectors:["Technology","Semiconductors"],
  alert:"High",
  news:["Earnings","M&A","Regulation","Macro","Insider"],
  notifications:true,
  aiStyle:"Balanced",
  sources:["SEC EDGAR","Reuters","Company IR"]
};

function Icon({name,size=17}){
  const paths={
    grid:"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    news:"M4 4h16v16H4zM7 8h10M7 12h10M7 16h6",
    alert:"M12 3 2 21h20L12 3zm0 6v5m0 3h.01",
    file:"M6 3h9l4 4v14H6zM15 3v5h5M9 12h6M9 16h6",
    star:"M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z",
    brain:"M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2.2 5.1A3 3 0 0 0 6 17a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 3 3 0 0 0 2.2-5.9A3 3 0 0 0 18 6a3 3 0 0 0-3-3zM9 7v10M15 7v10M9 12h6",
    settings:"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M3 12h2m14 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
    search:"M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm5-2 5 5",
    bell:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
    refresh:"M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4",
    close:"M5 5l14 14M19 5 5 19",
    up:"M4 16l6-6 4 4 6-8",
    down:"M4 8l6 6 4-4 6 8",
    check:"M5 12l4 4L19 6",
    user:"M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    logout:"M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{(paths[name]||paths.grid).split(/(?=[A-Z])/).map(()=>null)}<path d={paths[name]||paths.grid}/></svg>
}

function App(){
  const [logged,setLogged]=useState(()=>localStorage.getItem("sia-demo-session")==="1");
  const [tab,setTab]=useState("Command Center");
  const [selected,setSelected]=useState(()=>localStorage.getItem("sia-selected")||"NVDA");
  const [watch,setWatch]=useState(()=>JSON.parse(localStorage.getItem("sia-watch")||'["NVDA","MSFT","AMD","TSLA"]'));
  const [prefs,setPrefs]=useState(()=>JSON.parse(localStorage.getItem("sia-prefs")||JSON.stringify(DEFAULT_PREFS)));
  const [q,setQ]=useState("");
  const [searchOpen,setSearchOpen]=useState(false);
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState("");
  const [read,setRead]=useState(()=>JSON.parse(localStorage.getItem("sia-read")||"[]"));
  const [stamp,setStamp]=useState(new Date());
  const runGlobalSearch=(value)=>{const raw=value.trim(); const term=raw.toUpperCase(); if(!raw){setSearchOpen(false);return;} const match=Object.entries(STOCKS).find(([t,s])=>t===term || s.name.toUpperCase().includes(term)); if(match){setSelected(match[0]);setTab("Stock Research");setQ("");setSearchOpen(false);notify(`Opened ${match[0]} research`);return;} const newsMatch=NEWS.find(n=>(n.title+" "+n.summary+" "+n.tickers.join(" ")).toUpperCase().includes(term)); if(newsMatch){setTab("Market Intelligence");setQ(raw);setSearchOpen(false);notify("Filtered Market Intelligence");return;} const filingMatch=REPORTS.find(r=>(r.ticker+" "+r.company+" "+r.focus).toUpperCase().includes(term)); if(filingMatch){setTab("Financial Data");setQ(raw);setSearchOpen(false);notify("Filtered Financial Data");return;} setSearchOpen(true);notify("No direct match found");};

  useEffect(()=>localStorage.setItem("sia-watch",JSON.stringify(watch)),[watch]);
  useEffect(()=>localStorage.setItem("sia-selected",selected),[selected]);
  useEffect(()=>localStorage.setItem("sia-prefs",JSON.stringify(prefs)),[prefs]);
  useEffect(()=>localStorage.setItem("sia-read",JSON.stringify(read)),[read]);

  const notify=(m)=>{setToast(m);window.clearTimeout(window.__siaToast);window.__siaToast=window.setTimeout(()=>setToast(""),2000)};
  const login=()=>{localStorage.setItem("sia-demo-session","1");setLogged(true);notify("Welcome to Stock Intelligence AI")};
  const logout=()=>{localStorage.removeItem("sia-demo-session");setLogged(false)};
  const toggleWatch=(t)=>{setWatch(w=>w.includes(t)?w.filter(x=>x!==t):[...w,t]);notify(watch.includes(t)?`${t} removed from watchlist`:`${t} added to watchlist`)};
  const unread=NEWS.filter(n=>!read.includes(n.id)).length;

  if(!logged) return <Login onLogin={login}/>;

  const nav=[
    ["Command Center","grid"],["Market Intelligence","news"],["Stock Research","search"],["Alerts","alert"],["Financial Data","file"],["Watchlist","star"],["AI Research Lab","brain"],["Settings","settings"]
  ];

  return <div className="app">
    <aside>
      <div className="brand"><div className="brandMark">SI</div><div><b>STOCK INTEL</b><small>AI RESEARCH TERMINAL</small></div></div>
      <div className="marketStatus"><span className="liveDot"/> MARKET OPEN <i>US EQUITIES</i></div>
      <nav>{nav.map(([n,ic])=><button className={tab===n?"active":""} onClick={()=>setTab(n)} key={n}><Icon name={ic}/><span>{n}</span>{n==="Alerts"&&unread>0&&<em>{unread}</em>}</button>)}</nav>
      <div className="sidebarBottom">
        <div className="portfolioMini"><small>PORTFOLIO</small><strong>$248,920</strong><b>+2.84%</b></div>
        <div className="account"><div className="avatar">MP</div><div><b>Market Analyst</b><small>Demo account</small></div><button onClick={logout} title="Logout"><Icon name="logout" size={15}/></button></div>
      </div>
    </aside>

    <main>
      <header>
        <div className="globalSearchWrap"><div className="globalSearch"><Icon name="search" size={16}/><input value={q} onFocus={()=>setSearchOpen(true)} onChange={e=>{setQ(e.target.value);setSearchOpen(true)}} onKeyDown={e=>{if(e.key==="Enter")runGlobalSearch(e.currentTarget.value);if(e.key==="Escape")setSearchOpen(false)}} placeholder="Search ticker, company, news or filing..." /><kbd>Ctrl K</kbd></div>{searchOpen&&q.trim()&&<SearchPalette q={q} onOpenStock={t=>{setSelected(t);setTab("Stock Research");setQ("");setSearchOpen(false);notify(`Opened ${t} research`)}} onOpenNews={n=>{setModal(n);setSearchOpen(false)}} onClose={()=>setSearchOpen(false)}/>}</div>
        <div className="headerRight"><span className="liveText"><span className="liveDot"/> LIVE DEMO DATA</span><button onClick={()=>{setStamp(new Date());notify("Market intelligence refreshed")}}><Icon name="refresh" size={16}/></button><button onClick={()=>notify(`${unread} unread alerts`)}><Icon name="bell" size={17}/>{unread>0&&<i className="notifyDot"/>}</button></div>
      </header>

      {tab==="Command Center"&&<CommandCenter {...{selected,setSelected,watch,toggleWatch,q,setQ,setTab,setModal,stamp}}/>}
      {tab==="Market Intelligence"&&<MarketIntelligence {...{q,setModal}}/>}
      {tab==="Stock Research"&&<StockResearch {...{selected,setSelected,q,setModal,toggleWatch,watch}}/>}
      {tab==="Alerts"&&<Alerts {...{q,setModal,read,setRead}}/>}
      {tab==="Financial Data"&&<FinancialData {...{q,setModal}}/>}
      {tab==="Watchlist"&&<Watchlist {...{watch,selected,setSelected,toggleWatch}}/>}
      {tab==="AI Research Lab"&&<AILab {...{selected,setSelected}}/>}
      {tab==="Settings"&&<SettingsPage prefs={prefs} setPrefs={setPrefs} notify={notify}/>}
    </main>
    {modal&&<DetailModal item={modal} close={()=>setModal(null)}/>}
    {toast&&<div className="toast"><Icon name="check" size={14}/>{toast}</div>}
  </div>
}

function Login({onLogin}){
 const[email,setEmail]=useState("demo@stockintel.ai"),[pass,setPass]=useState("demo123"),[error,setError]=useState("");
 const submit=e=>{e.preventDefault();if(email==="demo@stockintel.ai"&&pass==="demo123")onLogin();else setError("Demo credentials are demo@stockintel.ai / demo123")};
 return <div className="loginPage"><div className="loginCard"><div className="loginLogo">SI</div><span className="eyebrow">STOCK INTELLIGENCE AI</span><h1>Your market research terminal.</h1><p>Gather. Verify. Analyze. Decide.</p><form onSubmit={submit}><label>EMAIL</label><input value={email} onChange={e=>setEmail(e.target.value)}/><label>PASSWORD</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)}/>{error&&<div className="error">{error}</div>}<button className="primary">Sign In</button></form><div className="demoHint">Demo account · no backend required</div></div></div>
}

function CommandCenter({selected,setSelected,watch,toggleWatch,setTab,setModal,stamp}){
 const s=STOCKS[selected];
 return <Page title="Command Center" sub="What matters now. What could move next."><div className="updated">Updated {stamp.toLocaleTimeString()}</div>
  <div className="marketTape">{[["S&P 500","6,512.34","+0.72%"],["NASDAQ","21,884.11","+1.04%"],["DOW","45,218.76","+0.31%"],["VIX","15.82","-4.28%"],["10Y","4.08%","+2.1bp"],["WTI","72.14","-1.12%"]].map(x=><div key={x[0]}><small>{x[0]}</small><b>{x[1]}</b><i className={x[2][0]==="-"?"red":""}>{x[2]}</i></div>)}</div>
  <div className="ccGrid"><div className="panel signalPanel"><div className="sectionLabel">AI MARKET REGIME</div><div className="signalHeadline"><div><h2>Risk-on momentum is building</h2><p>Positive earnings revisions and semiconductor strength are outweighing macro uncertainty.</p></div><strong>82<small>/100</small></strong></div><div className="signalGrid">{[["Breadth","Strong",78],["Macro risk","Elevated",61],["Momentum","Strong",84],["Liquidity","Healthy",72]].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><i><u style={{width:x[2]+"%"}}/></i></div>)}</div></div>
  <div className="panel"><div className="panelTop"><div><div className="sectionLabel danger">⚠ WHAT MATTERS NOW</div><h2>Priority events</h2></div><button className="link" onClick={()=>setTab("Alerts")}>View all</button></div>{NEWS.filter(n=>n.score>=78).slice(0,3).map(n=><button key={n.id} className="priority" onClick={()=>setModal(n)}><b>{n.score}</b><span><strong>{n.title}</strong><small>{n.source} · {n.time}</small></span></button>)}</div></div>
  <div className="ccGrid"><div className="panel"><div className="panelTop"><div><div className="sectionLabel">YOUR WATCHLIST</div><h2>Position intelligence</h2></div><button className="link" onClick={()=>setTab("Watchlist")}>Manage</button></div><div className="watchTable">{watch.map(t=>{let x=STOCKS[t];return <button key={t} className={selected===t?"chosen":""} onClick={()=>setSelected(t)}><b>{t}</b><span>{x.name}</span><strong>${x.price.toFixed(2)}</strong><i className={x.change<0?"red":""}>{x.change>=0?"+":""}{x.change}%</i><em>{x.signal}</em></button>})}</div></div>
  <div className="panel"><div className="panelTop"><div><div className="sectionLabel">AI DAILY BRIEFING</div><h2>3 things you should know</h2></div><span className="aiTag">AI</span></div><BriefingItem n="01" title="Semiconductor momentum remains strong" text="Positive guidance is reinforcing the AI infrastructure theme, but valuation sensitivity remains elevated."/><BriefingItem n="02" title="Rate expectations remain the key macro risk" text="Incoming inflation and labor data can quickly change the discount-rate backdrop for growth stocks."/><BriefingItem n="03" title="Evidence matters more than headlines" text="Use filings, earnings data and price/volume confirmation before changing an investment thesis."/></div></div>
 </Page>
}

function BriefingItem({n,title,text}){return <div className="brief"><span>{n}</span><div><b>{title}</b><p>{text}</p></div></div>}

function Meta({n}){return <div className="meta"><span>{n.time}</span><span>{n.source}</span><b className={n.sentiment.toLowerCase()}>{n.sentiment}</b><b>{n.impact}</b></div>}

function MarketIntelligence({q,setModal}){
 const[c,setC]=useState("ALL");
 const items=NEWS.filter(n=>(c==="ALL"||n.category.toUpperCase()===c)&&(n.title+" "+n.summary+" "+n.tickers.join(" ")+" "+n.source).toLowerCase().includes(q.toLowerCase()));
 return <Page title="Market Intelligence" sub="AI-ranked news across markets, sectors and companies"><div className="filterTabs">{["ALL","MACRO","EARNINGS","INSIDER","COMMODITIES"].map(x=><button key={x} className={c===x?"active":""} onClick={()=>setC(x)}>{x}</button>)}</div>{items.map(n=><button key={n.id} className="panel newsCard" onClick={()=>setModal(n)}><div className="scoreBox">{n.score}<small>IMPACT</small></div><div><Meta n={n}/><h2>{n.title}</h2><p>{n.summary}</p><div className="chips">{n.tickers.map(t=><span key={t}>{t}</span>)}<b>{n.impact}</b></div></div></button>)}{items.length===0&&<Empty text="No intelligence matches your search."/>}</Page>
}

function StockResearch({selected,setSelected,toggleWatch,watch}){
 const s=STOCKS[selected],[section,setSection]=useState("Overview");
 const sections=["Overview","News","Financials","Valuation","Evidence","Scenarios"];
 return <Page title="Stock Research" sub="Evidence-first company intelligence"><div className="researchSearch">{Object.keys(STOCKS).map(t=><button key={t} className={selected===t?"active":""} onClick={()=>setSelected(t)}>{t}</button>)}</div>
  <div className="stockHero panel"><div><div className="sectionLabel">{s.sector.toUpperCase()}</div><h2>{s.name}</h2><span className="tickerLarge">{selected}</span></div><div className="heroPrice"><b>${s.price.toFixed(2)}</b><i className={s.change<0?"red":""}>{s.change>=0?"+":""}{s.change}%</i></div><div className="aiScore"><small>AI VIEW</small><b>{s.signal}</b><strong>{s.score}<em>/100</em></strong></div><button className="watchButton" onClick={()=>toggleWatch(selected)}>{watch.includes(selected)?"★ Watching":"☆ Add to watchlist"}</button></div>
  <div className="researchNav">{sections.map(x=><button key={x} className={section===x?"active":""} onClick={()=>setSection(x)}>{x}</button>)}</div>
  {section==="Overview"&&<ResearchOverview s={s} selected={selected}/>}
  {section==="News"&&<StockNews selected={selected}/>}
  {section==="Financials"&&<FinancialOverview s={s}/>}
  {section==="Valuation"&&<Valuation s={s}/>}
  {section==="Evidence"&&<Evidence selected={selected}/>}
  {section==="Scenarios"&&<ScenarioCards selected={selected}/>}
 </Page>
}

function ResearchOverview({s,selected}){return <div className="researchGrid"><div className="panel"><div className="sectionLabel">PRICE & MOMENTUM</div><h2>Market behavior</h2><MiniChart ticker={selected}/><div className="metricGrid"><Metric label="Momentum" value={s.momentum+"/100"}/><Metric label="News sentiment" value={s.sentiment+"/100"}/><Metric label="Fundamentals" value={s.fundamentals+"/100"}/><Metric label="Signal" value={s.signal}/></div></div><div className="panel"><div className="sectionLabel">AI INTERPRETATION</div><h2>Why this matters</h2><p className="lead">The current setup is constructive, but the conclusion is conditional on price confirmation, earnings expectations and the macro discount-rate environment.</p><EvidenceRow type="FACT" text={`${selected} revenue is modeled at ${s.revenue} with growth of ${s.growth}.`}/><EvidenceRow type="SIGNAL" text={`Momentum score is ${s.momentum}/100 and news sentiment is ${s.sentiment}/100.`}/><EvidenceRow type="INTERPRETATION" text="Positive operating momentum is supportive, while valuation and macro sensitivity remain key risks."/><EvidenceRow type="ACTION" text="Monitor confirmation levels and thesis invalidation before changing exposure."/></div></div>}
function Metric({label,value}){return <div className="metric"><span>{label}</span><b>{value}</b></div>}
function EvidenceRow({type,text}){return <div className="evidenceRow"><span>{type}</span><p>{text}</p></div>}
function StockNews({selected}){const items=NEWS.filter(n=>n.tickers.includes(selected));return <div className="panel">{items.length?items.map(n=><div key={n.id} className="compactNews"><Meta n={n}/><b>{n.title}</b><p>{n.summary}</p></div>):<Empty text="No linked news in demo dataset."/>}</div>}
function FinancialOverview({s}){return <div className="researchGrid"><div className="panel"><div className="sectionLabel">KEY FINANCIALS</div><div className="metricGrid large">{[["Revenue",s.revenue],["Growth",s.growth],["Market Cap",s.marketCap],["P/E",s.pe]].map(x=><Metric key={x[0]} label={x[0]} value={x[1]}/>)}</div></div><div className="panel"><div className="sectionLabel">FUNDAMENTAL READ</div><h2>{s.fundamentals}/100</h2><p className="lead">Fundamentals are supportive in this demo dataset. In production this section will be calculated from normalized income statement, balance sheet, cash flow and consensus data.</p></div></div>}
function Valuation({s}){return <div className="researchGrid"><div className="panel"><div className="sectionLabel">VALUATION SNAPSHOT</div><div className="metricGrid large"><Metric label="P/E" value={s.pe}/><Metric label="Market Cap" value={s.marketCap}/><Metric label="Revenue" value={s.revenue}/><Metric label="Growth" value={s.growth}/></div></div><div className="panel"><div className="sectionLabel">AI VALUATION READ</div><h2>Premium requires evidence</h2><p className="lead">A high multiple increases sensitivity to earnings revisions and interest rates. The strongest confirmation would be sustained growth plus stable or improving margins.</p></div></div>}
function Evidence({selected}){const items=NEWS.filter(n=>n.tickers.includes(selected));return <div className="panel"><div className="sectionLabel">EVIDENCE LEDGER</div><h2>Facts → signals → interpretation</h2><EvidenceRow type="FACT" text={`${selected} has current demo price, financial and market metadata.`}/><EvidenceRow type="SIGNAL" text="Price momentum, news sentiment and fundamental scores are calculated from the demo dataset."/><EvidenceRow type="SOURCE" text="Primary-source examples: SEC EDGAR and company investor relations; market/news example: Reuters."/><EvidenceRow type="INTERPRETATION" text="The AI layer should never present interpretation as fact. Production responses will cite the underlying records."/>{items.map(n=><EvidenceRow key={n.id} type="NEWS" text={`${n.source}: ${n.title} · Impact ${n.score}/100`}/>)}</div>}
function ScenarioCards({selected}){return <div className="scenarioGrid">{[["BULL CASE","Momentum confirms and earnings expectations rise.","ACCUMULATE / HOLD"],["BASE CASE","Price consolidates while fundamentals remain intact.","HOLD / MONITOR"],["BEAR CASE","Support breaks and negative catalysts confirm the downside.","REDUCE / REASSESS"]].map((x,i)=><div key={x[0]} className="panel scenarioCard"><span>{x[0]}</span><h2>{x[1]}</h2><b>{x[2]}</b><small>Key trigger: {i===0?"volume + resistance breakout":i===1?"stable volume + catalyst":"support break + negative news"}</small></div>)}</div>}

function Alerts({q,setModal,read,setRead}){const items=NEWS.filter(n=>(n.title+" "+n.tickers.join(" ")).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.score-a.score);return <Page title="Alerts" sub="Prioritized events with the highest probability of moving prices"><div className="alertBanner"><div><b>AI WARNING ENGINE ACTIVE</b><span>Priority is based on relevance, magnitude and cross-asset sensitivity.</span></div><button onClick={()=>setRead(items.map(n=>n.id))}>Mark all read</button></div>{items.map(n=><button key={n.id} className={"panel alertCard "+(read.includes(n.id)?"read":"")} onClick={()=>{if(!read.includes(n.id))setRead([...read,n.id]);setModal(n)}}><div className={"alertScore "+n.impact.toLowerCase()}>{n.score}<small>/100</small></div><div><label>{n.impact} IMPACT · {n.source}</label><h2>{n.title}</h2><p>{n.summary}</p><div className="why"><b>WHY IT MATTERS</b>{n.why}</div></div><ChevronRight/></button>)}</Page>}
function FinancialData({q,setModal}){const items=REPORTS.filter(r=>(r.ticker+" "+r.company+" "+r.focus).toLowerCase().includes(q.toLowerCase()));return <Page title="Financial Data" sub="Public filings and structured fundamental research"><div className="stats"><div><span>FILINGS INDEXED</span><b>128,420</b></div><div><span>COMPANIES</span><b>8,612</b></div><div><span>AI SUMMARIES</span><b>24,891</b></div></div><div className="panel table"><table><thead><tr><th>TICKER</th><th>COMPANY</th><th>FORM</th><th>DATE</th><th>AI FOCUS</th></tr></thead><tbody>{items.map(r=><tr key={r.id} onClick={()=>setModal({report:true,data:r})}><td><b>{r.ticker}</b></td><td>{r.company}</td><td>{r.form}</td><td>{r.date}</td><td>{r.focus}</td></tr>)}</tbody></table></div></Page>}
function SearchPalette({q,onOpenStock,onOpenNews,onClose}){const term=q.trim().toLowerCase();const stocks=Object.entries(STOCKS).filter(([t,s])=>(t+" "+s.name+" "+s.sector).toLowerCase().includes(term)).slice(0,5);const news=NEWS.filter(n=>(n.title+" "+n.summary+" "+n.tickers.join(" ")).toLowerCase().includes(term)).slice(0,3);const filings=REPORTS.filter(r=>(r.ticker+" "+r.company+" "+r.focus).toLowerCase().includes(term)).slice(0,2);return <div className="searchPalette"><div className="paletteHead"><span>SEARCH RESULTS</span><button onClick={onClose}>ESC</button></div>{stocks.length>0&&<><div className="paletteLabel">STOCKS</div>{stocks.map(([t,s])=><button className="paletteItem" key={t} onClick={()=>onOpenStock(t)}><div className="paletteTicker">{t}</div><div><b>{s.name}</b><span>{s.sector} · ${s.price.toFixed(2)} · <i>{s.change>=0?"+":""}{s.change}%</i></span></div><strong>{s.score}<small> AI</small></strong></button>)}</>}{news.length>0&&<><div className="paletteLabel">NEWS</div>{news.map(n=><button className="paletteItem" key={n.id} onClick={()=>onOpenNews(n)}><div className="paletteIcon">N</div><div><b>{n.title}</b><span>{n.source} · Impact {n.score}/100</span></div></button>)}</>}{filings.length>0&&<><div className="paletteLabel">FILINGS</div>{filings.map(r=><div className="paletteStatic" key={r.id}><b>{r.ticker} · {r.form}</b><span>{r.focus} · {r.date}</span></div>)}</>}{stocks.length===0&&news.length===0&&filings.length===0&&<div className="paletteEmpty">No direct result. Press Enter to search across the selected module.</div>}<div className="paletteFoot">Enter · Open best match</div></div>}

function Plus(){return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>}

function Watchlist({watch,selected,setSelected,toggleWatch}){const safeWatch=watch.filter(t=>STOCKS[t]);return <Page title="Watchlist" sub="Personal names monitored by your research terminal"><div className="stockGrid">{safeWatch.map(t=>{const s=STOCKS[t];return <div key={t} className={"panel stockCard "+(t===selected?"selected":"")} onClick={()=>setSelected(t)}><div className="stockTop"><div className="stockSymbol">{t[0]}</div><div><b>{t}</b><span>{s.name}</span></div><button onClick={e=>{e.stopPropagation();toggleWatch(t)}}>★</button></div><h2>${s.price.toFixed(2)} <i className={s.change<0?"red":""}>{s.change>=0?"+":""}{s.change}%</i></h2><div className="stockSignal"><span>AI SIGNAL</span><b>{s.signal}</b></div></div>})}{safeWatch.length===0&&<div className="panel addStock"><Plus/><b>Your watchlist is empty</b><span>Search a ticker in the top bar and add it from Stock Research.</span></div>}<div className="panel addStock"><Plus/><b>Add a stock</b><span>Search a ticker in the top bar</span></div></div></Page>}
function AILab({selected,setSelected}){const[mode,setMode]=useState("UP"),s=STOCKS[selected];const copy={UP:["IF PRICE CONTINUES UP","Consider holding strength; only add after confirmation.","Confirm resistance breakout + volume expansion."],DOWN:["IF PRICE BREAKS DOWN","Reduce exposure and reassess the thesis at support.","Confirm support break + negative catalyst."],SIDE:["IF PRICE MOVES SIDEWAYS","Wait for confirmation rather than forcing a decision.","Watch catalyst + volume expansion."]}[mode];return <Page title="AI Research Lab" sub="Scenario-based decision support backed by explicit evidence"><div className="labHeader panel"><div><label>ANALYZE</label><select value={selected} onChange={e=>setSelected(e.target.value)}>{Object.keys(STOCKS).map(t=><option key={t}>{t}</option>)}</select></div>{[["UP","up"],["DOWN","down"],["SIDE","side"]].map(x=><button key={x[0]} className={mode===x[0]?"chosen":""} onClick={()=>setMode(x[0])}><Icon name={x[1]}/><b>{x[0]}</b><span>{x[0]==="UP"?"Continuation":x[0]==="DOWN"?"Risk control":"Wait for confirmation"}</span></button>)}</div><div className="labGrid"><div className="panel"><div className="sectionLabel">CURRENT READ · {selected}</div><h2>{s.signal}</h2><p className="lead">This demo separates the recommendation from the evidence that supports it.</p><Metric label="Momentum" value={s.momentum+"/100"}/><Metric label="News sentiment" value={s.sentiment+"/100"}/><Metric label="Fundamentals" value={s.fundamentals+"/100"}/></div><div className="panel recommendation"><div className="sectionLabel">RECOMMENDED NEXT STEP</div><h2>{copy[0]}</h2><p className="lead">{copy[1]}</p><div className="trigger"><b>Confirmation</b><span>{copy[2]}</span></div><div className="trigger"><b>Invalidation</b><span>Thesis deterioration, adverse filing data or a confirmed regime change.</span></div><div className="trigger"><b>Evidence sources</b><span>Market price/volume, financial reports, company releases and relevant macro data.</span></div></div></div></Page>}
function SettingsPage({prefs,setPrefs,notify}){const set=(k,v)=>setPrefs({...prefs,[k]:v});const toggle=(k,v)=>set(k,prefs[k].includes(v)?prefs[k].filter(x=>x!==v):[...prefs[k],v]);return <Page title="Settings" sub="Personalize what the research terminal shows and how it alerts you"><div className="settingsGrid"><div className="panel settingsSection"><div className="sectionLabel">MARKETS</div><h2>Research coverage</h2><div className="choiceRow">{["US Equities","Vietnam","Europe","Asia"].map(x=><button key={x} className={prefs.markets.includes(x)?"selected":""} onClick={()=>toggle("markets",x)}>{prefs.markets.includes(x)?"✓ ":""}{x}</button>)}</div><div className="sectionLabel gap">SECTORS</div><div className="choiceRow">{["Technology","Semiconductors","Financials","Energy","Healthcare","Defense"].map(x=><button key={x} className={prefs.sectors.includes(x)?"selected":""} onClick={()=>toggle("sectors",x)}>{prefs.sectors.includes(x)?"✓ ":""}{x}</button>)}</div></div><div className="panel settingsSection"><div className="sectionLabel">ALERTS</div><h2>Alert sensitivity</h2><div className="choiceRow">{["Low","Medium","High","Critical only"].map(x=><button key={x} className={prefs.alert===x?"selected":""} onClick={()=>set("alert",x)}>{x}</button>)}</div><div className="sectionLabel gap">NOTIFICATIONS</div><button className={"toggle "+(prefs.notifications?"on":"")} onClick={()=>set("notifications",!prefs.notifications)}><span/>{prefs.notifications?"Enabled":"Disabled"}</button></div><div className="panel settingsSection"><div className="sectionLabel">AI PREFERENCES</div><h2>Analysis style</h2><div className="choiceRow">{["Conservative","Balanced","Aggressive"].map(x=><button key={x} className={prefs.aiStyle===x?"selected":""} onClick={()=>set("aiStyle",x)}>{x}</button>)}</div><div className="sectionLabel gap">DATA SOURCES</div><div className="choiceRow">{["SEC EDGAR","Reuters","Company IR","Federal Reserve"].map(x=><button key={x} className={prefs.sources.includes(x)?"selected":""} onClick={()=>toggle("sources",x)}>{prefs.sources.includes(x)?"✓ ":""}{x}</button>)}</div></div><div className="panel settingsSection"><div className="sectionLabel">NEWS PREFERENCES</div><h2>Topics</h2><div className="choiceRow">{["Earnings","M&A","Regulation","Macro","Insider","Commodities"].map(x=><button key={x} className={prefs.news.includes(x)?"selected":""} onClick={()=>toggle("news",x)}>{prefs.news.includes(x)?"✓ ":""}{x}</button>)}</div><button className="save" onClick={()=>notify("Preferences saved locally")}>Save preferences</button></div></div></Page>}
function DetailModal({item,close}){return <div className="modalBack" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={close}><Icon name="close"/></button>{item.report?<><label>PUBLIC FILING · {item.data.form}</label><h2>{item.data.ticker} — {item.data.company}</h2><p>{item.data.date}</p><h3>AI Research Focus</h3><p>{item.data.focus}</p><h3>Key fields</h3><div className="modalChips">{item.data.facts.map(x=><span key={x}>{x}</span>)}</div><div className="sourceNote">SOURCE · {item.data.source}<br/>Step 1 uses simulated filing metadata. Step 2 will connect the live filing source.</div></>:<><Meta n={item}/><h2>{item.title}</h2><p>{item.summary}</p><div className="impactBox">AI market impact <b>{item.score}/100</b></div><h3>Why it matters</h3><p>{item.why}</p><h3>Potentially affected</h3><div className="modalChips">{item.tickers.map(t=><span key={t}>{t}</span>)}</div><div className="sourceNote">SOURCE · {item.source} · {item.time}<br/>AI conclusions in this demo are illustrative and not financial advice.</div></>}</div></div>}
function MiniChart({ticker}){const vals=CHARTS[ticker],min=Math.min(...vals),max=Math.max(...vals);const pts=vals.map((v,i)=>`${i/(vals.length-1)*100},${92-(v-min)/(max-min||1)*78}`).join(" ");return <svg className="miniChart" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>}
function Page({title,sub,children}){return <section className="content"><div className="pageTitle"><div><span>STOCK INTELLIGENCE AI</span><h1>{title}</h1><p>{sub}</p></div></div>{children}</section>}
function Empty({text}){return <div className="empty">{text}</div>}
function ChevronRight(){return <span className="chevron">›</span>}

createRoot(document.getElementById("root")).render(<App/>);
