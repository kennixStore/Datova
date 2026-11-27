const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const intro=$("#onboarding"),app=$("#app");

// Critical UI controls use early delegated handling so an unrelated startup
// error cannot leave onboarding, profile accordions, navigation or funding inert.
document.addEventListener("click",event=>{
 const target=event.target instanceof Element?event.target:null;
 if(!target)return;
 const supportLink=target.closest("[data-support-link]");
 if(supportLink){event.preventDefault();event.stopImmediatePropagation();const destination=supportLink.dataset.supportLink==="whatsapp"?"https://wa.me/2349135102119":"mailto:kennix2027@gmail.com";window.location.assign(destination);return;}
 const supportSend=target.closest("[data-support-channel]");
 if(supportSend){event.preventDefault();event.stopImmediatePropagation();const form=$("#supportReportForm");if(!form||!form.reportValidity())return;const topic=$("#supportIssueType").value.trim(),reference=$("#supportReference").value.trim(),details=$("#supportIssueDetails").value.trim();const message=["DATOVA support request","Topic: "+topic,reference?"Transaction reference: "+reference:"","Details: "+details,"Do not reply asking for my password, transaction PIN or OTP."].filter(Boolean).join("\n");const destination=supportSend.dataset.supportChannel==="whatsapp"?"https://wa.me/2349135102119?text="+encodeURIComponent(message):"mailto:kennix2027@gmail.com?subject="+encodeURIComponent("DATOVA support request — "+topic)+"&body="+encodeURIComponent(message);window.location.assign(destination);return;}
 const control=target.closest("#introNext,#introBack,#skipIntro,#replayOnboarding,[data-profile-toggle],#dashboardAddMoney,#walletAddMoney,[data-screen]");
 if(!control)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 if(control.id==="introNext"){
  if(introSliding)return;
  if(slide<slides.length-1)moveIntroSlide(1);else finishOnboarding();
  return;
 }
 if(control.id==="introBack"){moveIntroSlide(-1);return;}
 if(control.id==="skipIntro"){finishOnboarding();return;}
 if(control.id==="replayOnboarding"){replayOnboarding();return;}
 if(control.matches("[data-profile-toggle]")){
  const card=control.closest(".profile-section-card");
  if(!card)return;
  const expanded=control.getAttribute("aria-expanded")==="true";
  control.setAttribute("aria-expanded",String(!expanded));
  card.classList.toggle("is-collapsed",expanded);
  return;
 }
 if(control.id==="dashboardAddMoney"){go("wallet");openWalletFunding();return;}
 if(control.id==="walletAddMoney"){openWalletFunding();return;}
 if(control.hasAttribute("data-screen"))go(control.dataset.screen);
},true);
const slides=[
{step:"YOUR DIGITAL WORLD",title:"Your Digital<br><span>World, Made Easier.</span>",text:"Stay connected and enjoy the best services.",art:"globe"},
{step:"BUY DATA EASILY",title:"Buy Data<br><span>Without Stress.</span>",text:"Get affordable data from your favourite networks.",art:"data"},
{step:"AIRTIME MADE SIMPLE",title:"Recharge Without<br><span>Stress.</span>",text:"Top up your phone in a few simple steps.",art:"airtime"}];
let slide=0;
let screenHistoryReady=false,screenStack=["overview"];
function readStoredValue(key){
 const values=[];
 try{const value=localStorage.getItem(key);if(value!==null)values.push(value);}catch(error){}
 try{const item=document.cookie.split("; ").find(part=>part.startsWith(encodeURIComponent(key)+"="));if(item)values.push(decodeURIComponent(item.slice(item.indexOf("=")+1)));}catch(error){}
 try{const value=sessionStorage.getItem(key);if(value!==null)values.push(value);}catch(error){}
 // A successful marker in any available store wins over a stale value in another.
 if(values.includes("1"))return "1";
 return values.length?values[0]:null;
}
function writeStoredValue(key,value){
 try{localStorage.setItem(key,value)}catch(error){}
 try{document.cookie=encodeURIComponent(key)+"="+encodeURIComponent(value)+"; Max-Age=31536000; Path=/; SameSite=Lax; Secure"}catch(error){}
 try{sessionStorage.setItem(key,value)}catch(error){}
}
function savedScreen(){
 const saved=readStoredValue("datova_current_screen");
 return saved&&document.querySelector("#screen-"+saved)?saved:"overview";
}
function restoreSavedScreen(){const screen=savedScreen();$$(".screen").forEach(el=>el.classList.toggle("active",el.id==="screen-"+screen));syncNavigation(screen)}
function initScreenHistory(){if(screenHistoryReady)return;screenHistoryReady=true;const current=document.querySelector(".screen.active")?.id.replace("screen-","")||"overview";screenStack=[current];history.replaceState({datovaScreen:"root",datovaRoot:true},"",location.href);history.pushState({datovaScreen:current,datovaApp:true},"",location.href)}
function goBack(){if(history.state?.datovaApp){history.back();return}if(screenStack.length>1){screenStack.pop();const previous=screenStack[screenStack.length-1]||"overview";go(previous,{fromPopState:true});return}if($(".screen.active")?.id!=="screen-overview"){go("overview");return}toast("You're already on the DATOVA home screen.")}
let onboardingReplayMode=false;
function closeAuthModal(){
 const modal=$("#authModal");
 if(modal)modal.classList.add("hidden");
 document.body.classList.remove("auth-modal-open");
}
function markOnboardingComplete(){
 writeStoredValue("datova_intro_seen","1");
 writeStoredValue("datova_onboarding_complete","1");
 // Confirm the completion marker immediately so startup can use the latest state.
 try{
  if(localStorage.getItem("datova_onboarding_complete")!=="1")sessionStorage.setItem("datova_onboarding_complete","1");
 }catch(error){}
}
function showApp(){
 markOnboardingComplete();
 closeAuthModal();
 $("#introSplash")?.classList.add("hidden");
 intro.classList.add("hidden");
 $("#welcomeGate").classList.add("hidden");
 app.classList.remove("hidden");
 restoreSavedScreen();
 initScreenHistory();
 updateGreeting();
}
function showWelcomeGate(){
 markOnboardingComplete();
 $("#introSplash")?.classList.add("hidden");
 intro.classList.add("hidden");
 $("#welcomeGate").classList.remove("hidden");
 $("#welcomeGate").classList.add("gate-enter");
}
function finishOnboarding(){
 markOnboardingComplete();
 onboardingReplayMode=false;
 showApp();
}
function replayOnboarding(){
 onboardingReplayMode=true;
 slide=0;
 renderSlide();
 app.classList.add("hidden");
 $("#welcomeGate").classList.add("hidden");
 $("#introSplash")?.classList.add("hidden");
 intro.classList.remove("hidden","intro-arrive");
 void intro.offsetWidth;
 intro.classList.add("intro-arrive");
 window.scrollTo({top:0,behavior:"instant"});
}
function artMarkup(type){
const start='<svg viewBox="0 0 360 300" role="img">';
if(type==="globe")return start+'<defs><radialGradient id="earthFill"><stop stop-color="#39baff"/><stop offset=".7" stop-color="#0756c8"/><stop offset="1" stop-color="#041b54"/></radialGradient><linearGradient id="orbitLine"><stop stop-color="#55caff"/><stop offset=".5" stop-color="#1677ff"/><stop offset="1" stop-color="#a4eaff"/></linearGradient></defs><ellipse cx="180" cy="166" rx="145" ry="55" fill="none" stroke="url(#orbitLine)" stroke-width="5" transform="rotate(-12 180 166)"/><circle cx="180" cy="145" r="91" fill="url(#earthFill)" stroke="#48caff" stroke-width="2"/><ellipse cx="180" cy="145" rx="43" ry="91" fill="none" stroke="#6bd0ff" stroke-opacity=".65"/><path d="M91 145h178M106 105h148M106 185h148M180 54c-25 27-35 58-35 91s10 64 35 91M180 54c25 27 35 58 35 91s-10 64-35 91" fill="none" stroke="#74d5ff" stroke-opacity=".5"/><path d="M112 108q35-32 67-15t65 2M102 169q45-18 79 8t70-4" fill="none" stroke="#a5ecff" stroke-width="8" stroke-linecap="round" opacity=".25"/><g fill="#fff"><circle cx="62" cy="88" r="5"/><circle cx="292" cy="93" r="4"/><circle cx="277" cy="218" r="5"/></g><g fill="#1677ff" stroke="#9ce7ff" stroke-width="2"><rect x="35" y="183" width="46" height="40" rx="10"/><rect x="278" y="157" width="47" height="42" rx="10"/></g><path d="M49 202h18m-9-9v18M291 171l20 14m-20 0 20-14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
if(type==="data")return start+'<defs><linearGradient id="phoneBlue"><stop stop-color="#1677ff"/><stop offset="1" stop-color="#061d59"/></linearGradient></defs><ellipse cx="180" cy="210" rx="145" ry="38" fill="none" stroke="#4bbdff" stroke-width="5" transform="rotate(-13 180 210)"/><g transform="rotate(-9 180 145)"><rect x="118" y="27" width="124" height="222" rx="24" fill="url(#phoneBlue)" stroke="#65caff" stroke-width="3"/><rect x="128" y="42" width="104" height="190" rx="15" fill="#092b76"/><rect x="160" y="49" width="40" height="5" rx="3" fill="#75d8ff"/><path d="M145 124q35-40 70 0M157 139q23-25 46 0M171 153q9-10 18 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><g fill="#65caff"><rect x="148" y="183" width="10" height="25" rx="3"/><rect x="166" y="171" width="10" height="37" rx="3"/><rect x="184" y="157" width="10" height="51" rx="3"/><rect x="202" y="145" width="10" height="63" rx="3"/></g></g><circle cx="73" cy="104" r="23" fill="#1677ff" stroke="#79d9ff" stroke-width="2"/><path d="M63 104h20m-10-10v20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M279 88l16 10v19l-16 10-16-10V98z" fill="#126bdf" stroke="#7bdcff" stroke-width="2"/></svg>';
return start+'<defs><linearGradient id="airPhone"><stop stop-color="#1677ff"/><stop offset="1" stop-color="#061b54"/></linearGradient></defs><ellipse cx="180" cy="220" rx="140" ry="35" fill="none" stroke="#55caff" stroke-width="5" transform="rotate(-12 180 220)"/><g transform="rotate(9 180 145)"><rect x="119" y="25" width="122" height="224" rx="25" fill="url(#airPhone)" stroke="#65caff" stroke-width="3"/><rect x="130" y="42" width="100" height="190" rx="15" fill="#092c78"/><rect x="163" y="49" width="34" height="5" rx="3" fill="#8ee3ff"/><path d="M177 96l-20 34h18l-7 35 29-43h-19l8-26z" fill="#fff"/></g><g fill="#1677ff" stroke="#8ce1ff" stroke-width="3"><circle cx="77" cy="104" r="29"/><circle cx="283" cy="148" r="25"/><circle cx="87" cy="222" r="18"/></g><path d="M66 104h22m-11-11v22M275 148h16m-8-8v16M81 222h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
}
function renderSlide(){const v=slides[slide];$("#introStep").textContent=v.step;$("#introTitle").innerHTML=v.title;$("#introText").textContent=v.text;$("#introArt").dataset.art=v.art;$("#introVisual").innerHTML=artMarkup(v.art);$("#introDots").innerHTML=slides.map((_,i)=>'<i class="'+(i===slide?"active":"")+'"></i>').join("");$("#introBack").classList.toggle("hidden",slide===0);$("#introNext").innerHTML=slide===slides.length-1?'Get Started <b>→</b>':'Next <b>→</b>'}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2700)}
function passwordToggleIcon(visible){
 return visible
  ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
}
function setPasswordToggle(button,visible){
 button.setAttribute("aria-pressed",String(visible));
 const field=button.dataset.togglePassword==="confirmPassword"?"confirm password":"password";
 button.setAttribute("aria-label",visible?"Hide "+field:"Show "+field);
 button.innerHTML=passwordToggleIcon(visible);
}
function openAuth(mode="login"){
 const signup=mode==="signup";
 $("#authModal").classList.remove("hidden");
 document.body.classList.add("auth-modal-open");
 $$("[data-auth]").forEach(button=>{
  const selected=button.dataset.auth===mode;
  button.classList.toggle("selected",selected);
  button.setAttribute("aria-pressed",String(selected));
 });
 $("#fullNameField").classList.toggle("hidden",!signup);
 $("#fullName").required=signup;
 $("#confirmPasswordField").classList.toggle("hidden",!signup);
 $("#confirmPassword").required=signup;
 $("#forgotPassword").classList.toggle("hidden",signup);
 $("#authTitle").textContent=signup?"Create your account":"Welcome back";
 $("#authDesc").textContent=signup?"Join DATOVA and make staying connected easier.":"Sign in to access your DATOVA account.";
 $("#authPassword").value="";
 $("#confirmPassword").value="";
 $$("[data-toggle-password]").forEach(button=>{
  const input=$("#"+button.dataset.togglePassword);
  if(input)input.type="password";
  setPasswordToggle(button,false);
 });
 requestAnimationFrame(()=>$("#authModal").scrollTo({top:0,behavior:"auto"}));
}
function syncNavigation(screen){$$("[data-screen]").forEach(button=>{const active=button.dataset.screen===screen;button.classList.toggle("active",active);button.setAttribute("aria-current",active?"page":"false")})}
async function loadWalletHistory(){
 const panel=document.querySelector("#walletHistoryPanel");if(!panel)return;
 if(!currentUser||!supabaseReady||!supabaseClient){panel.innerHTML='<div class="empty-state"><div class="empty-symbol">↗</div><b>Sign in to view transactions</b><p>Your wallet activity will appear here after you sign in.</p></div>';return;}
 panel.innerHTML='<div class="empty-state"><b>Loading your transactions…</b></div>';
 try{
  const {data,error}=await supabaseClient.from("wallet_transactions").select("id,transaction_type,amount,balance_before,balance_after,reference,description,created_at").eq("user_id",currentUser.id).order("created_at",{ascending:false}).limit(50);
  if(error)throw error;
  if(!data?.length){panel.innerHTML='<div class="empty-state"><div class="empty-symbol">↗</div><b>No wallet activity yet</b><p>Your deposits and wallet activity will appear here.</p></div>';return;}
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  panel.innerHTML='<div class="wallet-history-list">'+data.map(row=>{
   const credit=["credit","refund","adjustment"].includes(String(row.transaction_type||"").toLowerCase());
   const amount=(credit?"+":"−")+"₦"+Number(row.amount||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
   const date=row.created_at?new Date(row.created_at).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short"}):"Date unavailable";
   return '<article class="wallet-history-item"><span class="wallet-history-mark '+(credit?"incoming":"outgoing")+'">'+(credit?"↓":"↑")+'</span><div class="wallet-history-info"><b>'+esc(row.description||row.transaction_type||"Wallet activity")+'</b><small>'+esc(date)+' · '+esc(row.reference||"No reference")+'</small></div><strong class="'+(credit?"incoming-text":"outgoing-text")+'">'+amount+'</strong></article>';
  }).join("")+'</div>';
 }catch(error){console.error("Could not load wallet history:",error);panel.innerHTML='<div class="empty-state"><b>Could not load transactions</b><p>Please refresh and try again.</p></div>';}
}
function go(screen,options={}){const target=$("#screen-"+screen);if(!target){toast("That section is not available yet.");return}writeStoredValue("datova_current_screen",screen);const current=$(".screen.active");if(current===target){syncNavigation(screen);return}if(!options.fromPopState&&screenHistoryReady){screenStack.push(screen);history.pushState({datovaScreen:screen,datovaApp:true},"",location.href)}else if(options.fromPopState){const index=screenStack.lastIndexOf(screen);if(index>=0)screenStack=screenStack.slice(0,index+1);else screenStack.push(screen)}if(current){current.classList.remove("active");current.classList.add("screen-exit");setTimeout(()=>current.classList.remove("screen-exit"),260)}target.classList.add("active","screen-enter");setTimeout(()=>target.classList.remove("screen-enter"),520);syncNavigation(screen);if(screen==="transactions")loadWalletHistory();window.scrollTo({top:0,behavior:"smooth"})}
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
$("#introNext").addEventListener("click",()=>{if(introSliding)return;if(slide<slides.length-1)moveIntroSlide(1);else finishOnboarding()});
$("#introBack").addEventListener("click",()=>moveIntroSlide(-1));
$("#skipIntro").addEventListener("click",finishOnboarding);
// Replay control is bound once in the reliable controls block at the end of this file.
$("#gateCreate").addEventListener("click",()=>openAuth("signup"));
$("#gateLogin").addEventListener("click",()=>openAuth("login"));
$("#exploreGuest").addEventListener("click",showApp);
async function startGoogleAuth(button){if(!supabaseReady){toast("Account service is unavailable. Please refresh and try again.");return}button.disabled=true;try{const {error}=await supabaseClient.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+window.location.pathname}});if(error)throw error;}catch(err){toast(err.message||"Google sign-in could not start.");button.disabled=false;}}
$$("[data-google-auth]").forEach(button=>button.addEventListener("click",()=>startGoogleAuth(button)));
$("#year").textContent=new Date().getFullYear();
$$("[data-network-shortcut]").forEach(btn=>btn.addEventListener("click",()=>{const network=btn.dataset.networkShortcut;go("data");$("#dataNetwork").value=network;$("#dataNetwork").dispatchEvent(new Event("change"));}));
document.addEventListener("click",event=>{const navButton=event.target.closest("[data-screen]");if(!navButton)return;event.preventDefault();go(navButton.dataset.screen)});
$("#accountBtn").addEventListener("click",()=>go("profile"));
$("#greetingAvatar")?.addEventListener("click",()=>go("profile"));
$("#loginSide").addEventListener("click",()=>openAuth("login"));
$("#profileSignIn").addEventListener("click",()=>openAuth("login"));
$("#profileTheme").addEventListener("click",()=>$("#themeToggle").click());
 $("#profilePasswordHelp")?.addEventListener("click",()=>{openAuth("login");$("#forgotPassword")?.focus();});
 const syncProfileThemeLabel=()=>{const dark=document.body.classList.contains("dark");const button=$("#profileTheme");if(button)button.textContent=dark?"Light mode":"Dark mode";const description=$("#profileThemeDescription");if(description)description.textContent=dark?"Dark appearance is active.":"Light appearance is active.";};
 syncProfileThemeLabel();
$("#closeAuth").addEventListener("click",closeAuthModal);
$("#authModal").addEventListener("click",e=>{if(e.target.id==="authModal")closeAuthModal();});
$$("[data-auth]").forEach(button=>button.addEventListener("click",event=>{event.preventDefault();openAuth(button.dataset.auth);}));
$$("[data-toggle-password]").forEach(button=>button.addEventListener("click",()=>{const input=$("#"+button.dataset.togglePassword);if(!input)return;const visible=input.type==="password";input.type=visible?"text":"password";setPasswordToggle(button,visible);}));
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
let accountNumberValue=null;
let accountNumberState="idle";
function updateAccountNumberDisplays(){
 const value=accountNumberState==="loading"?"Loading…":accountNumberValue||"Not available";
 ["profileAccountNumber","walletAccountNumber"].forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.textContent=value;
 });
 ["profileAccountCopy","walletAccountCopy"].forEach(id=>{
  const button=document.getElementById(id);
  if(button)button.disabled=!accountNumberValue;
 });
}
async function loadAccountNumber(user=currentUser){
 accountNumberValue=null;
 accountNumberState=user?"loading":"idle";
 updateAccountNumberDisplays();
 if(!user||!supabaseReady||!supabaseClient)return;
 try{
  const {data,error}=await supabaseClient.from("profiles").select("account_number").eq("id",user.id).maybeSingle();
  if(error)throw error;
  if(currentUser?.id!==user.id)return;
  accountNumberValue=data?.account_number||null;
  accountNumberState=accountNumberValue?"ready":"missing";
 }catch(error){
  console.error("Could not load DATOVA account number:",error);
  if(currentUser?.id!==user.id)return;
  accountNumberState="error";
 }
 updateAccountNumberDisplays();
}

let walletBalanceState="loading";
let walletBalanceVisible=true;
const formatNaira=value=>"₦"+Number(value||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
function updateWalletDisplays(){
 const amount=$("#walletAmountValue"),caption=$(".wallet-balance-caption"),dashboardAmount=$("#dashboardWalletAmountValue"),dashboardStatus=$("#dashboardWalletStatus");
 const shown=walletBalanceVisible;
 const display=!currentUser?"0.00":walletBalanceState==="ready"?Number(walletBalanceValue||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2}):walletBalanceState==="error"?"Unavailable":"Loading…";
 if(!currentUser){
  // Guests do not have a wallet balance to fetch; show a clear zero balance.
  if(amount)amount.textContent="0.00";
  if(caption)caption.innerHTML='<span class="wallet-balance-dot"></span> Sign in to access your personal wallet';
  if(dashboardAmount)dashboardAmount.textContent="0.00";
  if(dashboardStatus)dashboardStatus.textContent="Guest wallet · Sign in to get started";
 }else{
  if(amount)amount.textContent=shown?display:"••••••";
  if(caption)caption.innerHTML='<span class="wallet-balance-dot"></span> '+(walletBalanceState==="ready"?"Live wallet balance":walletBalanceState==="error"?"Balance could not be loaded. Refresh to try again.":"Loading your wallet balance…");
  if(dashboardAmount)dashboardAmount.textContent=shown?display:"••••••";
  if(dashboardStatus)dashboardStatus.textContent=walletBalanceState==="ready"?"Live wallet balance":walletBalanceState==="error"?"Balance unavailable":"Loading your balance…";
 }
 updateWalletBalanceVisibility();
}
async function loadWalletBalance(user=currentUser){
 if(!user||!supabaseReady||!supabaseClient){walletBalanceValue=null;walletBalanceState="idle";updateWalletDisplays();return}
 walletBalanceState="loading";updateWalletDisplays();
 try{
  const request=supabaseClient.from("wallets").select("balance,currency").eq("user_id",user.id).maybeSingle();
  const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error("Wallet balance request timed out. Check your connection and try again.")),12000));
  const {data,error}=await Promise.race([request,timeout]);
  if(error)throw error;
  if(currentUser?.id!==user.id)return;
  walletBalanceValue=data?Number(data.balance||0):0;
  walletBalanceState="ready";
 }catch(error){
  console.error("Could not load DATOVA wallet balance:",error);
  if(currentUser?.id!==user.id)return;
  walletBalanceState="error";
 }
 updateWalletDisplays();
}
function updateGreeting(){const user=currentUser;const parts=new Intl.DateTimeFormat("en-NG",{timeZone:"Africa/Lagos",hour:"2-digit",hourCycle:"h23"}).formatToParts(new Date());const hour=Number(parts.find(part=>part.type==="hour")?.value??new Date().getHours());const period=hour<5?"night":hour<12?"morning":hour<17?"afternoon":hour<21?"evening":"night";const full=(user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"").trim();const first=full?full.split(/\s+/)[0]:"Guest";const title=$("#greetingTitle");if(title)title.textContent=`Good ${period}, ${first}`;const sub=$("#greetingSubtitle");if(sub)sub.textContent=user?"Your DATOVA space is ready. Let’s keep you connected.":"Explore DATOVA’s digital services and stay connected.";updateWalletDisplays();}
setInterval(updateGreeting,60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)updateGreeting()});
function escapeText(value){return String(value).replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"}[c]));}
function renderAccount(user){
 currentUser=user||null;
 walletBalanceValue=null;walletBalanceState=user?"loading":"idle";
 const signedIn=!!user;
 updateGreeting();
 $("#profileSignIn").classList.toggle("hidden",signedIn);
 $("#profileSignOut").classList.toggle("hidden",!signedIn);
 const profileHeading=$(".profile-main h3");if(profileHeading)profileHeading.textContent=signedIn?(user.user_metadata?.full_name||user.email||"DATOVA customer"):"Guest account";
 const profileDescription=$(".profile-main p");if(profileDescription)profileDescription.textContent=signedIn?(user.email||"You're signed in to DATOVA."):"Sign in or create an account to manage your DATOVA profile.";
 const profileName=user?.user_metadata?.full_name||user?.user_metadata?.name||"DATOVA customer";
 const profileFullName=$("#profileFullName");if(profileFullName)profileFullName.textContent=signedIn?profileName:"Not available";
 const profileEmail=$("#profileEmailAddress");if(profileEmail)profileEmail.textContent=signedIn?(user.email||"Not provided"):"Not signed in";
 const profileStatus=$("#profileAccountStatus");if(profileStatus)profileStatus.textContent=signedIn?"Active":"Guest";
 const profileDisplayName=$(".profile-display-name");if(profileDisplayName)profileDisplayName.textContent=signedIn?profileName:"Guest account";
 const profileDisplayEmail=$(".profile-display-email");if(profileDisplayEmail)profileDisplayEmail.textContent=signedIn?(user.email||"Email not available"):"Sign in to view your account details.";
 const displayName=(user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email||"").trim();const initials=signedIn?(displayName.split(/\s+/).slice(0,2).map(x=>x.charAt(0)).join("").toUpperCase()||"D"):"G";const photo=user?.user_metadata?.avatar_url||user?.user_metadata?.picture||"";const avatarMarkup=photo?`<img src="${escapeText(photo)}" alt="Profile picture" referrerpolicy="no-referrer">`:escapeText(initials);$("#accountBtn").innerHTML=avatarMarkup;const greetingAvatar=$("#greetingAvatar");if(greetingAvatar)greetingAvatar.innerHTML=avatarMarkup;const profileAvatar=$(".profile-avatar");if(profileAvatar)profileAvatar.innerHTML=avatarMarkup;
 if(currentUser){loadWalletBalance(currentUser);loadAccountNumber(currentUser);}else{updateWalletDisplays();loadAccountNumber(null);}
}
if(supabaseReady){
 supabaseClient.auth.getSession().then(({data,error})=>{if(error){console.error("DATOVA getSession error:",error);toast(error.message||"Could not restore account session.");}renderAccount(data?.session?.user||null)}).catch(error=>{console.error("DATOVA getSession rejected:",error);toast(error?.message||"Account session could not be restored. Check browser console.");});
 supabaseClient.auth.onAuthStateChange(async(event,session)=>{renderAccount(session?.user||null);if(session?.user&&event==="SIGNED_IN"){markOnboardingComplete();showApp();}if(event==="PASSWORD_RECOVERY"){const next=window.prompt("Enter your new DATOVA password (at least 8 characters):");if(next&&next.length>=8){const {error}=await supabaseClient.auth.updateUser({password:next});toast(error?error.message:"Your password has been updated.");}else if(next!==null){toast("Password must contain at least 8 characters.");}}});
}else{renderAccount(null);}
$("#forgotPassword").addEventListener("click",async()=>{const email=$("#authEmail").value.trim();if(!email){toast("Enter your email address first.");$("#authEmail").focus();return}if(!supabaseReady){toast("Account service is unavailable.");return}const b=$("#forgotPassword");b.disabled=true;try{const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(error)throw error;toast("Password reset link sent. Check your email.");}catch(err){toast(err.message||"Could not send password reset email.");}finally{b.disabled=false;}});
$("#authForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const mode=$('[data-auth].selected')?.dataset.auth||"login";
 const email=$("#authEmail").value.trim();
 const password=$("#authPassword").value;
 const fullName=$("#fullName").value.trim();
 const confirmPassword=$("#confirmPassword").value;
 const submit=$("#authForm button[type='submit']");
 submit.disabled=true;submit.textContent="Please wait…";
 try{
  if(!supabaseReady)throw new Error("Account service could not load. Please refresh and try again.");
  if(mode==="signup"){
   if(!fullName){toast("Enter your full name.");return}
   if(password!==confirmPassword){toast("Your passwords do not match.");$("#confirmPassword").focus();return}
   const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:{full_name:fullName},emailRedirectTo:window.location.origin+window.location.pathname}});
   if(error)throw error;
   if(data.session){renderAccount(data.user);closeAuthModal();toast("Your DATOVA account is ready.");}
   else{closeAuthModal();toast("Account created. Check your email to confirm your address, then log in.");}
  }else{
   const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
   if(error)throw error;
   renderAccount(data.user);closeAuthModal();toast("Welcome back to DATOVA.");
  }
 }catch(err){toast(err.message||"Authentication failed. Please try again.");}
 finally{submit.disabled=false;submit.innerHTML='Continue <b>→</b>';}
});
document.addEventListener("click",event=>{const backButton=event.target.closest("[data-datova-back]");if(backButton){event.preventDefault();goBack();}});
// Sign-out control is bound once in the reliable controls block at the end of this file.
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
// Toggle visibility of the live wallet balance loaded from Supabase.
function updateWalletBalanceVisibility(){
 const amount=$("#walletAmountValue"),dashboardAmount=$("#dashboardWalletAmountValue");
 const control=$("#walletVisibility"),dashboardControl=$("#dashboardWalletVisibility");
 const display=!currentUser?"0.00":walletBalanceState==="ready"?Number(walletBalanceValue||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2}):walletBalanceState==="error"?"Unavailable":"Loading…";
 if(amount)amount.textContent=walletBalanceVisible?display:"••••••";
 if(dashboardAmount)dashboardAmount.textContent=walletBalanceVisible?display:"••••••";
 [control,dashboardControl].filter(Boolean).forEach(button=>{
  button.setAttribute("aria-pressed",String(walletBalanceVisible));
  button.setAttribute("aria-label",walletBalanceVisible?"Hide balance":"Show balance");
  button.title=walletBalanceVisible?"Hide balance":"Show balance";
  button.innerHTML=walletBalanceVisible
   ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 9 5 10 7-.4.8-1.4 2.1-3 3.3M6.2 6.2C3.8 7.7 2.4 10.3 2 12c1 2 4.8 7 10 7 1 0 2-.2 2.9-.6"/></svg>'
   : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
 });
}
document.addEventListener("click",event=>{
 const walletControl=event.target.closest("#walletVisibility, #dashboardWalletVisibility");
 if(!walletControl)return;
 event.preventDefault();
 walletBalanceVisible=!walletBalanceVisible;
 updateWalletBalanceVisibility();
});
$$("[data-transfer-amount]").forEach(button=>button.addEventListener("click",()=>{
 const amountField=$("#transferAmount");
 if(amountField){amountField.value=button.dataset.transferAmount;amountField.dispatchEvent(new Event("input",{bubbles:true}));}
}));
$("#walletTransferOpen")?.addEventListener("click",()=>{
  if(!currentUser){toast("Sign in to transfer money.");openAuth("login");return;}
  const panel=$("#walletTransferPanel");
  panel?.classList.remove("hidden");
  panel?.scrollIntoView({behavior:"smooth",block:"start"});
  setTimeout(()=>$("#transferRecipient")?.focus({preventScroll:true}),300);
});
$("#walletWithdrawOpen")?.addEventListener("click",()=>go("withdraw"));
$("#walletTransferClose")?.addEventListener("click",()=>{
  $("#walletTransferPanel")?.classList.add("hidden");
  $("#transferPreviewMessage")?.classList.remove("error","success");
  $("#transferPreviewMessage").textContent="Preview only. Recipient verification, transaction PIN and secure transfer processing are not connected yet. No money will be moved.";
});
$("#walletTransferForm")?.addEventListener("submit",async event=>{
  event.preventDefault();
  const recipientInput=$("#transferRecipient").value.trim().toUpperCase();
  const recipient=recipientInput.replace(/[\s-]/g,"");
  const amount=Number($("#transferAmount").value);
  const message=$("#transferPreviewMessage");
  $("#transferRecipientCard")?.classList.add("hidden");
  $("#transferCostCard")?.classList.add("hidden");
  message.classList.remove("error","success");
  if(!currentUser){message.textContent="Please sign in before preparing a transfer.";message.classList.add("error");openAuth("login");return;}
  if(!/^DTV\d{8}$/.test(recipient)){message.textContent="Enter a valid DATOVA account number, for example DTV-12345678.";message.classList.add("error");return;}
  if(recipient===String(accountNumberValue||"").toUpperCase().replace(/[\s-]/g,"")){message.textContent="You cannot send money to your own DATOVA account.";message.classList.add("error");return;}
  if(!Number.isFinite(amount)||amount<100||Math.round(amount*100)!==amount*100){message.textContent="Enter at least ₦100, using no more than 2 decimal places.";message.classList.add("error");return;}
  if(walletBalanceState!=="ready"){message.textContent="Your wallet balance is not ready. Refresh your balance and try again.";message.classList.add("error");return;}
  if(amount>walletBalanceValue){message.textContent="Insufficient wallet balance for this amount.";message.classList.add("error");return;}
  const button=$("#transferPreviewButton");
  button.disabled=true;
  button.textContent="Checking recipient…";
  try{
    const formattedAccount="DTV-"+recipient.slice(3);
    const {data:recipientName,error}=await supabaseClient.rpc("lookup_datova_recipient",{p_account_number:formattedAccount});
    if(error)throw error;
    if(!recipientName){
      message.textContent="No DATOVA account was found with that account number. Check the number and try again.";
      message.classList.add("error");
      return;
    }
    const cleanName=String(recipientName).trim();
    const initials=cleanName.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0].toUpperCase()).join("")||"DT";
    $("#transferRecipientInitials").textContent=initials;
    $("#transferRecipientName").textContent=cleanName;
    $("#transferRecipientAccount").textContent=formattedAccount;
    $("#transferReviewAmount").textContent="₦"+amount.toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
    $("#transferReviewTotal").textContent="₦"+amount.toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
    $("#transferRecipientCard")?.classList.remove("hidden");
    $("#transferCostCard")?.classList.remove("hidden");
    message.textContent="Recipient verified. Review the details above. This is a preview only—no money has been moved.";
    message.classList.add("success");
  }catch(error){
    console.error("DATOVA recipient lookup failed:",error);
    message.textContent="Recipient lookup is not ready yet. The secure lookup function must be installed in Supabase before this can work.";
    message.classList.add("error");
  }finally{
    button.disabled=false;
    button.textContent="Check transfer details";
  }
});
function openWalletFunding(){
 if(!currentUser){toast("Sign in to add money to your DATOVA wallet.");openAuth("login");return;}
 const area=$("#walletFundingArea");
 if(!area)return;
 area.classList.remove("hidden");
 // The wallet screen may still be transitioning from display:none.
 requestAnimationFrame(()=>setTimeout(()=>{
  area.scrollIntoView({behavior:"smooth",block:"start"});
  setTimeout(()=>$("#walletFundingAmount")?.focus({preventScroll:true}),250);
 },320));
}
$("#dashboardAddMoney")?.addEventListener("click",event=>{
 event.preventDefault();
 go("wallet");
 openWalletFunding();
});
$("#walletAddMoney")?.addEventListener("click",openWalletFunding);
$("#walletFundingClose")?.addEventListener("click",()=>$("#walletFundingArea")?.classList.add("hidden"));
updateWalletBalanceVisibility();

document.addEventListener("click",async event=>{
 const accountCopy=event.target.closest("[data-copy-account-number]");
 if(accountCopy){
  if(!accountNumberValue)return;
  try{await navigator.clipboard.writeText(accountNumberValue);toast("DATOVA account number copied.");}
  catch(error){toast("Copy unavailable. Please copy the number manually.");}
  return;
 }
 const copyButton=event.target.closest("[data-copy-reference]");
 if(!copyButton)return;
 const reference=copyButton.dataset.copyReference||"";
 try{await navigator.clipboard.writeText(reference);copyButton.textContent="Copied";toast("Payment reference copied.");setTimeout(()=>{copyButton.textContent="Copy"},1800)}
 catch(error){toast("Copy unavailable. Please select and copy the reference manually.");}
});

// Create a secure bank-transfer funding request for the signed-in customer.
$("#walletFundingForm")?.addEventListener("submit",async event=>{
 event.preventDefault();
 const amount=Number($("#walletFundingAmount").value);
 const button=$("#walletFundingSubmit");
 const message=$("#walletFundingMessage");
 if(!supabaseReady||!supabaseClient){toast("Account service is unavailable. Refresh and try again.");return}
 if(!currentUser){toast("Please sign in before funding your wallet.");openAuth("login");return}
 if(!Number.isFinite(amount)||amount<100||Math.round(amount*100)!==amount*100){
  message.textContent="Enter at least ₦100, using no more than 2 decimal places.";
  message.classList.add("error");
  return;
 }
 button.disabled=true;
 button.textContent="Creating request…";
 message.textContent="";
 message.classList.remove("error","success");
 try{
  const {data,error}=await supabaseClient.rpc("create_bank_transfer_request",{p_amount:amount});
  if(error)throw error;
  const request=Array.isArray(data)?data[0]:data;
  if(!request||!request.payment_reference)throw new Error("The request was created, but its payment reference could not be read. Contact DATOVA support before retrying.");
  const reference=escapeText(request.payment_reference);
  const requestedAmount=Number(request.payment_amount??amount).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
  const requestStatus=escapeText(request.payment_status||"pending");
  message.innerHTML='<div class="wallet-payment-instructions"><div class="wallet-instruction-top"><span class="wallet-instruction-check">✓</span><div><strong>Funding request created</strong><small>Your request has been saved successfully.</small></div></div><div class="wallet-instruction-row"><span>Amount to pay</span><b>₦'+requestedAmount+'</b></div><div class="wallet-instruction-row"><span>Bank</span><b>OPay</b></div><div class="wallet-instruction-row"><span>Account name</span><b>Romanus Okonkowo Eze</b></div><div class="wallet-instruction-row wallet-reference-row"><span>Account number</span><b>9066045837</b><button type="button" class="wallet-copy-reference" data-copy-reference="9066045837">Copy</button></div><div class="wallet-instruction-row wallet-reference-row"><span>Payment reference</span><b>'+reference+'</b><button type="button" class="wallet-copy-reference" data-copy-reference="'+reference+'">Copy</button></div><div class="wallet-instruction-row"><span>Request status</span><b class="wallet-pending-status">'+requestStatus.charAt(0).toUpperCase()+requestStatus.slice(1)+'</b></div><div class="wallet-bank-unavailable"><b>Important payment instructions</b><p>Transfer the exact amount shown to this account. Include your DATOVA payment reference in the transfer description if your banking app allows it. Your wallet will remain pending until the incoming transfer is checked and manually approved. Do not send your PIN or OTP to anyone.</p></div><small class="wallet-instruction-foot">Only make one transfer for this request. Keep your transfer receipt until DATOVA confirms payment.</small></div>';
  message.classList.add("success");
  $("#walletFundingAmount").value="";
  toast("Your bank-transfer request is ready.");
 }catch(error){
  console.error("Wallet funding request failed:",error);
  message.textContent=error.message||"Could not create your funding request. Please try again.";
  message.classList.add("error");
 }finally{
  button.disabled=false;
  button.innerHTML='Request Bank Transfer <b>→</b>';
 }
});
renderSlide();
// Do not let a slow or blocked auth request keep the splash screen open.
const sessionCheck=supabaseReady
 ? Promise.race([
     supabaseClient.auth.getSession().then(({data})=>data?.session?.user||null).catch(()=>null),
     new Promise(resolve=>setTimeout(()=>resolve(null),2200))
   ])
 : Promise.resolve(null);
function hasCompletedOnboarding(){
 return readStoredValue("datova_onboarding_complete")==="1"||readStoredValue("datova_intro_seen")==="1";
}
const openingPlayedThisSession=(()=>{try{return sessionStorage.getItem("datova_opening_seen")==="1"}catch(error){return false}})();
// The brand reveal plays once per tab session. Refreshes restore the last app section
// immediately, without replaying the animation or sending the visitor back Home.
// A first-time visitor who refreshes during onboarding returns to onboarding.
function markOpeningPlayedThisSession(){try{sessionStorage.setItem("datova_opening_seen","1")}catch(error){}}
// Play the user's original DATOVA intro audio uploaded to this repository.
const introAudio=new Audio("./32439b6f2e2b412b255dcb33fc7f3710_1795639637398.mp4");
introAudio.preload="auto";
introAudio.loop=false;
introAudio.volume=1;
let introSoundEnabled=localStorage.getItem("datova_intro_sound")!=="off";
function updateIntroSoundButton(){
 const button=$("#introSoundToggle");
 if(!button)return;
 button.setAttribute("aria-pressed",String(!introSoundEnabled));
 button.setAttribute("aria-label",introSoundEnabled?"Mute intro sound":"Enable intro sound");
 button.title=introSoundEnabled?"Mute intro sound":"Enable intro sound";
 button.querySelector("span").textContent=introSoundEnabled?"🔊":"🔇";
}
function playOriginalIntroSound(){
 if(!introSoundEnabled)return;
 try{
  introAudio.currentTime=0;
  const playback=introAudio.play();
  if(playback&&typeof playback.catch==="function")playback.catch(()=>{});
 }catch(error){}
}
function stopOriginalIntroSound(){
 introAudio.pause();
 try{introAudio.currentTime=0;}catch(error){}
}
$("#introSplash")?.addEventListener("pointerdown",event=>{
 if(event.target.closest("#introSoundToggle"))return;
 if(introSoundEnabled&&introAudio.paused)playOriginalIntroSound();
},{passive:true});
$("#introSoundToggle")?.addEventListener("click",()=>{
 introSoundEnabled=!introSoundEnabled;
 localStorage.setItem("datova_intro_sound",introSoundEnabled?"on":"off");
 updateIntroSoundButton();
 if(introSoundEnabled)playOriginalIntroSound();
 else stopOriginalIntroSound();
});
updateIntroSoundButton();
function startOpeningAnimation(afterOpening){
 const splash=$("#introSplash");
 introStartedAt=Date.now();
 splash.classList.remove("hidden","splash-leave","heartbeat-reveal");
 splash.classList.add("splash-play");
 playOriginalIntroSound();
 // The complete DATOVA wordmark gets a full three-second heartbeat after the globe forms.
 setTimeout(()=>splash.classList.add("heartbeat-reveal"),4270);
 setTimeout(()=>{
  // Let the original recording finish naturally.
  splash.classList.add("splash-leave");
  setTimeout(()=>{
   splash.classList.add("hidden");
   splash.classList.remove("splash-play","splash-leave","heartbeat-reveal");
   afterOpening();
  },620);
 },7300);
}
function showFirstVisitOnboarding(){
 intro.classList.remove("hidden");
 intro.classList.remove("intro-arrive");
 void intro.offsetWidth;
 intro.classList.add("intro-arrive");
}
function launchVisitorExperience(signedInUser){
 if(signedInUser)renderAccount(signedInUser);
 $("#welcomeGate")?.classList.add("hidden");
 // A refresh in the same tab skips the opening animation and restores the
 // last screen. A fresh tab/session gets the opening animation once.
 if(openingPlayedThisSession){
  if(hasCompletedOnboarding())showApp();
  else showFirstVisitOnboarding();
  return;
 }
 markOpeningPlayedThisSession();
 startOpeningAnimation(()=>{
  if(hasCompletedOnboarding())showApp();
  else showFirstVisitOnboarding();
 });
}
// Show the opening reveal immediately instead of waiting for Supabase to answer.
// Restore the signed-in profile as soon as the session lookup completes.
launchVisitorExperience(null);
sessionCheck.then(user=>{
 if(user)renderAccount(user);
}).catch(error=>console.error("DATOVA session restore:",error));

/* Reliable direct controls: bind after the app functions and DOM are ready. */
const themeControl=$("#themeToggle");
if(themeControl)themeControl.onclick=()=>applyTheme(!document.body.classList.contains("dark"));
const replayControl=$("#replayOnboarding");
if(replayControl)replayControl.onclick=()=>replayOnboarding();
const signInControl=$("#profileSignIn");
if(signInControl)signInControl.onclick=()=>openAuth("login");
const signOutControl=$("#profileSignOut");
if(signOutControl)signOutControl.onclick=async()=>{
 if(!supabaseReady||!supabaseClient){toast("Account service is unavailable. Please refresh and try again.");return;}
 signOutControl.disabled=true;
 try{const {error}=await supabaseClient.auth.signOut();if(error)throw error;renderAccount(null);showApp();toast("You have signed out.");}
 catch(error){toast(error.message||"Could not sign out. Please try again.");}
 finally{signOutControl.disabled=false;}
};


/* Profile Security and Preferences panels can be expanded/collapsed on mobile. */
$$("[data-profile-toggle]").forEach(button=>button.addEventListener("click",()=>{
 const card=button.closest(".profile-section-card");
 if(!card)return;
 const expanded=button.getAttribute("aria-expanded")==="true";
 button.setAttribute("aria-expanded",String(!expanded));
 card.classList.toggle("is-collapsed",expanded);
}));

/* DATOVA transaction PIN management — PINs are sent only to the protected Supabase RPC. */
const pinManager=$("#pinManager");
const pinOpen=$("#profilePinOpen");
const pinClose=$("#pinManagerClose");
const pinForm=$("#transactionPinForm");
const pinMessage=$("#transactionPinMessage");
if(pinOpen)pinOpen.addEventListener("click",()=>{
 if(!currentUser){toast("Please sign in to manage your transaction PIN.");openAuth("login");return;}
 pinManager?.classList.remove("hidden");
 pinMessage.textContent="";
 pinMessage.className="pin-manager-message";
 pinForm?.reset();
 $("#currentTransactionPin")?.focus();
});
if(pinClose)pinClose.addEventListener("click",()=>{pinManager?.classList.add("hidden");pinForm?.reset();pinMessage.textContent="";});
if(pinForm)pinForm.addEventListener("submit",async event=>{
 event.preventDefault();
 if(!supabaseReady||!supabaseClient){pinMessage.textContent="Account service is unavailable. Refresh and try again.";pinMessage.className="pin-manager-message error";return;}
 if(!currentUser){pinMessage.textContent="Please sign in again to continue.";pinMessage.className="pin-manager-message error";return;}
 const currentPin=$("#currentTransactionPin").value;
 const newPin=$("#newTransactionPin").value;
 const confirmPin=$("#confirmTransactionPin").value;
 if(!/^\d{4}$/.test(newPin)){pinMessage.textContent="Your new PIN must contain exactly four digits.";pinMessage.className="pin-manager-message error";return;}
 if(newPin!==confirmPin){pinMessage.textContent="The new PIN entries do not match.";pinMessage.className="pin-manager-message error";$("#confirmTransactionPin").focus();return;}
 if(currentPin&&!/^\d{4}$/.test(currentPin)){pinMessage.textContent="Your current PIN must contain exactly four digits.";pinMessage.className="pin-manager-message error";return;}
 const button=$("#transactionPinSubmit");
 button.disabled=true;button.textContent="Saving securely…";
 pinMessage.textContent="";pinMessage.className="pin-manager-message";
 try{
  const {data,error}=await supabaseClient.rpc("set_datova_transaction_pin",{p_new_pin:newPin,p_current_pin:currentPin||null});
  if(error)throw error;
  if(data===true){
   pinForm.reset();
   pinMessage.textContent="Your transaction PIN has been saved successfully.";
   pinMessage.className="pin-manager-message success";
   toast("Transaction PIN updated.");
  }else{
   pinMessage.textContent="The current PIN may be incorrect, or PIN changes are temporarily locked. Check it and try again later.";
   pinMessage.className="pin-manager-message error";
  }
 }catch(error){
  console.error("Transaction PIN update failed:",error);
  pinMessage.textContent=error.message||"Could not save your PIN. Please try again.";
  pinMessage.className="pin-manager-message error";
 }finally{
  button.disabled=false;button.textContent="Save transaction PIN";
 }
});


/* Manual verification test for the saved PIN; does not initiate a transfer. */
const pinTestForm=$("#transactionPinTestForm");
const pinTestMessage=$("#transactionPinTestMessage");
if(pinTestForm)pinTestForm.addEventListener("submit",async event=>{
 event.preventDefault();
 if(!supabaseReady||!currentUser){pinTestMessage.textContent="Please sign in and try again.";pinTestMessage.className="pin-manager-message error";return;}
 const pin=$("#testTransactionPin").value;
 if(!/^\d{4}$/.test(pin)){pinTestMessage.textContent="Enter exactly four digits.";pinTestMessage.className="pin-manager-message error";return;}
 const button=$("#transactionPinTestButton");
 button.disabled=true;button.textContent="Verifying…";
 pinTestMessage.textContent="";pinTestMessage.className="pin-manager-message";
 try{
  const {data,error}=await supabaseClient.rpc("verify_datova_transaction_pin",{p_pin:pin});
  if(error)throw error;
  if(data===true){
   pinTestMessage.textContent="PIN verified successfully. Your Supabase PIN check is working.";
   pinTestMessage.className="pin-manager-message success";
   pinTestForm.reset();
  }else{
   pinTestMessage.textContent="PIN not verified. Check the digits. Repeated failed attempts temporarily lock PIN verification.";
   pinTestMessage.className="pin-manager-message error";
  }
 }catch(error){
  console.error("Transaction PIN verification test failed:",error);
  pinTestMessage.textContent=error.message||"PIN verification is unavailable. Please try again.";
  pinTestMessage.className="pin-manager-message error";
 }finally{
  button.disabled=false;button.textContent="Verify PIN";
 }
});

window.datovaAppStarted=true;

