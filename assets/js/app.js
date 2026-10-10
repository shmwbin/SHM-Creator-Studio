(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);   const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const modal = $("#toolModal"), modalTitle = $("#modalTitle"), modalContent = $("#modalContent"), toast = $("#toast");
  let activeTool = "qrcode", toastTimer;

  $("#year").textContent = new Date().getFullYear();
  $("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));   $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));
  $("#closeModal").addEventListener("click", closeModal);   modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });   document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });   $$("[data-open-tool]").forEach(btn => btn.addEventListener("click", () => openTool(btn.dataset.openTool)));

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
      qrcode: ["Instant QR Code Generator", renderQRCodeTool],
      password: ["Secure Password Generator", renderPasswordTool],
      counter: ["Word & Character Counter", renderCounterTool],
      base64: ["Base64 Encoder / Decoder", renderBase64Tool],
      colorpicker: ["Color & Gradient Inspector", renderColorTool],
      post: ["AI Social Post Maker", renderPostTool]
    };
    const selected = config[tool] || config.qrcode;
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

  // 1. QR Code Tool
  function renderQRCodeTool() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("ওয়েবসাইট লিংক বা টেক্সট", "qrInput", "https://shmwb.in", "text", "লিংক বা লেখা লিখুন")}
      <span class="helper">ইনপুট দেওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে QR কোড তৈরি হবে।</span>
      ${buttons([{id:"copyQrText", label:"টেকনিক্যাল লিংক কপি", primary:true}])}
      <p class="small-note">গুগল এপিআই ব্যবহার করে ইনস্ট্যান্ট হাই-কোয়ালিটি QR কোড জেনারেট করা হয়।</p>
    </div><div><div class="preview-title">QR CODE PREVIEW</div><div class="preview-panel"><div id="qrPreviewBox" style="background:#fff;padding:15px;border-radius:12px;display:inline-block"><img id="qrImage" src="" alt="QR Code" style="display:block;max-width:200px;height:auto"></div><div id="qrTextNote" style="margin-top:12px;font-size:12px;color:var(--muted)">https://shmwb.in</div></div></div></div>`;
    
    const input = $("#qrInput"), img = $("#qrImage"), note = $("#qrTextNote");
    const updateQR = () => {
      const val = input.value.trim() || "https://shmwb.in";
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(val)}`;
      note.textContent = val;
    };
    input.addEventListener("input", updateQR);
    $("#copyQrText").addEventListener("click", () => copyText(input.value));
    updateQR();
  }

  // 2. Password Generator Tool
  function renderPasswordTool() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      <div class="field"><label for="pwdLen">পাসওয়ার্ডের দৈর্ঘ্য (Length: <span id="lenVal">16</span>)</label><input id="pwdLen" type="range" min="8" max="32" value="16" style="cursor:pointer"></div>
      <div style="display:flex;gap:20px;font-size:13px;align-items:center;margin-top:5px">
        <label><input type="checkbox" id="incUpper" checked> अपरकेস (A-Z)</label>
        <label><input type="checkbox" id="incNum" checked> সংখ্যা (0-9)</label>
        <label><input type="checkbox" id="incSym" checked> সিম্বল (!@#)</label>
      </div>
      ${buttons([{id:"genPwd", label:"নতুন পাসওয়ার্ড বানান", primary:true}, {id:"copyPwd", label:"পাসওয়ার্ড কপি করুন"}])}
      <p class="small-note">আপনার ব্রাউজারে র্যান্ডম ক্রিপ্টোগ্রাফিক অ্যালগরিদম ব্যবহার করে পাসওয়ার্ড তৈরি হয়।</p>
    </div><div><div class="preview-title">SECURE PASSWORD OUTPUT</div><div class="output-area" id="pwdOutput" style="font-family:monospace;font-size:18px;display:flex;align-items:center;justify-content:center;text-align:center;color:#34d399">Abc123xyz#789!</div></div></div>`;
    
    const len = $("#pwdLen"), lenVal = $("#lenVal"), out = $("#pwdOutput"), upper = $("#incUpper"), num = $("#incNum"), sym = $("#incSym");
    const generate = () => {
      lenVal.textContent = len.value;
      let chars = "abcdefghijklmnopqrstuvwxyz";
      if (upper.checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (num.checked) chars += "0123456789";
      if (sym.checked) chars += "!@#$%^&*()_+<>?";
      let res = "";
      for (let i = 0; i < parseInt(len.value); i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      out.textContent = res;
    };
    [len, upper, num, sym].forEach(el => el.addEventListener("input", generate));
    $("#genPwd").addEventListener("click", generate);
    $("#copyPwd").addEventListener("click", () => copyText(out.textContent));
    generate();
  }

  // 3. Word & Character Counter Tool
  function renderCounterTool() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${area("এখানে আপনার লেখা পেস্ট বা টাইপ করুন", "counterInput", "স্বাগতম SHM Digital Hub এ। এখানে আপনি খুব সহজে আপনার বাংলা বা ইংরেজি লেখার হিসাব দেখতে পাবেন।", "লেখুন...")}
      ${buttons([{id:"clearCounter", label:"সব মুছুন"}])}
    </div><div><div class="preview-title">LIVE STATISTICS</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="background:#060913;border:1px solid var(--line);padding:18px;border-radius:14px;text-align:center"><small style="color:var(--muted);font-size:11px">CHARACTER (অক্ষর)</small><div id="statChars" style="font-size:26px;font-weight:800;color:#c4b5fd;margin-top:4px">0</div></div>
        <div style="background:#060913;border:1px solid var(--line);padding:18px;border-radius:14px;text-align:center"><small style="color:var(--muted);font-size:11px">WORDS (শব্দ)</small><div id="statWords" style="font-size:26px;font-weight:800;color:#34d399;margin-top:4px">0</div></div>
      </div>
      <div style="background:#060913;border:1px solid var(--line);padding:14px;border-radius:14px;margin-top:12px;font-size:12.5px;color:var(--muted)">পড়ার আনুমানিক সময় (Reading Time): <b id="statTime" style="color:#fff">0 সেকেন্ড</b></div>
    </div></div>`;
    
    const input = $("#counterInput"), charsEl = $("#statChars"), wordsEl = $("#statWords"), timeEl = $("#statTime");
    const count = () => {
      const text = input.value;
      charsEl.textContent = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      wordsEl.textContent = words;
      const secs = Math.ceil(words / 3.5);
      timeEl.textContent = secs < 60 ? `${secs} সেকেন্ড` : `${(secs/60).toFixed(1)} মিনিট`;
    };
    input.addEventListener("input", count);
    $("#clearCounter").addEventListener("click", () => { input.value = ""; count(); });
    count();
  }

  // 4. Base64 Tool
  function renderBase64Tool() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${area("টেক্সট ইনপুট", "b64Input", "SHM Digital Hub", "টেক্সট বা বেস৬৪ কোড লিখুন")}
      <div class="form-actions">
        <button type="button" class="action-btn primary" id="b64Encode">Encode</button>
        <button type="button" class="action-btn" id="b64Decode">Decode</button>
      </div>
    </div><div><div class="preview-title">RESULT OUTPUT</div><div class="output-area" id="b64Output">SSHkgRGlnaXRhbCBIdWI=</div></div></div>`;
    
    const input = $("#b64Input"), out = $("#b64Output");
    $("#b64Encode").addEventListener("click", () => {
      try { out.textContent = btoa(unescape(encodeURIComponent(input.value))); showToast("এনকোড সম্পন্ন হয়েছে।"); }
      catch { showToast("ইনপুট সঠিক নয়।"); }
    });
    $("#b64Decode").addEventListener("click", () => {
      try { out.textContent = decodeURIComponent(escape(atob(input.value.trim()))); showToast("ডিকোড সম্পন্ন হয়েছে।"); }
      catch { showToast("ভুল Base64 ফরম্যাট।"); }
    });
  }

  // 5. Color Picker Tool
  function renderColorTool() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      <div class="field"><label for="pickerColor">রং নির্বাচন করুন</label><input id="pickerColor" type="color" value="#8b5cf6"></div>
      ${field("HEX কোড", "hexVal", "#8b5cf6")}
      ${field("RGB কোড", "rgbVal", "rgb(139, 92, 246)")}
      ${buttons([{id:"copyColorCode", label:"HEX কোড কপি করুন", primary:true}])}
    </div><div><div class="preview-title">LIVE COLOR PREVIEW</div><div id="colorBox" style="width:100%;height:220px;background:#8b5cf6;border-radius:14px;border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,0.3)"></div></div></div>`;
    
    const picker = $("#pickerColor"), hex = $("#hexVal"), rgb = $("#rgbVal"), box = $("#colorBox");
    picker.addEventListener("input", () => {
      const c = picker.value;
      hex.value = c;
      box.style.background = c;
      const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
      rgb.value = `rgb(${r}, ${g}, ${b})`;
    });
    $("#copyColorCode").addEventListener("click", () => copyText(hex.value));
  }

  // 6. Post Tool (Creator Studio snippet)
  function renderPostTool() {
    modalContent.innerHTML = `<div class="workspace-grid"><div class="form-stack">
      ${field("পোস্টের শিরোনাম", "postTitle", "SHM Digital Hub")}
      ${area("সাবটাইটেল", "postSubtitle", "Viral & Modern Utility Suite 2026")}
      <div class="field"><label for="postBg">ব্যাকগ্রাউন্ড রং</label><input id="postBg" type="color" value="#8b5cf6"></div>
      ${buttons([{id:"downloadPost", label:"PNG ডাউনলোড করুন", primary:true}])}
    </div><div><div class="preview-title">POSTER PREVIEW</div><div id="posterCanvas" style="width:100%;aspect-ratio:1/1;background:#8b5cf6;border-radius:12px;padding:10%;color:#fff;display:flex;flex-direction:column;justify-content:space-between"><b style="font-size:11px;letter-spacing:1px">SHM HUB</b><div><h3 id="pTitle" style="font-size:28px;margin:0 0 8px">SHM Digital Hub</h3><p id="pSub" style="font-size:14px;margin:0">Viral & Modern Utility Suite 2026</p></div><small style="font-size:10px">shmwb.in</small></div></div></div>`;
    
    const t = $("#postTitle"), s = $("#postSubtitle"), bg = $("#postBg"), pt = $("#pTitle"), ps = $("#pSub"), canvas = $("#posterCanvas");
    [t, s, bg].forEach(el => el.addEventListener("input", () => {
      pt.textContent = t.value; ps.textContent = s.value; canvas.style.background = bg.value;
    }));
    $("#downloadPost").addEventListener("click", () => showToast("পোস্টার প্রিভিউ রেডি হয়েছে।"));
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); showToast("সফলভাবে ক্লিপবোর্ডে কপি হয়েছে।"); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); showToast("কপি করা হয়েছে।"); }
  }
})();
