const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const splash=$("#splash"),intro=$("#onboarding"),app=$("#app");
const slides=[
{step:"WELCOME TO DATOVA",title:"Your digital world,<br><span>made easier.</span>",text:"A simpler way to stay connected. Get the essentials you need, all in one place.",icon:"D"},
{step:"BUY DATA EASILY",title:"Stay online.<br><span>Stay connected.</span>",text:"Find your network and choose a data plan in a few simple steps.",icon:"⌁"},
{step:"AIRTIME MADE SIMPLE",title:"Top up and<br><span>keep going.</span>",text:"A straightforward airtime experience is coming together inside DATOVA.",icon:"◉"},
{step:"EXPLORE DATOVA",title:"More services.<br><span>One destination.</span>",text:"Electricity, cable TV, internet and more will join the experience over time.",icon:"✦"}
];
let slide=0,authMode="login";
function showApp(){intro.classList.add("hidden");app.classList.remove("hidden");localStorage.setItem("datova_intro_seen","1")}
function renderSlide(){const s=slides[slide];$("#introStep").textContent=s.step;$("#introTitle").innerHTML=s.title;$("#introText").textContent=s.text;$("#introIcon").textContent=s.icon;$("#introDots").innerHTML=slides.map((_,i)=>'<i class="'+(i===slide?"active":"")+'"></i>').join("");$("#introBack").classList.toggle("hidden",slide===0);$("#introNext").innerHTML=slide===slides.length-1?'Explore <b>→</b>':'Next <b>→</b>'}
function openAuth(mode="login"){authMode=mode;$("#authModal").classList.remove("hidden");$$("[data-auth]").forEach(b=>b.classList.toggle("selected",b.dataset.auth===mode));$("#fullName").classList.toggle("hidden",mode!=="signup");$("#fullName").required=mode==="signup";$("#authTitle").textContent=mode==="login"?"Welcome back":"Create your account";$("#authDesc").textContent=mode==="login"?"Sign in to access your DATOVA account.":"Join DATOVA and make staying connected easier."}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
$("#introNext").addEventListener("click",()=>{if(slide<slides.length-1){slide++;renderSlide()}else showApp()});
$("#introBack").addEventListener("click",()=>{if(slide>0){slide--;renderSlide()}});
$("#skipIntro").addEventListener("click",showApp);
$("#year").textContent=new Date().getFullYear();
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>{const v=b.dataset.view;if(v==="buy-data"||v==="airtime"){openAuth("signup");toast("Purchases will be enabled after secure account and provider setup.")}else if(v==="coming")toast("This service is coming soon.");else toast("You're viewing the DATOVA overview.")}));
$("#accountBtn").addEventListener("click",()=>openAuth("login"));$("#loginSide").addEventListener("click",()=>openAuth("login"));
$("#closeAuth").addEventListener("click",()=>$("#authModal").classList.add("hidden"));
$("#authModal").addEventListener("click",e=>{if(e.target.id==="authModal")$("#authModal").classList.add("hidden")});
$$("[data-auth]").forEach(b=>b.addEventListener("click",()=>openAuth(b.dataset.auth)));
$("#authForm").addEventListener("submit",e=>{e.preventDefault();toast("Preview only: account services are not connected yet.")});
$("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("datova_theme",document.body.classList.contains("dark")?"dark":"light")});
if(localStorage.getItem("datova_theme")==="dark")document.body.classList.add("dark");
renderSlide();
setTimeout(()=>{splash.classList.add("out");setTimeout(()=>{splash.remove();if(localStorage.getItem("datova_intro_seen"))showApp();else intro.classList.remove("hidden")},650)},2750);
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));