(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);   const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const modal = $("#toolModal"), modalTitle = $("#modalTitle"), modalContent = $("#modalContent"), toast = $("#toast");
  let activeTool = "post", toastTimer;

  $("#year").textContent = new Date().getFullYear();
  $("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));   $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));
  $("#closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  $$("[data-open-tool]").forEach(btn => btn.addEventListener("click", () => openTool(btn.dataset.openTool)));      $$
(".template-tile").forEach(btn => btn.addEventListener("click", () => {
    const t = btn.dataset.template;
    openTool(t === "business" ? "business" : t === "creator" ? "portfolio" : "post");
    if (activeTool === "post") {
      const presets = {
        festival: ["উৎসবের শুভেচ্ছা", "আপনার ও আপনার পরিবারের জন্য রইল আন্তরিক শুভকামনা ও ভালোবাসা।", "#8b5cf6", "#ffffff", "SHM CREATOR STUDIO"],
        education: ["আজকের স্মার্ট টিপস", "প্রতিদিন নতুন প্রযুক্তি ও ক্রিয়েটিভ দক্ষতা শিখে নিজেকে এগিয়ে রাখুন।", "#2563eb", "#ffffff", "LEARN & GROW"]
      };
      const p = presets[t];
      if (p) { 
        $("#postTitle").value = p[0]; 
        $("#postSubtitle").value = p[1]; 
        $("#postBg").value = p[2]; 
        $("#postColor").value = p[3]; 
        $("#postBrand").value = p[4]; 
        updatePoster(); 
      }
    }
  }));

  function showToast(message) {
    toast.textContent = message; 
    toast.classList.add("show");
    clearTimeout(toastTimer); 
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function closeModal() { 
    modal.classList.remove("open"); 
    modal.setAttribute("aria-hidden", "true"); 
    document.body.style.overflow = ""; 
  }

  function openTool(tool) {
    activeTool = tool;
    modal.classList.add("open"); 
    modal.setAttribute("aria-hidden", "false"); 
    document.body.style.overflow = "hidden";
    
    const config = {
      post: ["AI Social Media Post Maker", renderPost],
      caption: ["Smart Bangla Caption Studio", renderCaption],
      product: ["Digital E-Book & PDF Maker", renderProduct],
      portfolio: ["Interactive Portfolio Builder", renderPortfolio],
      business: ["Business Quotation Kit", renderBusiness],
      seo: ["Creator SEO & Meta Inspector", renderSEO]
    };
    const selected = config[tool] || config.post;
    modalTitle.textContent = selected[0]; 
    modalContent.innerHTML = ""; 
    selected[1]();
  }

  function safeText(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  
  function field(label, id, value="", type="text", placeholder="") {
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${safeText(value)}" placeholder="${safeText(placeholder)}"></div>`;
  }
  
  function area(label, id, value="", placeholder="") {
    return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" placeholder="${safeText(placeholder)}">${safeText(value)}</textarea></div>`;
  }
  
  function buttons(items) { 
    return `<div class="form-actions">${items.map(i => `<button type="button" class="action-btn ${i.primary ? "primary" : ""}" id="${i.id}">${i.label}</button>`).join("")}</div>`; 
  }

  // 1. Post Maker
  function renderPost() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("পোস্টের শিরোনাম", "postTitle", "স্মার্ট ডিজাইন ভবিষ্যতের")}
      ${area("ছোট বিবরণ / সাবটাইটেল", "postSubtitle", "আধুনিক প্রযুক্তির ছোঁয়ায় আপনার ক্রিয়েটিভ কাজ প্রকাশ করুন।")}
      ${field("ব্র্যান্ড বা পেজের নাম", "postBrand", "SHM DIGITAL HUB")}
      <div class="field"><label for="postBg">ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট / রং</label><input id="postBg" type="color" value="#8b5cf6"></div>
      <div class="field"><label for="postColor">লেখার রং</label><input id="postColor" type="color" value="#ffffff"></div>
      ${field("ছবি আপলোড (ঐচ্ছিক)", "postImage", "", "file")}
      <span class="helper">সোশ্যাল মিডিয়া ফিডের জন্য অপ্টিমাইজড 1:1 রেশিও প্রিভিউ।</span>
      ${buttons([{id:"downloadPost", label:"PNG ডাউনলোড", primary:true}, {id:"resetPost", label:"রিসেট"}])}
    </div><div class="preview-panel"><div class="preview-title">LIVE PREVIEW</div><div id="posterCanvas" class="poster-canvas"><div class="poster-kicker">ORANGE ECONOMY 2026</div><div><div id="posterTitle" class="poster-title">স্মার্ট ডিজাইন ভবিষ্যতের</div><div id="posterSubtitle" class="poster-subtitle">আধুনিক প্রযুক্তির ছোঁয়ায় আপনার ক্রিয়েটিভ কাজ প্রকাশ করুন।</div></div><div id="posterBrand" class="poster-brand">SHM DIGITAL HUB</div></div><div class="preview-caption">হাই-রেজোলিউশন PNG হিসেবে ডাউনলোড করা যাবে।</div></div></div>`;
    
    ["postTitle", "postSubtitle", "postBrand", "postBg", "postColor"].forEach(id => $("#" + id).addEventListener("input", updatePoster));
    $("#postImage").addEventListener("change", previewImage);
    $("#downloadPost").addEventListener("click", downloadPoster);
    $("#resetPost").addEventListener("click", () => { 
      $("#postTitle").value = "স্মার্ট ডিজাইন ভবিষ্যতের"; 
      $("#postSubtitle").value = "আধুনিক প্রযুক্তির ছোঁয়ায় আপনার ক্রিয়েটিভ কাজ প্রকাশ করুন।"; 
      $("#postBrand").value = "SHM DIGITAL HUB"; 
      $("#postBg").value = "#8b5cf6"; 
      $("#postColor").value = "#ffffff"; 
      $("#postImage").value = ""; 
      uploadedImage = null; 
      updatePoster(); 
    });
    updatePoster();
  }

  let uploadedImage = null;
  function previewImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) { uploadedImage = null; updatePoster(); return; }
    if (!file.type.startsWith("image/")) { showToast("অনুগ্রহ করে একটি সঠিক ছবি নির্বাচন করুন।"); return; }
    const reader = new FileReader();
    reader.onload = () => { uploadedImage = reader.result; updatePoster(); };
    reader.readAsDataURL(file);
  }

  function updatePoster() {
    const canvas = $("#posterCanvas"); if (!canvas) return;
    canvas.style.background = $("#postBg").value;
    canvas.style.color = $("#postColor").value;
    $("#posterTitle").textContent = $("#postTitle").value || "শিরোনাম";
    $("#posterSubtitle").textContent = $("#postSubtitle").value || "";
    $("#posterBrand").textContent = $("#postBrand").value || "SHM STUDIO";
    canvas.style.backgroundImage = uploadedImage ? `linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)),url("${uploadedImage}")` : "none";
    canvas.style.backgroundSize = "cover"; 
    canvas.style.backgroundPosition = "center";
  }

  function downloadPoster() {
    const title = $("#postTitle").value || "Poster";
    const subtitle = $("#postSubtitle").value || "";
    const brand = $("#postBrand").value || "";
    const bg = $("#postBg").value, fg = $("#postColor").value;
    const img = uploadedImage;
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    
    const paint = () => {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1080);
      if (img) {
        const image = new Image();
        image.onload = () => {
          const scale = Math.max(1080/image.width, 1080/image.height), w = image.width*scale, h = image.height*scale;
          ctx.drawImage(image, (1080-w)/2, (1080-h)/2, w, h);
          ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, 0, 1080, 1080); 
          drawText();
        };
        image.onerror = drawText; 
        image.src = img;
      } else {
        drawText();
      }

      function drawText() {
        ctx.fillStyle = fg; 
        ctx.textBaseline = "top"; 
        ctx.font = "800 28px sans-serif"; 
        ctx.fillText("SHM CREATOR STUDIO", 90, 90);
        
        ctx.font = "800 68px sans-serif"; 
        let y = 340;
        ctx.fillText(title, 90, y, 900);
        
        ctx.font = "400 34px sans-serif"; 
        ctx.fillStyle = fg;
        ctx.fillText(subtitle, 90, 520, 900);
        
        ctx.font = "800 26px sans-serif"; 
        ctx.fillText(brand.toUpperCase(), 90, 960);
        
        const link = document.createElement("a"); 
        link.download = "shm-creator-poster.png"; 
        link.href = canvas.toDataURL("image/png"); 
        link.click(); 
        showToast("হাই-রেজোলিউশন পোস্টার সফলভাবে ডাউনলোড হয়েছে।");
      }
    };
    paint();
  }

  // 2. Caption Studio
  function renderCaption() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      <div class="field"><label for="captionType">কনটেন্টের ধরন</label><select id="captionType"><option value="business">ব্যবসার প্রচার ও অফার</option><option value="festival">উৎসব ও শুভেচ্ছা</option><option value="education">শিক্ষামূলক টিপস</option><option value="creator">ক্রিয়েটর পোর্টফোলিও</option><option value="video">রিলস / ভিডিও স্ক্রিপ্ট</option></select></div>
      <div class="field"><label for="captionTone">লেখার ভঙ্গি (Tone)</label><select id="captionTone"><option value="friendly">বন্ধুত্বপূর্ণ ও আকর্ষক</option><option value="professional">প্রফেশনাল ও কর্পোরেট</option><option value="emotional">আবেগপূর্ণ ও প্রেরণাদায়ী</option><option value="short">সংক্ষিপ্ত ও পয়েন্ট টু পয়েন্ট</option></select></div>
      ${field("বিষয় / পণ্য / পরিষেবার নাম", "captionSubject", "", "text", "যেমন: অনলাইন ক্রিয়েটিভ কোর্স")}
      ${area("মূল তথ্য বা বিশেষ অফার", "captionDetails", "", "মূল বৈশিষ্ট্য বা অফার সম্পর্কে লিখুন")}
      ${buttons([{id:"generateCaption", label:"স্মার্ট খসড়া তৈরি করুন", primary:true}, {id:"copyCaption", label:"কপি করুন"}])}
      <p class="small-note">স্মার্ট টেমপ্লেট জেনারেটর; আপনার প্রয়োজন অনুযায়ী তাৎক্ষণিকভাবে খসড়া তৈরি করে।</p>
    </div><div><div class="preview-title">GENERATED CAPTION</div><div class="output-area" id="captionOutput">তথ্য পূরণ করে “স্মার্ট খসড়া তৈরি করুন” বাটনে ক্লিক করুন।</div></div></div>`;
    
    $("#generateCaption").addEventListener("click", generateCaption);
    $("#copyCaption").addEventListener("click", () => copyText($("#captionOutput").textContent));
  }

  function generateCaption() {
    const type = $("#captionType").value, tone = $("#captionTone").value, subject = $("#captionSubject").value.trim(), details = $("#captionDetails").value.trim();
    if (!subject) { showToast("প্রথমে বিষয় বা পণ্যের নাম লিখুন।"); return; }
    
    const openers = {
      business: `🌟 বিশেষ ঘোষণা! নিয়ে এলাম আপনাদের পছন্দের ${subject}।`,
      festival: `✨ উৎসবের এই আনন্দে আপনার ও আপনার পরিবারের জন্য রইল বিশেষ নিবেদন: ${subject}।`,
      education: `💡 আজকের শেখার বিষয়: ${subject}। জেনে নিন সহজ কিছু কৌশল।`,
      creator: `🚀 আমার নতুন ক্রিয়েটিভ প্রজেক্ট ${subject} নিয়ে কাজ শুরু করেছি। আপনাদের মতামত অত্যন্ত মূল্যবান!`,
      video: `🎬 [রিলস স্ক্রিপ্ট]\nআজ কথা বলব ${subject} নিয়ে। ভিডিওটি শেষ পর্যন্ত দেখুন!`
    };
    const endings = {
      friendly: "আজই যোগাযোগ করুন এবং আপনার মতামত জানান! 👇",
      professional: "বিস্তারিত জানতে এবং বুকিং করতে ইনবক্স করুন।",
      emotional: "আপনাদের ভালোবাসা ও সমর্থনই আমাদের এগিয়ে চলার মূল শক্তি। ❤️",
      short: "বিস্তারিত জানতে যোগাযোগ করুন।"
    };
    
    let out = openers[type] + "\n\n" + (details || "আপনার চাহিদা অনুযায়ী সেরা মানের সেবা ও অভিজ্ঞতা নিশ্চিত করতে আমরা প্রতিজ্ঞাবদ্ধ।") + "\n\n#SHMDigitalHub #CreatorStudio #WestBengal #DigitalIndia\n\n" + endings[tone];
    $("#captionOutput").textContent = out;
  }

  // 3. Product Maker
  function renderProduct() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("ই-বুক / ডকুমেন্টের শিরোনাম", "productTitle", "ডিজিটাল ক্রিয়েটর গাইড ২০২৬")}
      ${field("লেখক / প্রকাশকের নাম", "productAuthor", "SHM Digital Hub")}
      ${area("ভূমিকা", "productIntro", "এই গাইডে আপনি আধুনিক ডিজিটাল টুলস ও ক্রিয়েটর ইকোনমির মূল বিষয়গুলো জানতে পারবেন।")}
      ${area("মূল বিষয়বস্তু ও অধ্যায়", "productBody", "অধ্যায় ১: ডিজিটাল টুলসের পরিচিতি\\nসঠিক প্ল্যাটফর্ম ও সফটওয়্যার নির্বাচন।\\n\\nঅধ্যায় ২: কন্টেন্ট ক্রিয়েশন\\nসোশ্যাল মিডিয়ায় নিজের উপস্থিতি তৈরি করা।")}
      ${buttons([{id:"previewProduct", label:"প্রিভিউ আপডেট", primary:true}, {id:"printProduct", label:"PDF হিসেবে সংরক্ষণ"}])}
      <p class="small-note">প্রিন্ট ডায়ালগ থেকে Destination এ “Save as PDF” সিলেক্ট করুন।</p>
    </div><div><div class="preview-title">DOCUMENT PREVIEW</div><article id="productPaper" class="business-paper printable"></article></div></div>`;
    
    ["productTitle", "productAuthor", "productIntro", "productBody"].forEach(id => $("#" + id).addEventListener("input", updateProduct));
    $("#previewProduct").addEventListener("click", updateProduct);
    $("#printProduct").addEventListener("click", () => { updateProduct(); printElement($("#productPaper"), "Digital E-Book"); });
    updateProduct();
  }

  function updateProduct() {
    const paper = $("#productPaper"); if (!paper) return;
    paper.innerHTML = `<div style="font-size:10px;letter-spacing:2px;color:#8b5cf6;font-weight:800">SHM DIGITAL HUB PUBLICATION</div><h3>${safeText($("#productTitle").value)}</h3><p>লেখক / প্রকাশক: ${safeText($("#productAuthor").value)}</p><hr style="border:0;border-top:1px solid #e2e8f0;margin:16px 0"><p style="font-weight:600">${safeText($("#productIntro").value).replace(/\n/g,"<br>")}</p><div style="white-space:pre-wrap;font-size:13px;line-height:1.8;margin-top:16px">${safeText($("#productBody").value)}</div><p style="font-size:9.5px;color:#94a3b8;margin-top:30px">Published via SHM Creator Studio · All rights reserved.</p>`;
  }

  // 4. Portfolio Builder
  function renderPortfolio() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("আপনার নাম", "portName", "সাদিকুল হক মোল্যা")}
      ${field("পেশা / পদবী", "portRole", "Data Entry Operator & Content Creator")}
      ${area("সংক্ষিপ্ত বায়ো", "portBio", "বাংলা কন্টেন্ট রাইটিং, ওয়েব ইউটিলিটি ডিজাইন এবং ডিজিটাল পাবলিশিং নিয়ে কাজ করি।")}
      ${field("দক্ষতা (কমা দিয়ে লিখুন)", "portSkills", "Bengali Typography, Web Design, Google Apps Script, Content Editing")}
      ${field("ইমেল অ্যাড্রেস", "portEmail", "", "email", "you@shmsolutions.online")}
      ${field("ওয়েবসাইট / পোর্টফোলিও লিংক", "portLink", "", "url", "https://shmwb.in")}
      ${buttons([{id:"updatePortfolio", label:"প্রিভিউ আপডেট", primary:true}, {id:"downloadPortfolio", label:"HTML ডাউনলোড"}, {id:"printPortfolio", label:"PDF / Print"}])}
      <p class="small-note">ডাউনলোড করা HTML ফাইলটি আপনার কম্পিউটারে বা হোস্টিংয়ে রান করতে পারবেন।</p>
    </div><div><div class="preview-title">PORTFOLIO PREVIEW</div><div id="portfolioPreview" class="portfolio-preview"></div></div></div>`;
    
    ["portName", "portRole", "portBio", "portSkills", "portEmail", "portLink"].forEach(id => $("#" + id).addEventListener("input", updatePortfolio));
    $("#updatePortfolio").addEventListener("click", updatePortfolio);
    $("#downloadPortfolio").addEventListener("click", downloadPortfolio);
    $("#printPortfolio").addEventListener("click", () => printElement($("#portfolioPreview"), "Creator Portfolio"));
    updatePortfolio();
  }

  function updatePortfolio() {
    const p = $("#portfolioPreview"); if (!p) return;
    const name = $("#portName").value \vert{}\vert{} "আপনার নাম", role = $("#portRole").value || "Digital Creator", bio = $("#portBio").value \vert{}\vert{} "", skills = $("#portSkills").value.split(",").map(s => s.trim()).filter(Boolean);
    const email = $("#portEmail").value.trim(), link = $("#portLink").value.trim();
    
    p.innerHTML = `<div style="font:800 10px Manrope;letter-spacing:2px;color:#c4b5fd">SHM CREATOR PROFILE</div><h3>${safeText(name)}</h3><div class="role">${safeText(role)}</div><p>${safeText(bio)}</p><div class="skill-chips">${skills.map(s => `<span>${safeText(s)}</span>`).join("")}</div><p style="margin-top:20px;font-size:12.5px">${email ? `✉ ${safeText(email)}` : ""} ${link ? `<br>🌐 <a href="${safeText(link)}" target="_blank" style="color:#34d399">${safeText(link)}</a>` : ""}</p>`;
  }

  function downloadPortfolio() {
    const name = $("#portName").value || "Portfolio";
    const html = `<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${safeText(name)} — Creator Portfolio</title><style>body{font:16px 'Hind Siliguri',Arial,sans-serif;background:#060913;color:#f0f4ff;margin:0;padding:8vw;line-height:1.8}main{max-width:760px;margin:auto;padding:40px;border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:#0d152b}small{letter-spacing:2px;color:#c4b5fd;font-weight:800;font-size:11px}h1{font-size:40px;margin:12px 0 0}.role{color:#10b981;font-weight:600}p{color:#94a3b8}.chips span{display:inline-block;border:1px solid rgba(255,255,255,0.15);border-radius:30px;padding:6px 14px;margin:4px;font-size:12px;background:rgba(255,255,255,0.05);color:#f1f5f9}a{color:#34d399}</style><main><small>SHM CREATOR PORTFOLIO</small><h1>${safeText($("#portName").value)}</h1><div class="role">${safeText($("#portRole").value)}</div><p>${safeText($("#portBio").value).replace(/\n/g,"<br>")}</p><div class="chips">${$("#portSkills").value.split(",").map(s=>s.trim()).filter(Boolean).map(s=>`<span>${safeText(s)}</span>`).join("")}</div><p style="margin-top:24px">${safeText($("#portEmail").value)}<br><a href="${safeText($("#portLink").value)}">${safeText($("#portLink").value)}</a></p></main></html>`;
    downloadBlob(new Blob([html], {type:"text/html;charset=utf-8"}), "creator-portfolio.html");
    showToast("পোর্টফোলিও HTML ফাইল ডাউনলোড হয়েছে।");
  }

  // 5. Business Quotation Kit
  function renderBusiness() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      <div class="field"><label for="bizDocType">ডকুমেন্টের ধরন</label><select id="bizDocType"><option>Quotation / কোটেশন</option><option>Service Price List / মূল্যতালিকা</option><option>Invoice / বিল</option></select></div>
      ${field("ব্যবসা বা সংস্থার নাম", "bizName", "SHM Digital Hub Services")}
      ${field("গ্রাহকের নাম (ঐচ্ছিক)", "bizCustomer", "", "text", "গ্রাহকের নাম")}
      ${area("পরিষেবা ও মূল্য (প্রতি লাইনে একটি)", "bizItems", "Social Media Poster Design — ₹299\\nCustom Web Page Setup — ₹999\\nDigital Document Formatting — ₹499")}
      ${area("শর্তাবলী ও পেমেন্ট বিবরণ", "bizTerms", "কাজের আগে ৫০% অগ্রিম এবং কাজ সম্পন্ন হওয়ার পর বাকি পেমেন্ট প্রযোজ্য।")}
      ${buttons([{id:"updateBusiness", label:"ডকুমেন্ট আপডেট", primary:true}, {id:"printBusiness", label:"PDF / Print"}])}
      <p class="small-note">সাধারণ কমার্শিয়াল কোটেশন ও প্রাইস লিস্ট তৈরির টুল।</p>
    </div><div><div class="preview-title">DOCUMENT PREVIEW</div><div id="businessPaper" class="business-paper printable"></div></div></div>`;
    
    ["bizDocType", "bizName", "bizCustomer", "bizItems", "bizTerms"].forEach(id => $("#" + id).addEventListener("input", updateBusiness));
    $("#updateBusiness").addEventListener("click", updateBusiness);
    $("#printBusiness").addEventListener("click", () => { updateBusiness(); printElement($("#businessPaper"), "Business Quotation"); });
    updateBusiness();
  }

  function updateBusiness() {
    const paper = $("#businessPaper"); if (!paper) return;
    const items = $("#bizItems").value.split("\n").map(s => s.trim()).filter(Boolean);
    const rows = items.map((item, i) => {
      const parts = item.split("—");
      return `<tr><td>${i+1}</td><td>${safeText(parts[0].trim())}</td><td>${safeText((parts[1]||"মূল্য নির্ধারিত").trim())}</td></tr>`;
    }).join("");
    
    paper.innerHTML = `<div style="font-size:10px;letter-spacing:2px;color:#8b5cf6;font-weight:800">SHM BUSINESS SOLUTIONS</div><h3>${safeText($("#bizDocType").value)}</h3><h4 style="margin:8px 0 4px;font-size:16px;color:#0f172a">${safeText($("#bizName").value)}</h4><p>${$("#bizCustomer").value ? `গ্রাহক: ${safeText($("#bizCustomer").value)}` : ""}</p><table><thead><tr><th>#</th><th>বিবরণ / পরিষেবা</th><th>মূল্য</th></tr></thead><tbody>${rows}</tbody></table><p style="white-space:pre-wrap;font-size:12px;color:#475569;margin-top:16px">${safeText($("#bizTerms").value)}</p><p style="font-size:9.5px;color:#94a3b8;margin-top:24px">Generated via SHM Creator Studio.</p>`;
  }

  // 6. Creator SEO & Meta Inspector
  function renderSEO() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("পেজ বা পোস্টের টাইটেল", "seoTitle", "SHM Creator Studio — বাংলা ক্রিয়েটর টুলস", "text", "সর্বোচ্চ ৬০ ক্যারেক্টার")}
      ${area("মেটা ডেসক্রিপশন", "seoDesc", "বাংলা ও ভারতীয় ক্রিয়েটর, ছোট ব্যবসা ও ডিজিটাল উদ্যোক্তাদের জন্য সহজ Creative Tools.", "সর্বোচ্চ ১৬০ ক্যারেক্টার")}
      ${field("কিওয়ার্ডস (কমা দিয়ে লিখুন)", "seoKeys", "creator studio, bangla tools, shm digital hub, poster maker")}
      ${buttons([{id:"analyzeSEO", label:"এসইও চেক করুন", primary:true}, {id:"copySEO", label:"টেমপ্লেট কপি করুন"}])}
      <p class="small-note">আপনার ওয়েবসাইট বা ব্লগ পোস্টের এসইও অপ্টিমাইজেশন যাচাই করুন।</p>
    </div><div><div class="preview-title">SEO ANALYSIS & PREVIEW</div><div class="output-area" id="seoOutput">টাইটেল ও ডেসক্রিপশন দিয়ে “এসইও চেক করুন” বাটনে ক্লিক করুন।</div></div></div>`;
    
    $("#analyzeSEO").addEventListener("click", analyzeSEO);
    $("#copySEO").addEventListener("click", () => copyText($("#seoOutput").textContent));
    analyzeSEO();
  }

  function analyzeSEO() {
    const title = $("#seoTitle").value.trim();
    const desc = $("#seoDesc").value.trim();
    const keys = $("#seoKeys").value.trim();
    
    const tLen = title.length;
    const dLen = desc.length;
    
    let tFeedback = tLen >= 30 && tLen <= 60 ? "✅ টাইটেল লেন্থ নিখুঁত (৩০-৬০ অক্ষর)।" : "⚠️ টাইটেল ৩০ থেকে ৬০ অক্ষরের মধ্যে রাখা আদর্শ।";
    let dFeedback = dLen >= 70 && dLen <= 160 ? "✅ মেটা ডেসক্রিপশন লেন্থ নিখুঁত (৭০-১৬০ অক্ষর)।" : "⚠️ ডেসক্রিপশন ৭০ থেকে ১৬০ অক্ষরের মধ্যে রাখুন।";
    
    let htmlCode = `<!-- HTML Meta Tags Generated via SHM Creator Studio -->\n<title>${safeText(title)}</title>\n<meta name="description" content="${safeText(desc)}">\n<meta name="keywords" content="${safeText(keys)}">\n\n[বিশ্লেষণ ফলাফল]:\n- টাইটেল অক্ষর সংখ্যা: ${tLen} -> ${tFeedback}\n- ডেসক্রিপশন অক্ষর সংখ্যা: ${dLen} -> ${dFeedback}`;
    $("#seoOutput").textContent = htmlCode;
  }

  async function copyText(text) {
    try { 
      await navigator.clipboard.writeText(text); 
      showToast("সফলভাবে ক্লিপবোর্ডে কপি হয়েছে।"); 
    } catch { 
      const ta = document.createElement("textarea"); 
      ta.value = text; 
      document.body.appendChild(ta); 
      ta.select(); 
      document.execCommand("copy"); 
      ta.remove(); 
      showToast("কপি করা হয়েছে।"); 
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = filename; 
    document.body.appendChild(a); a.click(); 
    a.remove(); 
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function printElement(element, title) {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { showToast("পপ-আপ ব্লক করা আছে। ব্রাউজার সেটিংস চেক করুন।"); return; }
    const styles = `<style>body{font-family:'Hind Siliguri',Arial,sans-serif;color:#0f172a;padding:30px;line-height:1.7}h3{font-size:24px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #cbd5e1;padding:10px;text-align:left}@page{margin:15mm}</style>`;
    win.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${safeText(title)}</title>${styles}</head><body>${element.outerHTML}</body></html>`);
    win.document.close(); win.focus(); 
    setTimeout(() => { win.print(); }, 350);
  }
})();
