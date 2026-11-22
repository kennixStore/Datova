const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const splash=$("#splash"),intro=$("#onboarding"),app=$("#app");
const slides=[
{step:"WELCOME TO DATOVA",title:"Your digital world,<br><span>made easier.</span>",text:"A simpler way to stay connected. Get the essentials you need, all in one place.",icon:"D"},
{step:"BUY DATA EASILY",title:"Stay online.<br><span>Stay connected.</span>",text:"Find your network and choose a data plan in a few simple steps.",icon:"⌁"},
{step:"AIRTIME MADE SIMPLE",title:"Top up and<br><span>keep going.</span>",text:"A straightforward airtime experience is coming together inside DATOVA.",icon:"◉"},
{step:"EXPLORE DATOVA",title:"More services.<br><span>One destination.</span>",text:"Electricity, cable TV, internet and more will join the experience over time.",icon:"✦"}];
let slide=0;
function showApp(){intro.classList.add("hidden");app.classList.remove("hidden");localStorage.setItem("datova_intro_seen","1")}
function renderSlide(){const s=slides[slide];$("#introStep").textContent=s.step;$("#introTitle").innerHTML=s.title;$("#introText").textContent=s.text;$("#introIcon").textContent=s.icon;$("#introDots").innerHTML=slides.map((_,i)=>'<i class="'+(i===slide?"active":"")+'"></i>').join("");$("#introBack").classList.toggle("hidden",slide===0);$("#introNext").innerHTML=slide===slides.length-1?'Explore <b>→</b>':'Next <b>→</b>'}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2700)}
function openAuth(mode="login"){$("#authModal").classList.remove("hidden");$$("[data-auth]").forEach(b=>b.classList.toggle("selected",b.dataset.auth===mode));$("#fullName").classList.toggle("hidden",mode!=="signup");$("#fullName").required=mode==="signup";$("#authTitle").textContent=mode==="login"?"Welcome back":"Create your account";$("#authDesc").textContent=mode==="login"?"Sign in to access your DATOVA account.":"Join DATOVA and make staying connected easier."}
function go(screen){const target=$("#screen-"+screen);if(!target){toast("That section is not available yet.");return}$$(".screen").forEach(s=>s.classList.remove("active"));target.classList.add("active");$$("[data-screen]").forEach(b=>b.classList.toggle("active",b.dataset.screen===screen));window.scrollTo({top:0,behavior:"smooth"})}
$("#introNext").addEventListener("click",()=>{if(slide<slides.length-1){slide++;renderSlide()}else showApp()});
$("#introBack").addEventListener("click",()=>{if(slide>0){slide--;renderSlide()}});
$("#skipIntro").addEventListener("click",showApp);
$("#year").textContent=new Date().getFullYear();
$$("[data-screen]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.screen)));
$("#accountBtn").addEventListener("click",()=>go("profile"));
$("#loginSide").addEventListener("click",()=>openAuth("login"));
$("#profileSignIn").addEventListener("click",()=>openAuth("login"));
$("#profileTheme").addEventListener("click",()=>$("#themeToggle").click());
$("#closeAuth").addEventListener("click",()=>$("#authModal").classList.add("hidden"));
$("#authModal").addEventListener("click",e=>{if(e.target.id==="authModal")$("#authModal").classList.add("hidden")});
$$("[data-auth]").forEach(b=>b.addEventListener("click",()=>openAuth(b.dataset.auth)));
$("#authForm").addEventListener("submit",e=>{e.preventDefault();toast("Preview only: account services are not connected yet.")});
$("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("datova_theme",document.body.classList.contains("dark")?"dark":"light")});
if(localStorage.getItem("datova_theme")==="dark")document.body.classList.add("dark");
const plans={MTN:["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days","5 GB — 30 days"],Airtel:["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days","5 GB — 30 days"],Glo:["1 GB — 30 days","2 GB — 30 days","3 GB — 30 days","5 GB — 30 days"],"9mobile":["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days"]};
$("#dataNetwork").addEventListener("change",e=>{$("#dataPlan").innerHTML='<option value="">Select a sample plan</option>'+(plans[e.target.value]||[]).map(p=>'<option>'+p+'</option>').join("")});
$("#dataContinue").addEventListener("click",()=>{const n=$("#dataNetwork").value,p=$("#dataPhone").value,plan=$("#dataPlan").value;if(!n||!/^0\d{10}$/.test(p)||!plan){toast("Select a network, enter a valid 11-digit number and choose a plan.");return}toast("Preview only: data purchases are not connected yet.")});
$("#airContinue").addEventListener("click",()=>{const n=$("#airNetwork").value,p=$("#airPhone").value,a=Number($("#airAmount").value);if(!n||!/^0\d{10}$/.test(p)||!Number.isFinite(a)||a<50||a>50000){toast("Check the network, phone number and amount (₦50–₦50,000).");return}toast("Preview only: airtime purchases are not connected yet.")});
$$(".filter-chip").forEach(b=>b.addEventListener("click",()=>{$$(".filter-chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");toast("Transaction filters will work when account history is connected.")}));
renderSlide();
setTimeout(()=>{splash.classList.add("out");setTimeout(()=>{splash.remove();if(localStorage.getItem("datova_intro_seen"))showApp();else intro.classList.remove("hidden")},650)},2750);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));