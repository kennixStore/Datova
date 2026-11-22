const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const splash=$("#splash"),intro=$("#onboarding"),app=$("#app");
const slides=[
{step:"YOUR DIGITAL WORLD",title:"Your Digital<br><span>World, Made Easier.</span>",text:"Stay connected and enjoy the best services.",art:"globe"},
{step:"BUY DATA EASILY",title:"Buy Data<br><span>Without Stress.</span>",text:"Get affordable data from your favourite networks.",art:"data"},
{step:"AIRTIME MADE SIMPLE",title:"Recharge Without<br><span>Stress.</span>",text:"Top up your phone in a few simple steps.",art:"airtime"}];
let slide=0;
function showApp(){intro.classList.add("hidden");$("#welcomeGate").classList.add("hidden");app.classList.remove("hidden");localStorage.setItem("datova_intro_seen","1");updateGreeting()}
function showWelcomeGate(){localStorage.setItem("datova_intro_seen","1");intro.classList.add("hidden");$("#welcomeGate").classList.remove("hidden");$("#welcomeGate").classList.add("gate-enter")}
function artMarkup(type){
const start='<svg viewBox="0 0 360 300" role="img">';
if(type==="globe")return start+'<defs><radialGradient id="earthFill"><stop stop-color="#39baff"/><stop offset=".7" stop-color="#0756c8"/><stop offset="1" stop-color="#041b54"/></radialGradient><linearGradient id="orbitLine"><stop stop-color="#55caff"/><stop offset=".5" stop-color="#1677ff"/><stop offset="1" stop-color="#a4eaff"/></linearGradient></defs><ellipse cx="180" cy="166" rx="145" ry="55" fill="none" stroke="url(#orbitLine)" stroke-width="5" transform="rotate(-12 180 166)"/><circle cx="180" cy="145" r="91" fill="url(#earthFill)" stroke="#48caff" stroke-width="2"/><ellipse cx="180" cy="145" rx="43" ry="91" fill="none" stroke="#6bd0ff" stroke-opacity=".65"/><path d="M91 145h178M106 105h148M106 185h148M180 54c-25 27-35 58-35 91s10 64 35 91M180 54c25 27 35 58 35 91s-10 64-35 91" fill="none" stroke="#74d5ff" stroke-opacity=".5"/><path d="M112 108q35-32 67-15t65 2M102 169q45-18 79 8t70-4" fill="none" stroke="#a5ecff" stroke-width="8" stroke-linecap="round" opacity=".25"/><g fill="#fff"><circle cx="62" cy="88" r="5"/><circle cx="292" cy="93" r="4"/><circle cx="277" cy="218" r="5"/></g><g fill="#1677ff" stroke="#9ce7ff" stroke-width="2"><rect x="35" y="183" width="46" height="40" rx="10"/><rect x="278" y="157" width="47" height="42" rx="10"/></g><path d="M49 202h18m-9-9v18M291 171l20 14m-20 0 20-14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
if(type==="data")return start+'<defs><linearGradient id="phoneBlue"><stop stop-color="#1677ff"/><stop offset="1" stop-color="#061d59"/></linearGradient></defs><ellipse cx="180" cy="210" rx="145" ry="38" fill="none" stroke="#4bbdff" stroke-width="5" transform="rotate(-13 180 210)"/><g transform="rotate(-9 180 145)"><rect x="118" y="27" width="124" height="222" rx="24" fill="url(#phoneBlue)" stroke="#65caff" stroke-width="3"/><rect x="128" y="42" width="104" height="190" rx="15" fill="#092b76"/><rect x="160" y="49" width="40" height="5" rx="3" fill="#75d8ff"/><path d="M145 124q35-40 70 0M157 139q23-25 46 0M171 153q9-10 18 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><g fill="#65caff"><rect x="148" y="183" width="10" height="25" rx="3"/><rect x="166" y="171" width="10" height="37" rx="3"/><rect x="184" y="157" width="10" height="51" rx="3"/><rect x="202" y="145" width="10" height="63" rx="3"/></g></g><circle cx="73" cy="104" r="23" fill="#1677ff" stroke="#79d9ff" stroke-width="2"/><path d="M63 104h20m-10-10v20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M279 88l16 10v19l-16 10-16-10V98z" fill="#126bdf" stroke="#7bdcff" stroke-width="2"/></svg>';
return start+'<defs><linearGradient id="airPhone"><stop stop-color="#1677ff"/><stop offset="1" stop-color="#061b54"/></linearGradient></defs><ellipse cx="180" cy="220" rx="140" ry="35" fill="none" stroke="#55caff" stroke-width="5" transform="rotate(-12 180 220)"/><g transform="rotate(9 180 145)"><rect x="119" y="25" width="122" height="224" rx="25" fill="url(#airPhone)" stroke="#65caff" stroke-width="3"/><rect x="130" y="42" width="100" height="190" rx="15" fill="#092c78"/><rect x="163" y="49" width="34" height="5" rx="3" fill="#8ee3ff"/><path d="M177 96l-20 34h18l-7 35 29-43h-19l8-26z" fill="#fff"/></g><g fill="#1677ff" stroke="#8ce1ff" stroke-width="3"><circle cx="77" cy="104" r="29"/><circle cx="283" cy="148" r="25"/><circle cx="87" cy="222" r="18"/></g><path d="M66 104h22m-11-11v22M275 148h16m-8-8v16M81 222h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
}
function renderSlide(){const v=slides[slide];$("#introStep").textContent=v.step;$("#introTitle").innerHTML=v.title;$("#introText").textContent=v.text;$("#introArt").dataset.art=v.art;$("#introVisual").innerHTML=artMarkup(v.art);$("#introDots").innerHTML=slides.map((_,i)=>'<i class="'+(i===slide?"active":"")+'"></i>').join("");$("#introBack").classList.toggle("hidden",slide===0);$("#introNext").innerHTML=slide===slides.length-1?'Get Started <b>→</b>':'Next <b>→</b>'}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2700)}
function openAuth(mode="login"){$("#authModal").classList.remove("hidden");$$("[data-auth]").forEach(b=>b.classList.toggle("selected",b.dataset.auth===mode));$("#fullName").classList.toggle("hidden",mode!=="signup");$("#fullName").required=mode==="signup";$("#authTitle").textContent=mode==="login"?"Welcome back":"Create your account";$("#authDesc").textContent=mode==="login"?"Sign in to access your DATOVA account.":"Join DATOVA and make staying connected easier."}
function go(screen){const target=$("#screen-"+screen);if(!target){toast("That section is not available yet.");return}const current=$(".screen.active");if(current===target)return;if(current){current.classList.remove("active");current.classList.add("screen-exit");setTimeout(()=>current.classList.remove("screen-exit"),260)}target.classList.add("active","screen-enter");setTimeout(()=>target.classList.remove("screen-enter"),520);$("[data-screen]").forEach(b=>b.classList.toggle("active",b.dataset.screen===screen));window.scrollTo({top:0,behavior:"smooth"})}
$("#introNext").addEventListener("click",()=>{if(slide<slides.length-1){slide++;renderSlide()}else showWelcomeGate()});
$("#introBack").addEventListener("click",()=>{if(slide>0){slide--;renderSlide()}});
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
$("[data-network-shortcut]").forEach(btn=>btn.addEventListener("click",()=>{const network=btn.dataset.networkShortcut;go("data");$("#dataNetwork").value=network;$("#dataNetwork").dispatchEvent(new Event("change"));}));
$$("[data-screen]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.screen)));
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
function updateGreeting(){const user=currentUser;const hour=new Date().getHours();const period=hour<12?"morning":hour<17?"afternoon":"evening";const full=(user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"").trim();const first=full?full.split(/\s+/)[0]:"Guest";const title=$("#greetingTitle");if(title)title.textContent=`Good ${period}, ${first}`;const sub=$("#greetingSubtitle");if(sub)sub.textContent=user?"Your DATOVA space is ready. Let’s keep you connected.":"Explore DATOVA’s digital services and stay connected.";const wallet=$("#miniWalletValue");if(wallet)wallet.textContent=user?"Wallet balance is not connected yet":"Sign in to view balance";}
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
$("#profileSignOut").addEventListener("click",async()=>{
 if(!supabaseReady){toast("Account service is unavailable.");return}
 const {error}=await supabaseClient.auth.signOut();
 if(error)toast(error.message);else{renderAccount(null);toast("You have signed out.");}
});
$("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("datova_theme",document.body.classList.contains("dark")?"dark":"light")});
if(localStorage.getItem("datova_theme")==="dark")document.body.classList.add("dark");
const plans={MTN:["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days","5 GB — 30 days"],Airtel:["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days","5 GB — 30 days"],Glo:["1 GB — 30 days","2 GB — 30 days","3 GB — 30 days","5 GB — 30 days"],"9mobile":["500 MB — 30 days","1 GB — 30 days","2 GB — 30 days"]};
$("#dataNetwork").addEventListener("change",e=>{$("#dataPlan").innerHTML='<option value="">Select a sample plan</option>'+(plans[e.target.value]||[]).map(p=>'<option>'+p+'</option>').join("")});
$("#dataContinue").addEventListener("click",()=>{const n=$("#dataNetwork").value,p=$("#dataPhone").value,plan=$("#dataPlan").value;if(!n||!/^0\d{10}$/.test(p)||!plan){toast("Select a network, enter a valid 11-digit number and choose a plan.");return}toast("Preview only: data purchases are not connected yet.")});
$("#airContinue").addEventListener("click",()=>{const n=$("#airNetwork").value,p=$("#airPhone").value,a=Number($("#airAmount").value);if(!n||!/^0\d{10}$/.test(p)||!Number.isFinite(a)||a<50||a>50000){toast("Check the network, phone number and amount (₦50–₦50,000).");return}toast("Preview only: airtime purchases are not connected yet.")});
$$(".filter-chip").forEach(b=>b.addEventListener("click",()=>{$$(".filter-chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");toast("Transaction filters will work when account history is connected.")}));
renderSlide();
const sessionCheck=supabaseReady?supabaseClient.auth.getSession().then(({data})=>data?.session?.user||null).catch(()=>null):Promise.resolve(null);
const returningVisitor=!!localStorage.getItem("datova_intro_seen");const splashDuration=returningVisitor?1350:7600;splash.classList.add(returningVisitor?"returning-visit":"first-visit");setTimeout(async()=>{splash.classList.add("out");const signedInUser=await sessionCheck;setTimeout(()=>{splash.remove();if(signedInUser){renderAccount(signedInUser);showApp()}else if(returningVisitor)showApp();else intro.classList.remove("hidden")},620)},splashDuration);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));