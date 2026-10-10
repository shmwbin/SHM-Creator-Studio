(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const modal = $("#toolModal"), modalTitle = $("#modalTitle"), modalContent = $("#modalContent"), toast = $("#toast");
  let activeTool = "post", toastTimer;

  $("#year").textContent = new Date().getFullYear();
  $("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));
  $("#closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  $$("[data-open-tool]").forEach(btn => btn.addEventListener("click", () => openTool(btn.dataset.openTool)));
  $$(".template-tile").forEach(btn => btn.addEventListener("click", () => {
    openTool(btn.dataset.template === "business" ? "business" : btn.dataset.template === "creator" ? "portfolio" : "post");
    if (activeTool === "post") {
      const presets = {
        festival: ["উৎসবের শুভেচ্ছা", "আপনার ও আপনার পরিবারের জন্য রইল আন্তরিক শুভকামনা।", "#9d83ff", "#17152c", "SHM CREATOR STUDIO"],
        education: ["আজকের শেখা", "প্রতিদিন একটু করে শিখুন, নিজের দক্ষতাকে এগিয়ে নিন।", "#78c8ff", "#102239", "LEARN · CREATE · GROW"]
      };
      const p = presets[btn.dataset.template];
      if (p) { $("#postTitle").value=p[0]; $("#postSubtitle").value=p[1]; $("#postBg").value=p[2]; $("#postColor").value=p[3]; $("#postBrand").value=p[4]; updatePoster(); }
    }
  }));

  function showToast(message) {
    toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function closeModal() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  function openTool(tool) {
    activeTool = tool;
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    const config = {
      post: ["Social Media Post Maker", renderPost],
      caption: ["Bangla Caption Studio", renderCaption],
      product: ["Digital Product Maker", renderProduct],
      portfolio: ["Creator Portfolio Builder", renderPortfolio],
      business: ["Micro Business Kit", renderBusiness]
    };
    const selected = config[tool] || config.post;
    modalTitle.textContent = selected[0]; modalContent.innerHTML = ""; selected[1]();
  }
  function safeText(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function field(label, id, value="", type="text", placeholder="") {
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${safeText(value)}" placeholder="${safeText(placeholder)}"></div>`;
  }
  function area(label, id, value="", placeholder="") {
    return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" placeholder="${safeText(placeholder)}">${safeText(value)}</textarea></div>`;
  }
  function buttons(items) { return `<div class="form-actions">${items.map(i=>`<button type="button" class="action-btn ${i.primary?"primary":""}" id="${i.id}">${i.label}</button>`).join("")}</div>`; }

  function renderPost() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("পোস্টের শিরোনাম","postTitle","নিজের সৃষ্টিতে নতুন পরিচয়")}
      ${area("ছোট বার্তা / বিবরণ","postSubtitle","আপনার ভাবনাকে ডিজিটাল সৃষ্টিতে রূপ দিন।")}
      ${field("ব্র্যান্ড / পেজের নাম","postBrand","SHM CREATOR STUDIO")}
      <div class="field"><label for="postBg">ব্যাকগ্রাউন্ডের রং</label><input id="postBg" type="color" value="#9d83ff"></div>
      <div class="field"><label for="postColor">লেখার রং</label><input id="postColor" type="color" value="#17152c"></div>
      ${field("ছবি যোগ করুন (ঐচ্ছিক)","postImage","","file")}
      <span class="helper">সেরা ফলের জন্য সংক্ষিপ্ত শিরোনাম ব্যবহার করুন। এই প্রিভিউ 1:1 সোশ্যাল পোস্টের জন্য।</span>
      ${buttons([{id:"downloadPost",label:"PNG ডাউনলোড",primary:true},{id:"resetPost",label:"রিসেট"}])}
    </div><div class="preview-panel"><div class="preview-title">LIVE PREVIEW</div><div id="posterCanvas" class="poster-canvas"><div class="poster-kicker">YOUR IDEA · YOUR BRAND</div><div><div id="posterTitle" class="poster-title">নিজের সৃষ্টিতে নতুন পরিচয়</div><div id="posterSubtitle" class="poster-subtitle">আপনার ভাবনাকে ডিজিটাল সৃষ্টিতে রূপ দিন।</div></div><div id="posterBrand" class="poster-brand">SHM CREATOR STUDIO</div></div><div class="preview-caption">প্রিভিউটি PNG হিসেবে ডাউনলোড করা যাবে।</div></div></div>`;
    ["postTitle","postSubtitle","postBrand","postBg","postColor"].forEach(id => $("#"+id).addEventListener("input", updatePoster));
    $("#postImage").addEventListener("change", previewImage);
    $("#downloadPost").addEventListener("click", downloadPoster);
    $("#resetPost").addEventListener("click", () => { $("#postTitle").value="নিজের সৃষ্টিতে নতুন পরিচয়"; $("#postSubtitle").value="আপনার ভাবনাকে ডিজিটাল সৃষ্টিতে রূপ দিন।"; $("#postBrand").value="SHM CREATOR STUDIO"; $("#postBg").value="#9d83ff"; $("#postColor").value="#17152c"; $("#postImage").value=""; removePosterImage(); updatePoster(); });
    updatePoster();
  }
  let uploadedImage = null;
  function previewImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) { uploadedImage = null; updatePoster(); return; }
    if (!file.type.startsWith("image/")) { showToast("অনুগ্রহ করে একটি image file নির্বাচন করুন।"); return; }
    const reader = new FileReader();
    reader.onload = () => { uploadedImage = reader.result; updatePoster(); };
    reader.readAsDataURL(file);
  }
  function removePosterImage() { uploadedImage = null; }
  function updatePoster() {
    const canvas = $("#posterCanvas"); if (!canvas) return;
    canvas.style.background = $("#postBg").value;
    canvas.style.color = $("#postColor").value;
    $("#posterTitle").textContent = $("#postTitle").value || "আপনার শিরোনাম";
    $("#posterSubtitle").textContent = $("#postSubtitle").value || "";
    $("#posterBrand").textContent = $("#postBrand").value || "YOUR BRAND";
    canvas.style.backgroundImage = uploadedImage ? `linear-gradient(#0002,#0002),url("${uploadedImage}")` : "none";
    canvas.style.backgroundSize = "cover"; canvas.style.backgroundPosition = "center";
  }
  function downloadPoster() {
    const title = $("#postTitle").value || "SHM Creator Poster";
    const subtitle = $("#postSubtitle").value || "";
    const brand = $("#postBrand").value || "";
    const bg = $("#postBg").value, fg = $("#postColor").value;
    const img = uploadedImage;
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    const paint = () => {
      ctx.fillStyle = bg; ctx.fillRect(0,0,1080,1080);
      if (img) {
        const image = new Image();
        image.onload = () => {
          const scale = Math.max(1080/image.width,1080/image.height), w=image.width*scale,h=image.height*scale;
          ctx.drawImage(image,(1080-w)/2,(1080-h)/2,w,h);
          ctx.fillStyle = "#0003"; ctx.fillRect(0,0,1080,1080); drawText();
        };
        image.onerror = drawText; image.src = img;
      } else drawText();
      function drawText() {
        ctx.fillStyle = fg; ctx.textBaseline = "top"; ctx.font = "700 27px sans-serif"; ctx.fillText("YOUR IDEA · YOUR BRAND", 86, 85);
        const lines = wrapCanvasText(ctx,title,ctx,72,850);
        ctx.font = "700 72px sans-serif"; let y=350-(lines.length*82)/2;
        lines.forEach(line=>{ctx.fillText(line,86,y);y+=86;});
        ctx.font = "400 34px sans-serif"; wrapCanvasText(ctx,subtitle,ctx,34,850).forEach(line=>{ctx.fillText(line,86,y+18);y+=43;});
        ctx.font = "700 24px sans-serif"; ctx.fillText(brand.toUpperCase(),86,980);
        const link=document.createElement("a"); link.download="shm-creator-poster.png"; link.href=canvas.toDataURL("image/png"); link.click(); showToast("পোস্টার PNG হিসেবে ডাউনলোড হয়েছে।");
      }
    };
    paint();
  }
  function wrapCanvasText(ctx,text,_unused,fontSize,maxWidth) {
    ctx.font = `700 ${fontSize}px sans-serif`; const words=String(text).split(/\s+/); const lines=[]; let line="";
    words.forEach(word=>{const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;});
    if(line)lines.push(line); return lines;
  }

  function renderCaption() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      <div class="field"><label for="captionType">কনটেন্টের ধরন</label><select id="captionType"><option value="business">ব্যবসার প্রচার</option><option value="festival">উৎসবের শুভেচ্ছা</option><option value="education">শিক্ষামূলক পোস্ট</option><option value="creator">নিজের কাজের পরিচিতি</option><option value="video">ছোট ভিডিওর স্ক্রিপ্ট</option></select></div>
      <div class="field"><label for="captionTone">লেখার ভঙ্গি</label><select id="captionTone"><option value="friendly">বন্ধুত্বপূর্ণ</option><option value="professional">পেশাদার</option><option value="emotional">আবেগপূর্ণ</option><option value="short">সংক্ষিপ্ত</option></select></div>
      ${field("বিষয় / পণ্য / পরিষেবার নাম","captionSubject","","text","যেমন: ঘরে তৈরি কেক")}
      ${area("মূল তথ্য","captionDetails","","আপনার পণ্য বা বিষয় সম্পর্কে কয়েকটি তথ্য লিখুন")}
      ${buttons([{id:"generateCaption",label:"লেখার খসড়া তৈরি করুন",primary:true},{id:"copyCaption",label:"কপি করুন"}])}
      <p class="small-note">এটি অফলাইন template-based helper; নিজে থেকে তথ্য যাচাই করে না এবং AI-ভিত্তিক লেখা তৈরি করে না।</p>
    </div><div><div class="preview-title">YOUR DRAFT</div><div class="output-area" id="captionOutput">বিষয় ও তথ্য যোগ করে “লেখার খসড়া তৈরি করুন” চাপুন।</div></div></div>`;
    $("#generateCaption").addEventListener("click", generateCaption);
    $("#copyCaption").addEventListener("click", () => copyText($("#captionOutput").textContent));
  }
  function generateCaption() {
    const type=$("#captionType").value, tone=$("#captionTone").value, subject=$("#captionSubject").value.trim(), details=$("#captionDetails").value.trim();
    if(!subject){showToast("প্রথমে বিষয় বা পণ্যের নাম লিখুন।");return;}
    const openers={
      business:`আপনার জন্য নিয়ে এসেছি ${subject}।`,
      festival:`আনন্দ, ভালোবাসা ও নতুন আশায় ভরে উঠুক প্রতিটি মুহূর্ত।`,
      education:`আজকের শেখা: ${subject}।`,
      creator:`আমি ${subject} নিয়ে কাজ করছি এবং আমার সৃজনশীল ভাবনাকে নতুনভাবে তুলে ধরছি।`,
      video:`[শুরু — ৩ সেকেন্ড]\\nআজ কথা বলব ${subject} নিয়ে।`
    };
    const endings={
      friendly:"আপনার মতামত জানাতে ভুলবেন না!",
      professional:"আরও তথ্যের জন্য সরাসরি যোগাযোগ করুন।",
      emotional:"আপনাদের ভালোবাসা ও সমর্থনই এগিয়ে যাওয়ার অনুপ্রেরণা।",
      short:"জানতে যোগাযোগ করুন।"
    };
    let out=openers[type]+"\n\n"+(details||"আপনার প্রয়োজন ও পছন্দ অনুযায়ী বিস্তারিত জানুন।")+"\n\n"+endings[tone];
    if(tone==="short") out=openers[type]+" "+(details||"বিস্তারিত জানতে যোগাযোগ করুন।");
    $("#captionOutput").textContent=out;
  }

  function renderProduct() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("ডিজিটাল পণ্যের শিরোনাম","productTitle","আমার ডিজিটাল গাইড")}
      ${field("লেখক / নির্মাতার নাম","productAuthor","আপনার নাম")}
      ${area("ভূমিকা / বিবরণ","productIntro","এই গাইডে আপনি শিখবেন...")}
      ${area("মূল বিষয়বস্তু","productBody","প্রথম অধ্যায়\\nআপনার বিষয় এখানে লিখুন।\\n\\nদ্বিতীয় অধ্যায়\\nআরও তথ্য যোগ করুন।")}
      ${buttons([{id:"previewProduct",label:"প্রিভিউ আপডেট",primary:true},{id:"printProduct",label:"PDF হিসেবে সংরক্ষণ"}])}
      <p class="small-note">“PDF হিসেবে সংরক্ষণ” চাপার পর Print dialog-এ Destination হিসেবে “Save as PDF” বেছে নিন।</p>
    </div><div><div class="preview-title">DOCUMENT PREVIEW</div><article id="productPaper" class="business-paper printable"></article></div></div>`;
    ["productTitle","productAuthor","productIntro","productBody"].forEach(id=>$("#"+id).addEventListener("input",updateProduct));
    $("#previewProduct").addEventListener("click",updateProduct);
    $("#printProduct").addEventListener("click",()=>{updateProduct();printElement($("#productPaper"),"Digital Product");});
    updateProduct();
  }
  function updateProduct() {
    const paper=$("#productPaper");if(!paper)return;
    paper.innerHTML=`<div style="font-size:10px;letter-spacing:2px;color:#6652b5;font-weight:800">SHM CREATOR STUDIO</div><h3>${safeText($("#productTitle").value)}</h3><p>লেখক: ${safeText($("#productAuthor").value)}</p><hr style="border:0;border-top:1px solid #d9dfeb;margin:18px 0"><p>${safeText($("#productIntro").value).replace(/\n/g,"<br>")}</p><div style="white-space:pre-wrap;font-size:13px;line-height:1.9">${safeText($("#productBody").value)}</div><p style="font-size:9px;color:#788196;margin-top:30px">নিজের তৈরি বিষয়বস্তু ব্যবহার করুন এবং প্রয়োজনমতো তথ্য যাচাই করুন।</p>`;
  }

  function renderPortfolio() {
    modalContent.innerHTML=`<div class="workspace-grid"><div class="form-stack">
      ${field("আপনার নাম","portName","আপনার নাম")}
      ${field("আপনার পেশা / পরিচয়","portRole","Digital Creator")}
      ${area("সংক্ষিপ্ত পরিচিতি","portBio","আমি সৃজনশীল ডিজিটাল কাজ তৈরি করতে ভালোবাসি।")}
      ${field("দক্ষতা (কমা দিয়ে লিখুন)","portSkills","Design, Writing, Digital Tools")}
      ${field("যোগাযোগের ইমেল (ঐচ্ছিক)","portEmail","","email","you@example.com")}
      ${field("পোর্টফোলিও / সোশ্যাল লিংক (ঐচ্ছিক)","portLink","","url","https://")}
      ${buttons([{id:"updatePortfolio",label:"প্রিভিউ আপডেট",primary:true},{id:"downloadPortfolio",label:"HTML ডাউনলোড"},{id:"printPortfolio",label:"PDF / Print"}])}
      <p class="small-note">ডাউনলোড করা HTML ফাইলটি আপনার কম্পিউটারে খুলতে পারবেন। অনলাইনে প্রকাশ করতে হলে নিজের হোস্টিংয়ে আপলোড করুন।</p>
    </div><div><div class="preview-title">PORTFOLIO PREVIEW</div><div id="portfolioPreview" class="portfolio-preview"></div></div></div>`;
    ["portName","portRole","portBio","portSkills","portEmail","portLink"].forEach(id=>$("#"+id).addEventListener("input",updatePortfolio));
    $("#updatePortfolio").addEventListener("click",updatePortfolio);
    $("#downloadPortfolio").addEventListener("click",downloadPortfolio);
    $("#printPortfolio").addEventListener("click",()=>printElement($("#portfolioPreview"),"Creator Portfolio"));
    updatePortfolio();
  }
  function updatePortfolio() {
    const p=$("#portfolioPreview");if(!p)return;
    const name=$("#portName").value||"আপনার নাম", role=$("#portRole").value||"Digital Creator", bio=$("#portBio").value||"", skills=$("#portSkills").value.split(",").map(s=>s.trim()).filter(Boolean);
    const email=$("#portEmail").value.trim(), link=$("#portLink").value.trim();
    p.innerHTML=`<div style="font:800 9px Manrope;letter-spacing:2px;color:#9d83ff">CREATOR PORTFOLIO</div><h3>${safeText(name)}</h3><div class="role">${safeText(role)}</div><p>${safeText(bio)}</p><div class="skill-chips">${skills.map(s=>`<span>${safeText(s)}</span>`).join("")}</div><p style="margin-top:20px">${email?`✉ ${safeText(email)}`:""} ${link?`<br>↗ ${safeText(link)}`:""}</p>`;
  }
  function downloadPortfolio() {
    const name=$("#portName").value||"Creator Portfolio";
    const html=`<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${safeText(name)} — Portfolio</title><style>body{font:16px Arial,sans-serif;background:#10182b;color:#f5f7ff;margin:0;padding:8vw;line-height:1.8}main{max-width:760px;margin:auto;padding:35px;border:1px solid #38405a;border-radius:20px;background:#18223a}small{letter-spacing:2px;color:#a994ff}h1{font-size:42px;margin:15px 0 0}.role{color:#74e4c0}p{color:#c1cbe0}.chips span{display:inline-block;border:1px solid #4a536d;border-radius:30px;padding:4px 12px;margin:4px;font-size:12px}a{color:#74e4c0}</style><main><small>CREATOR PORTFOLIO</small><h1>${safeText($("#portName").value||"আপনার নাম")}</h1><div class="role">${safeText($("#portRole").value)}</div><p>${safeText($("#portBio").value).replace(/\n/g,"<br>")}</p><div class="chips">${$("#portSkills").value.split(",").map(s=>s.trim()).filter(Boolean).map(s=>`<span>${safeText(s)}</span>`).join("")}</div><p>${safeText($("#portEmail").value)}<br>${safeText($("#portLink").value)}</p></main></html>`;
    downloadBlob(new Blob([html],{type:"text/html;charset=utf-8"}),"creator-portfolio.html");showToast("Portfolio HTML ডাউনলোড হয়েছে।");
  }

  function renderBusiness() {
    modalContent.innerHTML=`<div class="workspace-grid"><div class="form-stack">
      <div class="field"><label for="bizDocType">ডকুমেন্টের ধরন</label><select id="bizDocType"><option>Quotation / কোটেশন</option><option>Service Price List / মূল্যতালিকা</option><option>Invoice / বিল</option></select></div>
      ${field("ব্যবসা / পরিষেবার নাম","bizName","আপনার ব্যবসা")}
      ${field("গ্রাহকের নাম (ঐচ্ছিক)","bizCustomer","","text","গ্রাহকের নাম")}
      ${area("পরিষেবা ও মূল্য (প্রতি লাইনে একটি)","bizItems","Poster Design — ₹299\\nSocial Media Pack — ₹499\\nBasic Website — ₹1999")}
      ${area("শর্ত / অতিরিক্ত তথ্য","bizTerms","চূড়ান্ত কাজের আগে মূল্য ও সময়সীমা নিশ্চিত করুন।")}
      ${buttons([{id:"updateBusiness",label:"ডকুমেন্ট আপডেট",primary:true},{id:"printBusiness",label:"PDF / Print"}])}
      <p class="small-note">এটি সাধারণ ডকুমেন্ট তৈরির টুল, কর-অনুবর্তী বিলিং বা GST হিসাবের সফটওয়্যার নয়। প্রয়োজনীয় আইনগত তথ্য নিজে যাচাই করুন।</p>
    </div><div><div class="preview-title">DOCUMENT PREVIEW</div><div id="businessPaper" class="business-paper printable"></div></div></div>`;
    ["bizDocType","bizName","bizCustomer","bizItems","bizTerms"].forEach(id=>$("#"+id).addEventListener("input",updateBusiness));
    $("#updateBusiness").addEventListener("click",updateBusiness);
    $("#printBusiness").addEventListener("click",()=>{updateBusiness();printElement($("#businessPaper"),"Business Document");});
    updateBusiness();
  }
  function updateBusiness() {
    const paper=$("#businessPaper");if(!paper)return;
    const items=$("#bizItems").value.split("\n").map(s=>s.trim()).filter(Boolean);
    const rows=items.map((item,i)=>{const parts=item.split("—");return `<tr><td>${i+1}</td><td>${safeText(parts[0].trim())}</td><td>${safeText((parts[1]||"মূল্য উল্লেখ নেই").trim())}</td></tr>`;}).join("");
    paper.innerHTML=`<div style="font-size:10px;letter-spacing:2px;color:#6652b5;font-weight:800">SHM CREATOR STUDIO</div><h3>${safeText($("#bizDocType").value)}</h3><h4 style="margin:12px 0 0">${safeText($("#bizName").value||"আপনার ব্যবসা")}</h4><p>${$("#bizCustomer").value?`গ্রাহক: ${safeText($("#bizCustomer").value)}`:""}</p><table><thead><tr><th>#</th><th>পরিষেবা / বিবরণ</th><th>মূল্য</th></tr></thead><tbody>${rows}</tbody></table><p style="white-space:pre-wrap">${safeText($("#bizTerms").value)}</p><p style="font-size:9px;color:#788196;margin-top:25px">এই ডকুমেন্টটি একটি সাধারণ টেমপ্লেট। মূল্য, কর ও অন্যান্য তথ্য যাচাই করে নিন।</p>`;
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); showToast("টেক্সট কপি হয়েছে।"); }
    catch { const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();showToast("টেক্সট কপি হয়েছে।"); }
  }
  function downloadBlob(blob, filename) {
    const url=URL.createObjectURL(blob), a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function printElement(element,title) {
    const win=window.open("","_blank","width=900,height=700");
    if(!win){showToast("Print window খুলতে পারেনি। Browser popup অনুমতি দিন।");return;}
    const styles=`<style>body{font-family:Arial,'Noto Sans Bengali',sans-serif;color:#182033;padding:30px;line-height:1.7}h3{font-size:25px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}@page{margin:15mm}</style>`;
    win.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${safeText(title)}</title>${styles}</head><body>${element.outerHTML}</body></html>`);
    win.document.close();win.focus();setTimeout(()=>{win.print();},350);
  }
})();