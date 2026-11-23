const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const intro=$("#onboarding"),app=$("#app");
const slides=[
{step:"YOUR DIGITAL WORLD",title:"Your Digital<br><span>World, Made Easier.</span>",text:"Stay connected and enjoy the best services.",art:"globe"},
{step:"BUY DATA EASILY",title:"Buy Data<br><span>Without Stress.</span>",text:"Get affordable data from your favourite networks.",art:"data"},
{step:"AIRTIME MADE SIMPLE",title:"Recharge Without<br><span>Stress.</span>",text:"Top up your phone in a few simple steps.",art:"airtime"}];
let slide=0;
let screenHistoryReady=false,screenStack=["overview"];
function initScreenHistory(){if(screenHistoryReady)return;screenHistoryReady=true;const current=document.querySelector(".screen.active")?.id.replace("screen-","")||"overview";screenStack=[current];history.replaceState({datovaScreen:"root",datovaRoot:true},"",location.href);history.pushState({datovaScreen:current,datovaApp:true},"",location.href)}
function goBack(){if(history.state?.datovaApp){history.back();return}if(screenStack.length>1){screenStack.pop();const previous=screenStack[screenStack.length-1]||"overview";go(previous,{fromPopState:true});return}if($(".screen.active")?.id!=="screen-overview"){go("overview");return}toast("You're already on the DATOVA home screen.")}
function showApp(){$("#introSplash")?.classList.add("hidden");intro.classList.add("hidden");$("#welcomeGate").classList.add("hidden");app.classList.remove("hidden");localStorage.setItem("datova_intro_seen","1");initScreenHistory();updateGreeting()}
function showWelcomeGate(){localStorage.setItem("datova_intro_seen","1");$("#introSplash")?.classList.add("hidden");intro.classList.add("hidden");$("#welcomeGate").classList.remove("hidden");$("#welcomeGate").classList.add("gate-enter")}
function artMarkup(type){
const start='<svg viewBox="0 0 360 300" role="img">';
if(type==="globe")return start+'<defs><radialGradient id="earthFill"><stop stop-color="#39baff"/><stop offset=".7" stop-color="#0756c8"/><stop offset="1" stop-color="#041b54"/></radialGradient><linearGradient id="orbitLine"><stop stop-color="#55caff"/><stop offset=".5" stop-color="#1677ff"/><stop offset="1" stop-color="#a4eaff"/></linearGradient></defs><ellipse cx="180" cy="166" rx="145" ry="55" fill="none" stroke="url(#orbitLine)" stroke-width="5" transform="rotate(-12 180 166)"/><circle cx="180" cy="145" r="91" fill="url(#earthFill)" stroke="#48caff" stroke-width="2"/><ellipse cx="180" cy="145" rx="43" ry="91" fill="none" stroke="#6bd0ff" stroke-opacity=".65"/><path d="M91 145h178M106 105h148M106 185h148M180 54c-25 27-35 58-35 91s10 64 35 91M180 54c25 27 35 58 35 91s-10 64-35 91" fill="none" stroke="#74d5ff" stroke-opacity=".5"/><path d="M112 108q35-32 67-15t65 2M102 169q45-18 79 8t70-4" fill="none" stroke="#a5ecff" stroke-width="8" stroke-linecap="round" opacity=".25"/><g fill="#fff"><circle cx="62" cy="88" r="5"/><circle cx="292" cy="93" r="4"/><circle cx="277" cy="218" r="5"/></g><g fill="#1677ff" stroke="#9ce7ff" stroke-width="2"><rect x="35" y="183" width="46" height="40" rx="10"/><rect x="278" y="157" width="47" height="42" rx="10"/></g><path d="M49 202h18m-9-9v18M291 171l20 14m-20 0 20-14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
if(type==="data")return start+'<defs><linearGradient id="phoneBlue"><stop stop-color="#1677ff"/><stop offset="1" stop-color="#061d59"/></linearGradient></defs><ellipse cx="180" cy="210" rx="145" ry="38" fill="none" stroke="#4bbdff" stroke-width="5" transform="rotate(-13 180 210)"/><g transform="rotate(-9 180 145)"><rect x="118" y="27" width="124" height="222" rx="24" fill="url(#phoneBlue)" stroke="#65caff" stroke-width="3"/><rect x="128" y="42" width="104" height="190" rx="15" fill="#092b76"/><rect x="160" y="49" width="40" height="5" rx="3" fill="#75d8ff"/><path d="M145 124q35-40 70 0M157 139q23-25 46 0M171 153q9-10 18 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><g fill="#65caff"><rect x="148" y="183" width="10" height="25" rx="3"/><rect x="166" y="171" width="10" height="37" rx="3"/><rect x="184" y="157" width="10" height="51" rx="3"/><rect x="202" y="145" width="10" height="63" rx="3"/></g></g><circle cx="73" cy="104" r="23" fill="#1677ff" stroke="#79d9ff" stroke-width="2"/><path d="M63 104h20m-10-10v20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M279 88l16 10v19l-16 10-16-10V98z" fill="#126bdf" stroke="#7bdcff" stroke-width="2"/></svg>';
return start+'<defs><linearGradient id="airPhone"><stop stop-color="#1677ff"/><stop offset="1" stop-color="#061b54"/></linearGradient></defs><ellipse cx="180" cy="220" rx="140" ry="35" fill="none" stroke="#55caff" stroke-width="5" transform="rotate(-12 180 220)"/><g transform="rotate(9 180 145)"><rect x="119" y="25" width="122" height="224" rx="25" fill="url(#airPhone)" stroke="#65caff" stroke-width="3"/><rect x="130" y="42" width="100" height="190" rx="15" fill="#092c78"/><rect x="163" y="49" width="34" height="5" rx="3" fill="#8ee3ff"/><path d="M177 96l-20 34h18l-7 35 29-43h-19l8-26z" fill="#fff"/></g><g fill="#1677ff" stroke="#8ce1ff" stroke-width="3"><circle cx="77" cy="104" r="29"/><circle cx="283" cy="148" r="25"/><circle cx="87" cy="222" r="18"/></g><path d="M66 104h22m-11-11v22M275 148h16m-8-8v16M81 222h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
}
function renderSlide(){const v=slides[slide];$("#introStep").textContent=v.step;$("#introTitle").innerHTML=v.title;$("#introText").textContent=v.text;$("#introArt").dataset.art=v.art;$("#introVisual").innerHTML=artMarkup(v.art);$("#introDots").innerHTML=slides.map((_,i)=>'<i class="'+(i===slide?"active":"")+'"></i>').join("");$("#introBack").classList.toggle("hidden",slide===0);$("#introNext").innerHTML=slide===slides.length-1?'Get Started <b>→</b>':'Next <b>→</b>'}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2700)}
function openAuth(mode="login"){$("#authModal").classList.remove("hidden");$$("[data-auth]").forEach(b=>b.classList.toggle("selected",b.dataset.auth===mode));$("#fullName").classList.toggle("hidden",mode!=="signup");$("#fullName").required=mode==="signup";$("#authTitle").textContent=mode==="login"?"Welcome back":"Create your account";$("#authDesc").textContent=mode==="login"?"Sign in to access your DATOVA account.":"Join DATOVA and make staying connected easier."}
function syncNavigation(screen){$$("[data-screen]").forEach(button=>{const active=button.dataset.screen===screen;button.classList.toggle("active",active);button.setAttribute("aria-current",active?"page":"false")})}
function go(screen,options={}){const target=$("#screen-"+screen);if(!target){toast("That section is not available yet.");return}const current=$(".screen.active");if(current===target){syncNavigation(screen);return}if(!options.fromPopState&&screenHistoryReady){screenStack.push(screen);history.pushState({datovaScreen:screen,datovaApp:true},"",location.href)}else if(options.fromPopState){const index=screenStack.lastIndexOf(screen);if(index>=0)screenStack=screenStack.slice(0,index+1);else screenStack.push(screen)}if(current){current.classList.remove("active");current.classList.add("screen-exit");setTimeout(()=>current.classList.remove("screen-exit"),260)}target.classList.add("active","screen-enter");setTimeout(()=>target.classList.remove("screen-enter"),520);syncNavigation(screen);window.scrollTo({top:0,behavior:"smooth"})}
window.datovaNavigate=go;
window.addEventListener("popstate",event=>{if(!screenHistoryReady)return;const screen=event.state?.datovaScreen;if(screen&&screen!=="root"&&$("#screen-"+screen)){go(screen,{fromPopState:true});return}screenStack=["overview"];go("overview",{fromPopState:true})});
let introSliding=false;
function moveIntroSlide(direction){
 if(introSliding)return;
 const next=slide+direction;
 if(next<0||next>=slides.length)return;
 introSliding=true;
 const parts=[$("#introArt"),$(".intro-copy"),$(".intro-bottom")];
 parts.forEach(el=>{el.classList.remove("intro-enter-left","intro-enter-right","intro-exit-left","intro-exit-right");el.classList.add(direction>0?"intro-exit-left":"intro-exit-right")});
 setTimeout(()=>{
  slide=next;
  renderSlide();
  parts.forEach(el=>{
   el.classList.remove("intro-exit-left","intro-exit-right");
   el.classList.add(direction>0?"intro-enter-right":"intro-enter-left");
  });
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   parts.forEach(el=>{el.classList.remove("intro-enter-right","intro-enter-left");el.classList.add("intro-settling")});
   setTimeout(()=>{parts.forEach(el=>el.classList.remove("intro-settling"));introSliding=false},480);
  }));
 },190);
}
$("#introNext").addEventListener("click",()=>{if(introSliding)return;if(slide<slides.length-1)moveIntroSlide(1);else showWelcomeGate()});
$("#introBack").addEventListener("click",()=>moveIntroSlide(-1));
$("#skipIntro").addEventListener("click",showWelcomeGate);
$("#gateCreate").addEventListener("click",()=>openAuth("signup"));
$("#gateLogin").addEventListener("click",()=>openAuth("login"));
$("#exploreGuest").addEventListener("click",showApp);
$("#googleAuth").addEventListener("click",async()=>{
 if(!supabaseReady){toast("Account service is unavailable. Please refresh and try again.");return}
 const button=$("#googleAuth");
 button.disabled=true;
 try{
  const {error}=await supabaseClient.auth.signInWithOAuth({
   provider:"google",
   options:{redirectTo:window.location.origin+window.location.pathname}
  });
  if(error)throw error;
 }catch(err){toast(err.message||"Google sign-in could not start.");button.disabled=false;}
});
$("#year").textContent=new Date().getFullYear();
$$("[data-network-shortcut]").forEach(btn=>btn.addEventListener("click",()=>{const network=btn.dataset.networkShortcut;go("data");$("#dataNetwork").value=network;$("#dataNetwork").dispatchEvent(new Event("change"));}));
document.addEventListener("click",event=>{const navButton=event.target.closest("[data-screen]");if(!navButton)return;event.preventDefault();go(navButton.dataset.screen)});
$("#accountBtn").addEventListener("click",()=>go("profile"));
$("#greetingAvatar")?.addEventListener("click",()=>go("profile"));
$("#loginSide").addEventListener("click",()=>openAuth("login"));
$("#profileSignIn").addEventListener("click",()=>openAuth("login"));
$("#profileTheme").addEventListener("click",()=>$("#themeToggle").click());
$("#closeAuth").addEventListener("click",()=>$("#authModal").classList.add("hidden"));
$("#authModal").addEventListener("click",e=>{if(e.target.id==="authModal")$("#authModal").classList.add("hidden")});
$$("[data-auth]").forEach(b=>b.addEventListener("click",()=>openAuth(b.dataset.auth)));
// DATOVA Supabase connection (publishable key is designed for browser use; RLS protects data).
const SUPABASE_URL="https://lqfmgzfdpamaenrtbjat.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_jnPRVfYqcu2W0DCdTYX3_g_SMJte69z";
let supabaseClient=null;
let supabaseReady=false;
let currentUser=null;
try{
 if(window.supabase&&typeof window.supabase.createClient==="function"){
  supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  supabaseReady=true;
 }else{
  console.warn("Supabase library did not load; DATOVA will open in preview mode.");
 }
}catch(initError){console.error("Supabase initialization failed:",initError);}
function updateGreeting(){const user=currentUser;const parts=new Intl.DateTimeFormat("en-NG",{timeZone:"Africa/Lagos",hour:"2-digit",hourCycle:"h23"}).formatToParts(new Date());const hour=Number(parts.find(part=>part.type==="hour")?.value??new Date().getHours());const period=hour<5?"night":hour<12?"morning":hour<17?"afternoon":hour<21?"evening":"night";const full=(user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"").trim();const first=full?full.split(/\s+/)[0]:"Guest";const title=$("#greetingTitle");if(title)title.textContent=`Good ${period}, ${first}`;const sub=$("#greetingSubtitle");if(sub)sub.textContent=user?"Your DATOVA space is ready. Let’s keep you connected.":"Explore DATOVA’s digital services and stay connected.";const wallet=$("#miniWalletValue");if(wallet)wallet.textContent=user?"Wallet balance is not connected yet":"Sign in to view balance";}
setInterval(updateGreeting,60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)updateGreeting()});
function escapeText(value){return String(value).replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"}[c]));}
function renderAccount(user){
 currentUser=user||null;
 const signedIn=!!user;
 updateGreeting();
 $("#profileSignIn").classList.toggle("hidden",signedIn);
 $("#profileSignOut").classList.toggle("hidden",!signedIn);
 $(".profile-main h3").textContent=signedIn?(user.user_metadata?.full_name||user.email||"DATOVA customer"):"Guest account";
 $(".profile-main p").textContent=signedIn?(user.email||"You're signed in to DATOVA."):"Sign in or create an account to manage your DATOVA profile.";
 const displayName=(user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email||"").trim();const initials=signedIn?(displayName.split(/\s+/).slice(0,2).map(x=>x.charAt(0)).join("").toUpperCase()||"D"):"G";const photo=user?.user_metadata?.avatar_url||user?.user_metadata?.picture||"";const avatarMarkup=photo?`<img src="${escapeText(photo)}" alt="Profile picture" referrerpolicy="no-referrer">`:escapeText(initials);$("#accountBtn").innerHTML=avatarMarkup;const greetingAvatar=$("#greetingAvatar");if(greetingAvatar)greetingAvatar.innerHTML=avatarMarkup;const profileAvatar=$(".profile-avatar");if(profileAvatar)profileAvatar.innerHTML=avatarMarkup;
}
if(supabaseReady){
 supabaseClient.auth.getSession().then(({data,error})=>{if(error)toast(error.message);renderAccount(data?.session?.user||null)}).catch(()=>toast("Account service is temporarily unavailable."));
 supabaseClient.auth.onAuthStateChange((event,session)=>{renderAccount(session?.user||null);if(event==="SIGNED_IN"&&session?.user){showApp();}});
}else{renderAccount(null);}
$("#authForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const mode=$('[data-auth].selected')?.dataset.auth||"login";
 const email=$('#authForm input[type="email"]').value.trim();
 const password=$('#authForm input[type="password"]').value;
 const fullName=$("#fullName").value.trim();
 const submit=$("#authForm button[type='submit']");
 submit.disabled=true;submit.textContent="Please wait…";
 try{
  if(!supabaseReady)throw new Error("Account service could not load. Please refresh and try again.");
  if(mode==="signup"){
   if(!fullName){toast("Enter your full name.");return}
   const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:{full_name:fullName}}});
   if(error)throw error;
   if(data.session){renderAccount(data.user);$("#authModal").classList.add("hidden");toast("Your DATOVA account is ready.");}
   else{$("#authModal").classList.add("hidden");toast("Account created. Check your email to confirm your address, then log in.");}
  }else{
   const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
   if(error)throw error;
   renderAccount(data.user);$("#authModal").classList.add("hidden");toast("Welcome back to DATOVA.");
  }
 }catch(err){toast(err.message||"Authentication failed. Please try again.");}
 finally{submit.disabled=false;submit.innerHTML='Continue <b>→</b>';}
});
document.addEventListener("click",event=>{const backButton=event.target.closest("[data-datova-back]");if(backButton){event.preventDefault();goBack();}});
$("#profileSignOut").addEventListener("click",async()=>{
 if(!supabaseReady){toast("Account service is unavailable.");return}
 const {error}=await supabaseClient.auth.signOut();
 if(error)toast(error.message);else{renderAccount(null);toast("You have signed out.");}
});
function applyTheme(isDark,save=true){
 document.body.classList.toggle("dark",isDark);
 const control=$("#themeToggle");
 if(control){
  control.setAttribute("aria-checked",String(isDark));
  control.setAttribute("aria-label",isDark?"Switch to light mode":"Switch to dark mode");
  const icon=control.querySelector(".theme-switch-icon");
  const label=control.querySelector(".theme-switch-label");
  if(icon)icon.textContent=isDark?"☾":"☀";
  if(label)label.textContent=isDark?"Dark":"Light";
 }
 if(save)localStorage.setItem("datova_theme",isDark?"dark":"light");
}
// Theme clicks are handled directly by the header control.
applyTheme(localStorage.getItem("datova_theme")==="dark",false);
const plans={MTN:["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days","5 GB — 30 days"],Airtel:["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days","5 GB — 30 days"],Glo:["1 GB — 30 days","2 GB — 30 days","3 GB — 30 days","5 GB — 30 days"],"9mobile":["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days"]};
$("#dataNetwork").addEventListener("change",e=>{$("#dataPlan").innerHTML='<option value="">Select a sample plan</option>'+(plans[e.target.value]||[]).map(p=>'<option>'+p+'</option>').join("")});
$("#dataContinue").addEventListener("click",()=>{const n=$("#dataNetwork").value,p=$("#dataPhone").value,plan=$("#dataPlan").value;if(!n||!/^0\d{10}$/.test(p)||!plan){toast("Select a network, enter a valid 11-digit number and choose a plan.");return}toast("Preview only: data purchases are not connected yet.")});
$("#airContinue").addEventListener("click",()=>{const n=$("#airNetwork").value,p=$("#airPhone").value,a=Number($("#airAmount").value);if(!n||!/^0\d{10}$/.test(p)||!Number.isFinite(a)||a<50||a>50000){toast("Check the network, phone number and amount (₦50–₦50,000).");return}toast("Preview only: airtime purchases are not connected yet.")});
$$(".filter-chip").forEach(b=>b.addEventListener("click",()=>{$$(".filter-chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");toast("Transaction filters will work when account history is connected.")}));
// Wallet balance visibility preview. Live wallet data is not connected yet.
let walletBalanceVisible=false;
function updateWalletBalanceVisibility(){
 const amount=$("#walletAmountValue");
 const control=$("#walletVisibility");
 if(amount)amount.textContent=walletBalanceVisible?"0.00":"••••••";
 if(control){
  control.setAttribute("aria-pressed",String(walletBalanceVisible));
  control.setAttribute("aria-label",walletBalanceVisible?"Hide balance":"Show balance");
  control.title=walletBalanceVisible?"Hide balance":"Show balance";
  control.innerHTML=walletBalanceVisible
   ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 9 5 10 7- .4.8-1.4 2.1-3 3.3M6.2 6.2C3.8 7.7 2.4 10.3 2 12c1 2 4.8 7 10 7 1 0 2-.2 2.9-.6" /></svg>'
   : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
 }
}
document.addEventListener("click",event=>{
 const walletControl=event.target.closest("#walletVisibility");
 if(!walletControl)return;
 event.preventDefault();
 walletBalanceVisible=!walletBalanceVisible;
 updateWalletBalanceVisibility();
});
updateWalletBalanceVisibility();
renderSlide();
// Do not let a slow or blocked auth request keep the splash screen open.
const sessionCheck=supabaseReady
 ? Promise.race([
     supabaseClient.auth.getSession().then(({data})=>data?.session?.user||null).catch(()=>null),
     new Promise(resolve=>setTimeout(()=>resolve(null),2200))
   ])
 : Promise.resolve(null);
const returningVisitor=!!localStorage.getItem("datova_intro_seen");
// Play the short DATOVA brand reveal on every fresh site load.
// First-time visitors continue to onboarding; returning visitors go to the app.
function startOpeningAnimation(afterOpening){
 const splash=$("#introSplash");
 splash.classList.remove("hidden","splash-leave");
 splash.classList.add("splash-play");
 setTimeout(()=>{
  splash.classList.add("splash-leave");
  setTimeout(()=>{
   splash.classList.add("hidden");
   splash.classList.remove("splash-play","splash-leave");
   afterOpening();
  },620);
 },4400);
}
function showFirstVisitOnboarding(){
 intro.classList.remove("hidden");
 intro.classList.remove("intro-arrive");
 void intro.offsetWidth;
 intro.classList.add("intro-arrive");
}
sessionCheck.then(signedInUser=>{
 if(signedInUser){
  renderAccount(signedInUser);
  startOpeningAnimation(showApp);
 }else if(returningVisitor){
  startOpeningAnimation(showApp);
 }else{
  startOpeningAnimation(showFirstVisitOnboarding);
 }
}).catch(()=>{
 if(returningVisitor)startOpeningAnimation(showApp);
 else startOpeningAnimation(showFirstVisitOnboarding);
});
window.datovaAppStarted=true;